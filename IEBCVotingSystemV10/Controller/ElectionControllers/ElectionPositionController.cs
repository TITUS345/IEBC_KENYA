using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using IEBCVotingSystemV10.Data;
using IEBCVotingSystemV10.Model.DTOs;
using IEBCVotingSystemV10.Model.Entity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace IEBCVotingSystemV10.Controller.Election
{
    [ApiController]
    [Route("api/election-position")]
    public class ElectionPositionController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<ElectionPositionController> _logger;

        public ElectionPositionController(ApplicationDbContext dbContext, ILogger<ElectionPositionController> logger)
        {
            this._dbContext = dbContext;
            this._logger = logger;
        }

        [HttpPost("addPosition")]
        public async Task<IActionResult> AddPosition(ElectionPositionDTO positionDTO)
        {
            try
            {
                var existing = await _dbContext.ElectionPositions.FirstOrDefaultAsync(e => e.Position == positionDTO.Position);
                if (existing != null)
                {
                    return BadRequest("Position name already exists");
                }

                var newPosition = new ElectionPositionModel
                {
                    Position = positionDTO.Position,
                    Description = positionDTO.Description,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _dbContext.AddAsync(newPosition);
                await _dbContext.SaveChangesAsync();

                return Ok(new { message = "Position added successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding election position: {Position}", positionDTO.Position);
                return StatusCode(500, "Internal Server Error");
            }
        }

        [HttpPut("updatePosition/{id}")]
        public async Task<IActionResult> UpdatePosition(int id, [FromBody] ElectionPositionDTO positionDTO)
        {
            try
            {
                var existingPosition = await _dbContext.ElectionPositions.FindAsync(id);
                if (existingPosition == null)
                {
                    return NotFound("Position does not exist");
                }

                // Check if the new name is already used by a DIFFERENT position ID
                if (await _dbContext.ElectionPositions.AnyAsync(p => p.Position == positionDTO.Position && p.Id != id))
                {
                    return BadRequest("Another position with this name already exists");
                }

                existingPosition.Position = positionDTO.Position;
                existingPosition.Description = positionDTO.Description;
                existingPosition.UpdatedAt = DateTime.UtcNow;

                _dbContext.ElectionPositions.Update(existingPosition);
                await _dbContext.SaveChangesAsync();

                return Ok(new { message = "Position updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating election position ID: {Id}", id);
                return StatusCode(500, "Internal Server Error");
            }
        }

        [HttpDelete("deletePosition/{id}")]
        public async Task<IActionResult> DeletePosition(int id)
        {
            try
            {
                var position = await _dbContext.ElectionPositions.FindAsync(id);
                if (position == null)
                {
                    return NotFound("Position does not exist");
                }

                _dbContext.ElectionPositions.Remove(position);
                await _dbContext.SaveChangesAsync();
                return Ok(new { message = "Position deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting election position ID: {Id}", id);
                return StatusCode(500, "Internal Server Error");
            }
        }
        [HttpGet("getAllPositions")]
        public async Task<IActionResult> GetAllPositions()
        {
            try
            {
                var positions = await _dbContext.ElectionPositions.ToListAsync();
                return Ok(positions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all election positions");
                return StatusCode(500, "Internal Server Error");
            }
        }
        [HttpGet("getPosition/{position}")]
        public async Task<IActionResult> GetPosition(string position)
        {
            try
            {
                var positions = await _dbContext.ElectionPositions.FirstOrDefaultAsync(e => e.Position == position);
                return Ok(positions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching election position: {Position}", position);
                return StatusCode(500, "Internal Server Error");
            }
        }



    }
}