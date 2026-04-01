using backend.DTOs;

namespace backend.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> Register(RegisterDto dto);
    Task<AuthResponseDto> Login(LoginDto dto);
    Task<AuthResponseDto> RefreshToken(string refreshToken);
    Task<bool> Logout(string refreshToken);
}
