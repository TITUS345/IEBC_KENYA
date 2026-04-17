using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using IEBCVotingSystemV10.Data;
using IEBCVotingSystemV10.Model.DTOs;
using IEBCVotingSystemV10.Model.Entity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.VisualBasic;

namespace IEBCVotingSystemV10.Controller.RegistrationController
{
    [Route("api/voter")]
    [ApiController]
    public class VoterController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly RoleManager<AppUserRoles> _roleManager;
        public VoterController(ApplicationDbContext dbContext,
                                RoleManager<AppUserRoles> roleManager)
        {
            this._dbContext = dbContext;
            this._roleManager = roleManager;
        }

        [HttpPost("registerVoter")]
        public async Task<IActionResult> RegisterVoter(VoterDTO voterDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                var voterExist = await _dbContext.Voters.FirstOrDefaultAsync(v => v.NationalIdNo == voterDTO.NationalIdNo);
                if (voterExist != null) return BadRequest("Voter is already registered");

                var emailExists = await _dbContext.Voters.FirstOrDefaultAsync(v => v.Email == voterDTO.Email);
                if (emailExists != null) return BadRequest("Voter with the Email already exists");


                var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == voterDTO.Email);
                if (user != null)
                {
                    voterDTO.UserId = user.Id;
                    voterDTO.NationalIdNo = user.NationalIdNo;
                    voterDTO.Email = user.Email ?? "";
                }
                if (user == null)
                {
                    return BadRequest("User account not found. Please register a user account first.");
                }

                var roleName = voterDTO.SelectedRole;

                var role = await _roleManager.FindByNameAsync(roleName);
                if (role == null) return BadRequest("The specified role doesent exist");

                //Handle File Upload
                string fileName = "default_profile.png";// Default value
                if (voterDTO.ProfilePicture != null)
                {
                    string extension = Path.GetExtension(voterDTO.ProfilePicture.FileName);
                    fileName = $"Profile_{Guid.NewGuid()}{extension}";
                    //Path.Combine for cross-platform compatibility
                    string dirPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "VoterImages");

                    if (!Directory.Exists(dirPath))
                    {
                        Directory.CreateDirectory(dirPath);
                    }
                    string fullPath = Path.Combine(dirPath, fileName);
                    using (var stream = new FileStream(fullPath, FileMode.Create))
                    {
                        await voterDTO.ProfilePicture.CopyToAsync(stream);
                    }
                }


                var voter = new VoterModel
                {
                    FirstName = voterDTO.FirstName,
                    LastName = voterDTO.LastName,
                    SirName = voterDTO.SirName,
                    Fullname = $"{voterDTO.FirstName} {voterDTO.LastName}",
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
                    ProfilePicture = fileName,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,

                };

                await _dbContext.AddAsync(voter);
                await _dbContext.SaveChangesAsync();

                return Ok("Voter created successfully");


            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message} Inner: {ex.InnerException?.Message}");
            }
        }

    }
}