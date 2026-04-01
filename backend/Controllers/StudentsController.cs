using backend.DTOs;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    private readonly IStudentService _studentService;

    public StudentsController(IStudentService studentService)
    {
        _studentService = studentService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<ActionResult<List<StudentResponseDto>>> GetAll()
    {
        var students = await _studentService.GetAll();
        return Ok(students);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<ActionResult<StudentResponseDto>> GetById(int id)
    {
        var student = await _studentService.GetById(id);
        return student is null ? NotFound() : Ok(student);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<StudentResponseDto>> Create([FromBody] CreateStudentDto dto)
    {
        try
        {
            var createdStudent = await _studentService.Create(dto);
            return CreatedAtAction(nameof(GetById), new { id = createdStudent.Id }, createdStudent);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<StudentResponseDto>> Update(int id, [FromBody] UpdateStudentDto dto)
    {
        try
        {
            var updatedStudent = await _studentService.Update(id, dto);
            return updatedStudent is null ? NotFound() : Ok(updatedStudent);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _studentService.Delete(id);
        return deleted ? NoContent() : NotFound();
    }
}
