using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using IEBCVotingSystemV10.Utils;

namespace IEBCVotingSystemV10.Model.Entity
{
    public class PartyModel
    {
        public int Id { get; set; }
        [Required]
        public string PartyName { get; set; } = string.Empty;
        public string? PartyLogoPath { get; set; } // Path to the party logo
        [Required]
        public string PartyLeader { get; set; } = string.Empty;
        public string? ManifestoPdfPath { get; set; } // Path to the manifesto PDF

        // Navigation property for candidates belonging to this party
        public ICollection<CandidateModel>? Candidates { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}