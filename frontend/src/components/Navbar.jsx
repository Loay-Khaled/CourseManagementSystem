import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/Navbar.module.css";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated()) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className={styles.header}>
      <div className={styles.brandRow}>
        <Link className={styles.brand} to="/dashboard">
          Course Management
        </Link>
        <div className={styles.userInfo}>
          <span>{user.username}</span>
          <span className={styles.roleBadge}>{user.role}</span>
        </div>
      </div>

      <nav className={styles.nav}>
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? styles.active : "")}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/courses"
          className={({ isActive }) => (isActive ? styles.active : "")}
        >
          Courses
        </NavLink>
        {user.role !== "Student" && (
          <NavLink
            to="/students"
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            Students
          </NavLink>
        )}
        {user.role !== "Student" && (
          <NavLink
            to="/enrollments"
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            Enrollments
          </NavLink>
        )}
        {user.role === "Admin" && (
          <NavLink
            to="/admin"
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            Admin
          </NavLink>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className={styles.logoutButton}
        >
          Logout
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
