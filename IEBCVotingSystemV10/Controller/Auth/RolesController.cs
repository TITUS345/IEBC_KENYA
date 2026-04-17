using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using IEBCVotingSystemV10.Model.Entity;
using IEBCVotingSystemV10.Model.Roles;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace IEBCVotingSystemV10.Controller.Auth
{
    [Route("api/[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly RoleManager<AppUserRoles> _rolemanager;

        public RolesController(RoleManager<AppUserRoles> rolemanager)
        {
            this._rolemanager = rolemanager;
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
            catch (Exception)
            {
                return StatusCode(500, "Internal erver error");
            }
        }
    }
}