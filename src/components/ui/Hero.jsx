export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex flex-col items-center justify-center text-center px-6 py-20
                 bg-gradient-to-b from-mediumpur via-softlav to-white"
    >
      {/* Background blur overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-nwupur/30 via-softlav/20 to-transparent blur-3xl"></div>

      {/* Tagline */}
      <p className="relative z-10 flex items-center gap-2 text-white font-medium mb-6">
        ✨ Connect • Discover • Belong
      </p>

      {/* Heading */}
      <h1 className="relative z-10 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
        <span className="text-white drop-shadow-md">Find Your</span>{" "}
        <span className="bg-gradient-to-r from-nwupur to-black bg-clip-text text-transparent">
          Perfect Society Match
        </span>
      </h1>

      {/* Subtext */}
      <p className="relative z-10 mt-6 max-w-2xl text-lg text-white/90">
        Join thousands of NWU students connecting with societies, clubs, and
        organizations that match their passions and goals.
      </p>

      {/* CTA buttons */}
      <div className="relative z-10 mt-10 flex gap-4">
        <button className="rounded-lg bg-gradient-to-r from-nwupur to-softlav px-6 py-3 text-white font-semibold shadow-lg hover:opacity-90 transition">
          Get Started Today
        </button>
        <button className="rounded-lg border border-white/60 bg-white/10 px-6 py-3 text-white font-semibold hover:bg-white/20 transition">
          I Already Have an Account
        </button>
      </div>
    </section>
  );
}
