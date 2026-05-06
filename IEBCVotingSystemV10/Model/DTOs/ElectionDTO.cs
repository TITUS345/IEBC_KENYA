using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using IEBCVotingSystemV10.Model.Entity;
using IEBCVotingSystemV10.Model.Enums;

namespace IEBCVotingSystemV10.Model.DTOs
{
    public class ElectionDTO
    {
        public int Id { get; set; }
        [Required]
        public string ElectionName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public int ElectionTypeId { get; set; }
        [Required]
        public string ElectionType { get; set; } = string.Empty;

        public int ElectionPositionId { get; set; }
        [Required]
        public string ElectionPosition { get; set; } = string.Empty;

        public string CreatedById { get; set; } = string.Empty;
        [Required]
        public string CreatedBy { get; set; } = string.Empty;
        [Required]
        public ElectionStatus Status { get; set; }
        [Required]
        public DateTime StartDate { get; set; }
        [Required]
        public DateTime EndDate { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public ElectionTypeModel? TypeModel { get; set; }

        public ElectionPositionModel? PositionModel { get; set; }

        public ApplicationUser? Creator { get; set; }
    }
}