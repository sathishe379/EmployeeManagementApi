using EmployeeManagementApi.DTOs;
using EmployeeManagementApi.Exceptions;
using EmployeeManagementApi.Models;
using EmployeeManagementApi.Repositories;
using EmployeeManagementApi.Services.Interfaces;

namespace EmployeeManagementApi.Services.Implementations;

public class EmployeeService : IEmployeeService
{
    private readonly IEmployeeRepository _repository;

    public EmployeeService(IEmployeeRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<EmployeeDto>> GetAllAsync()
    {
        var employees = await _repository.GetAllAsync();
        return employees.Select(MapToDto);
    }

    public async Task<EmployeeDto?> GetByIdAsync(int id)
    {
        var employee = await _repository.GetByIdAsync(id);
        return employee == null ? null : MapToDto(employee);
    }

    public async Task<IEnumerable<EmployeeDto>> SearchAsync(string searchTerm)
    {
        var employees = await _repository.SearchAsync(searchTerm);
        return employees.Select(MapToDto);
    }

    public async Task<IEnumerable<EmployeeDto>> GetByDepartmentAsync(int departmentId)
    {
        var employees = await _repository.GetByDepartmentAsync(departmentId);
        return employees.Select(MapToDto);
    }

    public async Task<EmployeeDto> CreateAsync(CreateEmployeeDto dto)
    {
        if (await _repository.ExistsByEmailAsync(dto.Email))
            throw new Exceptions.ValidationException("An employee with this email already exists.");

        var age = DateTime.Today.Year - dto.DateOfBirth.Year;
        if (dto.DateOfBirth.Date > DateTime.Today.AddYears(-age)) age--;
        if (age < 18)
            throw new Exceptions.ValidationException("Employee must be at least 18 years old.");

        var employee = new Employee
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Phone = dto.Phone,
            DateOfBirth = dto.DateOfBirth,
            HireDate = dto.HireDate,
            Salary = dto.Salary,
            DepartmentId = dto.DepartmentId,
            IsActive = true
        };

        var created = await _repository.CreateAsync(employee);
        return MapToDto(created);
    }

    public async Task<EmployeeDto?> UpdateAsync(int id, UpdateEmployeeDto dto)
    {
        var employee = await _repository.GetByIdAsync(id);
        if (employee == null)
            throw new NotFoundException("Employee", id);

        if (await _repository.ExistsByEmailAsync(dto.Email, id))
            throw new Exceptions.ValidationException("An employee with this email already exists.");

        var age = DateTime.Today.Year - dto.DateOfBirth.Year;
        if (dto.DateOfBirth.Date > DateTime.Today.AddYears(-age)) age--;
        if (age < 18)
            throw new Exceptions.ValidationException("Employee must be at least 18 years old.");

        employee.FirstName = dto.FirstName;
        employee.LastName = dto.LastName;
        employee.Email = dto.Email;
        employee.Phone = dto.Phone;
        employee.DateOfBirth = dto.DateOfBirth;
        employee.HireDate = dto.HireDate;
        employee.Salary = dto.Salary;
        employee.DepartmentId = dto.DepartmentId;
        employee.IsActive = dto.IsActive;

        var updated = await _repository.UpdateAsync(employee);
        return MapToDto(updated);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        return await _repository.DeleteAsync(id);
    }

    private static EmployeeDto MapToDto(Employee employee)
    {
        return new EmployeeDto
        {
            Id = employee.Id,
            FirstName = employee.FirstName,
            LastName = employee.LastName,
            Email = employee.Email,
            MaskedEmail = MaskEmail(employee.Email),
            Phone = employee.Phone,
            DateOfBirth = employee.DateOfBirth,
            HireDate = employee.HireDate,
            Salary = employee.Salary,
            DepartmentId = employee.DepartmentId,
            DepartmentName = employee.Department?.Name,
            IsActive = employee.IsActive
        };
    }

    private static string MaskEmail(string email)
    {
        var parts = email.Split('@');
        if (parts.Length != 2) return "***";

        var local = parts[0];
        var domain = parts[1];

        if (local.Length <= 3)
            return local[0] + new string('*', local.Length - 1) + "@" + domain;

        return local[..3] + new string('*', local.Length - 3) + "@" + domain;
    }
}
