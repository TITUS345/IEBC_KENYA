using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IEBCVotingSystemV10.Model;
using IEBCVotingSystemV10.Model.DTOs;
using IEBCVotingSystemV10.Model.Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace IEBCVotingSystemV10.Controller.Auth
{
    [Route("api/admin/users")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminUserController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<AdminUserController> _logger;

        public AdminUserController(UserManager<ApplicationUser> userManager, ILogger<AdminUserController> logger)
        {
            _userManager = userManager;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _userManager.Users.ToListAsync();
                var userDTOs = new List<AdminUserDTO>();

                foreach (var user in users)
                {
                    var roles = await _userManager.GetRolesAsync(user);
                    userDTOs.Add(new AdminUserDTO
                    {
                        Id = user.Id,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        SurName = user.SurName ?? string.Empty,
                        Email = user.Email ?? string.Empty,
                        NationalIdNo = user.NationalIdNo,
                        PhoneNumber = user.PhoneNumber ?? string.Empty,
                        Roles = roles.ToList()
                    });
                }
                return Ok(userDTOs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all users.");
                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] AdminUserUpdateDTO userUpdate)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null) return NotFound($"User with ID {id} not found.");

                user.FirstName = userUpdate.FirstName;
                user.LastName = userUpdate.LastName;
                user.SurName = userUpdate.SurName;
                user.PhoneNumber = userUpdate.PhoneNumber;
                user.UpdatedAt = DateTime.UtcNow;

                // Handle roles update
                var currentRoles = await _userManager.GetRolesAsync(user);
                var rolesToRemove = currentRoles.Except(userUpdate.Roles);
                var rolesToAdd = userUpdate.Roles.Except(currentRoles);

                await _userManager.RemoveFromRolesAsync(user, rolesToRemove);
                await _userManager.AddToRolesAsync(user, rolesToAdd);

                var result = await _userManager.UpdateAsync(user);

                if (result.Succeeded) return Ok(new { message = "User updated successfully." });

                return BadRequest(result.Errors.Select(e => e.Description));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user with ID {UserId}", id);
                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null) return NotFound($"User with ID {id} not found.");

                var result = await _userManager.DeleteAsync(user);
                if (result.Succeeded) return Ok(new { message = "User deleted successfully." });

                return BadRequest(result.Errors.Select(e => e.Description));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user with ID {UserId}", id);
                return StatusCode(500, "Internal server error.");
            }
        }
    }
}