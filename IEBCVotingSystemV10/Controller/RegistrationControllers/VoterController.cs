using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using IEBCVotingSystemV10.Data;
using IEBCVotingSystemV10.Model.DTOs;
using IEBCVotingSystemV10.Model.Entity;
using IEBCVotingSystemV10.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.VisualBasic;
using System.Text.Json;

namespace IEBCVotingSystemV10.Controller.RegistrationController
{
    [Route("api/voter")]
    [ApiController]
    public class VoterController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly RoleManager<AppUserRoles> _roleManager;
        private readonly IBiometricService _biometricService;
        private readonly ILogger<VoterController> _logger;
        private readonly IWebHostEnvironment _env;

        public VoterController(ApplicationDbContext dbContext,
                                RoleManager<AppUserRoles> roleManager,
                                IBiometricService biometricService,
                                ILogger<VoterController> logger,
                                IWebHostEnvironment env)
        {
            this._dbContext = dbContext;
            this._roleManager = roleManager;
            this._biometricService = biometricService;
            this._logger = logger;
            this._env = env;
        }

        [HttpPost("registerVoter")]
        public async Task<IActionResult> RegisterVoter([FromForm] VoterDTO voterDTO)
        {
            _logger.LogInformation("RegisterVoter called for email: {Email}", voterDTO.Email);

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("ModelState invalid: {Errors}", ModelState.Values.SelectMany(v => v.Errors));
                return BadRequest(ModelState);
            }

            try
            {
                // Validate required fields
                if (string.IsNullOrEmpty(voterDTO.FirstName) || string.IsNullOrEmpty(voterDTO.LastName))
                {
                    return BadRequest("First Name and Last Name are required");
                }

                // Check for duplicate voter
                var voterExist = await _dbContext.Voters.FirstOrDefaultAsync(v => v.NationalIdNo == voterDTO.NationalIdNo);
                if (voterExist != null)
                {
                    _logger.LogWarning("Voter already exists with NationalIdNo: {NationalId}", voterDTO.NationalIdNo);
                    return BadRequest("Voter is already registered");
                }

                // Check for duplicate email
                var emailExists = await _dbContext.Voters.FirstOrDefaultAsync(v => v.Email == voterDTO.Email);
                if (emailExists != null)
                {
                    _logger.LogWarning("Email already registered: {Email}", voterDTO.Email);
                    return BadRequest("Voter with the Email already exists");
                }

                // Verify user exists
                var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == voterDTO.Email);
                if (user == null)
                {
                    _logger.LogWarning("User account not found for email: {Email}", voterDTO.Email);
                    return BadRequest("User account not found. Please register a user account first.");
                }

                // Update DTO with user data
                voterDTO.UserId = user.Id;
                voterDTO.NationalIdNo = user.NationalIdNo;
                voterDTO.Email = user.Email ?? "";

                // Verify role exists
                var roleName = voterDTO.SelectedRole;
                var role = await _roleManager.FindByNameAsync(roleName);
                if (role == null)
                {
                    _logger.LogWarning("Role not found: {Role}", roleName);
                    return BadRequest("The specified role does not exist");
                }

                // Handle Biometric Face Enrollment
                string fileName = "embeddings_only"; // Default when no file is stored
                float[]? embeddings = null;

                if (voterDTO.FaceBiometricFile != null && voterDTO.FaceBiometricFile.Length > 0)
                {
                    _logger.LogInformation("Processing biometric file: {FileName}, Size: {Size}", voterDTO.FaceBiometricFile.FileName, voterDTO.FaceBiometricFile.Length);

                    // 1. Parse the facial embeddings from the frontend
                    try
                    {
                        if (string.IsNullOrEmpty(voterDTO.FaceEmbeddings))
                        {
                            return BadRequest("Face embeddings are required when uploading a biometric file.");
                        }

                        embeddings = JsonSerializer.Deserialize<float[]>(voterDTO.FaceEmbeddings);
                        if (embeddings == null || embeddings.Length == 0)
                        {
                            _logger.LogWarning("Invalid face embeddings provided for {Email}", voterDTO.Email);
                            return BadRequest("Invalid face embeddings provided. Embeddings must be a non-empty array of numbers.");
                        }
                        _logger.LogInformation("Face embeddings parsed successfully. Embedding count: {Count}", embeddings.Length);
                    }
                    catch (JsonException ex)
                    {
                        _logger.LogError(ex, "Failed to deserialize face embeddings for {Email}", voterDTO.Email);
                        return BadRequest("Face embeddings must be a valid JSON array of numbers.");
                    }

                    // 2. Save the biometric file (optional on hosted platforms)
                    try
                    {
                        string extension = Path.GetExtension(voterDTO.FaceBiometricFile.FileName);
                        if (string.IsNullOrEmpty(extension))
                        {
                            extension = ".jpg"; // Default extension
                        }

                        // Use NationalIdNo in filename for easier lookups during verification
                        fileName = $"FaceRef_{voterDTO.NationalIdNo}_{Guid.NewGuid()}{extension}";

                        // For hosted platforms, skip file storage and only store embeddings
                        // The image data is not needed for verification - only embeddings matter
                        _logger.LogInformation("Skipping biometric file storage on hosted platform. Only storing embeddings for verification.");

                        _logger.LogInformation("Biometric embeddings processed successfully for {NationalId}", voterDTO.NationalIdNo);
                    }
                    catch (Exception ex)
                    {
                        // Log but don't fail - embeddings are more important than file storage
                        _logger.LogWarning(ex, "File storage failed, but continuing with embeddings for {NationalId}", voterDTO.NationalIdNo);
                    }
                }
                else
                {
                    // No file provided - just validate embeddings
                    if (string.IsNullOrEmpty(voterDTO.FaceEmbeddings))
                    {
                        return BadRequest("Face embeddings are required for biometric registration.");
                    }

                    try
                    {
                        embeddings = JsonSerializer.Deserialize<float[]>(voterDTO.FaceEmbeddings);
                        if (embeddings == null || embeddings.Length == 0)
                        {
                            return BadRequest("Invalid face embeddings provided. Embeddings must be a non-empty array of numbers.");
                        }
                        _logger.LogInformation("Face embeddings parsed successfully. Embedding count: {Count}", embeddings.Length);
                    }
                    catch (JsonException ex)
                    {
                        _logger.LogError(ex, "Failed to deserialize face embeddings for {Email}", voterDTO.Email);
                        return BadRequest("Face embeddings must be a valid JSON array of numbers.");
                    }
                }

                // 3. Create voter record
                var voter = new VoterModel
                {
                    FirstName = voterDTO.FirstName,
                    LastName = voterDTO.LastName,
                    SirName = voterDTO.SirName ?? string.Empty,
                    Fullname = $"{voterDTO.FirstName} {voterDTO.LastName} {voterDTO.SirName}".Trim(),
                    Email = voterDTO.Email,
                    PhoneNumber = voterDTO.PhoneNumber,
                    NationalIdNo = voterDTO.NationalIdNo,
                    Address = voterDTO.Address,
                    Location = voterDTO.Location,
                    Sub_Location = voterDTO.Sub_Location,
                    Ward = voterDTO.Ward,
                    Constituency = voterDTO.Constituency,
                    County = voterDTO.County,
                    Region = voterDTO.Region,
                    SelectedRole = role.Name ?? "Voter",
                    UserId = user.Id,
                    FaceBiometricImage = fileName,
                    FaceEmbeddings = embeddings != null ? JsonSerializer.Serialize(embeddings) : string.Empty,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };

                _logger.LogInformation("Adding voter record to database: {NationalId}", voter.NationalIdNo);
                await _dbContext.AddAsync(voter);
                await _dbContext.SaveChangesAsync();

                _logger.LogInformation("Voter registered successfully: {NationalId}", voter.NationalIdNo);
                return Ok(new { message = "Voter enrolled with face biometrics successfully", voterId = voter.Id });
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Database error during voter registration for {Email}", voterDTO.Email);
                return StatusCode(500, $"Database error: {dbEx.InnerException?.Message ?? dbEx.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during voter registration for {Email}", voterDTO.Email);
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }

        [HttpPost("verifyVoterFace")]
        public async Task<IActionResult> VerifyVoterFace([FromForm] string nationalId, [FromForm] string liveEmbeddingsJson)
        {
            if (string.IsNullOrEmpty(liveEmbeddingsJson)) return BadRequest("Live embeddings are required for verification.");

            try
            {
                var voter = await _dbContext.Voters.FirstOrDefaultAsync(v => v.NationalIdNo == nationalId);
                if (voter == null) return NotFound("Voter not found.");

                if (string.IsNullOrEmpty(voter.FaceEmbeddings))
                    return BadRequest("No biometric data found for this voter. Please re-enroll.");

                // 1. Deserialize the live embeddings from the request
                var liveEmbeddings = JsonSerializer.Deserialize<float[]>(liveEmbeddingsJson);
                if (liveEmbeddings == null || liveEmbeddings.Length == 0) return BadRequest("Invalid live embeddings.");

                // 2. Deserialize the stored embeddings from the database
                var storedEmbeddings = JsonSerializer.Deserialize<float[]>(voter.FaceEmbeddings);
                if (storedEmbeddings == null) return BadRequest("Internal error: Could not process stored biometric data.");

                // 3. Compare the two
                double distance = _biometricService.CalculateDistance(liveEmbeddings, storedEmbeddings);

                // 0.6 is the standard threshold for face recognition. Lower means more similar.
                bool isMatch = distance < 0.6;

                return Ok(new { success = isMatch, distance, message = isMatch ? "Verification successful" : "Face does not match registered biometric record" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }
    }
}