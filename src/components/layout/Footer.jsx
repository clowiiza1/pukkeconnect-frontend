import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-r from-mediumpur/90 to-softlav/90 text-white mt-20">
      {/* Glow divider top */}
      <div className="absolute -top-4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent blur-sm"></div>

      <div className="mx-auto max-w-7xl px-2 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* === Brand / About === */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src="/icon.png" alt="Pukke Connect Logo" className="h-12 w-12 rounded-full ring-2 ring-white/40" />
            <span className="text-xl font-semibold">
              Pukke <span className="text-lightgr">Connect</span>
            </span>
          </div>
          <p className="text-sm text-white/80 mb-4">
            Connecting North-West University students with their perfect society matches through intelligent technology and community building.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <FontAwesomeIcon icon={faEnvelope} className="w-4" />
              support@pukkeconnect.co.za
            </li>
            <li className="flex items-center gap-2">
              <FontAwesomeIcon icon={faPhone} className="w-4" />
              +27 (0) 18 299 1111
            </li>
            <li className="flex items-center gap-2">
              <FontAwesomeIcon icon={faLocationDot} className="w-4" />
              North-West University, South Africa
            </li>
          </ul>
        </div>

        {/* === Platform === */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Platform</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-lightgr">Home Page</Link></li>
            <li><Link to="/about" className="hover:text-lightgr">About Pukke-Connect</Link></li>
            <li><a href="/#societies-section" className="hover:text-lightgr">Society Categories</a></li>
            <li><a href="/#faq" className="hover:text-lightgr">FAQ</a></li>
          </ul>
        </div>

        {/* === Support === */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Support</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-lightgr">Help Center</Link></li>
            <li><Link to="/contact" className="hover:text-lightgr">Contact Us</Link></li>
            <li><Link to="/contact" className="hover:text-lightgr">Report Issue</Link></li>
            <li><Link to="/about" className="hover:text-lightgr">Community Guidelines</Link></li>
          </ul>
        </div>

        {/* === Legal === */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/terms" className="hover:text-lightgr">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-lightgr">Terms of Service</Link></li>
            <li><Link to="/terms" className="hover:text-lightgr">Cookie Policy</Link></li>
            <li><Link to="/terms" className="hover:text-lightgr">Data Protection</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/20 mt-6 py-4 text-center text-xs text-white/60">
        © 2024 Pukke Connect. All rights reserved.
      </div>
    </footer>
  );
}
