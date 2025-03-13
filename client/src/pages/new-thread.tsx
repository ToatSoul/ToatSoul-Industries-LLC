import { ThreadForm } from "@/components/forum/thread-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function NewThread() {
  return (
    <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button variant="outline" className="mb-6" asChild>
        <Link href="/forums">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Forums
        </Link>
      </Button>
      
      <ThreadForm />
    </main>
  );
}
