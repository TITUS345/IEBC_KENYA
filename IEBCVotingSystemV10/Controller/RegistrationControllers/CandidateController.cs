using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using IEBCVotingSystemV10.Data;
using IEBCVotingSystemV10.Model.DTOs;
using IEBCVotingSystemV10.Model.Entity;
using IEBCVotingSystemV10.Services;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace IEBCVotingSystemV10.Controller.RegistrationController
{
    [Route("api/candidate")]
    public class CandidateController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IBiometricService _biometricService;
        private readonly ILogger<CandidateController> _logger;
        private readonly IWebHostEnvironment _env;

        public CandidateController(ApplicationDbContext dbContext, IBiometricService biometricService, ILogger<CandidateController> logger, IWebHostEnvironment env)
        {
            this._dbContext = dbContext;
            this._biometricService = biometricService;
            this._logger = logger;
            this._env = env;
        }

        [HttpPost("registerCandidate")]
        public async Task<IActionResult> RegisterCandidate([FromForm] CandidateDTO candidateDTO)
        {
            _logger.LogInformation("RegisterCandidate called for email: {Email}", candidateDTO.Email);

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("ModelState invalid for Candidate: {Errors}", ModelState.Values.SelectMany(v => v.Errors));
                return BadRequest(ModelState);
            }
            try
            {
                // Validate required fields
                if (string.IsNullOrEmpty(candidateDTO.FirstName) || string.IsNullOrEmpty(candidateDTO.LastName))
                {
                    return BadRequest("First Name and Last Name are required");
                }

                var candidateExists = await _dbContext.Candidates.FirstOrDefaultAsync(c => c.NationalIdNo == candidateDTO.NationalIdNo);
                if (candidateExists != null)
                {
                    _logger.LogWarning("Candidate already registered with ID: {NationalId}", candidateDTO.NationalIdNo);
                    return BadRequest("Candidate already registered with the Id");
                }

                var emailExists = await _dbContext.Candidates.FirstOrDefaultAsync(c => c.Email == candidateDTO.Email);
                if (emailExists != null)
                {
                    _logger.LogWarning("Email already registered for candidate: {Email}", candidateDTO.Email);
                    return BadRequest("Candidate with this Email already exists");
                }

                var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == candidateDTO.Email);
                if (user == null)
                {
                    _logger.LogWarning("User account not found for candidate: {Email}", candidateDTO.Email);
                    return BadRequest("No system user account found for this email. Please register a user account before enrolling as a candidate.");
                }

                candidateDTO.UserId = user.Id;

                var role = await _dbContext.Roles.FirstOrDefaultAsync(r => r.Name == candidateDTO.Role);
                if (role == null)
                {
                    _logger.LogWarning("Role not found: {Role}", candidateDTO.Role);
                    return BadRequest("Role name doesn't exist");
                }
                candidateDTO.Role = role.Name ?? "Candidate";

                // Handle Biometric Face Enrollment
                var fileName = "embeddings_only"; // Default when no file is stored
                float[]? embeddings = null;

                if (candidateDTO.FaceBiometricFile != null && candidateDTO.FaceBiometricFile.Length > 0)
                {
                    _logger.LogInformation("Processing candidate biometric file: {FileName}", candidateDTO.FaceBiometricFile.FileName);

                    // 1. Parse the facial embeddings from the frontend
                    try
                    {
                        if (string.IsNullOrEmpty(candidateDTO.FaceEmbeddings))
                        {
                            return BadRequest("Face embeddings are required when uploading a biometric file.");
                        }

                        embeddings = JsonSerializer.Deserialize<float[]>(candidateDTO.FaceEmbeddings);
                        if (embeddings == null || embeddings.Length == 0)
                        {
                            _logger.LogWarning("Invalid face embeddings for candidate {Email}", candidateDTO.Email);
                            return BadRequest("Invalid face embeddings provided.");
                        }
                        _logger.LogInformation("Face embeddings parsed successfully for candidate.");
                    }
                    catch (JsonException ex)
                    {
                        _logger.LogError(ex, "Failed to deserialize candidate embeddings for {Email}", candidateDTO.Email);
                        return BadRequest("Face embeddings must be a valid JSON array of numbers.");
                    }

                    // Skip file storage on hosted platforms - only store embeddings for candidate verification
                    try
                    {
                        var extension = Path.GetExtension(candidateDTO.FaceBiometricFile.FileName);
                        if (string.IsNullOrEmpty(extension)) extension = ".jpg";
                        fileName = $"FaceRef_Cand_{candidateDTO.NationalIdNo}_{Guid.NewGuid()}{extension}";
                        _logger.LogInformation("Skipping biometric file storage for candidate on hosted platform.");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Biometric file metadata generation failed, continuing with embeddings.");
                    }
                }
                else
                {
                    // No file provided - just validate embeddings
                    if (string.IsNullOrEmpty(candidateDTO.FaceEmbeddings))
                    {
                        return BadRequest("Face embeddings are required for biometric registration.");
                    }

                    try
                    {
                        embeddings = JsonSerializer.Deserialize<float[]>(candidateDTO.FaceEmbeddings);
                        if (embeddings == null || embeddings.Length == 0)
                        {
                            return BadRequest("Invalid face embeddings provided.");
                        }
                        _logger.LogInformation("Face embeddings parsed successfully for candidate.");
                    }
                    catch (JsonException ex)
                    {
                        _logger.LogError(ex, "Failed to deserialize candidate embeddings for {Email}", candidateDTO.Email);
                        return BadRequest("Face embeddings must be a valid JSON array of numbers.");
                    }
                }

                // Handle Manifesto PDF Upload
                string? manifestoPdfPath = null;
                if (candidateDTO.ManifestoPdfFile != null)
                {
                    try
                    {
                        manifestoPdfPath = await SaveFile(candidateDTO.ManifestoPdfFile, "manifestos");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error saving manifesto PDF for candidate {Email}", candidateDTO.Email);
                        return StatusCode(500, $"Error uploading manifesto: {ex.Message}");
                    }
                }
                var newCandidate = new CandidateModel
                {
                    FirstName = candidateDTO.FirstName,
                    LastName = candidateDTO.LastName,
                    SurName = candidateDTO.SurName,
                    Fullname = $"{candidateDTO.FirstName} {candidateDTO.LastName} {candidateDTO.SurName}".Trim(),
                    Email = candidateDTO.Email,
                    PhoneNumber = candidateDTO.PhoneNumber,
                    NationalIdNo = candidateDTO.NationalIdNo,
                    Address = candidateDTO.Address,
                    Location = candidateDTO.Location,
                    Sub_Location = candidateDTO.Sub_Location,
                    Ward = candidateDTO.Ward,
                    Constituency = candidateDTO.Constituency,
                    County = candidateDTO.County,
                    Region = candidateDTO.Region,
                    Role = candidateDTO.Role,
                    UserId = user.Id,
                    ManifestoPdfPath = manifestoPdfPath,
                    FaceBiometricImage = fileName,
                    FaceEmbeddings = JsonSerializer.Serialize(embeddings),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };

                _logger.LogInformation("Saving candidate record to database: {Email}", newCandidate.Email);
                await _dbContext.AddAsync(newCandidate);
                await _dbContext.SaveChangesAsync();

                _logger.LogInformation("Candidate registered successfully: {Email}", newCandidate.Email);
                return Ok(new { message = "Candidate enrolled with face biometrics successfully", candidateId = newCandidate.Id });
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Database error during candidate registration for {Email}", candidateDTO.Email);
                return StatusCode(500, $"Database error: {dbEx.InnerException?.Message ?? dbEx.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during candidate registration for {Email}", candidateDTO.Email);
                return StatusCode(500, $"Internal Server Error: {ex.Message} Inner: {ex.InnerException?.Message}");
            }
        }

        private async Task<string> SaveFile(IFormFile file, string folderName)
        {
            var uploadFolder = Path.Combine(_env.WebRootPath, folderName);
            if (!Directory.Exists(uploadFolder))
            {
                Directory.CreateDirectory(uploadFolder);
            }

            var uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(file.FileName);
            var filePath = Path.Combine(uploadFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }
            return $"/{folderName}/{uniqueFileName}";
        }
    }
}