using System.ComponentModel.DataAnnotations;

namespace IEBCVotingSystemV10.Model.DTOs
{
    public class VoteRequestDTO
    {
        [Required]
        public string VoterEmail { get; set; } = string.Empty;

        [Required]
        public int ElectionId { get; set; }

        [Required]
        public int CandidateId { get; set; }

        [Required]
        public string LiveFaceEmbeddings { get; set; } = string.Empty; // JSON string of float[]
    }
}