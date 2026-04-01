using backend.DTOs;

namespace backend.Interfaces;

public interface IStudentService
{
    Task<List<StudentResponseDto>> GetAll();
    Task<StudentResponseDto?> GetById(int id);
    Task<StudentResponseDto> Create(CreateStudentDto dto);
    Task<StudentResponseDto?> Update(int id, UpdateStudentDto dto);
    Task<bool> Delete(int id);
}
