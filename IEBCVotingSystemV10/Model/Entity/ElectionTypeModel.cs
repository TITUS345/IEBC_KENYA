using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace IEBCVotingSystemV10.Model.Entity
{
    public class ElectionTypeModel
    {
        public int Id { get; set; }
        [Required]
        public string Type { get; set; } = string.Empty;
        [Required]
        public string Description { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}