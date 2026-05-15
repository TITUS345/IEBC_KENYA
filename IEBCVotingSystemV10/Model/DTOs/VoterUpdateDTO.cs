using System.ComponentModel.DataAnnotations;

namespace IEBCVotingSystemV10.Model.DTOs
{
    public class VoterUpdateDTO
    {
        [Required]
        public string FirstName { get; set; } = string.Empty;
        [Required]
        public string LastName { get; set; } = string.Empty;
        public string SurName { get; set; } = string.Empty;
        [Required]
        public string PhoneNumber { get; set; } = string.Empty;
        [Required]
        public string Address { get; set; } = string.Empty;
        [Required]
        public string Location { get; set; } = string.Empty;
        [Required]
        public string Sub_Location { get; set; } = string.Empty;
        [Required]
        public string Ward { get; set; } = string.Empty;
        [Required]
        public string Constituency { get; set; } = string.Empty;
        [Required]
        public string County { get; set; } = string.Empty;
        [Required]
        public string Region { get; set; } = string.Empty;
    }
}