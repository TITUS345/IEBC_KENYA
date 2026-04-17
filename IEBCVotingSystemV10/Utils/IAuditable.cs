using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IEBCVotingSystemV10.Utils
{
    public interface IAuditable
    {
        DateTime CreatedAt { get; set; }
        DateTime UpdatedAt { get; set; }
    }
}