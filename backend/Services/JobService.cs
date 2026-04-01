using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class JobService
{
    private readonly AppDbContext _context;

    public JobService(AppDbContext context)
    {
        _context = context;
    }

    public async Task CleanExpiredRefreshTokens()
    {
        var staleTokens = await _context.RefreshTokens
            .Where(rt => rt.IsRevoked || rt.ExpiresAt <= DateTime.UtcNow)
            .ToListAsync();

        if (staleTokens.Count == 0)
        {
            return;
        }

        _context.RefreshTokens.RemoveRange(staleTokens);
        await _context.SaveChangesAsync();
    }
}
