using Microsoft.AspNetCore.Mvc;
using SipCore.Core.DTOs;
using SipCore.Api.Services;

namespace SipCore.Api.Controllers;

[ApiController]
[Route("api/english-hub")]
public class EnglishHubController : ControllerBase
{
    private readonly IEnglishHubStateService _englishHubStateService;

    public EnglishHubController(IEnglishHubStateService englishHubStateService)
    {
        _englishHubStateService = englishHubStateService;
    }

    [HttpGet("state")]
    public async Task<ActionResult<EnglishHubStateDto>> GetState()
    {
        return Ok(await _englishHubStateService.LoadStateAsync());
    }

    [HttpPut("state")]
    public async Task<ActionResult<EnglishHubStateDto>> SaveState([FromBody] EnglishHubStateDto state)
    {
        return Ok(await _englishHubStateService.SaveStateAsync(state));
    }
}
