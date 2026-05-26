using Moq;
using Xunit;
using SipCore.Core.DTOs;
using SipCore.Api.Controllers;
using SipCore.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace SipCore.Tests;

public class EnglishHubControllerTests
{
    private readonly Mock<IEnglishHubStateService> _mockService;
    private readonly EnglishHubController _controller;

    public EnglishHubControllerTests()
    {
        _mockService = new Mock<IEnglishHubStateService>();
        _controller = new EnglishHubController(_mockService.Object);
    }

    [Fact]
    public async Task GetState_ReturnsOkWithDto()
    {
        // Arrange
        var expectedDto = new EnglishHubStateDto
        {
            Words = new Dictionary<string, List<EnglishHubStateDto.WordItemDto>>
            {
                ["A1"] = new List<EnglishHubStateDto.WordItemDto>
                {
                    new EnglishHubStateDto.WordItemDto
                    {
                        Ana = "APPLE",
                        Turkce = "Elma",
                        Tabu = new List<string> { "Fruit", "Red" }
                    }
                }
            },
            Notes = new Dictionary<string, string>(),
            Curriculum = new Dictionary<string, Dictionary<string, List<string>>>()
        };

        _mockService
            .Setup(s => s.LoadStateAsync())
            .ReturnsAsync(expectedDto);

        // Act
        var result = await _controller.GetState();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(okResult.Value);
        var returnedDto = Assert.IsType<EnglishHubStateDto>(okResult.Value);
        Assert.NotEmpty(returnedDto.Words);
        _mockService.Verify(s => s.LoadStateAsync(), Times.Once);
    }

    [Fact]
    public async Task SaveState_WithValidDto_ReturnsOkWithUpdatedDto()
    {
        // Arrange
        var inputDto = new EnglishHubStateDto
        {
            Words = new Dictionary<string, List<EnglishHubStateDto.WordItemDto>>
            {
                ["B1"] = new List<EnglishHubStateDto.WordItemDto>
                {
                    new EnglishHubStateDto.WordItemDto
                    {
                        Ana = "BOOK",
                        Turkce = "Kitap",
                        Tabu = new List<string> { "Pages", "Read" }
                    }
                }
            },
            Notes = new Dictionary<string, string>(),
            Curriculum = new Dictionary<string, Dictionary<string, List<string>>>()
        };

        _mockService
            .Setup(s => s.SaveStateAsync(It.IsAny<EnglishHubStateDto?>()))
            .ReturnsAsync(inputDto);

        // Act
        var result = await _controller.SaveState(inputDto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(okResult.Value);
        _mockService.Verify(s => s.SaveStateAsync(It.IsAny<EnglishHubStateDto?>()), Times.Once);
    }

    [Fact]
    public async Task SaveState_WithNullDto_ReturnsOk()
    {
        // Arrange
        var expectedDto = new EnglishHubStateDto();

        _mockService
            .Setup(s => s.SaveStateAsync(It.IsAny<EnglishHubStateDto?>()))
            .ReturnsAsync(expectedDto);

        // Act
        var result = await _controller.SaveState(null);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task GetState_WhenServiceThrowsException_PropagatesException()
    {
        // Arrange
        _mockService
            .Setup(s => s.LoadStateAsync())
            .ThrowsAsync(new InvalidOperationException("Test exception"));

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _controller.GetState());
    }
}
