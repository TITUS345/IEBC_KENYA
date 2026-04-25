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

namespace IEBCVotingSystemV10.Controller.RegistrationController
{
    [Route("api/candidate")]
    public class CandidateController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IBiometricService _biometricService;

        public CandidateController(ApplicationDbContext dbContext, IBiometricService biometricService)
        {
            this._dbContext = dbContext;
            this._biometricService = biometricService;
        }

        [HttpPost("registerCandidate")]
        public async Task<IActionResult> RegisterCandidate([FromForm] CandidateDTO candidateDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var candidateExists = await _dbContext.Candidates.FirstOrDefaultAsync(c => c.NationalIdNo == candidateDTO.NationalIdNo);
                if (candidateExists != null) return BadRequest("Candidate already registered with the Id");

                var emailExists = await _dbContext.Candidates.FirstOrDefaultAsync(c => c.Email == candidateDTO.Email);
                if (emailExists != null) return BadRequest("Candidate with this Email already exists");

                var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == candidateDTO.Email);
                if (user != null)
                {
                    candidateDTO.UserId = user.Id;
                }
                else
                {
                    return BadRequest("No system user account found for this email. Please register a user account before enrolling as a candidate.");
                }
                var role = await _dbContext.Roles.FirstOrDefaultAsync(r => r.Name == candidateDTO.Role);
                if (role != null)
                {
                    candidateDTO.Role = role.Name ?? "";
                }
                else
                {
                    return BadRequest("Role name doesn't exist");
                }

                // Handle Biometric Face Enrollment
                var fileName = "embeddings_only"; // Default when no file is stored
                float[]? embeddings = null;

                if (candidateDTO.FaceBiometricFile != null)
                {
                    // 1. Parse the facial embeddings from the frontend
                    try
                    {
                        embeddings = JsonSerializer.Deserialize<float[]>(candidateDTO.FaceEmbeddings);
                        if (embeddings == null || embeddings.Length == 0)
                        {
                            return BadRequest("Invalid face embeddings provided.");
                        }
                    }
                    catch
                    {
                        return BadRequest("Face embeddings must be a valid JSON array of numbers.");
                    }

                    // Skip file storage on hosted platforms - only store embeddings
                    var extension = Path.GetExtension(candidateDTO.FaceBiometricFile.FileName);
                    fileName = $"FaceRef_Cand_{candidateDTO.NationalIdNo}_{Guid.NewGuid()}{extension}";

                    // File storage bypassed for hosted platforms
                    // Only embeddings are needed for verification
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
                    }
                    catch
                    {
                        return BadRequest("Face embeddings must be a valid JSON array of numbers.");
                    }
                }

                var newCandidate = new CandidateModel
                {
                    FirstName = candidateDTO.FirstName,
                    LastName = candidateDTO.LastName,
                    SirName = candidateDTO.SirName,
                    Fullname = $"{candidateDTO.FirstName} {candidateDTO.LastName} {candidateDTO.SirName}".Trim(),
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
                    Role = role?.Name ?? "Candidate",
                    UserId = user?.Id ?? string.Empty,
                    FaceBiometricImage = fileName,
                    FaceEmbeddings = JsonSerializer.Serialize(embeddings),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,

                };

                await _dbContext.AddAsync(newCandidate);
                await _dbContext.SaveChangesAsync();

                return Ok(new { message = "Candidate enrolled with face biometrics successfully" });

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message} Inner: {ex.InnerException?.Message}");
            }
        }

    }
}