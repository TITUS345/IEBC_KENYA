using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IEBCVotingSystemV10.Model.Roles.Enumes;
using IEBCVotingSystemV10.Utils;
using Microsoft.AspNetCore.Identity;

namespace IEBCVotingSystemV10.Model.Entity
{
    public class AppUserRoles : IdentityRole, IAuditable
    {
        public RoleStatus Status { get; set; } = RoleStatus.Active;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}