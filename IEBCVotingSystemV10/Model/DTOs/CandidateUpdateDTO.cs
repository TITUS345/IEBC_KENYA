using System.ComponentModel.DataAnnotations;

namespace IEBCVotingSystemV10.Model.DTOs
{
    public class CandidateUpdateDTO
    {
        [Required]
        public string FirstName { get; set; } = string.Empty;
        [Required]
        public string LastName { get; set; } = string.Empty;
        public string SurName { get; set; } = string.Empty;
        [Required]
        public int PartyId { get; set; }
        [Required]
        public int ElectionId { get; set; }
        [Required]
        public int ElectionPositionId { get; set; }
        [Required]
        public string PhoneNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Sub_Location { get; set; } = string.Empty;
        public string Ward { get; set; } = string.Empty;
        public string Constituency { get; set; } = string.Empty;
        public string County { get; set; } = string.Empty;
        public string Region { get; set; } = string.Empty;
        public string Role { get; set; } = "Candidate";
    }
}