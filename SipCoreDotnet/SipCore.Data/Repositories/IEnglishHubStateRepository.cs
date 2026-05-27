using System.Threading.Tasks;
using SipCore.Core.Models;

namespace SipCore.Data.Repositories;

public interface IEnglishHubStateRepository
{
    Task<EnglishHubState?> GetByStateKeyAsync(string stateKey);
    Task<EnglishHubState> SaveAsync(EnglishHubState entity);
}
