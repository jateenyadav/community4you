export default function Footer() {
  return (
    <footer className="footer">
      <div className="container row-between">
        <span>© {new Date().getFullYear()} Community4You — built as a full-stack showcase.</span>
        <span className="muted">React · Express · SQLite · JWT</span>
      </div>
    </footer>
  );
}
