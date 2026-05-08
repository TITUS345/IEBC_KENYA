using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http; // Required for IFormFile

namespace IEBCVotingSystemV10.Model.DTOs
{
    public class PartyDTO
    {
        public int Id { get; set; }
        [Required]
        public string PartyName { get; set; } = string.Empty;
        [Required]
        public string PartyLeader { get; set; } = string.Empty;
        public string PartyLogoPath { get; set; } = string.Empty;
        public IFormFile? LogoFile { get; set; } // For uploading party logo
        public IFormFile? ManifestoFile { get; set; } // For uploading new manifesto
        public string? ExistingManifestoPdfPath { get; set; } // To retain if no new file is uploaded
    }
}
