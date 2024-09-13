import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-gray-800 p-4">
      <div className="sm:container mx-auto flex justify-between items-center text-gray-400 text-sm">
        <p>
          &copy; {new Date().getFullYear()} RedTeam Arena. All rights reserved.
        </p>
        <nav className="space-x-0 sm:space-x-4">
          <Link
            to="/"
            style={{
              color: "#666",
              marginRight: "1rem",
              textDecoration: "none",
            }}
          >
            Home
          </Link>
          <Link
            to="/terms"
            style={{
              color: "#666",
              marginRight: "1rem",
              textDecoration: "none",
            }}
          >
            Terms of Service
          </Link>
          <a
            href="https://github.com"
            style={{
              color: "#666",
              marginRight: "1rem",
              textDecoration: "none",
            }}
            target="_blank"
            rel="noopener noreferrer"
          >
            Github
          </a>
        </nav>
      </div>
    </footer>
  );
}
