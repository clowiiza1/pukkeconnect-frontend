import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faCheckCircle, faBolt } from "@fortawesome/free-solid-svg-icons";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section
      id="hero"
      className="relative flex flex-col items-center justify-center text-center px-6 min-h-screen
                 bg-gradient-to-b from-mediumpur via-softlav to-white overflow-hidden"
    >
      {/* === Glowing animated blob background === */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-pulse-slow h-[40rem] w-[40rem] rounded-full bg-gradient-to-r from-nwupur/40 via-softlav/40 to-transparent blur-3xl"></div>
      </div>

      {/* Tagline */}
      <p className="relative z-10 flex items-center gap-2 text-white font-medium mb-6">
        ✨ Connect • Discover • Belong
      </p>

      {/* Heading */}
      <h1 className="relative z-10 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
        <span className="text-white drop-shadow-md">Find Your</span>{" "}
        <span className="bg-gradient-to-r from-nwupur to-dark bg-clip-text text-transparent">
          Perfect Society Match
        </span>
      </h1>

      {/* Subtext */}
      <p className="relative z-10 mt-6 max-w-2xl text-lg text-white/90">
        Join thousands of NWU students connecting with societies, clubs, and
        organizations that match their passions and goals.
      </p>

      {/* === Stats row === */}
      <div className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-6 text-white/90 font-medium">
        <span className="inline-flex items-center gap-2">
          <FontAwesomeIcon icon={faUsers} className="h-5 w-5" />
          500+ Active Students
        </span>
        <span className="inline-flex items-center gap-2">
          <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5" />
          50+ Societies
        </span>
        <span className="inline-flex items-center gap-2">
          <FontAwesomeIcon icon={faBolt} className="h-5 w-5" />
          95% Match Success
        </span>
      </div>

      {/* === CTA buttons === */}
      <div className="relative z-10 mt-10 flex gap-4">
        <button
          onClick={() => navigate("/?auth=register")}
          className="rounded-4xl bg-gradient-to-r from-softlav to-nwupur px-6 py-3 text-white font-semibold shadow-lg hover:opacity-90 transition cursor-pointer"
        >
          Get Started Today
        </button>
        <button
          onClick={() => navigate("/?auth=login")}
          className="rounded-4xl border border-white/60 bg-white/10 px-6 py-3 text-white font-semibold hover:bg-white/20 transition cursor-pointer"
        >
          I Already Have an Account
        </button>
      </div>

      {/* === Trusted campuses === */}
      <div className="relative z-10 mt-16 text-sm text-dark/80">
        <p>Trusted by students across all NWU campuses</p>
        <div className="mt-2 flex gap-6 justify-center font-semibold">
          <span>Potchefstroom</span>
          <span>Mahikeng</span>
          <span>Vanderbijlpark</span>
        </div>
      </div>
    </section>
  );
}
