using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IEBCVotingSystemV10.Model.Roles.Enumes;

namespace IEBCVotingSystemV10.Model.Roles
{
    public static class AppRoles
    {
        public const string User = nameof(UserRoles.User);
        public const string Admin = nameof(UserRoles.Admin);
        public const string Voter = nameof(UserRoles.Voter);
        public const string Candidate = nameof(UserRoles.Candidate);
        public const string Official = nameof(UserRoles.IEBCOfficial);

    }
}