using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using backend.Data;
using backend.DTOs;
using backend.Entities;
using backend.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services;

public class AuthService : IAuthService
{
    private static readonly HashSet<string> AllowedRoles = new(StringComparer.OrdinalIgnoreCase)
    {
        "Admin",
        "Instructor",
        "Student"
    };

    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto> Register(RegisterDto dto)
    {
        if (!AllowedRoles.Contains(dto.Role))
        {
            throw new InvalidOperationException("Invalid role. Allowed values are Admin, Instructor, Student.");
        }

        var emailExists = await _context.Users
            .AsNoTracking()
            .AnyAsync(u => u.Email == dto.Email);

        if (emailExists)
        {
            throw new InvalidOperationException("Email is already in use.");
        }

        var usernameExists = await _context.Users
            .AsNoTracking()
            .AnyAsync(u => u.Username == dto.Username);

        if (usernameExists)
        {
            throw new InvalidOperationException("Username is already in use.");
        }

        var normalizedRole = NormalizeRole(dto.Role);

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = normalizedRole
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        if (normalizedRole == "Instructor")
        {
            var profile = new InstructorProfile
            {
                UserId = user.Id,
                Bio = "",
                Department = "General"
            };
            _context.InstructorProfiles.Add(profile);
            await _context.SaveChangesAsync();
        }

        if (normalizedRole == "Student")
        {
            var student = new Student
            {
                UserId = user.Id,
                FullName = dto.Username,
                Email = dto.Email
            };
            _context.Students.Add(student);
            await _context.SaveChangesAsync();
        }

        var refreshTokenValue = GenerateRefreshToken();
        var refreshToken = new RefreshToken
        {
            Token = refreshTokenValue,
            UserId = user.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = false
        };

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        return new AuthResponseDto
        {
            AccessToken = GenerateJwt(user),
            RefreshToken = refreshTokenValue,
            Role = user.Role,
            Username = user.Username,
            Email = user.Email
        };
    }

    public async Task<AuthResponseDto> Login(LoginDto dto)
    {
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid credentials.");
        }

        var refreshTokenValue = GenerateRefreshToken();
        var refreshToken = new RefreshToken
        {
            Token = refreshTokenValue,
            UserId = user.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = false
        };

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        return new AuthResponseDto
        {
            AccessToken = GenerateJwt(user),
            RefreshToken = refreshTokenValue,
            Role = user.Role,
            Username = user.Username,
            Email = user.Email
        };
    }

    public async Task<AuthResponseDto> RefreshToken(string refreshToken)
    {
        var tokenEntity = await _context.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

        if (tokenEntity is null || tokenEntity.IsRevoked || tokenEntity.ExpiresAt <= DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException("Invalid refresh token.");
        }

        tokenEntity.IsRevoked = true;

        var newRefreshTokenValue = GenerateRefreshToken();
        var newRefreshToken = new RefreshToken
        {
            Token = newRefreshTokenValue,
            UserId = tokenEntity.UserId,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = false
        };

        _context.RefreshTokens.Add(newRefreshToken);
        await _context.SaveChangesAsync();

        return new AuthResponseDto
        {
            AccessToken = GenerateJwt(tokenEntity.User),
            RefreshToken = newRefreshTokenValue,
            Role = tokenEntity.User.Role,
            Username = tokenEntity.User.Username,
            Email = tokenEntity.User.Email
        };
    }

    public async Task<bool> Logout(string refreshToken)
    {
        var tokenEntity = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

        if (tokenEntity is null)
        {
            return false;
        }

        tokenEntity.IsRevoked = true;
        await _context.SaveChangesAsync();
        return true;
    }

    private string GenerateJwt(User user)
    {
        var key = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT key is missing.");
        var issuer = _configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("JWT issuer is missing.");
        var audience = _configuration["Jwt:Audience"] ?? throw new InvalidOperationException("JWT audience is missing.");
        var expiryMinutes = int.TryParse(_configuration["Jwt:ExpiryMinutes"], out var minutes) ? minutes : 60;

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateRefreshToken()
    {
        var randomBytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(randomBytes);
    }

    private static string NormalizeRole(string role)
    {
        if (role.Equals("Admin", StringComparison.OrdinalIgnoreCase))
        {
            return "Admin";
        }

        if (role.Equals("Instructor", StringComparison.OrdinalIgnoreCase))
        {
            return "Instructor";
        }

        return "Student";
    }
}
