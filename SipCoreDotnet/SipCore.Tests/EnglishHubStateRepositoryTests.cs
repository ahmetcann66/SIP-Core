using Moq;
using Xunit;
using SipCore.Core.Models;
using SipCore.Data;
using SipCore.Data.Repositories;
using Microsoft.EntityFrameworkCore;

namespace SipCore.Tests;

public class EnglishHubStateRepositoryTests : IAsyncLifetime
{
    private readonly DbContextOptions<AppDbContext> _dbContextOptions;
    private AppDbContext? _dbContext;
    private IEnglishHubStateRepository? _repository;

    public EnglishHubStateRepositoryTests()
    {
        _dbContextOptions = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
    }

    public async Task InitializeAsync()
    {
        _dbContext = new AppDbContext(_dbContextOptions);
        await _dbContext.Database.EnsureCreatedAsync();
        _repository = new EnglishHubStateRepository(_dbContext);
    }

    public async Task DisposeAsync()
    {
        if (_dbContext != null)
        {
            await _dbContext.Database.EnsureDeletedAsync();
            await _dbContext.DisposeAsync();
        }
    }

    [Fact]
    public async Task SaveAsync_WithNewEntity_InsertedSuccessfully()
    {
        // Arrange
        var entity = new EnglishHubState
        {
            StateKey = "TEST_WORDS",
            PayloadJson = "{}",
            UpdatedAt = DateTime.UtcNow
        };

        // Act
        var result = await _repository!.SaveAsync(entity);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.Id > 0);
        Assert.Equal("TEST_WORDS", result.StateKey);
    }

    [Fact]
    public async Task GetByStateKeyAsync_WithExistingKey_ReturnsEntity()
    {
        // Arrange
        var entity = new EnglishHubState
        {
            StateKey = "EXISTING_KEY",
            PayloadJson = "{}",
            UpdatedAt = DateTime.UtcNow
        };
        await _repository!.SaveAsync(entity);

        // Act
        var result = await _repository.GetByStateKeyAsync("EXISTING_KEY");

        // Assert
        Assert.NotNull(result);
        Assert.Equal("EXISTING_KEY", result.StateKey);
    }

    [Fact]
    public async Task GetByStateKeyAsync_WithNonExistentKey_ReturnsNull()
    {
        // Act
        var result = await _repository!.GetByStateKeyAsync("NON_EXISTENT");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task SaveAsync_WithExistingEntity_UpdatesSuccessfully()
    {
        // Arrange
        var entity = new EnglishHubState
        {
            StateKey = "UPDATE_TEST",
            PayloadJson = "{}",
            UpdatedAt = DateTime.UtcNow
        };
        var saved = await _repository!.SaveAsync(entity);

        saved.PayloadJson = "{\"updated\": true}";

        // Act
        var updated = await _repository.SaveAsync(saved);

        // Assert
        Assert.NotNull(updated);
        Assert.Contains("updated", updated.PayloadJson);
    }
}
