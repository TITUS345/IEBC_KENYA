using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace IEBCVotingSystemV10.Services
{
    public interface IBiometricService
    {
        // Compares two embeddings and returns the Euclidean distance
        double CalculateDistance(float[] first, float[] second);
    }
}