export default function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted">
        © {new Date().getFullYear()} PukkeConnect
      </div>
    </footer>
  );
}
