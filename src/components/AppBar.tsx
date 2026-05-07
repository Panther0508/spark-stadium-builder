import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { HallsBot } from "./HallsBot";

export function AppBar() {
  return (
    <header className="sticky top-0 z-30 px-4 pt-4">
      <div className="glass rounded-2xl px-4 py-2 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold tracking-tight">
          <span className="text-primary text-glow">Halls</span>Sports
        </Link>
        <div className="-my-2">
          <HallsBot />
        </div>
        <Link
          to="/admin"
          className="glass rounded-full p-2 hover:ring-1 hover:ring-primary/40 transition"
          aria-label="Admin login"
        >
          <Lock className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}
