using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using IEBCVotingSystemV10.Model.Enums;
using IEBCVotingSystemV10.Utils;

namespace IEBCVotingSystemV10.Model.Entity
{
    public class ElectionModel : IAuditable
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
        public ElectionStatus Status { get; set; } = ElectionStatus.Upcoming;

        [Required]
        public DateTime StartDate { get; set; }
        [Required]
        public DateTime EndDate { get; set; }
        [Required]
        public DateTime CreatedAt { get; set; }
        [Required]
        public DateTime UpdatedAt { get; set; }

        [ForeignKey("ElectionTypeId")]
        public ElectionTypeModel? TypeModel { get; set; }

        [ForeignKey("ElectionPositionId")]
        public ElectionPositionModel? PositionModel { get; set; }

        [ForeignKey("CreatedById")]
        public ApplicationUser? Creator { get; set; }
    }
}