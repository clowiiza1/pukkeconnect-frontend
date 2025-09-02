import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-softlav to-mediumpur text-center px-6 relative overflow-hidden">

      {/* Animated 404 Text */}
      <motion.h1
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-9xl font-extrabold text-white drop-shadow-lg"
      >
        404
      </motion.h1>

      {/* Subtitle */}
      <p className="mt-4 text-lg text-white/90 max-w-md">
        Looks like you're lost in space. The page you’re searching for doesn’t exist.
      </p>

      {/* Back to home button */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-mediumpur font-semibold shadow-lg hover:shadow-2xl hover:scale-105 transition"
        >
          🚀 Back to Home
        </Link>
      </motion.div>

      {/* Decorative floating planets */}
      <motion.img
        src="https://cdn-icons-png.flaticon.com/512/4149/4149677.png"
        alt="Planet"
        className="absolute top-10 left-10 w-16 opacity-70"
        animate={{ y: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 4 }}
      />

      <motion.img
        src="https://cdn-icons-png.flaticon.com/512/4149/4149678.png"
        alt="Planet"
        className="absolute bottom-10 right-10 w-20 opacity-70"
        animate={{ y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 5 }}
      />
    </div>
  );
}
