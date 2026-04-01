namespace backend.Entities;

public class InstructorProfile
{
    public int Id { get; set; }
    public string? Bio { get; set; }
    public string Department { get; set; } = string.Empty;

    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
