import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faCircleInfo,
  faUsers,
  faEnvelope,
  faRightToBracket,
  faUserPlus,
  faArrowRightFromBracket,
  faPhone,
  faBookOpen,
  faPager,
} from "@fortawesome/free-solid-svg-icons";


function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className="inline-flex items-center gap-2 px-3 py-2 text-dark hover:text-mediumpur"
    >
      {children}
    </NavLink>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, role, logout } = useAuth();

  const goAuth = (kind) => navigate({ pathname: "/", search: `?auth=${kind}` });

  const dashboardHref =
    role === "admin" ? "/admin" :
    role === "society-admin" ? "/society-admin" :
    "/student";

  // close mobile menu when route changes
  useMemo(() => setOpen(false), [location.pathname]);

  return (
    <header className="sticky top-0 z-40 w-full bg-gradient-to-b from-white/90 to-white/70 backdrop-blur">
      <div className="mx-auto max-w-8xl px-4">
        <div className="flex h-20 items-center justify-between">
          {/* === Logo ==== */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/icon.png"
              alt="PukkeConnect"
              className="h-14 w-14 rounded-full ring-1 ring-muted/40"
            />
            <span className="font-alt text-lg font-semibold">
              Pukke{""}
              <span className="bg-mediumpur to-softlav bg-clip-text text-transparent">
                Connect
              </span>
            </span>
          </Link>

         
          {/* === Desktop Nav Bar with FontAwesome icons === */}
          <nav className="hidden md:flex items-center gap-2 ">
            <NavItem to="/">
              <FontAwesomeIcon icon={faHouse} className="h-4 w-4" />
              <span>Home</span>
            </NavItem>

            <NavItem to="/about">
              <FontAwesomeIcon icon={faBookOpen} className="h-4 w-4" />
              <span>About</span>
            </NavItem>

            <NavItem to="/societies">
              <FontAwesomeIcon icon={faUsers} className="h-4 w-4" />
              <span>Societies</span>
            </NavItem>

            <NavItem to="/contact">
              <FontAwesomeIcon icon={faPhone} className="h-4 w-4" />
              <span>Contact</span>
            </NavItem>
          


            {isAuthenticated && <NavItem to={dashboardHref}>
              <FontAwesomeIcon icon={faPager} className="h-4 w-4" />
              <span>Dashboard</span>
              </NavItem>}
          </nav>

          {/* === Right side actions === */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <button onClick={() => goAuth("login")} className=" hover:text-mediumpur cursor-pointer">
                  Sign In
                </button>
                <button
                  onClick={() => goAuth("register")}
                  className="rounded-3xl px-4 py-2 text-white bg-gradient-to-r from-mediumpur to-softlav hover:opacity-90 transition"
                >
                  <span className="inline-flex items-center gap-2 cursor-pointer">
                    <FontAwesomeIcon icon={faUserPlus} className="h-4 w-4" />
                    Join Now
                  </span>
                </button>
              </>
            ) : (
              <button
                onClick={logout}
                className="rounded-4xl border border-dark/30 px-4 py-2 text-white bg-gradient-to-r from-mediumpur to-softlav hover:opacity-90 transition"
              >
                Logout
              </button>
            )}
          </div>

          {/* === Hamburger (mobile) === */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg ring-1 ring-muted/40 text-dark"
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
            </svg>
          </button>
        </div>
      </div>

      {/* === Mobile sheet === */}
      {open && (
        <div className="md:hidden  bg-white">
          <div className="mx-auto max-w-7xl px-4 py-3 space-y-2">
            <NavLink to="/" className="block rounded px-2 py-2 hover:text-white hover:bg-softlav">Home</NavLink>
            <NavLink to="/about" className="block rounded px-2 py-2 hover:text-white hover:bg-softlav">About</NavLink>
            <NavLink to="/societies" className="block rounded px-2 py-2 hover:text-white hover:bg-softlav">Society Categories</NavLink>
            <NavLink to="/contact" className="block rounded px-2 py-2 hover:text-white hover:bg-softlav">Contact</NavLink>
            {isAuthenticated && (
              <NavLink to={dashboardHref} className="block rounded px-2 py-2 hover:bg-lightgr">Dashboard</NavLink>
            )}
            <div className="pt-3 flex gap-2">
              {!isAuthenticated ? (
              <>
                <button
                  onClick={() => goAuth("login")}
                  className="text-dark hover:text-mediumpur flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faRightToBracket} />
                  Sign In
                </button>
                <button
                  onClick={() => goAuth("register")}
                  className="rounded-lg px-4 py-2 text-white bg-gradient-to-r from-mediumpur to-softlav hover:opacity-90 transition flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faUserPlus} />
                  Join Now
                </button>
              </>
            ) : (
              <button
                onClick={logout}
                className="rounded-lg border border-dark/30 px-4 py-2 text-dark hover:bg-lightgr flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
                Logout
              </button>
            )}

            </div>
          </div>
        </div>
      )}
    </header>
  );
}
