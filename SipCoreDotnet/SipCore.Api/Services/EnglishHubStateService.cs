using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using SipCore.Core.DTOs;
using SipCore.Core.Models;
using SipCore.Data.Repositories;

namespace SipCore.Api.Services;

public class EnglishHubStateService : IEnglishHubStateService
{
    private const string WordsKey = "WORDS";
    private const string NotesKey = "NOTES";
    private const string CurriculumKey = "CURRICULUM";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly IEnglishHubStateRepository _repository;

    public EnglishHubStateService(IEnglishHubStateRepository repository)
    {
        _repository = repository;
    }

    public async Task<EnglishHubStateDto> LoadStateAsync()
    {
        var dto = new EnglishHubStateDto
        {
            Words = await ReadPayloadAsync(WordsKey, () => new Dictionary<string, List<EnglishHubStateDto.WordItemDto>>()),
            Notes = await ReadPayloadAsync(NotesKey, () => new Dictionary<string, string>()),
            Curriculum = await ReadPayloadAsync(CurriculumKey, () => new Dictionary<string, Dictionary<string, List<string>>>())
        };

        return dto;
    }

    public async Task<EnglishHubStateDto> SaveStateAsync(EnglishHubStateDto? state)
    {
        var safeState = state ?? new EnglishHubStateDto();

        await WritePayloadAsync(WordsKey, safeState.Words);
        await WritePayloadAsync(NotesKey, safeState.Notes);
        await WritePayloadAsync(CurriculumKey, safeState.Curriculum);

        return await LoadStateAsync();
    }

    private async Task<T> ReadPayloadAsync<T>(string stateKey, Func<T> emptyFactory)
    {
        var entity = await _repository.GetByStateKeyAsync(stateKey);
        if (entity is null || string.IsNullOrWhiteSpace(entity.PayloadJson))
        {
            return emptyFactory();
        }

        try
        {
            var parsed = JsonSerializer.Deserialize<T>(entity.PayloadJson, JsonOptions);
            return parsed ?? emptyFactory();
        }
        catch (JsonException)
        {
            return emptyFactory();
        }
    }

    private async Task WritePayloadAsync(string stateKey, object payload)
    {
        var entity = await _repository.GetByStateKeyAsync(stateKey) ?? new EnglishHubState();

        entity.StateKey = stateKey;
        entity.PayloadJson = JsonSerializer.Serialize(payload ?? new Dictionary<string, object>(), JsonOptions);
        entity.TouchUpdated();

        await _repository.SaveAsync(entity);
    }
}
