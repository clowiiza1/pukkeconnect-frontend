// About.jsx
import { motion } from "framer-motion";
import { Star, TrendingUp, Smile } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function About({ goAuth }) {
  const navigate = useNavigate();
  return (
    <section id="about" className="bg-white py-20 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        
        {/* LEFT SIDE - IMAGES + STATS */}
        <div className="space-y-6">
          {/* Row 1 */}
          <div className="flex gap-6">
            <motion.img
              src="/src/assets/photo4.jpg"
              alt="Society engagement"
              className="rounded-2xl w-1/2 object-cover shadow-md"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            />
            <motion.div
              className="bg-white rounded-2xl shadow-md p-6 w-1/2 flex flex-col justify-between"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <h4 className="text-2xl font-bold text-dark">500+</h4>
              <p className="text-sm text-muted">
                Students matched with societies successfully.
              </p>
              <div className="flex mt-3 -space-x-2">
                {["/src/assets/photo1.jpg", "/src/assets/photo2.jpg", "/src/assets/photo3.jpg"].map(
                  (src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt="student avatar"
                      className="w-8 h-8 rounded-full border-2 border-white"
                    />
                  )
                )}
              </div>
              <span className="flex items-center text-green-500 text-xs mt-2">
                <TrendingUp size={14} className="mr-1" /> Growing rapidly
              </span>
            </motion.div>
          </div>

          {/* Row 2 */}
          <div className="flex gap-6">
            <motion.img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
              alt="Collaboration"
              className="rounded-2xl w-1/2 object-cover shadow-md"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            />
            <motion.div
              className="bg-white rounded-2xl shadow-md p-6 w-1/2 flex flex-col items-start justify-center"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <p className="text-sm font-semibold text-dark">Best ratings</p>
              <div className="flex mt-2 space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="flex items-center text-sm text-muted mt-2">
                <Smile className="mr-2 text-mediumpur" size={18} />
                Loved by NWU students
              </span>
            </motion.div>
          </div>
        </div>

        {/* RIGHT SIDE - ABOUT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl font-bold text-dark mb-4">About Us</h2>
          <p className="text-0xl text-muted leading-relaxed mb-8">
            PukkeConnect is a digital matchmaking platform designed to connect 
            students with societies at NWU. By solving the <strong>visibility gap</strong>, 
            we ensure every student finds their community, grows leadership skills, 
            and contributes to a vibrant campus life.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-mediumpur to-softlav px-6 py-3 text-white font-semibold shadow hover:opacity-90 transition"
            onClick={() => navigate("/about")}
          >
            Explore More
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
