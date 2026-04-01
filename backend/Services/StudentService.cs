using backend.Data;
using backend.DTOs;
using backend.Entities;
using backend.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class StudentService : IStudentService
{
    private readonly AppDbContext _context;

    public StudentService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<StudentResponseDto>> GetAll()
    {
        return await _context.Students
            .AsNoTracking()
            .Select(s => new StudentResponseDto
            {
                Id = s.Id,
                FullName = s.FullName,
                Email = s.Email
            })
            .ToListAsync();
    }

    public async Task<StudentResponseDto?> GetById(int id)
    {
        return await _context.Students
            .AsNoTracking()
            .Where(s => s.Id == id)
            .Select(s => new StudentResponseDto
            {
                Id = s.Id,
                FullName = s.FullName,
                Email = s.Email
            })
            .FirstOrDefaultAsync();
    }

    public async Task<StudentResponseDto> Create(CreateStudentDto dto)
    {
        var emailExists = await _context.Users
            .AsNoTracking()
            .AnyAsync(u => u.Email == dto.Email);

        if (emailExists)
        {
            throw new InvalidOperationException("Email is already in use.");
        }

        var username = dto.Email.Split('@')[0];
        var usernameBase = string.IsNullOrWhiteSpace(username) ? "student" : username;
        var uniqueUsername = usernameBase;
        var suffix = 1;

        while (await _context.Users.AsNoTracking().AnyAsync(u => u.Username == uniqueUsername))
        {
            uniqueUsername = $"{usernameBase}{suffix}";
            suffix++;
        }

        var generatedPassword = $"Stud{Guid.NewGuid():N}"[..12];

        var user = new User
        {
            Username = uniqueUsername,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(generatedPassword),
            Role = "Student"
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var student = new Student
        {
            FullName = dto.FullName,
            Email = dto.Email,
            UserId = user.Id
        };

        _context.Students.Add(student);
        await _context.SaveChangesAsync();

        return new StudentResponseDto
        {
            Id = student.Id,
            FullName = student.FullName,
            Email = student.Email
        };
    }

    public async Task<StudentResponseDto?> Update(int id, UpdateStudentDto dto)
    {
        var student = await _context.Students
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (student is null)
        {
            return null;
        }

        if (!string.IsNullOrWhiteSpace(dto.FullName))
        {
            student.FullName = dto.FullName;
        }

        if (!string.IsNullOrWhiteSpace(dto.Email))
        {
            var emailExists = await _context.Users
                .AsNoTracking()
                .AnyAsync(u => u.Email == dto.Email && u.Id != student.UserId);

            if (emailExists)
            {
                throw new InvalidOperationException("Email is already in use.");
            }

            student.Email = dto.Email;
            student.User.Email = dto.Email;
        }

        await _context.SaveChangesAsync();

        return new StudentResponseDto
        {
            Id = student.Id,
            FullName = student.FullName,
            Email = student.Email
        };
    }

    public async Task<bool> Delete(int id)
    {
        var student = await _context.Students.FirstOrDefaultAsync(s => s.Id == id);
        if (student is null)
        {
            return false;
        }

        _context.Students.Remove(student);
        await _context.SaveChangesAsync();
        return true;
    }
}
