using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Reflection.Metadata.Ecma335;
using System.Threading.Tasks;
using IEBCVotingSystemV10.Data;
using IEBCVotingSystemV10.Model.DTOs;
using IEBCVotingSystemV10.Model.Entity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace IEBCVotingSystemV10.Controller.ElectionControllers
{
    [Route("api/election-type")]
    [ApiController]
    public class ElectionTypeController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<ElectionTypeController> _logger;
        public ElectionTypeController(ApplicationDbContext dbContext,
                                      ILogger<ElectionTypeController> logger)
        {
            this._dbContext = dbContext;
            this._logger = logger;
        }

        [HttpPost("addElectionType")]
        public async Task<IActionResult> AddElectionType(ElectionTypeDTO electionTypeDTO)
        {
            try
            {
                var existing = await _dbContext.ElectionTypes.FirstOrDefaultAsync(e => e.Type == electionTypeDTO.Type);
                if (existing != null)
                {
                    return BadRequest("Election type already exists");
                }
                var newElectionType = new ElectionTypeModel
                {
                    Type = electionTypeDTO.Type,
                    Description = electionTypeDTO.Description,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow

                };
                await _dbContext.AddAsync(newElectionType);
                await _dbContext.SaveChangesAsync();
                return Ok(new { message = "Election type added successfully" });

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding election type: {Type}", electionTypeDTO.Type);
                return StatusCode(500, "Internal Server Error");
            }
        }
        [HttpPut("updateElectionType/{id}")]
        public async Task<IActionResult> UpdateElectionType(int id, [FromBody] ElectionTypeDTO electionTypeDTO)
        {
            try
            {
                var existingElectionType = await _dbContext.ElectionTypes.FindAsync(id);
                if (existingElectionType == null)
                {
                    return NotFound("Election type does not exist");
                }
                if (await _dbContext.ElectionTypes.AnyAsync(et => et.Type == electionTypeDTO.Type && et.Id != id))
                {
                    return BadRequest("Another election type with this name already exists");
                }
                existingElectionType.Type = electionTypeDTO.Type;
                existingElectionType.Description = electionTypeDTO.Description;
                existingElectionType.UpdatedAt = DateTime.UtcNow;

                _dbContext.ElectionTypes.Update(existingElectionType);
                await _dbContext.SaveChangesAsync();
                return Ok(new { message = "Election type updated successfully" });

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating election type ID: {Id}", id);
                return StatusCode(500, "Interal Server Error");
            }
        }
        [HttpDelete("deleteElectnType/{id}")]
        public async Task<IActionResult> DeleteElectionType(int id)
        {
            try
            {
                var electionType = await _dbContext.ElectionTypes.FindAsync(id);
                if (electionType == null)
                {
                    return NotFound("Electioin type does not exist");
                }

                _dbContext.ElectionTypes.Remove(electionType);
                await _dbContext.SaveChangesAsync();
                return Ok(new { message = "Election type deleted successfully" });

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting election type ID:{Id}", id);
                return StatusCode(500, "Internal Server Error");
            }
        }
        [HttpGet("getAllElectionTypes")]
        public async Task<IActionResult> GetAllElectionTypes()
        {
            try
            {
                var electionTypes = await _dbContext.ElectionTypes.ToListAsync();
                return Ok(electionTypes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all election types");
                return StatusCode(500, "Internal Server Error");
            }
        }


    }
}