using System.ComponentModel.DataAnnotations;

namespace EmployeeManagementApi.DTOs;

public class EmployeeDto
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    public string MaskedEmail { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; set; }

    public DateTime DateOfBirth { get; set; }

    public DateTime HireDate { get; set; }

    public decimal Salary { get; set; }

    public int DepartmentId { get; set; }

    public string? DepartmentName { get; set; }

    public bool IsActive { get; set; }
}

public class CreateEmployeeDto
{
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; set; }

    public DateTime DateOfBirth { get; set; }

    public DateTime HireDate { get; set; }

    [Range(1, 100000, ErrorMessage = "Salary must be between 1 and 100,000.")]
    public decimal Salary { get; set; }

    [Required]
    public int DepartmentId { get; set; }
}

public class UpdateEmployeeDto
{
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; set; }

    public DateTime DateOfBirth { get; set; }

    public DateTime HireDate { get; set; }

    [Range(1, 100000, ErrorMessage = "Salary must be between 1 and 100,000.")]
    public decimal Salary { get; set; }

    [Required]
    public int DepartmentId { get; set; }

    public bool IsActive { get; set; }
}
