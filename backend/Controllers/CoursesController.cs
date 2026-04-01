using System.Security.Claims;
using backend.Data;
using backend.DTOs;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CoursesController : ControllerBase
{
    private readonly ICourseService _courseService;
    private readonly AppDbContext _context;

    public CoursesController(ICourseService courseService, AppDbContext context)
    {
        _courseService = courseService;
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<CourseResponseDto>>> GetAll()
    {
        var courses = await _courseService.GetAll();
        return Ok(courses);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CourseResponseDto>> GetById(int id)
    {
        var course = await _courseService.GetById(id);
        return course is null ? NotFound() : Ok(course);
    }

    [HttpGet("{id:int}/students")]
    public async Task<ActionResult<List<StudentResponseDto>>> GetEnrolledStudents(int id)
    {
        var courseExists = await _context.Courses
            .AsNoTracking()
            .AnyAsync(c => c.Id == id);

        if (!courseExists)
        {
            return NotFound();
        }

        var students = await _context.Enrollments
            .AsNoTracking()
            .Where(e => e.CourseId == id)
            .Select(e => new StudentResponseDto
            {
                Id = e.Student.Id,
                FullName = e.Student.FullName,
                Email = e.Student.Email
            })
            .ToListAsync();

        return Ok(students);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<ActionResult<CourseResponseDto>> Create([FromBody] CreateCourseDto dto)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdClaim, out var instructorId))
        {
            return Unauthorized();
        }

        try
        {
            var createdCourse = await _courseService.Create(dto, instructorId);
            return CreatedAtAction(nameof(GetById), new { id = createdCourse.Id }, createdCourse);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<ActionResult<CourseResponseDto>> Update(int id, [FromBody] UpdateCourseDto dto)
    {
        var updatedCourse = await _courseService.Update(id, dto);
        return updatedCourse is null ? NotFound() : Ok(updatedCourse);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _courseService.Delete(id);
        return deleted ? NoContent() : NotFound();
    }
}
