import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { courseService } from "../services/courseService";
import styles from "../styles/TablePage.module.css";

const CourseDetailPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCourseDetails = async () => {
      try {
        const [courseData, studentData] = await Promise.all([
          courseService.getById(id),
          courseService.getEnrolledStudents(id),
        ]);
        setCourse(courseData);
        setStudents(studentData);
      } catch {
        setError("Unable to load course details.");
      }
    };

    loadCourseDetails();
  }, [id]);

  if (error) {
    return (
      <main className={styles.page}>
        <p className={styles.error}>{error}</p>
      </main>
    );
  }

  if (!course) {
    return (
      <main className={styles.page}>
        <p>Loading course details...</p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <h1>{course.title}</h1>
        <p>{course.description || "No description available."}</p>
        <p>
          <strong>Credits:</strong> {course.credits}
        </p>
        <p>
          <strong>Instructor:</strong> {course.instructorName}
        </p>
        <Link to="/courses" className={styles.linkButton}>
          Back to Courses
        </Link>
      </section>

      <section className={styles.panel}>
        <h2>Enrolled Students</h2>
        {students.length === 0 ? (
          <p>No students enrolled yet.</p>
        ) : (
          <ul className={styles.list}>
            {students.map((student) => (
              <li key={student.id}>
                {student.fullName} <span>{student.email}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default CourseDetailPage;
