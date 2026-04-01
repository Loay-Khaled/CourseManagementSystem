import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { courseService } from "../services/courseService";
import styles from "../styles/TablePage.module.css";

const emptyCourseForm = {
  title: "",
  description: "",
  credits: 1,
};

const CoursesPage = () => {
  const { user } = useAuth();
  const canEdit = useMemo(
    () => ["Admin", "Instructor"].includes(user?.role),
    [user?.role],
  );
  const canDelete = user?.role === "Admin";

  const [courses, setCourses] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCourseForm);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(emptyCourseForm);
  const [error, setError] = useState("");

  const loadCourses = async () => {
    try {
      const data = await courseService.getAll();
      setCourses(data);
    } catch {
      setError("Failed to load courses.");
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const validate = (payload) => {
    if (!payload.title.trim()) {
      return "Title is required.";
    }
    if (payload.title.length > 100) {
      return "Title cannot exceed 100 characters.";
    }
    if (payload.description && payload.description.length > 500) {
      return "Description cannot exceed 500 characters.";
    }
    if (Number(payload.credits) < 1 || Number(payload.credits) > 6) {
      return "Credits must be between 1 and 6.";
    }
    return "";
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setError("");

    const validationError = validate(createForm);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await courseService.create({
        ...createForm,
        credits: Number(createForm.credits),
      });
      setCreateForm(emptyCourseForm);
      setShowCreateForm(false);
      await loadCourses();
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to create course.");
    }
  };

  const startEdit = (course) => {
    setEditId(course.id);
    setEditForm({
      title: course.title,
      description: course.description || "",
      credits: course.credits,
    });
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    setError("");

    const validationError = validate(editForm);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await courseService.update(editId, {
        ...editForm,
        credits: Number(editForm.credits),
      });
      setEditId(null);
      setEditForm(emptyCourseForm);
      await loadCourses();
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to update course.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course?",
    );
    if (!confirmed) {
      return;
    }

    setError("");
    try {
      await courseService.remove(id);
      await loadCourses();
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to delete course.");
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h1>Courses</h1>
          {canEdit && (
            <button
              type="button"
              onClick={() => setShowCreateForm((prev) => !prev)}
            >
              {showCreateForm ? "Cancel" : "Add Course"}
            </button>
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {showCreateForm && (
          <form onSubmit={handleCreate} className={styles.form}>
            <input
              placeholder="Title"
              value={createForm.title}
              onChange={(event) =>
                setCreateForm((prev) => ({
                  ...prev,
                  title: event.target.value,
                }))
              }
              maxLength={100}
            />
            <textarea
              placeholder="Description"
              value={createForm.description}
              onChange={(event) =>
                setCreateForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              maxLength={500}
            />
            <input
              type="number"
              min="1"
              max="6"
              value={createForm.credits}
              onChange={(event) =>
                setCreateForm((prev) => ({
                  ...prev,
                  credits: event.target.value,
                }))
              }
            />
            <button type="submit">Create</button>
          </form>
        )}

        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Credits</th>
                <th>Instructor</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>{course.title}</td>
                  <td>{course.description || "N/A"}</td>
                  <td>{course.credits}</td>
                  <td>{course.instructorName}</td>
                  <td className={styles.actions}>
                    <Link
                      to={`/courses/${course.id}`}
                      className={styles.linkButton}
                    >
                      View
                    </Link>
                    {canEdit && (
                      <button type="button" onClick={() => startEdit(course)}>
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        className={styles.danger}
                        onClick={() => handleDelete(course.id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editId && (
          <form onSubmit={handleUpdate} className={styles.form}>
            <h2>Edit Course</h2>
            <input
              placeholder="Title"
              value={editForm.title}
              onChange={(event) =>
                setEditForm((prev) => ({ ...prev, title: event.target.value }))
              }
              maxLength={100}
            />
            <textarea
              placeholder="Description"
              value={editForm.description}
              onChange={(event) =>
                setEditForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              maxLength={500}
            />
            <input
              type="number"
              min="1"
              max="6"
              value={editForm.credits}
              onChange={(event) =>
                setEditForm((prev) => ({
                  ...prev,
                  credits: event.target.value,
                }))
              }
            />
            <div className={styles.actions}>
              <button type="submit">Save</button>
              <button type="button" onClick={() => setEditId(null)}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
};

export default CoursesPage;
