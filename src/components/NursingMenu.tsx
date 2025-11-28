import { Link } from 'react-router-dom';
import { Activity, FileText, ClipboardList, Users, AlertTriangle, History, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNurseRole } from '@/hooks/useNurseRole';

export function NursingMenu() {
  const { isNurse, loading } = useNurseRole();

  if (loading || !isNurse) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground hover:bg-primary-foreground/10"
        >
          <Activity className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Módulo de Enfermagem</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Dashboards
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/nursing" className="flex items-center cursor-pointer">
            <Users className="h-4 w-4 mr-2" />
            Dashboard de Plantão
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/nursing/dashboard-mobile" className="flex items-center cursor-pointer">
            <Smartphone className="h-4 w-4 mr-2" />
            Dashboard Mobile
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Registros
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/nursing/vital-signs" className="flex items-center cursor-pointer">
            <Activity className="h-4 w-4 mr-2" />
            Sinais Vitais
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/nursing/vital-signs-mobile" className="flex items-center cursor-pointer">
            <Activity className="h-4 w-4 mr-2" />
            Sinais Vitais (Mobile)
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/nursing/evolution" className="flex items-center cursor-pointer">
            <FileText className="h-4 w-4 mr-2" />
            Evolução de Enfermagem
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/nursing/evolution-mobile" className="flex items-center cursor-pointer">
            <FileText className="h-4 w-4 mr-2" />
            Evolução (Mobile)
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/nursing/procedures" className="flex items-center cursor-pointer">
            <ClipboardList className="h-4 w-4 mr-2" />
            Procedimentos
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Gestão
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/nursing/incidents" className="flex items-center cursor-pointer">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Intercorrências
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/nursing/history-mobile" className="flex items-center cursor-pointer">
            <History className="h-4 w-4 mr-2" />
            Histórico do Paciente
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
