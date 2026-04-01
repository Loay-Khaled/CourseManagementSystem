using backend.Data;
using backend.DTOs;
using backend.Entities;
using backend.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class CourseService : ICourseService
{
    private readonly AppDbContext _context;

    public CourseService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<CourseResponseDto>> GetAll()
    {
        return await _context.Courses
            .AsNoTracking()
            .Select(c => new CourseResponseDto
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                Credits = c.Credits,
                InstructorName = c.Instructor.Username
            })
            .ToListAsync();
    }

    public async Task<CourseResponseDto?> GetById(int id)
    {
        return await _context.Courses
            .AsNoTracking()
            .Where(c => c.Id == id)
            .Select(c => new CourseResponseDto
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                Credits = c.Credits,
                InstructorName = c.Instructor.Username
            })
            .FirstOrDefaultAsync();
    }

    public async Task<CourseResponseDto> Create(CreateCourseDto dto, int instructorId)
    {
        var instructorExists = await _context.Users
            .AsNoTracking()
            .AnyAsync(u => u.Id == instructorId && (u.Role == "Instructor" || u.Role == "Admin"));

        if (!instructorExists)
        {
            throw new InvalidOperationException("Instructor not found.");
        }

        var course = new Course
        {
            Title = dto.Title,
            Description = dto.Description,
            Credits = dto.Credits,
            InstructorId = instructorId
        };

        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        var createdCourse = await _context.Courses
            .AsNoTracking()
            .Where(c => c.Id == course.Id)
            .Select(c => new CourseResponseDto
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                Credits = c.Credits,
                InstructorName = c.Instructor.Username
            })
            .FirstOrDefaultAsync();

        if (createdCourse is null)
        {
            throw new InvalidOperationException("Failed to load created course.");
        }

        return createdCourse;
    }

    public async Task<CourseResponseDto?> Update(int id, UpdateCourseDto dto)
    {
        var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == id);
        if (course is null)
        {
            return null;
        }

        if (!string.IsNullOrWhiteSpace(dto.Title))
        {
            course.Title = dto.Title;
        }

        if (dto.Description is not null)
        {
            course.Description = dto.Description;
        }

        if (dto.Credits.HasValue)
        {
            course.Credits = dto.Credits.Value;
        }

        await _context.SaveChangesAsync();

        return await _context.Courses
            .AsNoTracking()
            .Where(c => c.Id == id)
            .Select(c => new CourseResponseDto
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                Credits = c.Credits,
                InstructorName = c.Instructor.Username
            })
            .FirstOrDefaultAsync();
    }

    public async Task<bool> Delete(int id)
    {
        var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == id);
        if (course is null)
        {
            return false;
        }

        _context.Courses.Remove(course);
        await _context.SaveChangesAsync();
        return true;
    }
}
