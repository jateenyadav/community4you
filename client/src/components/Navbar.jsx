import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <img className="brand-logo" src="/community.png" alt="Community4You" />
          Community4You
        </Link>
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} end>
            Explore
          </NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} end>
                Dashboard
              </NavLink>
              <NavLink to="/create" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
                Create
              </NavLink>
              <button className="btn btn-ghost" onClick={handleLogout} style={{ marginLeft: 6 }}>
                Log out
              </button>
              <Link to="/dashboard">
                <img className="avatar" src={user.avatar} alt={user.name} title={user.name} />
              </Link>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
                Log in
              </NavLink>
              <Link to="/register" className="btn btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
