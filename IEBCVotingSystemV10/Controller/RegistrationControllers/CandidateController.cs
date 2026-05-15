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
using Microsoft.AspNetCore.Identity;
using IEBCVotingSystemV10.Model.Enums;

namespace IEBCVotingSystemV10.Controller.RegistrationControllers
{
    [Route("api/candidate")]
    [ApiController]
    public class CandidateController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IBiometricService _biometricService;
        private readonly ILogger<CandidateController> _logger;
        private readonly IWebHostEnvironment _env;
        private readonly RoleManager<AppUserRoles> _roleManager;

        public CandidateController(ApplicationDbContext dbContext, IBiometricService biometricService, ILogger<CandidateController> logger, IWebHostEnvironment env, RoleManager<AppUserRoles> roleManager)
        {
            this._dbContext = dbContext;
            this._biometricService = biometricService;
            this._logger = logger;
            this._env = env;
            this._roleManager = roleManager;
        }

        [HttpPost("registerCandidate")]
        public async Task<IActionResult> RegisterCandidate([FromForm] CandidateDTO candidateDTO)
        {
            if (candidateDTO == null)
            {
                _logger.LogError("RegisterCandidate received a null CandidateDTO.");
                return BadRequest("Invalid candidate data provided.");
            }

            _logger.LogInformation("RegisterCandidate called for email: {Email}", candidateDTO.Email);

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("ModelState invalid for Candidate: {Errors}", string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));
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

                var role = await _roleManager.FindByNameAsync(candidateDTO.Role);
                if (role == null)
                {
                    _logger.LogWarning("Role not found: {Role}", candidateDTO.Role);
                    return BadRequest("Role name doesn't exist");
                }
                candidateDTO.Role = role.Name ?? "Candidate";

                var electionPosition = await _dbContext.ElectionPositions.FirstOrDefaultAsync(ep => ep.Id == candidateDTO.ElectionPositionId);
                if (electionPosition == null)
                {
                    _logger.LogWarning("Election position not found for ID: {ElectionPositionId}", candidateDTO.ElectionPositionId);
                    return BadRequest("Selected election position does not exist.");
                }

                var election = await _dbContext.Elections.FirstOrDefaultAsync(e => e.Id == candidateDTO.ElectionId);
                if (election == null)
                {
                    _logger.LogWarning("Election not found for ID: {ElectionId}", candidateDTO.ElectionId);
                    return BadRequest("Selected election does not exist.");
                }

                var partyEntity = await _dbContext.Parties.FirstOrDefaultAsync(p => p.Id == candidateDTO.PartyId);
                if (partyEntity == null)
                {
                    _logger.LogWarning("Party not found for ID: {PartyId}", candidateDTO.PartyId);
                    return BadRequest("Selected political party does not exist.");
                }

                // Handle Biometric Face Enrollment
                string faceBiometricPath = "embeddings_only"; // Default when no file is stored
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
                        faceBiometricPath = await SaveFile(candidateDTO.FaceBiometricFile, "Biometrics/Candidates", candidateDTO.NationalIdNo);
                        _logger.LogInformation("Biometric file saved to: {Path}", faceBiometricPath);
                    }
                    catch (JsonException ex)
                    {
                        _logger.LogError(ex, "Failed to deserialize candidate embeddings for {Email}", candidateDTO.Email);
                        return BadRequest("Face embeddings must be a valid JSON array of numbers.");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error saving biometric file for candidate {NationalId}", candidateDTO.NationalIdNo);
                        return StatusCode(500, $"Error saving biometric file: {ex.Message}");
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
                        _logger.LogInformation("Face embeddings parsed successfully. Embedding count: {Count}", embeddings.Length);
                    }
                    catch (JsonException ex)
                    {
                        _logger.LogError(ex, "Failed to deserialize face embeddings for {Email}", candidateDTO.Email);
                        return BadRequest("Face embeddings must be a valid JSON array of numbers.");
                    }
                }

                // Handle Manifesto PDF Upload
                string? manifestoPdfPath = null;
                if (candidateDTO.ManifestoPdfFile != null && candidateDTO.ManifestoPdfFile.Length > 0)
                {
                    try
                    {
                        manifestoPdfPath = await SaveFile(candidateDTO.ManifestoPdfFile, "Manifestos/Candidates", candidateDTO.NationalIdNo);
                        _logger.LogInformation("Manifesto PDF saved to: {Path}", manifestoPdfPath);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error saving manifesto PDF for candidate {NationalId}", candidateDTO.NationalIdNo);
                        return StatusCode(500, $"Error saving manifesto PDF: {ex.Message}");
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
                    PartyId = candidateDTO.PartyId,
                    Party = partyEntity.PartyName,
                    ElectionId = candidateDTO.ElectionId,
                    Election = election.ElectionName,
                    Address = candidateDTO.Address,
                    Location = candidateDTO.Location,
                    Sub_Location = candidateDTO.Sub_Location,
                    Ward = candidateDTO.Ward,
                    Constituency = candidateDTO.Constituency,
                    County = candidateDTO.County,
                    Region = candidateDTO.Region,
                    Role = candidateDTO.Role,
                    UserId = user.Id,
                    ManifestoPdfPath = manifestoPdfPath ?? string.Empty,
                    FaceBiometricImage = faceBiometricPath,
                    FaceEmbeddings = embeddings != null ? JsonSerializer.Serialize(embeddings) : string.Empty,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    ElectionPositionId = candidateDTO.ElectionPositionId,
                    ElectionPosition = electionPosition.Position,
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

        // Helper method to save files to wwwroot
        private async Task<string> SaveFile(IFormFile file, string folderName, string identifier)
        {
            string webRootPath = _env.WebRootPath;
            var uploadFolder = Path.Combine(webRootPath, "uploads", folderName);
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
            return Path.Combine("/uploads", folderName, uniqueFileName).Replace("\\", "/");
        }

        [HttpGet("election/{electionId}")]
        public async Task<IActionResult> GetCandidatesByElection(int electionId)
        {
            try
            {
                var candidates = await _dbContext.Candidates
                    .Where(c => c.ElectionId == electionId)
                    .Select(c => new
                    {
                        c.Id,
                        c.Fullname,
                        c.Party,
                        c.ElectionPosition,
                        c.FaceBiometricImage // Using FaceBiometricImage for display
                    })
                    .ToListAsync();

                return Ok(candidates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching candidates for election ID: {ElectionId}", electionId);
                return StatusCode(500, "Internal Server Error while fetching candidates.");
            }
        }

        [HttpGet("getAllCandidates")]
        public async Task<IActionResult> GetAllCandidates()
        {
            try
            {
                var candidates = await _dbContext.Candidates.ToListAsync();
                return Ok(candidates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all candidates");
                return StatusCode(500, "Internal Server Error");
            }
        }

        [HttpGet("getCandidate/{id}")]
        public async Task<IActionResult> GetCandidate(int id)
        {
            try
            {
                var candidate = await _dbContext.Candidates.FindAsync(id);
                if (candidate == null) return NotFound("Candidate not found");
                return Ok(candidate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching candidate ID: {Id}", id);
                return StatusCode(500, "Internal Server Error");
            }
        }

        [HttpPut("updateCandidate/{id}")]
        public async Task<IActionResult> UpdateCandidate(int id, [FromBody] CandidateUpdateDTO candidateUpdate)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var existingCandidate = await _dbContext.Candidates.FindAsync(id);
                if (existingCandidate == null) return NotFound("Candidate not found");

                existingCandidate.FirstName = candidateUpdate.FirstName;
                existingCandidate.LastName = candidateUpdate.LastName;
                existingCandidate.SurName = candidateUpdate.SurName ?? string.Empty;
                existingCandidate.Fullname = $"{candidateUpdate.FirstName} {candidateUpdate.LastName} {candidateUpdate.SurName}".Trim();
                existingCandidate.PhoneNumber = candidateUpdate.PhoneNumber;
                existingCandidate.Address = candidateUpdate.Address;
                existingCandidate.Location = candidateUpdate.Location;
                existingCandidate.Sub_Location = candidateUpdate.Sub_Location;
                existingCandidate.Ward = candidateUpdate.Ward;
                existingCandidate.Constituency = candidateUpdate.Constituency;
                existingCandidate.County = candidateUpdate.County;
                existingCandidate.Region = candidateUpdate.Region;
                existingCandidate.Role = candidateUpdate.Role;

                // Sync denormalized relational names if IDs have changed
                var party = await _dbContext.Parties.FindAsync(candidateUpdate.PartyId);
                if (party == null) return BadRequest("Selected party does not exist");
                existingCandidate.PartyId = party.Id;
                existingCandidate.Party = party.PartyName;

                var election = await _dbContext.Elections.FindAsync(candidateUpdate.ElectionId);
                if (election == null) return BadRequest("Selected election does not exist");
                existingCandidate.ElectionId = election.Id;
                existingCandidate.Election = election.ElectionName;

                var position = await _dbContext.ElectionPositions.FindAsync(candidateUpdate.ElectionPositionId);
                if (position == null) return BadRequest("Selected position does not exist");
                existingCandidate.ElectionPositionId = position.Id;
                existingCandidate.ElectionPosition = position.Position;

                existingCandidate.UpdatedAt = DateTime.UtcNow;

                _dbContext.Candidates.Update(existingCandidate);
                await _dbContext.SaveChangesAsync();

                return Ok(new { message = "Candidate updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating candidate ID: {Id}", id);
                return StatusCode(500, "Internal Server Error");
            }
        }

        [HttpDelete("deleteCandidate/{id}")]
        public async Task<IActionResult> DeleteCandidate(int id)
        {
            try
            {
                var candidate = await _dbContext.Candidates.FindAsync(id);
                if (candidate == null) return NotFound("Candidate does not exist");

                // Referential integrity: Clean up associated votes
                var associatedVotes = await _dbContext.Votes.Where(v => v.CandidateId == id).ToListAsync();
                _dbContext.Votes.RemoveRange(associatedVotes);

                _dbContext.Candidates.Remove(candidate);
                await _dbContext.SaveChangesAsync();

                return Ok(new { message = "Candidate and associated votes deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting candidate ID: {Id}", id);
                return StatusCode(500, "Internal Server Error");
            }
        }

        [HttpGet("getCandidateVotes/{id}")]
        public async Task<IActionResult> GetCandidateVotes(int id)
        {
            try
            {
                var candidate = await _dbContext.Candidates.FindAsync(id);
                if (candidate == null) return NotFound("Candidate not found");

                var votes = await _dbContext.Votes
                    .Where(v => v.CandidateId == id)
                    .ToListAsync();

                return Ok(new
                {
                    candidateId = id,
                    candidateName = candidate.Fullname,
                    voteCount = votes.Count,
                    votes
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching votes for candidate ID: {Id}", id);
                return StatusCode(500, "Internal Server Error");
            }
        }
    }
}