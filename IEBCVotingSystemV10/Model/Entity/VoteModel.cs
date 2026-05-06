using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using IEBCVotingSystemV10.Utils;

namespace IEBCVotingSystemV10.Model.Entity
{
    public class VoteModel : IAuditable
    {
        public int Id { get; set; }
        public int VoterId { get; set; }
        [Required]
        public string Voter { get; set; } = string.Empty;
        public int CandidateId { get; set; }
        [Required]
        public string Candidate { get; set; } = string.Empty;
        public int ElectionId { get; set; }
        [Required]
        public string Election { get; set; } = string.Empty;
        public double BiometricVerificationScore { get; set; }
        public string? IpAddress { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("VoterId")]
        public VoterModel? VoterModel { get; set; }
        [ForeignKey("CandidateId")]
        public CandidateModel? CandidateModel { get; set; }
        [ForeignKey("ElectionId")]
        public ElectionModel? ElectionModel { get; set; }





    }
}