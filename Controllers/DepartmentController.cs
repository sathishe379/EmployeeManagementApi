using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EmployeeManagementApi.Data;
using EmployeeManagementApi.DTOs;
using EmployeeManagementApi.Models;

namespace EmployeeManagementApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DepartmentController : ControllerBase
{
    private readonly AppDbContext _context;

    public DepartmentController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var departments = await _context.Departments
            .Include(d => d.Employees)
            .Select(d => new DepartmentDto
            {
                Id = d.Id,
                Name = d.Name,
                Description = d.Description,
                EmployeeCount = d.Employees.Count(e => e.IsActive)
            })
            .OrderBy(d => d.Name)
            .ToListAsync();

        return Ok(departments);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var department = await _context.Departments
            .Include(d => d.Employees)
            .Where(d => d.Id == id)
            .Select(d => new DepartmentDto
            {
                Id = d.Id,
                Name = d.Name,
                Description = d.Description,
                EmployeeCount = d.Employees.Count(e => e.IsActive)
            })
            .FirstOrDefaultAsync();

        if (department == null)
            return NotFound(new { message = $"Department with ID {id} not found." });

        return Ok(department);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateDepartmentDto dto)
    {
        if (await _context.Departments.AnyAsync(d => d.Name == dto.Name))
            return BadRequest(new { message = "A department with this name already exists." });

        var department = new Department
        {
            Name = dto.Name,
            Description = dto.Description
        };

        _context.Departments.Add(department);
        await _context.SaveChangesAsync();

        var result = new DepartmentDto
        {
            Id = department.Id,
            Name = department.Name,
            Description = department.Description,
            EmployeeCount = 0
        };

        return CreatedAtAction(nameof(GetById), new { id = department.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateDepartmentDto dto)
    {
        var department = await _context.Departments.FindAsync(id);
        if (department == null)
            return NotFound(new { message = $"Department with ID {id} not found." });

        if (await _context.Departments.AnyAsync(d => d.Name == dto.Name && d.Id != id))
            return BadRequest(new { message = "A department with this name already exists." });

        department.Name = dto.Name;
        department.Description = dto.Description;
        await _context.SaveChangesAsync();

        return Ok(new DepartmentDto
        {
            Id = department.Id,
            Name = department.Name,
            Description = department.Description,
            EmployeeCount = await _context.Employees.CountAsync(e => e.DepartmentId == id && e.IsActive)
        });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var department = await _context.Departments.FindAsync(id);
        if (department == null)
            return NotFound(new { message = $"Department with ID {id} not found." });

        if (await _context.Employees.AnyAsync(e => e.DepartmentId == id && e.IsActive))
            return BadRequest(new { message = "Cannot delete department with active employees." });

        _context.Departments.Remove(department);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
