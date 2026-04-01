using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class CreateInstructorProfileDto
{
    [MaxLength(500)]
    public string? Bio { get; set; }

    [Required]
    [MaxLength(100)]
    public string Department { get; set; } = string.Empty;
}

public class InstructorProfileResponseDto
{
    public int Id { get; set; }
    public string? Bio { get; set; }
    public string Department { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
}
