using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class CreateStudentDto
{
    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}

public class UpdateStudentDto
{
    [MaxLength(100)]
    public string? FullName { get; set; }

    [EmailAddress]
    public string? Email { get; set; }
}

public class StudentResponseDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}
