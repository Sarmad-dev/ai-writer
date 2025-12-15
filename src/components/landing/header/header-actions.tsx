import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function HeaderActions() {
  return (
    <div className="flex items-center gap-1.5 md:gap-2">
      <ThemeToggle />
      <Button
        variant="ghost"
        className="h-9 bg-muted px-3 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground md:h-10 md:px-4"
      >
        <Link href="/login">Login</Link>
      </Button>
      <Button className="group font-medium">
        <Link href="/register" className="flex items-center">
          Get Access
          <ArrowRight className="ml-2 h-4 w-4 arrow-rotate" />
        </Link>
      </Button>
    </div>
  );
}
