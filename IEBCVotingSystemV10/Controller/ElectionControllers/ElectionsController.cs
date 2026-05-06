using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using IEBCVotingSystemV10.Data;
using IEBCVotingSystemV10.Model.DTOs;
using IEBCVotingSystemV10.Model.Entity;
using IEBCVotingSystemV10.Model.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace IEBCVotingSystemV10.Controller
{
    [Route("api/elections")]
    [ApiController]
    public class ElectionsController : ControllerBase
    {
        private readonly ILogger<ElectionsController> _logger;
        private readonly ApplicationDbContext _dbContext;

        public ElectionsController(ILogger<ElectionsController> logger,
                                           ApplicationDbContext dbContext)
        {
            _logger = logger;
            _dbContext = dbContext;
        }

        [HttpPost("addElection")]
        public async Task<IActionResult> AddElection(ElectionDTO electionDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var existing = await _dbContext.Elections.FirstOrDefaultAsync(e => e.ElectionName == electionDTO.ElectionName);
                if (existing != null)
                {
                    return BadRequest("Election name already exists");
                }
                var typeEntity = await _dbContext.ElectionTypes.FirstOrDefaultAsync(e => e.Type == electionDTO.ElectionType);
                if (typeEntity == null)
                {
                    return BadRequest("Election type does not exist");
                }

                var createdBy = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == electionDTO.CreatedBy);
                if (createdBy == null)
                {
                    return BadRequest("Created by does not exist");
                }

                if (electionDTO.StartDate > electionDTO.EndDate)
                {
                    return BadRequest("Start date cannot be after end date");
                }

                // Logic for General Election (All Positions) vs Specific Election
                if (typeEntity.Type.Equals("General Election", StringComparison.OrdinalIgnoreCase))
                {
                    var allPositions = await _dbContext.ElectionPositions.ToListAsync();
                    var newElections = allPositions.Select(pos => new ElectionModel
                    {
                        // Append position name to make the record unique (e.g. "2027 General Election - President")
                        ElectionName = $"{electionDTO.ElectionName} - {pos.Position}",
                        Description = electionDTO.Description,
                        ElectionTypeId = typeEntity.Id,
                        ElectionType = typeEntity.Type,
                        ElectionPositionId = pos.Id,
                        ElectionPosition = pos.Position,
                        CreatedById = createdBy.Id,
                        CreatedBy = createdBy.Email!,
                        Status = electionDTO.Status,
                        StartDate = electionDTO.StartDate.ToUniversalTime(),
                        EndDate = electionDTO.EndDate.ToUniversalTime(),
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    }).ToList();

                    await _dbContext.Elections.AddRangeAsync(newElections);
                    await _dbContext.SaveChangesAsync();
                    return Ok(new { message = $"General Election launched with {newElections.Count} positions." });
                }

                // Logic for By-Elections or specific types
                var positionEntity = await _dbContext.ElectionPositions.FirstOrDefaultAsync(e => e.Position == electionDTO.ElectionPosition);
                if (positionEntity == null)
                {
                    return BadRequest("Election position does not exist");
                }

                var existingSingle = await _dbContext.Elections.FirstOrDefaultAsync(e => e.ElectionName == electionDTO.ElectionName);
                if (existingSingle != null)
                {
                    return BadRequest("Election name already exists");
                }

                var newElection = new ElectionModel
                {
                    ElectionName = electionDTO.ElectionName,
                    Description = electionDTO.Description,
                    ElectionTypeId = typeEntity.Id,
                    ElectionType = typeEntity.Type,
                    ElectionPositionId = positionEntity.Id,
                    ElectionPosition = positionEntity.Position,
                    CreatedById = createdBy.Id,
                    CreatedBy = createdBy.Email!,
                    Status = electionDTO.Status,
                    StartDate = electionDTO.StartDate.ToUniversalTime(),
                    EndDate = electionDTO.EndDate.ToUniversalTime(),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _dbContext.Elections.AddAsync(newElection);
                await _dbContext.SaveChangesAsync();

                return Ok(new { message = "Election added successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding election: {ElectionName}", electionDTO.ElectionName);
                return StatusCode(500, new
                {
                    error = "Internal Server Error",
                    message = ex.Message,
                    details = ex.InnerException?.Message
                });
            }
        }
        [HttpPut("updateElection/{id}")]
        public async Task<IActionResult> UpdateElection(int id, [FromBody] ElectionDTO electionDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var existingElection = await _dbContext.Elections.FindAsync(id);
                if (existingElection == null)
                {
                    return NotFound("Election does not exist");
                }
                if (await _dbContext.Elections.AnyAsync(e => e.ElectionName == electionDTO.ElectionName && e.Id != id))
                {
                    return BadRequest("Another election with this name already exists");
                }

                var typeEntity = await _dbContext.ElectionTypes.FirstOrDefaultAsync(e => e.Type == electionDTO.ElectionType);
                if (typeEntity == null) return BadRequest("Election type does not exist");

                var positionEntity = await _dbContext.ElectionPositions.FirstOrDefaultAsync(e => e.Position == electionDTO.ElectionPosition);
                if (positionEntity == null) return BadRequest("Election position does not exist");

                var createdBy = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == electionDTO.CreatedBy);
                if (createdBy == null) return BadRequest("Created by user does not exist");

                if (electionDTO.StartDate > electionDTO.EndDate) return BadRequest("Start date cannot be after end date");

                existingElection.ElectionName = electionDTO.ElectionName;
                existingElection.Description = electionDTO.Description;
                existingElection.ElectionTypeId = typeEntity.Id;
                existingElection.ElectionType = typeEntity.Type;
                existingElection.ElectionPositionId = positionEntity.Id;
                existingElection.ElectionPosition = positionEntity.Position;
                existingElection.CreatedById = createdBy.Id;
                existingElection.CreatedBy = createdBy.Email!;
                existingElection.Status = electionDTO.Status;
                existingElection.StartDate = electionDTO.StartDate.ToUniversalTime();
                existingElection.EndDate = electionDTO.EndDate.ToUniversalTime();
                existingElection.UpdatedAt = DateTime.UtcNow;


                _dbContext.Elections.Update(existingElection);
                await _dbContext.SaveChangesAsync();

                return Ok(new { message = "Election updated successfully" });

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating election ID:{Id}", id);
                return StatusCode(500, new
                {
                    error = "Internal Server Error",
                    message = ex.Message,
                    details = ex.InnerException?.Message
                });
            }
        }
        [HttpDelete("deleteElection/{id}")]
        public async Task<IActionResult> DeleteElection(int id)
        {
            try
            {
                var election = await _dbContext.Elections.FindAsync(id);
                if (election == null)
                {
                    return NotFound("Election does not exist");
                }
                _dbContext.Elections.Remove(election);
                await _dbContext.SaveChangesAsync();
                return Ok(new { message = "Election deleted successfully" });

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting election ID:{Id}", id);
                return StatusCode(500, "Internal Server Error");
            }
        }
        [HttpGet("getAllElections")]
        public async Task<IActionResult> GetAllElections()
        {
            try
            {
                var elections = await _dbContext.Elections.ToListAsync();
                return Ok(elections);

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all elections");
                return StatusCode(500, "Internal Server Error");
            }
        }
    }
}