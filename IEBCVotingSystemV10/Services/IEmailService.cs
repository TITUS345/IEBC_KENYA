using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IEBCVotingSystemV10.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toemail, string subject, string body);
    }
}