using EmployeeManagementApi.DTOs;

namespace EmployeeManagementApi.Services.Interfaces;

public interface IEmployeeService
{
    Task<IEnumerable<EmployeeDto>> GetAllAsync();
    Task<EmployeeDto?> GetByIdAsync(int id);
    Task<IEnumerable<EmployeeDto>> SearchAsync(string searchTerm);
    Task<IEnumerable<EmployeeDto>> GetByDepartmentAsync(int departmentId);
    Task<EmployeeDto> CreateAsync(CreateEmployeeDto dto);
    Task<EmployeeDto?> UpdateAsync(int id, UpdateEmployeeDto dto);
    Task<bool> DeleteAsync(int id);
}
