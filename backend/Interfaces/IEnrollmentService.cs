using backend.DTOs;

namespace backend.Interfaces;

public interface IEnrollmentService
{
    Task<List<EnrollmentResponseDto>> GetAll();
    Task<EnrollmentResponseDto> Enroll(CreateEnrollmentDto dto);
    Task<bool> Unenroll(int enrollmentId);
}
