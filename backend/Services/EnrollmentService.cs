using backend.Data;
using backend.DTOs;
using backend.Entities;
using backend.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class EnrollmentService : IEnrollmentService
{
    private readonly AppDbContext _context;

    public EnrollmentService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<EnrollmentResponseDto>> GetAll()
    {
        return await _context.Enrollments
            .AsNoTracking()
            .OrderByDescending(e => e.EnrolledAt)
            .Select(e => new EnrollmentResponseDto
            {
                Id = e.Id,
                StudentName = e.Student.FullName,
                CourseTitle = e.Course.Title,
                EnrolledAt = e.EnrolledAt
            })
            .ToListAsync();
    }

    public async Task<EnrollmentResponseDto> Enroll(CreateEnrollmentDto dto)
    {
        var studentExists = await _context.Students
            .AsNoTracking()
            .AnyAsync(s => s.Id == dto.StudentId);

        if (!studentExists)
        {
            throw new InvalidOperationException("Student not found.");
        }

        var courseExists = await _context.Courses
            .AsNoTracking()
            .AnyAsync(c => c.Id == dto.CourseId);

        if (!courseExists)
        {
            throw new InvalidOperationException("Course not found.");
        }

        var duplicateEnrollment = await _context.Enrollments
            .AsNoTracking()
            .AnyAsync(e => e.StudentId == dto.StudentId && e.CourseId == dto.CourseId);

        if (duplicateEnrollment)
        {
            throw new InvalidOperationException("Student is already enrolled in this course.");
        }

        var enrollment = new Enrollment
        {
            StudentId = dto.StudentId,
            CourseId = dto.CourseId,
            EnrolledAt = DateTime.UtcNow
        };

        _context.Enrollments.Add(enrollment);
        await _context.SaveChangesAsync();

        var createdEnrollment = await _context.Enrollments
            .AsNoTracking()
            .Where(e => e.Id == enrollment.Id)
            .Select(e => new EnrollmentResponseDto
            {
                Id = e.Id,
                StudentName = e.Student.FullName,
                CourseTitle = e.Course.Title,
                EnrolledAt = e.EnrolledAt
            })
            .FirstOrDefaultAsync();

        if (createdEnrollment is null)
        {
            throw new InvalidOperationException("Failed to load created enrollment.");
        }

        return createdEnrollment;
    }

    public async Task<bool> Unenroll(int enrollmentId)
    {
        var enrollment = await _context.Enrollments.FirstOrDefaultAsync(e => e.Id == enrollmentId);
        if (enrollment is null)
        {
            return false;
        }

        _context.Enrollments.Remove(enrollment);
        await _context.SaveChangesAsync();
        return true;
    }
}
