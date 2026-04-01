import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { studentService } from "../services/studentService";
import styles from "../styles/TablePage.module.css";

const emptyStudentForm = {
  fullName: "",
  email: "",
};

const StudentsPage = () => {
  const { user } = useAuth();
  const isAdmin = useMemo(() => user?.role === "Admin", [user?.role]);

  const [students, setStudents] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState(emptyStudentForm);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(emptyStudentForm);
  const [error, setError] = useState("");

  const loadStudents = async () => {
    try {
      const data = await studentService.getAll();
      setStudents(data);
    } catch {
      setError("Failed to load students.");
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const validate = (payload) => {
    if (!payload.fullName.trim()) {
      return "Full name is required.";
    }
    if (payload.fullName.length > 100) {
      return "Full name cannot exceed 100 characters.";
    }
    if (!payload.email.trim()) {
      return "Email is required.";
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
      await studentService.create(createForm);
      setCreateForm(emptyStudentForm);
      setShowCreateForm(false);
      await loadStudents();
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to create student.");
    }
  };

  const startEdit = (student) => {
    setEditId(student.id);
    setEditForm({ fullName: student.fullName, email: student.email });
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
      await studentService.update(editId, editForm);
      setEditId(null);
      setEditForm(emptyStudentForm);
      await loadStudents();
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to update student.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?",
    );
    if (!confirmed) {
      return;
    }

    try {
      await studentService.remove(id);
      await loadStudents();
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to delete student.");
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h1>Students</h1>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowCreateForm((prev) => !prev)}
            >
              {showCreateForm ? "Cancel" : "Add Student"}
            </button>
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {showCreateForm && isAdmin && (
          <form onSubmit={handleCreate} className={styles.form}>
            <input
              placeholder="Full Name"
              value={createForm.fullName}
              onChange={(event) =>
                setCreateForm((prev) => ({
                  ...prev,
                  fullName: event.target.value,
                }))
              }
            />
            <input
              placeholder="Email"
              type="email"
              value={createForm.email}
              onChange={(event) =>
                setCreateForm((prev) => ({
                  ...prev,
                  email: event.target.value,
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
                <th>Full Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.fullName}</td>
                  <td>{student.email}</td>
                  <td className={styles.actions}>
                    {isAdmin && (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(student)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className={styles.danger}
                          onClick={() => handleDelete(student.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editId && isAdmin && (
          <form onSubmit={handleUpdate} className={styles.form}>
            <h2>Edit Student</h2>
            <input
              placeholder="Full Name"
              value={editForm.fullName}
              onChange={(event) =>
                setEditForm((prev) => ({
                  ...prev,
                  fullName: event.target.value,
                }))
              }
            />
            <input
              placeholder="Email"
              type="email"
              value={editForm.email}
              onChange={(event) =>
                setEditForm((prev) => ({ ...prev, email: event.target.value }))
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

export default StudentsPage;
