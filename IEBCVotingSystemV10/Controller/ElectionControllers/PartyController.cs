using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using IEBCVotingSystemV10.Data;
using IEBCVotingSystemV10.Model.DTOs;
using IEBCVotingSystemV10.Model.Entity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace IEBCVotingSystemV10.Controller
{
    [Route("api/party")]
    [ApiController]
    public class PartyController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<PartyController> _logger;
        private readonly IWebHostEnvironment _env;

        public PartyController(ApplicationDbContext dbContext, ILogger<PartyController> logger, IWebHostEnvironment env)
        {
            _dbContext = dbContext;
            _logger = logger;
            _env = env;
        }

        [RequestSizeLimit(52428800)] // Set limit to 50 MB for manifesto upload
        [HttpPost("addParty")]
        public async Task<IActionResult> AddParty([FromForm] PartyDTO partyDTO)
        {
            if (partyDTO == null)
            {
                _logger.LogError("AddParty received a null PartyDTO.");
                return BadRequest("Invalid party data provided.");
            }

            _logger.LogInformation("AddParty called for party: {PartyName}", partyDTO.PartyName ?? "Unknown");

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("ModelState invalid for Party: {Errors}", string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));
                return BadRequest(ModelState);
            }

            try
            {
                var existingParty = await _dbContext.Parties.FirstOrDefaultAsync(p => p.PartyName == partyDTO.PartyName);
                if (existingParty != null)
                {
                    _logger.LogWarning("Party with name '{PartyName}' already exists.", partyDTO.PartyName);
                    return BadRequest($"Party with name '{partyDTO.PartyName!}' already exists.");
                }

                string? manifestoPdfPath = null;
                if (partyDTO.ManifestoFile != null)
                {
                    // As per BIOMETRIC_STORAGE_FIX.md, generate a placeholder path and do not save the actual file to disk.
                    _logger.LogInformation("Generating placeholder path for manifesto PDF for party: {PartyName}", partyDTO.PartyName);
                    var extension = Path.GetExtension(partyDTO.ManifestoFile.FileName);
                    if (string.IsNullOrEmpty(extension)) extension = ".pdf"; // Default extension
                    manifestoPdfPath = $"/manifestos/Party_{partyDTO.PartyName!.Replace(" ", "_")}_{Guid.NewGuid()}{extension}";
                }

                string? partyLogoPath = null;
                if (partyDTO.LogoFile != null)
                {
                    _logger.LogInformation("Generating placeholder path for logo for party: {PartyName}", partyDTO.PartyName);
                    var extension = Path.GetExtension(partyDTO.LogoFile.FileName);
                    if (string.IsNullOrEmpty(extension)) extension = ".png";
                    partyLogoPath = $"/logos/Party_Logo_{partyDTO.PartyName!.Replace(" ", "_")}_{Guid.NewGuid()}{extension}";
                }

                var newParty = new PartyModel
                {
                    PartyName = partyDTO.PartyName!,
                    PartyLeader = partyDTO.PartyLeader,
                    ManifestoPdfPath = manifestoPdfPath,
                    PartyLogoPath = partyLogoPath,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _dbContext.Parties.AddAsync(newParty);
                await _dbContext.SaveChangesAsync();

                _logger.LogInformation("Party '{PartyName}' added successfully with ID: {PartyId}", newParty.PartyName, newParty.Id);
                return Ok(new { message = "Party added successfully", partyId = newParty.Id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding party '{PartyName}'.", partyDTO.PartyName);
                return StatusCode(500, $"Internal Server Error: {ex.Message} Inner: {ex.InnerException?.Message}");
            }
        }

        [RequestSizeLimit(52428800)] // Set limit to 50 MB for manifesto upload
        [HttpPut("updateParty/{id}")]
        public async Task<IActionResult> UpdateParty(int id, [FromForm] PartyDTO partyDTO)
        {
            if (partyDTO == null)
            {
                _logger.LogError("UpdateParty received a null PartyDTO for ID: {PartyId}", id);
                return BadRequest("Invalid party data provided.");
            }

            _logger.LogInformation("UpdateParty called for ID: {PartyId}, Party Name: {PartyName}", id, partyDTO.PartyName ?? "Unknown");

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("ModelState invalid for Party ID {PartyId}: {Errors}", id, string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));
                return BadRequest(ModelState);
            }

            try
            {
                var existingParty = await _dbContext.Parties.FindAsync(id);
                if (existingParty == null)
                {
                    _logger.LogWarning("Party with ID {PartyId} not found for update.", id);
                    return NotFound($"Party with ID {id} not found.");
                }

                if (await _dbContext.Parties.AnyAsync(p => p.PartyName == partyDTO.PartyName && p.Id != id))
                {
                    _logger.LogWarning("Another party with name '{PartyName}' already exists.", partyDTO.PartyName);
                    return BadRequest($"Another party with name '{partyDTO.PartyName!}' already exists.");
                }

                existingParty.PartyName = partyDTO.PartyName!;
                existingParty.PartyLeader = partyDTO.PartyLeader;
                existingParty.UpdatedAt = DateTime.UtcNow;

                if (partyDTO.ManifestoFile != null)
                {
                    _logger.LogInformation("Updating manifesto PDF for party ID: {PartyId}", id);
                    var extension = Path.GetExtension(partyDTO.ManifestoFile.FileName);
                    if (string.IsNullOrEmpty(extension)) extension = ".pdf";
                    existingParty.ManifestoPdfPath = $"/manifestos/Party_{partyDTO.PartyName!.Replace(" ", "_")}_{Guid.NewGuid()}{extension}";
                }
                else if (!string.IsNullOrEmpty(partyDTO.ExistingManifestoPdfPath))
                {
                    existingParty.ManifestoPdfPath = partyDTO.ExistingManifestoPdfPath;
                }
                else
                {
                    existingParty.ManifestoPdfPath = null; // Clear manifesto if no new file and no existing path provided
                }

                if (partyDTO.LogoFile != null)
                {
                    _logger.LogInformation("Updating logo for party ID: {PartyId}", id);
                    var extension = Path.GetExtension(partyDTO.LogoFile.FileName);
                    if (string.IsNullOrEmpty(extension)) extension = ".png";
                    existingParty.PartyLogoPath = $"/logos/Party_Logo_{partyDTO.PartyName!.Replace(" ", "_")}_{Guid.NewGuid()}{extension}";
                }

                _dbContext.Parties.Update(existingParty);
                await _dbContext.SaveChangesAsync();

                _logger.LogInformation("Party with ID {PartyId} updated successfully.", id);
                return Ok(new { message = "Party updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating party with ID {PartyId}.", id);
                return StatusCode(500, $"Internal Server Error: {ex.Message} Inner: {ex.InnerException?.Message}");
            }
        }

        [HttpDelete("deleteParty/{id}")]
        public async Task<IActionResult> DeleteParty(int id)
        {
            try
            {
                var party = await _dbContext.Parties.FindAsync(id);
                if (party == null)
                {
                    _logger.LogWarning("Party with ID {PartyId} not found for deletion.", id);
                    return NotFound($"Party with ID {id} not found.");
                }

                _dbContext.Parties.Remove(party);
                await _dbContext.SaveChangesAsync();

                _logger.LogInformation("Party with ID {PartyId} deleted successfully.", id);
                return Ok(new { message = "Party deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting party with ID {PartyId}.", id);
                return StatusCode(500, $"Internal Server Error: {ex.Message} Inner: {ex.InnerException?.Message}");
            }
        }

        [HttpGet("getAllParties")]
        public async Task<IActionResult> GetAllParties()
        {
            try
            {
                var parties = await _dbContext.Parties.ToListAsync();
                return Ok(parties);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all parties.");
                return StatusCode(500, "Internal Server Error while fetching parties.");
            }
        }

        [HttpGet("getParty/{id}")]
        public async Task<IActionResult> GetPartyById(int id)
        {
            try
            {
                var party = await _dbContext.Parties.FindAsync(id);
                if (party == null)
                {
                    _logger.LogWarning("Party with ID {PartyId} not found.", id);
                    return NotFound($"Party with ID {id} not found.");
                }
                return Ok(party);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching party with ID {PartyId}.", id);
                return StatusCode(500, "Internal Server Error while fetching party.");
            }
        }
    }
}