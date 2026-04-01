import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { courseService } from "../services/courseService";
import { enrollmentService } from "../services/enrollmentService";
import { studentService } from "../services/studentService";
import styles from "../styles/Dashboard.module.css";

const AdminDashboardPage = () => {
  const [summary, setSummary] = useState({
    courses: 0,
    students: 0,
    enrollments: 0,
  });
  const [recentEnrollments, setRecentEnrollments] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [courses, students, enrollments] = await Promise.all([
          courseService.getAll(),
          studentService.getAll(),
          enrollmentService.getAll(),
        ]);

        setSummary({
          courses: courses.length,
          students: students.length,
          enrollments: enrollments.length,
        });

        setRecentEnrollments(enrollments.slice(0, 5));
      } catch {
        setSummary({ courses: 0, students: 0, enrollments: 0 });
        setRecentEnrollments([]);
      }
    };

    loadData();
  }, []);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Admin Dashboard</h1>
        <p>Global overview of the course platform.</p>
      </header>

      <section className={styles.grid}>
        <article className={styles.card}>
          <h2>Courses</h2>
          <p>{summary.courses}</p>
        </article>
        <article className={styles.card}>
          <h2>Students</h2>
          <p>{summary.students}</p>
        </article>
        <article className={styles.card}>
          <h2>Enrollments</h2>
          <p>{summary.enrollments}</p>
        </article>
      </section>

      <section className={styles.panel}>
        <h2>Quick Actions</h2>
        <div className={styles.quickActions}>
          <Link to="/courses">Go to Courses</Link>
          <Link to="/students">Go to Students</Link>
          <Link to="/enrollments">Go to Enrollments</Link>
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Recent Enrollments</h2>
        {recentEnrollments.length === 0 ? (
          <p>No enrollments available.</p>
        ) : (
          <ul className={styles.recentList}>
            {recentEnrollments.map((enrollment) => (
              <li key={enrollment.id}>
                <strong>{enrollment.studentName}</strong> enrolled in{" "}
                {enrollment.courseTitle} on{" "}
                {new Date(enrollment.enrolledAt).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default AdminDashboardPage;
