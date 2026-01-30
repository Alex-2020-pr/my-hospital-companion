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
  Stethoscope,
  ClipboardList,
  UserCheck,
  HeartPulse,
  Brain,
  Clipboard,
  Phone,
  History,
  FolderOpen,
  HelpCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDoctorDutyMode } from "@/hooks/useDoctorDutyMode";

// DADOS DE EXEMPLO - notificações por funcionalidade
const NOTIFICATIONS = {
  agenda: 3,
  chat: 2,
  alertas: 5,
  prescricoes: 1,
  interconsultas: 2
};

interface MenuItem {
  id: string;
  label: string;
  description: string;
  icon: any;
  path?: string;
  notifications?: number;
  isNew?: boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const MENU_SECTIONS: MenuSection[] = [
  {
    title: "ATENDIMENTO",
    items: [
      {
        id: "painel",
        label: "Dashboard",
        description: "Visão geral do plantão",
        icon: LayoutDashboard,
        path: "/medico-dashboard"
      },
      {
        id: "pacientes",
        label: "Meus Pacientes",
        description: "Lista de pacientes internados",
        icon: Users,
        path: "/doctor/patients"
      },
      {
        id: "agenda",
        label: "Agenda",
        description: "Consultas e compromissos",
        icon: Calendar,
        notifications: NOTIFICATIONS.agenda,
        path: "/consultas"
      },
      {
        id: "ficha-exemplo",
        label: "Prontuário Eletrônico",
        description: "Exemplo de ficha completa",
        icon: FileText,
        path: "/paciente/exemplo-1"
      }
    ]
  },
  {
    title: "PRESCRIÇÃO E EXAMES",
    items: [
      {
        id: "prescricao",
        label: "Prescrição Digital",
        description: "Receitas e medicamentos",
        icon: Pill,
        notifications: NOTIFICATIONS.prescricoes
      },
      {
        id: "exames",
        label: "Solicitação de Exames",
        description: "Pedir exames laboratoriais e imagem",
        icon: ClipboardList,
        path: "/exames"
      },
      {
        id: "pacs",
        label: "Visualizador PACS",
        description: "Imagens e laudos",
        icon: Image,
        isNew: true
      },
      {
        id: "resultados",
        label: "Resultados",
        description: "Exames e laudos disponíveis",
        icon: FolderOpen,
        path: "/exames"
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
        icon: Video,
        path: "/telemedicina"
      },
      {
        id: "interconsulta",
        label: "Interconsultas",
        description: "Solicitações entre especialidades",
        icon: UserCheck,
        notifications: NOTIFICATIONS.interconsultas
      },
      {
        id: "chat",
        label: "Chat da Equipe",
        description: "Mensagens com enfermagem e equipe",
        icon: MessageSquare,
        notifications: NOTIFICATIONS.chat
      },
      {
        id: "alertas",
        label: "Alertas Clínicos",
        description: "Notificações de pacientes críticos",
        icon: Bell,
        notifications: NOTIFICATIONS.alertas
      },
      {
        id: "chamada-enfermagem",
        label: "Chamar Enfermagem",
        description: "Solicitar equipe de enfermagem",
        icon: Phone
      }
    ]
  },
  {
    title: "PRODUTIVIDADE",
    items: [
      {
        id: "plantoes",
        label: "Escala de Plantões",
        description: "Gerenciar escalas e horários",
        icon: Clock
      },
      {
        id: "protocolos",
        label: "Protocolos Clínicos",
        description: "Diretrizes e guidelines",
        icon: BookOpen
      },
      {
        id: "calculadoras",
        label: "Calculadoras Médicas",
        description: "Glasgow, Braden, CHA2DS2-VASc",
        icon: Brain,
        path: "/doctor/calculators",
        isNew: true
      },
      {
        id: "historico",
        label: "Histórico de Atendimentos",
        description: "Pacientes atendidos anteriormente",
        icon: History
      },
      {
        id: "relatorios",
        label: "Relatórios e Estatísticas",
        description: "Métricas de produtividade",
        icon: BarChart3
      }
    ]
  },
  {
    title: "CONFIGURAÇÕES",
    items: [
      {
        id: "configuracoes",
        label: "Configurações",
        description: "Preferências do sistema",
        icon: Settings,
        path: "/perfil"
      },
      {
        id: "ajuda",
        label: "Ajuda e Suporte",
        description: "Central de ajuda",
        icon: HelpCircle
      }
    ]
  }
];

interface DoctorMenuProps {}

export const DoctorMenu = ({}: DoctorMenuProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { onDutyMode, loading, toggleDutyMode } = useDoctorDutyMode();

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

  const totalNotifications = Object.values(NOTIFICATIONS).reduce((a, b) => a + b, 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10 relative">
          <Menu className="h-6 w-6" />
          {totalNotifications > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive rounded-full text-xs flex items-center justify-center text-destructive-foreground">
              {totalNotifications > 9 ? '9+' : totalNotifications}
            </span>
          )}
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
        <div className={`mb-6 p-4 rounded-lg border ${
          onDutyMode 
            ? 'bg-green-500/10 border-green-500/30' 
            : 'bg-muted/50 border-border'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                onDutyMode ? 'bg-green-500/20' : 'bg-muted'
              }`}>
                <HeartPulse className={`h-5 w-5 ${onDutyMode ? 'text-green-500' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="font-semibold text-sm">Modo Plantão</p>
                <p className="text-xs text-muted-foreground">
                  {onDutyMode ? 'Você está de plantão' : 'Ativar disponibilidade'}
                </p>
              </div>
            </div>
            <Switch
              checked={onDutyMode}
              onCheckedChange={toggleDutyMode}
              disabled={loading}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        </div>

        {/* Seções do Menu */}
        <div className="space-y-6">
          {MENU_SECTIONS.map((section, sectionIndex) => (
            <div key={section.title}>
              {sectionIndex > 0 && <Separator className="mb-4" />}
              <h3 className="text-xs font-semibold text-muted-foreground mb-3 px-2 tracking-wider">
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
                          {item.isNew && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary">
                              Novo
                            </Badge>
                          )}
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
