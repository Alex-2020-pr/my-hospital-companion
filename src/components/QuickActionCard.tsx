import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
  variant?: "default" | "accent" | "warning";
}

export const QuickActionCard = ({ 
  title, 
  description, 
  icon: Icon, 
  onClick,
  variant = "default" 
}: QuickActionCardProps) => {
  const variantStyles = {
    default: "hover:bg-primary/5 border-primary/20",
    accent: "hover:bg-accent/5 border-accent/20",
    warning: "hover:bg-destructive/5 border-destructive/20 text-destructive"
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
        variantStyles[variant]
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className={cn(
            "p-2 rounded-lg",
            variant === "default" && "bg-primary/10 text-primary",
            variant === "accent" && "bg-accent/10 text-accent",
            variant === "warning" && "bg-destructive/10 text-destructive"
          )}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold text-sm">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};