import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NursingAlertCard, NursingAlert } from "./NursingAlertCard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NursingAlertBadgeProps {
  alerts: NursingAlert[];
  onResolve?: (alertId: string) => void;
  onView?: (alertId: string) => void;
}

export function NursingAlertBadge({ alerts, onResolve, onView }: NursingAlertBadgeProps) {
  const activeAlerts = alerts.filter(a => a.isActive);
  const criticalCount = activeAlerts.filter(a => a.severity === "critical").length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {activeAlerts.length > 0 && (
            <Badge 
              variant={criticalCount > 0 ? "destructive" : "default"}
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {activeAlerts.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Alertas Ativos</h3>
          <p className="text-sm text-muted-foreground">
            {activeAlerts.length} alerta{activeAlerts.length !== 1 ? 's' : ''} 
            {criticalCount > 0 && ` (${criticalCount} crítico${criticalCount !== 1 ? 's' : ''})`}
          </p>
        </div>
        
        <ScrollArea className="h-96">
          <div className="p-4 space-y-3">
            {activeAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum alerta ativo no momento
              </p>
            ) : (
              activeAlerts.map(alert => (
                <NursingAlertCard
                  key={alert.id}
                  alert={alert}
                  onResolve={onResolve}
                  onView={onView}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
