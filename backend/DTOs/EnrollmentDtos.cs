using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class CreateEnrollmentDto
{
    [Required]
    public int StudentId { get; set; }

    [Required]
    public int CourseId { get; set; }
}

public class EnrollmentResponseDto
{
    public int Id { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public DateTime EnrolledAt { get; set; }
}
