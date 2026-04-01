using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class CreateCourseDto
{
    [Required]
    [MaxLength(100)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [Required]
    [Range(1, 6)]
    public int Credits { get; set; }
}

public class UpdateCourseDto
{
    [MaxLength(100)]
    public string? Title { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    [Range(1, 6)]
    public int? Credits { get; set; }
}

public class CourseResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Credits { get; set; }
    public string InstructorName { get; set; } = string.Empty;
}
