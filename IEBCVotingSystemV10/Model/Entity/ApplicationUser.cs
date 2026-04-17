using System;
using System.ComponentModel.DataAnnotations;
using IEBCVotingSystemV10.Utils;
using Microsoft.AspNetCore.Identity;

namespace IEBCVotingSystemV10.Model;

public class ApplicationUser : Microsoft.AspNetCore.Identity.IdentityUser, IAuditable
{
    [Required]
    public string FirstName { get; set; } = string.Empty;
    [Required]
    public string LastName { get; set; } = string.Empty;
    [Required]
    public string SirName { get; set; } = string.Empty;
    [Required]
    public string NationalIdNo { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

}
