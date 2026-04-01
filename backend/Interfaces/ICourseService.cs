using backend.DTOs;

namespace backend.Interfaces;

public interface ICourseService
{
    Task<List<CourseResponseDto>> GetAll();
    Task<CourseResponseDto?> GetById(int id);
    Task<CourseResponseDto> Create(CreateCourseDto dto, int instructorId);
    Task<CourseResponseDto?> Update(int id, UpdateCourseDto dto);
    Task<bool> Delete(int id);
}
