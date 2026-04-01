using backend.DTOs;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EnrollmentsController : ControllerBase
{
    private readonly IEnrollmentService _enrollmentService;

    public EnrollmentsController(IEnrollmentService enrollmentService)
    {
        _enrollmentService = enrollmentService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<ActionResult<List<EnrollmentResponseDto>>> GetAll()
    {
        var enrollments = await _enrollmentService.GetAll();
        return Ok(enrollments);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<EnrollmentResponseDto>> Enroll([FromBody] CreateEnrollmentDto dto)
    {
        try
        {
            var enrollment = await _enrollmentService.Enroll(dto);
            return Ok(enrollment);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Unenroll(int id)
    {
        var removed = await _enrollmentService.Unenroll(id);
        return removed ? NoContent() : NotFound();
    }
}
