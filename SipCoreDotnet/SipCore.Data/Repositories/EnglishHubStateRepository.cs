using Microsoft.EntityFrameworkCore;
using SipCore.Core.Models;
using System.Threading.Tasks;

namespace SipCore.Data.Repositories;

/// <summary>
/// EnglishHubState için özelleştirilmiş depo; generic <see cref="Repository{T}"/> kalıtımı kullanır.
/// </summary>
public class EnglishHubStateRepository : Repository<EnglishHubState>, IEnglishHubStateRepository
{
    public EnglishHubStateRepository(AppDbContext db)
        : base(db)
    {
    }

    public async Task<EnglishHubState?> GetByStateKeyAsync(string stateKey)
    {
        return await Db.EnglishHubStates.FirstOrDefaultAsync(e => e.StateKey == stateKey);
    }

    public async Task<EnglishHubState> SaveAsync(EnglishHubState entity)
    {
        if (entity.Id <= 0)
        {
            await Db.EnglishHubStates.AddAsync(entity);
        }
        else
        {
            entity.TouchUpdated();
            Db.EnglishHubStates.Update(entity);
        }

        await Db.SaveChangesAsync();
        return entity;
    }
}
