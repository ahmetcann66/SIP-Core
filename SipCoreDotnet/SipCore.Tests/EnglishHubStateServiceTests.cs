using Moq;
using Xunit;
using SipCore.Core.DTOs;
using SipCore.Core.Models;
using SipCore.Api.Services;
using SipCore.Data.Repositories;
using System.Text.Json;

namespace SipCore.Tests;

public class EnglishHubStateServiceTests
{
    private readonly Mock<IEnglishHubStateRepository> _mockRepository;
    private readonly EnglishHubStateService _service;

    public EnglishHubStateServiceTests()
    {
        _mockRepository = new Mock<IEnglishHubStateRepository>();
        _service = new EnglishHubStateService(_mockRepository.Object);
    }

    [Fact]
    public async Task LoadStateAsync_WhenDataExists_ReturnsValidDto()
    {
        // Arrange
        var wordsJson = JsonSerializer.Serialize(new Dictionary<string, List<EnglishHubStateDto.WordItemDto>>
        {
            ["A1"] = new List<EnglishHubStateDto.WordItemDto>
            {
                new EnglishHubStateDto.WordItemDto
                {
                    Ana = "HELLO",
                    Turkce = "Merhaba",
                    Tabu = new List<string> { "HI", "Greet" }
                }
            }
        });

        var englishHubState = new EnglishHubState
        {
            StateKey = "WORDS",
            PayloadJson = wordsJson,
            UpdatedAt = DateTime.UtcNow
        };

        _mockRepository
            .Setup(r => r.GetByStateKeyAsync(It.IsAny<string>()))
            .ReturnsAsync(englishHubState);

        // Act
        var result = await _service.LoadStateAsync();

        // Assert
        Assert.NotNull(result);
        Assert.NotEmpty(result.Words);
        Assert.True(result.Words.ContainsKey("A1"));
        Assert.Equal("HELLO", result.Words["A1"][0].Ana);
        _mockRepository.Verify(r => r.GetByStateKeyAsync(It.IsAny<string>()), Times.Exactly(3));
    }

    [Fact]
    public async Task LoadStateAsync_WhenNoData_ReturnsEmptyCollections()
    {
        // Arrange
        _mockRepository
            .Setup(r => r.GetByStateKeyAsync(It.IsAny<string>()))
            .ReturnsAsync((EnglishHubState?)null);

        // Act
        var result = await _service.LoadStateAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result.Words);
        Assert.Empty(result.Notes);
        Assert.Empty(result.Curriculum);
    }

    [Fact]
    public async Task SaveStateAsync_WithValidDto_PersistsData()
    {
        // Arrange
        var dto = new EnglishHubStateDto
        {
            Words = new Dictionary<string, List<EnglishHubStateDto.WordItemDto>>
            {
                ["B1"] = new List<EnglishHubStateDto.WordItemDto>
                {
                    new EnglishHubStateDto.WordItemDto
                    {
                        Ana = "GOODBYE",
                        Turkce = "Hoşça kalın",
                        Tabu = new List<string> { "BYE", "Leave" }
                    }
                }
            },
            Notes = new Dictionary<string, string>(),
            Curriculum = new Dictionary<string, Dictionary<string, List<string>>>()
        };

        _mockRepository
            .Setup(r => r.SaveAsync(It.IsAny<EnglishHubState>()))
            .ReturnsAsync((EnglishHubState e) => e);

        // Act
        var result = await _service.SaveStateAsync(dto);

        // Assert
        Assert.NotNull(result);
        _mockRepository.Verify(r => r.SaveAsync(It.IsAny<EnglishHubState>()), Times.AtLeastOnce);
    }

    [Fact]
    public async Task SaveStateAsync_WithNullDto_ReturnsEmptyState()
    {
        // Arrange
        var entity = new EnglishHubState();

        _mockRepository
            .Setup(r => r.SaveAsync(It.IsAny<EnglishHubState>()))
            .ReturnsAsync(entity);

        // Act
        var result = await _service.SaveStateAsync(null);

        // Assert
        Assert.NotNull(result);
        _mockRepository.Verify(r => r.SaveAsync(It.IsAny<EnglishHubState>()), Times.AtLeastOnce);
    }

    [Fact]
    public async Task LoadStateAsync_WithInvalidJson_ReturnsEmptyCollections()
    {
        // Arrange
        var invalidEntity = new EnglishHubState
        {
            StateKey = "WORDS",
            PayloadJson = "{ invalid json }",
            UpdatedAt = DateTime.UtcNow
        };

        _mockRepository
            .Setup(r => r.GetByStateKeyAsync(It.IsAny<string>()))
            .ReturnsAsync(invalidEntity);

        // Act
        var result = await _service.LoadStateAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result.Words);
    }
}
