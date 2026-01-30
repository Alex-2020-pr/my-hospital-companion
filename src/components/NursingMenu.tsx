import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Activity,
  FileText,
  ClipboardList,
  Users,
  AlertTriangle,
  Menu,
  Pill,
  Heart,
  Thermometer,
  Syringe,
  Clock,
  MessageSquare,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  Clipboard,
  BookOpen,
  UserCheck,
  Bed,
  CalendarCheck,
  Phone,
  HelpCircle,
  Droplets,
  Stethoscope
} from 'lucide-react';
import { useNurseRole } from '@/hooks/useNurseRole';

// DADOS DE EXEMPLO - notificações por funcionalidade
const NOTIFICATIONS = {
  medicacoes: 8,
  alertas: 3,
  pendencias: 5,
  chat: 2
};

interface MenuItem {
  id: string;
  label: string;
  description: string;
  icon: any;
  path?: string;
  notifications?: number;
  isNew?: boolean;
  urgent?: boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const MENU_SECTIONS: MenuSection[] = [
  {
    title: "ASSISTÊNCIA",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        description: "Visão geral do plantão",
        icon: Activity,
        path: "/nursing/dashboard-mobile"
      },
      {
        id: "pacientes",
        label: "Lista de Pacientes",
        description: "Pacientes do setor",
        icon: Users,
        path: "/nursing"
      },
      {
        id: "sinais-vitais",
        label: "Sinais Vitais",
        description: "Aferição e registro",
        icon: Heart,
        path: "/nursing/vital-signs-mobile"
      },
      {
        id: "evolucao",
        label: "Evolução de Enfermagem",
        description: "Registros de evolução",
        icon: FileText,
        path: "/nursing/evolution-mobile"
      },
      {
        id: "balanço-hidrico",
        label: "Balanço Hídrico",
        description: "Controle de líquidos",
        icon: Droplets,
        isNew: true
      }
    ]
  },
  {
    title: "MEDICAÇÃO",
    items: [
      {
        id: "aprazamento",
        label: "Aprazamento",
        description: "Horários de medicação",
        icon: Clock,
        notifications: NOTIFICATIONS.medicacoes,
        urgent: true
      },
      {
        id: "administracao",
        label: "Administração de Medicamentos",
        description: "Registrar medicação dada",
        icon: Pill
      },
      {
        id: "checagem",
        label: "Checagem de Prescrição",
        description: "Conferir prescrições médicas",
        icon: ClipboardList,
        notifications: NOTIFICATIONS.pendencias
      },
      {
        id: "hemoderivados",
        label: "Hemoderivados",
        description: "Transfusão e controle",
        icon: Syringe
      }
    ]
  },
  {
    title: "PROCEDIMENTOS",
    items: [
      {
        id: "procedimentos",
        label: "Procedimentos",
        description: "Registrar procedimentos realizados",
        icon: Stethoscope,
        path: "/nursing/procedures"
      },
      {
        id: "curativos",
        label: "Curativos",
        description: "Registro de feridas",
        icon: Clipboard
      },
      {
        id: "sondas-cateteres",
        label: "Sondas e Cateteres",
        description: "Controle de dispositivos",
        icon: Thermometer
      },
      {
        id: "coleta",
        label: "Coleta de Exames",
        description: "Registro de coletas",
        icon: CalendarCheck
      }
    ]
  },
  {
    title: "DOCUMENTAÇÃO",
    items: [
      {
        id: "intercorrencias",
        label: "Intercorrências",
        description: "Registrar eventos adversos",
        icon: AlertTriangle,
        notifications: NOTIFICATIONS.alertas,
        path: "/nursing/incidents"
      },
      {
        id: "passagem-plantao",
        label: "Passagem de Plantão",
        description: "Relatório de turno",
        icon: UserCheck
      },
      {
        id: "historico",
        label: "Histórico do Paciente",
        description: "Ver evoluções anteriores",
        icon: BookOpen,
        path: "/nursing/history-mobile"
      },
      {
        id: "escalas",
        label: "Escalas de Avaliação",
        description: "Glasgow, Braden, CHA2DS2-VASc",
        icon: BarChart3,
        path: "/nursing/calculators"
      }
    ]
  },
  {
    title: "COMUNICAÇÃO",
    items: [
      {
        id: "chat",
        label: "Chat da Equipe",
        description: "Mensagens internas",
        icon: MessageSquare,
        notifications: NOTIFICATIONS.chat
      },
      {
        id: "alertas",
        label: "Alertas",
        description: "Notificações do setor",
        icon: Bell,
        notifications: NOTIFICATIONS.alertas
      },
      {
        id: "chamar-medico",
        label: "Chamar Médico",
        description: "Solicitar avaliação médica",
        icon: Phone
      }
    ]
  },
  {
    title: "GESTÃO",
    items: [
      {
        id: "leitos",
        label: "Gestão de Leitos",
        description: "Ocupação e movimentação",
        icon: Bed
      },
      {
        id: "escala-equipe",
        label: "Escala da Equipe",
        description: "Ver escala de plantão",
        icon: CalendarCheck
      },
      {
        id: "protocolos",
        label: "Protocolos",
        description: "POPs e diretrizes",
        icon: BookOpen
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

export function NursingMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { isNurse, loading } = useNurseRole();

  if (loading || !isNurse) {
    return null;
  }

  const handleItemClick = (item: MenuItem) => {
    if (item.path) {
      navigate(item.path);
      setOpen(false);
    } else {
      console.log(`Navegar para: ${item.id}`);
    }
  };

  const handleLogout = () => {
    navigate("/auth");
  };

  const totalNotifications = Object.values(NOTIFICATIONS).reduce((a, b) => a + b, 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground hover:bg-primary-foreground/10 relative"
        >
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
            <Activity className="h-6 w-6 text-primary" />
            Menu Enfermagem
          </SheetTitle>
        </SheetHeader>

        {/* Resumo do Plantão */}
        <div className="mb-6 p-4 rounded-lg border bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-sm">Resumo do Plantão</p>
            <Badge variant="outline" className="text-xs">
              07:00 - 19:00
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-background rounded">
              <p className="text-lg font-bold text-primary">12</p>
              <p className="text-[10px] text-muted-foreground">Pacientes</p>
            </div>
            <div className="p-2 bg-background rounded">
              <p className="text-lg font-bold text-orange-500">{NOTIFICATIONS.medicacoes}</p>
              <p className="text-[10px] text-muted-foreground">Medicações</p>
            </div>
            <div className="p-2 bg-background rounded">
              <p className="text-lg font-bold text-destructive">{NOTIFICATIONS.alertas}</p>
              <p className="text-[10px] text-muted-foreground">Alertas</p>
            </div>
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
                      className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left group ${
                        item.urgent 
                          ? 'bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30' 
                          : 'hover:bg-accent'
                      }`}
                    >
                      <div className="mt-0.5">
                        <Icon className={`h-5 w-5 ${item.urgent ? 'text-orange-500' : 'text-primary'}`} />
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
                              variant={item.urgent ? "default" : "destructive"}
                              className={`h-5 min-w-5 px-1.5 text-xs ${item.urgent ? 'bg-orange-500' : ''}`}
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
}
