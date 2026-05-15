using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using IEBCVotingSystemV10.Model.Entity;
using IEBCVotingSystemV10.Model.Roles;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace IEBCVotingSystemV10.Controller.Auth
{
    [Route("api/[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly RoleManager<AppUserRoles> _rolemanager;
        private readonly ILogger<RolesController> _logger;

        public RolesController(RoleManager<AppUserRoles> rolemanager, ILogger<RolesController> logger)
        {
            this._rolemanager = rolemanager;
            this._logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> CreateRole(RoleDTO roleDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                var roleName = roleDTO.Name.ToString();

                var roleExist = await _rolemanager.RoleExistsAsync(roleName);
                if (roleExist) return BadRequest("Role already exists");

                var newRole = new AppUserRoles
                {
                    Name = roleName,
                    Status = roleDTO.Status,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow

                };

                var result = await _rolemanager.CreateAsync(newRole);
                if (result.Succeeded)
                {
                    return Ok("Successfully created role with status");
                }

                return BadRequest(result.Errors);


            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating role {RoleName}", roleDTO.Name);
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("getAllRoles")]
        public async Task<IActionResult> GetAllRoles()
        {
            try
            {
                var roles = await _rolemanager.Roles.ToListAsync();
                return Ok(roles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all roles");
                return StatusCode(500, "Internal Server Error");
            }
        }

        [HttpGet("getRole/{id}")]
        public async Task<IActionResult> GetRoleById(string id)
        {
            try
            {
                var role = await _rolemanager.FindByIdAsync(id);
                if (role == null) return NotFound("Role not found");
                return Ok(role);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching role ID: {Id}", id);
                return StatusCode(500, "Internal Server Error");
            }
        }

        [HttpPut("updateRole/{id}")]
        public async Task<IActionResult> UpdateRole(string id, [FromBody] RoleDTO roleDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                var existingRole = await _rolemanager.FindByIdAsync(id);
                if (existingRole == null) return NotFound("Role not found");

                var roleName = roleDTO.Name.ToString();

                // Check if name is changing and if new name already exists
                if (existingRole.Name != roleName && await _rolemanager.RoleExistsAsync(roleName))
                {
                    return BadRequest("Role name already exists");
                }

                existingRole.Name = roleName;
                existingRole.Status = roleDTO.Status;
                existingRole.UpdatedAt = DateTime.UtcNow;

                var result = await _rolemanager.UpdateAsync(existingRole);
                if (result.Succeeded)
                {
                    return Ok(new { message = "Role updated successfully" });
                }

                return BadRequest(result.Errors);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating role ID: {Id}", id);
                return StatusCode(500, "Internal Server Error");
            }
        }

        [HttpDelete("deleteRole/{id}")]
        public async Task<IActionResult> DeleteRole(string id)
        {
            try
            {
                var role = await _rolemanager.FindByIdAsync(id);
                if (role == null) return NotFound("Role not found");

                var result = await _rolemanager.DeleteAsync(role);
                if (result.Succeeded)
                {
                    return Ok(new { message = "Role deleted successfully" });
                }

                return BadRequest(result.Errors);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting role ID: {Id}", id);
                return StatusCode(500, "Internal Server Error");
            }
        }
    }
}