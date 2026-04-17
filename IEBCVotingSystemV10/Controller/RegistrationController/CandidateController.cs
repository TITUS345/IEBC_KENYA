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

namespace IEBCVotingSystemV10.Controller.RegistrationController
{
    [Route("api/candidate")]
    public class CandidateController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        public CandidateController(ApplicationDbContext dbContext)
        {
            this._dbContext = dbContext;
        }

        [HttpPost("registerCandidate")]
        public async Task<IActionResult> RegisterCandidate(CandidateDTO candidateDTO)
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
                if (emailExists != null) return BadRequest("Email alraedy exist");

                var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == candidateDTO.Email);
                if (user != null)
                {
                    candidateDTO.UserId = user.Id;
                }
                else
                {
                    return BadRequest("No system user account found for this email. Please register a user account before enrolling as a voter.");
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

                var fileName = "default_profile.png";
                if (candidateDTO.ProfilePicture != null)
                {
                    var extension = Path.GetExtension(candidateDTO.ProfilePicture.FileName);
                    fileName = $"Profile_{Guid.NewGuid()}{extension}";
                    //Path.Combine for cross-platform compatibility
                    var dirPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "CandidateImages");
                    if (!Directory.Exists(dirPath))
                    {
                        Directory.CreateDirectory(dirPath);
                    }

                    string fullPath = Path.Combine(dirPath, fileName);
                    using (var stream = new FileStream(fullPath, FileMode.Create))
                    {
                        await candidateDTO.ProfilePicture.CopyToAsync(stream);
                    }


                }

                var newCandidate = new CandidateModel
                {
                    FirstName = candidateDTO.FirstName,
                    LastName = candidateDTO.LastName,
                    SirName = candidateDTO.SirName,
                    Fullname = $"{candidateDTO.FirstName} {candidateDTO.LastName}",
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
                    ProfilePicture = fileName,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,

                };

                await _dbContext.AddAsync(newCandidate);
                await _dbContext.SaveChangesAsync();

                return Ok("Candidate successfully created");

            }
            catch (Exception)
            {
                return StatusCode(500, "Internal Server error");
            }
        }

    }
}