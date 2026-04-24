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

        public VoterController(ApplicationDbContext dbContext,
                                RoleManager<AppUserRoles> roleManager,
                                IBiometricService biometricService)
        {
            this._dbContext = dbContext;
            this._roleManager = roleManager;
            this._biometricService = biometricService;
        }

        [HttpPost("registerVoter")]
        public async Task<IActionResult> RegisterVoter([FromForm] VoterDTO voterDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                var voterExist = await _dbContext.Voters.FirstOrDefaultAsync(v => v.NationalIdNo == voterDTO.NationalIdNo);
                if (voterExist != null) return BadRequest("Voter is already registered");

                var emailExists = await _dbContext.Voters.FirstOrDefaultAsync(v => v.Email == voterDTO.Email);
                if (emailExists != null) return BadRequest("Voter with the Email already exists");


                var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == voterDTO.Email);
                if (user == null)
                {
                    return BadRequest("User account not found. Please register a user account first.");
                }

                voterDTO.UserId = user.Id;
                voterDTO.NationalIdNo = user.NationalIdNo;
                voterDTO.Email = user.Email ?? "";

                var roleName = voterDTO.SelectedRole;

                var role = await _roleManager.FindByNameAsync(roleName);
                if (role == null) return BadRequest("The specified role does not exist");

                // Handle Biometric Face Enrollment
                string fileName = "pending_enrollment.png";
                float[]? embeddings = null;

                if (voterDTO.FaceBiometricFile != null)
                {
                    // 1. Parse the facial embeddings from the frontend
                    try
                    {
                        embeddings = JsonSerializer.Deserialize<float[]>(voterDTO.FaceEmbeddings);
                        if (embeddings == null || embeddings.Length == 0)
                        {
                            return BadRequest("Invalid face embeddings provided.");
                        }
                    }
                    catch
                    {
                        return BadRequest("Face embeddings must be a valid JSON array of numbers.");
                    }

                    string extension = Path.GetExtension(voterDTO.FaceBiometricFile.FileName);
                    // Use ID in filename to make lookups easier for verification
                    fileName = $"FaceRef_{voterDTO.NationalIdNo}_{Guid.NewGuid()}{extension}";

                    string dirPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "Biometrics", "Voters");

                    if (!Directory.Exists(dirPath))
                    {
                        Directory.CreateDirectory(dirPath);
                    }

                    string fullPath = Path.Combine(dirPath, fileName);
                    using (var stream = new FileStream(fullPath, FileMode.Create))
                    {
                        await voterDTO.FaceBiometricFile.CopyToAsync(stream);
                    }
                }


                var voter = new VoterModel
                {
                    FirstName = voterDTO.FirstName,
                    LastName = voterDTO.LastName,
                    SirName = voterDTO.SirName,
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
                    UserId = user?.Id ?? string.Empty,
                    FaceBiometricImage = fileName,
                    // Convert the array of numbers into a JSON string to store in the DB
                    FaceEmbeddings = JsonSerializer.Serialize(embeddings),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,

                };

                await _dbContext.AddAsync(voter);
                await _dbContext.SaveChangesAsync();

                return Ok(new { message = "Voter enrolled with face biometrics successfully" });


            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message} Inner: {ex.InnerException?.Message}");
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