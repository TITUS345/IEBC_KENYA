using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text.Json;
using System.Linq;
using System.Threading.Tasks;
using IEBCVotingSystemV10.Data;
using IEBCVotingSystemV10.Model.Entity;
using IEBCVotingSystemV10.Model.DTOs;
using IEBCVotingSystemV10.Model.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using IEBCVotingSystemV10.Services;

namespace IEBCVotingSystemV10.Controller
{
    [Route("api/vote-casting")]
    public class VoteCastingController : ControllerBase
    {
        private readonly ILogger<VoteCastingController> _logger;
        private readonly ApplicationDbContext _dbContext;
        private readonly IBiometricService _biometricService; // Assuming an IBiometricService exists

        public VoteCastingController(ILogger<VoteCastingController> logger,
                                     ApplicationDbContext dbContext,
                                     IBiometricService biometricService) // Inject IBiometricService
        {
            this._logger = logger;
            this._dbContext = dbContext;
            this._biometricService = biometricService;
        }
        [HttpPost("castVote")]
        public async Task<IActionResult> CastVote(VoteRequestDTO voteRequestDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var voter = await _dbContext.Voters.FirstOrDefaultAsync(v => v.Email == voteRequestDTO.VoterEmail);
                if (voter == null)
                {
                    return BadRequest("Voter does not exist");
                }
                var candidate = await _dbContext.Candidates.FirstOrDefaultAsync(c => c.Id == voteRequestDTO.CandidateId);
                if (candidate == null)
                {
                    return BadRequest("Candidate does not exist");
                }
                var election = await _dbContext.Elections.FirstOrDefaultAsync(e => e.Id == voteRequestDTO.ElectionId);
                if (election == null)
                {
                    return BadRequest("Election does not exist");
                }
                if (election.Status != ElectionStatus.Ongoing)
                {
                    _logger.LogWarning("Vote attempt failed for {VoterEmail}: Election {ElectionName} is not ongoing (Status: {Status}).", voteRequestDTO.VoterEmail, election.ElectionName, election.Status);
                    return BadRequest($"Election'{election.ElectionName}' is not currently ongoing.Status:{election.Status}");
                }
                var currentTime = DateTime.UtcNow;
                if (currentTime < election.StartDate || currentTime > election.EndDate)
                {
                    _logger.LogWarning("Vote attempt failed for {VoterEmail}: Election {ElectionName} is outside its active period (Start: {StartDate}, End: {EndDate}, Current: {CurrentTime}).", voteRequestDTO.VoterEmail, election.ElectionName, election.StartDate, election.EndDate, currentTime);
                    return BadRequest($"Voting for '{election.ElectionName}' is only allowed between {election.StartDate.ToLocalTime()} and {election.EndDate.ToLocalTime()}.");
                }
                // 5. Prevent Double Voting
                var existingVote = await _dbContext.Votes.AnyAsync(v => v.VoterId == voter.Id && v.ElectionId == election.Id);
                if (existingVote)
                {
                    _logger.LogWarning("Vote attempt failed for {VoterEmail}: Already voted in election {ElectionName}.", voteRequestDTO.VoterEmail, election.ElectionName);
                    return Conflict("You have already cast your vote for this election.");
                }

                // 6. Biometric Verification
                if (string.IsNullOrEmpty(voter.FaceEmbeddings))
                {
                    _logger.LogWarning("Vote attempt failed for {VoterEmail}: No biometric data found in record.", voteRequestDTO.VoterEmail);
                    return BadRequest("No biometric data found for this voter. Please re-enroll.");
                }

                float[]? liveEmbeddings;
                float[]? storedEmbeddings;

                try
                {
                    liveEmbeddings = JsonSerializer.Deserialize<float[]>(voteRequestDTO.LiveFaceEmbeddings);
                    storedEmbeddings = JsonSerializer.Deserialize<float[]>(voter.FaceEmbeddings);
                }
                catch (JsonException ex)
                {
                    _logger.LogError(ex, "Failed to deserialize face embeddings for {VoterEmail}", voteRequestDTO.VoterEmail);
                    return BadRequest("Invalid biometric data format.");
                }

                if (liveEmbeddings == null || liveEmbeddings.Length == 0 || storedEmbeddings == null)
                {
                    return BadRequest("Internal error: Could not process biometric data.");
                }

                // Calculate distance (lower means more similar)
                double distance = _biometricService.CalculateDistance(liveEmbeddings, storedEmbeddings);
                const double BIOMETRIC_THRESHOLD = 0.6; // Consistent with VoterController verification

                if (distance > BIOMETRIC_THRESHOLD)
                {
                    _logger.LogWarning("Vote attempt failed for {VoterEmail}: Biometric verification failed with distance {Distance}.", voteRequestDTO.VoterEmail, distance);
                    return Unauthorized("Biometric verification failed. Please try again or contact support.");
                }

                // 7. Record the Vote
                var newVote = new VoteModel
                {
                    VoterId = voter.Id,
                    Voter = voter.Fullname, // Or just voter.Email, depending on what you want to store
                    CandidateId = candidate.Id,
                    Candidate = candidate.Fullname,
                    ElectionId = election.Id,
                    Election = election.ElectionName,
                    BiometricVerificationScore = distance,
                    IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() // Capture client IP
                };

                await _dbContext.Votes.AddAsync(newVote);
                await _dbContext.SaveChangesAsync();

                _logger.LogInformation("Vote successfully cast by {VoterEmail} for candidate {CandidateName} in election {ElectionName} with biometric distance {Distance}.", voteRequestDTO.VoterEmail, candidate.Fullname, election.ElectionName, distance);
                return Ok(new { message = "Vote cast successfully!" });



            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error casting vote: {VoterEmail}", voteRequestDTO.VoterEmail);
                return StatusCode(500, "Internal Server Error");
            }
        }
    }
}
