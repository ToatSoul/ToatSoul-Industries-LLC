import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="mt-auto py-6 bg-gray-50 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} ToastSoul Industries. All rights reserved.
            </p>
          </div>
          <nav className="flex gap-6">
            <Link href="/" className="text-sm text-gray-600 hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/forums" className="text-sm text-gray-600 hover:text-primary transition-colors">
              Forums
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}