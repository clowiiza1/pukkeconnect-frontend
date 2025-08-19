import { Outlet, Link } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
          <Link to="/" className="font-alt text-xl text-mediumpur">PukkeConnect</Link>
          <nav className="flex gap-4">
            <Link to="/login" className="text-muted hover:text-mediumpur">Login</Link>
            <Link to="/register" className="text-muted hover:text-mediumpur">Register</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted">
          © {new Date().getFullYear()} PukkeConnect
        </div>
      </footer>
    </div>
  );
}
