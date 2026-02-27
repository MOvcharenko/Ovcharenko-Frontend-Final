import { Link } from 'react-router-dom';

interface NavBarProps {
  title: string;
  to?: string;
}

export default function NavBar({ title, to = '/' }: NavBarProps) {
  return (
    <nav className="top-nav">
      <Link to={to} className="nav-title">
        {title}
      </Link>
    </nav>
  );
}
