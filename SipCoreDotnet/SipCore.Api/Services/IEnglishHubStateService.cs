using System.Threading.Tasks;
using SipCore.Core.DTOs;

namespace SipCore.Api.Services;

public interface IEnglishHubStateService
{
    Task<EnglishHubStateDto> LoadStateAsync();
    Task<EnglishHubStateDto> SaveStateAsync(EnglishHubStateDto? state);
}
