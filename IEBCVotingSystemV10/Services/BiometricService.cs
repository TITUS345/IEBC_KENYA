using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;

namespace IEBCVotingSystemV10.Services
{
    public class BiometricService : IBiometricService
    {
        public BiometricService(IWebHostEnvironment env)
        {
            // No initialization needed since face recognition is done on frontend
        }

        public double CalculateDistance(float[] first, float[] second)
        {
            if (first.Length != second.Length) return 1.0; // Maximum distance if vectors don't match

            double sum = 0;
            for (int i = 0; i < first.Length; i++)
            {
                double diff = first[i] - second[i];
                sum += diff * diff;
            }
            return Math.Sqrt(sum);
        }
    }
}