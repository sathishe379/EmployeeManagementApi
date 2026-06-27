using EmployeeManagementApi.DTOs;

namespace EmployeeManagementApi.Services.Interfaces;

public interface IAuthService
{
    Task<string?> LoginAsync(LoginRequest request);
    Task<bool> RegisterAsync(RegisterRequest request);
}
