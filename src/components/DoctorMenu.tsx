import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Menu,
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Pill,
  Video,
  Image,
  MessageSquare,
  Bell,
  Clock,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  Stethoscope
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// DADOS DE EXEMPLO - notificações por funcionalidade
const NOTIFICATIONS = {
  agenda: 2,
  chat: 1,
  alertas: 3
};

interface MenuItem {
  id: string;
  label: string;
  description: string;
  icon: any;
  path?: string;
  notifications?: number;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const MENU_SECTIONS: MenuSection[] = [
  {
    title: "CLÍNICO",
    items: [
      {
        id: "painel",
        label: "Painel",
        description: "Visão geral do dia",
        icon: LayoutDashboard,
        path: "/medico-dashboard"
      },
      {
        id: "agenda",
        label: "Agenda",
        description: "Consultas e compromissos",
        icon: Calendar,
        notifications: NOTIFICATIONS.agenda
      },
      {
        id: "pacientes",
        label: "Pacientes",
        description: "Lista e prontuários",
        icon: Users
      },
      {
        id: "prontuario",
        label: "Prontuário",
        description: "Registro médico completo",
        icon: FileText
      },
      {
        id: "prescricao",
        label: "Prescrição Digital",
        description: "Receitas e medicamentos",
        icon: Pill
      },
      {
        id: "exames",
        label: "Exames/Imagens (PACS)",
        description: "Resultados e diagnósticos",
        icon: Image
      }
    ]
  },
  {
    title: "COMUNICAÇÃO",
    items: [
      {
        id: "teleconsulta",
        label: "Teleconsulta",
        description: "Atendimento por vídeo",
        icon: Video
      },
      {
        id: "chat",
        label: "Chat Equipe",
        description: "Mensagens internas",
        icon: MessageSquare,
        notifications: NOTIFICATIONS.chat
      },
      {
        id: "alertas",
        label: "Alertas",
        description: "Notificações clínicas",
        icon: Bell,
        notifications: NOTIFICATIONS.alertas
      }
    ]
  },
  {
    title: "PRODUTIVIDADE",
    items: [
      {
        id: "plantoes",
        label: "Plantões",
        description: "Escalas e horários",
        icon: Clock
      },
      {
        id: "protocolos",
        label: "Protocolos/Guias",
        description: "Diretrizes clínicas",
        icon: BookOpen
      },
      {
        id: "relatorios",
        label: "Relatórios Pessoais",
        description: "Estatísticas e métricas",
        icon: BarChart3
      }
    ]
  },
  {
    title: "ADMIN",
    items: [
      {
        id: "configuracoes",
        label: "Configurações",
        description: "Preferências do sistema",
        icon: Settings
      }
    ]
  }
];

interface DoctorMenuProps {
  onDutyMode: boolean;
  onToggleDutyMode: (value: boolean) => void;
}

export const DoctorMenu = ({ onDutyMode, onToggleDutyMode }: DoctorMenuProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleItemClick = (item: MenuItem) => {
    if (item.path) {
      navigate(item.path);
      setOpen(false);
    } else {
      console.log(`Navegar para: ${item.id}`);
      // Aqui você conectaria às rotas reais quando implementadas
    }
  };

  const handleLogout = () => {
    console.log("Logout");
    navigate("/auth");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 overflow-y-auto bg-background">
        <SheetHeader className="text-left mb-6">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Stethoscope className="h-6 w-6 text-primary" />
            Menu Médico
          </SheetTitle>
        </SheetHeader>

        {/* Modo Plantão Toggle */}
        <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Modo Plantão</p>
              <p className="text-xs text-muted-foreground">Ativar status de disponibilidade</p>
            </div>
            <Switch
              checked={onDutyMode}
              onCheckedChange={onToggleDutyMode}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        </div>

        {/* Seções do Menu */}
        <div className="space-y-6">
          {MENU_SECTIONS.map((section, sectionIndex) => (
            <div key={section.title}>
              {sectionIndex > 0 && <Separator className="mb-4" />}
              <h3 className="text-xs font-semibold text-muted-foreground mb-3 px-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left group"
                    >
                      <div className="mt-0.5">
                        <Icon className="h-5 w-5 text-primary group-hover:text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">
                            {item.label}
                          </p>
                          {item.notifications && item.notifications > 0 && (
                            <Badge 
                              variant="destructive" 
                              className="h-5 min-w-5 px-1.5 text-xs"
                            >
                              {item.notifications}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Sair */}
          <Separator />
          <button
            onClick={handleLogout}
            className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-destructive/10 transition-colors text-left group"
          >
            <LogOut className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p className="font-medium text-sm text-destructive">Sair</p>
              <p className="text-xs text-muted-foreground">Encerrar sessão</p>
            </div>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
