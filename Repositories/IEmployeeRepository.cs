using EmployeeManagementApi.Models;

namespace EmployeeManagementApi.Repositories;

public interface IEmployeeRepository
{
    Task<IEnumerable<Employee>> GetAllAsync();
    Task<Employee?> GetByIdAsync(int id);
    Task<IEnumerable<Employee>> SearchAsync(string searchTerm);
    Task<IEnumerable<Employee>> GetByDepartmentAsync(int departmentId);
    Task<Employee> CreateAsync(Employee employee);
    Task<Employee> UpdateAsync(Employee employee);
    Task<bool> DeleteAsync(int id);
    Task<bool> ExistsByEmailAsync(string email, int? excludeId = null);
}
