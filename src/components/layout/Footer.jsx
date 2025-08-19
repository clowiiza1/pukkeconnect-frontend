export default function Footer() {
  return (
    <footer className="bg-dark text-lightgr py-6 mt-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm">&copy; {new Date().getFullYear()} PukkeConnect. All rights reserved.</p>
        <nav className="flex gap-6 text-sm">
          <a href="/terms" className="hover:text-softlav">Terms</a>
          <a href="/privacy" className="hover:text-softlav">Privacy</a>
          <a href="/contact" className="hover:text-softlav">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
