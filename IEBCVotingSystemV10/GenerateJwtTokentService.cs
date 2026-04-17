

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using IEBCVotingSystemV10.Model;
using Microsoft.IdentityModel.Tokens;
using ModelContextProtocol.Protocol;

namespace IEBCVotingSystemV10
{
    public class GenerateJwtTokentService : IGenerateJwtBearerToken
    {
        private readonly IConfiguration _config;
        public GenerateJwtTokentService(IConfiguration config)
        {
            this._config = config;
        }

        public string GenerateJwtToken(ApplicationUser user, IList<string> roles)
        {
            var jwtKey = _config["JWT_KEY"]
                ?? throw new InvalidOperationException("JWT_KEY is not defined in the configuration (.env or environment variables).");
            //"Claims" (The data inside the ID card)
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.NameId,user.Id),
                new Claim(JwtRegisteredClaimNames.Email,user.Email!),
                new Claim(JwtRegisteredClaimNames.Jti,Guid.NewGuid().ToString()),
            };

            //add roles to claim
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            //Create the Key
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

            //Define the Signing Credentials (The "Stamp of Authenticity")
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            //create token descriptor
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(7),
                SigningCredentials = creds,
                Issuer = _config["Jwt:Issuer"],
                Audience = _config["Jwt:Audience"]
            };

            //Generate and write the token 
            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

    }
}