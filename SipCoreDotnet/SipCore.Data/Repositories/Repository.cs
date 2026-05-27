using Microsoft.EntityFrameworkCore;
using SipCore.Core.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SipCore.Data.Repositories;

public class Repository<T> : IRepository<T> where T : BaseEntity
{
    protected readonly AppDbContext Db;

    public Repository(AppDbContext db)
    {
        Db = db;
    }

    public async Task AddAsync(T entity)
    {
        await Db.Set<T>().AddAsync(entity);
        await Db.SaveChangesAsync();
    }

    public async Task DeleteAsync(T entity)
    {
        Db.Set<T>().Remove(entity);
        await Db.SaveChangesAsync();
    }

    public async Task<T?> GetByIdAsync(long id)
    {
        return await Db.Set<T>().FindAsync(id);
    }

    public async Task<IEnumerable<T>> ListAsync()
    {
        return await Db.Set<T>().ToListAsync();
    }

    public async Task UpdateAsync(T entity)
    {
        Db.Set<T>().Update(entity);
        await Db.SaveChangesAsync();
    }
}
