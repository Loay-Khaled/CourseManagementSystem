namespace backend.Entities;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;

    public InstructorProfile? InstructorProfile { get; set; }
    public Student? StudentProfile { get; set; }
    public ICollection<Course> Courses { get; set; } = new List<Course>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
