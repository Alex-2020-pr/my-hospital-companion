import { ReactNode } from "react";
import { BottomNavigation } from "./BottomNavigation";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export const Layout = ({ children, title }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {title && (
        <header className="bg-primary text-primary-foreground px-4 py-4 shadow-sm">
          <h1 className="text-xl font-semibold">{title}</h1>
        </header>
      )}
      
      <main className="pb-20 min-h-screen">
        {children}
      </main>
      
      <BottomNavigation />
    </div>
  );
};