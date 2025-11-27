import { Link } from 'react-router-dom';
import { Activity, FileText, ClipboardList, Users, Menu } from 'lucide-react';
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
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Módulo de Enfermagem</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/nursing" className="flex items-center cursor-pointer">
            <Users className="h-4 w-4 mr-2" />
            Dashboard de Plantão
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/nursing/vital-signs" className="flex items-center cursor-pointer">
            <Activity className="h-4 w-4 mr-2" />
            Sinais Vitais
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/nursing/evolution" className="flex items-center cursor-pointer">
            <FileText className="h-4 w-4 mr-2" />
            Evolução de Enfermagem
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/nursing/procedures" className="flex items-center cursor-pointer">
            <ClipboardList className="h-4 w-4 mr-2" />
            Procedimentos
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
