using JobPlatform.Core.DTOs.Requests;
using JobPlatform.Core.DTOs.Responses;

namespace JobPlatform.Core.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<UserResponse> GetCurrentUserAsync(Guid userId);
}
