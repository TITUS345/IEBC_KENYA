
using IEBCVotingSystemV10.Model;

namespace IEBCVotingSystemV10
{
    public interface IGenerateJwtBearerToken
    {
        string GenerateJwtToken(ApplicationUser user, IList<string> roles);
    }
}