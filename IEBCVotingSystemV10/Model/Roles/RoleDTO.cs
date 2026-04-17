using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IEBCVotingSystemV10.Model.Roles.Enumes;

namespace IEBCVotingSystemV10.Model.Roles
{
    public class RoleDTO
    {
        public UserRoles Name { get; set; } = UserRoles.User;
        public RoleStatus Status { get; set; } = RoleStatus.Active;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}