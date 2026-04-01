import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { courseService } from "../services/courseService";
import { enrollmentService } from "../services/enrollmentService";
import { studentService } from "../services/studentService";
import styles from "../styles/TablePage.module.css";

const EnrollmentsPage = () => {
  const { user } = useAuth();
  const isAdmin = useMemo(() => user?.role === "Admin", [user?.role]);

  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentId: "", courseId: "" });
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [enrollmentData, studentData, courseData] = await Promise.all([
        enrollmentService.getAll(),
        studentService.getAll(),
        courseService.getAll(),
      ]);

      setEnrollments(enrollmentData);
      setStudents(studentData);
      setCourses(courseData);
    } catch {
      setError("Failed to load enrollments data.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEnroll = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.studentId || !form.courseId) {
      setError("Student and course are required.");
      return;
    }

    try {
      await enrollmentService.enroll({
        studentId: Number(form.studentId),
        courseId: Number(form.courseId),
      });
      setForm({ studentId: "", courseId: "" });
      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to enroll student.");
    }
  };

  const handleUnenroll = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this enrollment?",
    );
    if (!confirmed) {
      return;
    }

    try {
      await enrollmentService.unenroll(id);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to remove enrollment.");
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h1>Enrollments</h1>
          {isAdmin && (
            <button type="button" onClick={() => setShowForm((prev) => !prev)}>
              {showForm ? "Cancel" : "Enroll Student"}
            </button>
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {showForm && isAdmin && (
          <form onSubmit={handleEnroll} className={styles.form}>
            <select
              value={form.studentId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, studentId: event.target.value }))
              }
            >
              <option value="">Select Student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.fullName}
                </option>
              ))}
            </select>

            <select
              value={form.courseId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, courseId: event.target.value }))
              }
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>

            <button type="submit">Enroll</button>
          </form>
        )}

        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Enrolled At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enrollment) => (
                <tr key={enrollment.id}>
                  <td>{enrollment.studentName}</td>
                  <td>{enrollment.courseTitle}</td>
                  <td>{new Date(enrollment.enrolledAt).toLocaleString()}</td>
                  <td className={styles.actions}>
                    {isAdmin && (
                      <button
                        type="button"
                        className={styles.danger}
                        onClick={() => handleUnenroll(enrollment.id)}
                      >
                        Unenroll
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default EnrollmentsPage;
