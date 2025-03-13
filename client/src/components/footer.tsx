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
            <Button 
              variant="link" 
              className="text-sm text-gray-600 hover:text-gray-900 p-0"
              onClick={() => window.location.href = "/terms"}
            >
              Terms
            </Button>
            <Button 
              variant="link" 
              className="text-sm text-gray-600 hover:text-gray-900 p-0"
              onClick={() => window.location.href = "/privacy"}
            >
              Privacy
            </Button>
            <Button 
              variant="link" 
              className="text-sm text-gray-600 hover:text-gray-900 p-0"
              onClick={() => window.location.href = "/contact"}
            >
              Contact
            </Button>
          </nav>
        </div>
      </div>
    </footer>
  );
}