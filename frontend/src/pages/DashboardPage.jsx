import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { courseService } from "../services/courseService";
import { enrollmentService } from "../services/enrollmentService";
import { studentService } from "../services/studentService";
import styles from "../styles/Dashboard.module.css";

const DashboardPage = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState({
    courses: 0,
    students: 0,
    enrollments: 0,
  });

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const courses = await courseService.getAll();
        let students = [];
        let enrollments = [];

        if (user?.role !== "Student") {
          [students, enrollments] = await Promise.all([
            studentService.getAll(),
            enrollmentService.getAll(),
          ]);
        }

        setCounts({
          courses: courses.length,
          students: students.length,
          enrollments: enrollments.length,
        });
      } catch {
        setCounts({ courses: 0, students: 0, enrollments: 0 });
      }
    };

    loadSummary();
  }, [user?.role]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Dashboard</h1>
        <p>
          Welcome, <strong>{user?.username}</strong> ({user?.role})
        </p>
      </header>

      <section className={styles.grid}>
        <article className={styles.card}>
          <h2>Total Courses</h2>
          <p>{counts.courses}</p>
        </article>
        <article className={styles.card}>
          <h2>Total Students</h2>
          <p>{counts.students}</p>
        </article>
        <article className={styles.card}>
          <h2>Total Enrollments</h2>
          <p>{counts.enrollments}</p>
        </article>
      </section>
    </main>
  );
};

export default DashboardPage;
