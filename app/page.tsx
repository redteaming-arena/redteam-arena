import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full bg-gray-900 text-white py-4 z-50 shadow-md">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo or Brand Name */}
        <div className="text-lg font-bold">
          <Link href="/">MyBrand</Link>
        </div>

        {/* Navigation Links (Visible on larger screens) */}
        <nav className="hidden md:flex space-x-6">
          <Link href="/" className="hover:text-gray-400">
            Home
          </Link>
          <Link href="/leaderboard" className="hover:text-gray-400">
            Leaderboard
          </Link>
          <Link href="/games" className="hover:text-gray-400">
            Games
          </Link>
        </nav>

        {/* Hamburger Menu (Visible on small screens) */}
        <div className="md:hidden">
          <button
            className="focus:outline-none text-white"
            aria-label="Toggle navigation"
            onClick={() => document.getElementById('mobileMenu')?.classList.toggle('hidden')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu (Hidden by default) */}
      <div id="mobileMenu" className="hidden md:hidden bg-gray-900">
        <nav className="flex flex-col space-y-2 p-4">
          <Link href="/" className="hover:text-gray-400">
            Home
          </Link>
          <Link href="/leaderboard" className="hover:text-gray-400">
            Leaderboard
          </Link>
          <Link href="/games" className="hover:text-gray-400">
            Games
          </Link>
        </nav>
      </div>
    </header>
  );
}
