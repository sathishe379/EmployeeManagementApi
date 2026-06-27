using Microsoft.EntityFrameworkCore;
using EmployeeManagementApi.Data;
using EmployeeManagementApi.Models;

namespace EmployeeManagementApi.Repositories;

public class EmployeeRepository : IEmployeeRepository
{
    private readonly AppDbContext _context;

    public EmployeeRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Employee>> GetAllAsync()
    {
        return await _context.Employees
            .Include(e => e.Department)
            .OrderByDescending(e => e.IsActive)
            .ThenBy(e => e.LastName)
            .ThenBy(e => e.FirstName)
            .ToListAsync();
    }

    public async Task<Employee?> GetByIdAsync(int id)
    {
        return await _context.Employees
            .Include(e => e.Department)
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<IEnumerable<Employee>> SearchAsync(string searchTerm)
    {
        var term = searchTerm.ToLower();
        return await _context.Employees
            .Include(e => e.Department)
            .Where(e => e.FirstName.ToLower().Contains(term)
                     || e.LastName.ToLower().Contains(term)
                     || e.Email.ToLower().Contains(term)
                     || (e.Department != null && e.Department.Name.ToLower().Contains(term)))
            .OrderBy(e => e.LastName)
            .ToListAsync();
    }

    public async Task<IEnumerable<Employee>> GetByDepartmentAsync(int departmentId)
    {
        return await _context.Employees
            .Include(e => e.Department)
            .Where(e => e.DepartmentId == departmentId && e.IsActive)
            .OrderBy(e => e.LastName)
            .ToListAsync();
    }

    public async Task<Employee> CreateAsync(Employee employee)
    {
        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();
        return employee;
    }

    public async Task<Employee> UpdateAsync(Employee employee)
    {
        _context.Employees.Update(employee);
        await _context.SaveChangesAsync();
        return employee;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null) return false;

        employee.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsByEmailAsync(string email, int? excludeId = null)
    {
        return await _context.Employees
            .AnyAsync(e => e.Email.ToLower() == email.ToLower()
                        && (!excludeId.HasValue || e.Id != excludeId.Value));
    }
}
