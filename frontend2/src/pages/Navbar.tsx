type NavbarProps = {
  title: string;
};

function Navbar({ title }: NavbarProps) {
  return (
    <nav>
      <h2>🚀 {title}</h2>

      <div>👤</div>
    </nav>
  );
}

export default Navbar;
