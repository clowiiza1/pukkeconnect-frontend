import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardHref =
    role === "admin" ? "/admin" :
    role === "society-admin" ? "/society-admin" : "/student";

  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/icon.png" alt="PukkeConnect" className="h-8 w-8" />
          <span className="font-alt text-xl text-dark">PukkeConnect</span>
        </Link>

        <nav className="flex items-center gap-4">
          <NavLink to="/" className="text-muted hover:text-mediumpur">Home</NavLink>

          {isAuthenticated && (
            <NavLink to={dashboardHref} className="text-muted hover:text-mediumpur">
              Dashboard
            </NavLink>
          )}

          {!isAuthenticated ? (
            <>
              <button onClick={() => navigate("/?auth=login")} className="px-3 py-1 rounded bg-mediumpur text-white">
                Login
              </button>
              <button onClick={() => navigate("/?auth=register")} className="px-3 py-1 rounded border border-mediumpur text-mediumpur">
                Register
              </button>
            </>
          ) : (
            <button onClick={logout} className="px-3 py-1 rounded border border-dark text-dark">
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
