import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const categories = [
  {
    title: "Academic Societies",
    description: "Enhance your studies with discipline-specific groups and academic excellence clubs.",
    img: "/src/assets/Academics.jpg",
    popular: ["Engineering Society", "Business Club", "CS&IS Students Association"],
  },
  {
    title: "Community Service",
    description: "Make a difference through volunteer work and community outreach programs.",
    img: "/src/assets/CommunityService.jpg",
    popular: ["Community Outreach", "Environmental Action", "Charity Drive"],
  },
  {
    title: "Sports & Recreation",
    description: "Stay active and competitive with various sports clubs and fitness groups.",
    img: "/src/assets/Sports.png",
    popular: ["Rugby Club", "Tennis Society", "Fitness Enthusiasts"],
  },
  {
    title: "Music & Performance",
    description: "Showcase your talents in music, dance, and performing arts.",
    img: "/src/assets/Music.jpeg",
    popular: ["Choir Society", "Dance Club", "Music Ensemble"],
  },
  {
    title: "Arts & Culture",
    description: "Express yourself through creative and cultural organizations.",
    img: "/src/assets/Arts.jpeg",
    popular: ["Drama Society", "Photography Club", "Cultural Heritage"],
  },
  {
    title: "Technology & Innovation",
    description: "Explore cutting-edge technology and innovation with tech-focused societies.",
    img: "/src/assets/Tech.jpg",
    popular: ["Coding Club", "Robotics Society", "Tech Entrepreneurs"],
  },
];

export default function SocietyCategories({ goAuth }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Slider config
  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  const handleExplore = () => {
    if (!user) {
      // open login/signup modal
      goAuth?.("login");
      return;
    }
    if (user.role === "student") {
      navigate("/student/societies");
    } else {
      navigate("/"); // fallback
    }
  };

  return (
    <section id="societies-section" className="py-16 bg-white">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-dark">Explore Society Categories</h1>
        <p className="mt-2 text-muted max-w-2xl mx-auto">
          Discover societies across different categories and find where your passions align with amazing communities.
        </p>
      </div>

      {/* Carousel */}
      <div className="px-6">
        <Slider {...settings}>
          {categories.map((cat, i) => (
            <div key={i} className="px-3">
              <div className="rounded-xl overflow-hidden shadow-md bg-white hover:shadow-lg transition">
                <img src={cat.img} alt={cat.title} className="h-60 w-full object-cover" />
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-dark">{cat.title}</h2>
                  <p className="mt-2 text-sm text-muted">{cat.description}</p>
                  <h3 className="mt-4 text-sm font-medium text-dark">Popular societies:</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {cat.popular.map((society, j) => (
                      <span
                        key={j}
                        className="px-3 py-1 text-xs rounded-full border border-mediumpur text-mediumpur"
                      >
                        {society}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* Explore Button */}
      <div className="text-center mt-10">
        <button
          onClick={handleExplore}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-mediumpur to-softlav px-6 py-3 text-white font-semibold shadow hover:opacity-90 transition"
        >
          Explore All Societies
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </section>
  );
}
