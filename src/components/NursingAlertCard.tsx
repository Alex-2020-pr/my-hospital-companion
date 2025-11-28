import { AlertCircle, TrendingDown, Users, Thermometer, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AlertType = 
  | "critical_vitals"
  | "fall_risk"
  | "high_pain"
  | "deterioration"
  | "isolation";

export type AlertSeverity = "critical" | "warning" | "info";

export interface NursingAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  patient: string;
  bed: string;
  message: string;
  time: string;
  isActive: boolean;
}

interface NursingAlertCardProps {
  alert: NursingAlert;
  onResolve?: (alertId: string) => void;
  onView?: (alertId: string) => void;
}

const alertConfig = {
  critical_vitals: {
    icon: Activity,
    label: "Sinais Críticos",
    color: "text-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  },
  fall_risk: {
    icon: AlertCircle,
    label: "Risco de Queda",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200"
  },
  high_pain: {
    icon: AlertCircle,
    label: "Dor Alta",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200"
  },
  deterioration: {
    icon: TrendingDown,
    label: "Tendência de Piora",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  },
  isolation: {
    icon: Users,
    label: "Isolamento",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  }
};

const severityConfig = {
  critical: { label: "Crítico", variant: "destructive" as const },
  warning: { label: "Atenção", variant: "default" as const },
  info: { label: "Info", variant: "secondary" as const }
};

export function NursingAlertCard({ alert, onResolve, onView }: NursingAlertCardProps) {
  const config = alertConfig[alert.type];
  const Icon = config.icon;
  const severityInfo = severityConfig[alert.severity];

  return (
    <Card className={cn(
      "border-l-4 transition-all hover:shadow-md",
      config.borderColor,
      config.bgColor
    )}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg bg-white", config.color)}>
            <Icon className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm">{config.label}</h4>
              <Badge variant={severityInfo.variant} className="text-xs">
                {severityInfo.label}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">
              <span className="font-medium">{alert.patient}</span> - Leito {alert.bed}
            </p>
            
            <p className="text-sm mb-3">{alert.message}</p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{alert.time}</span>
              
              <div className="flex gap-2">
                {onView && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onView(alert.id)}
                  >
                    Ver Paciente
                  </Button>
                )}
                {onResolve && alert.isActive && (
                  <Button 
                    size="sm"
                    onClick={() => onResolve(alert.id)}
                  >
                    Resolver
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
