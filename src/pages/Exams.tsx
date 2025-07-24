import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Eye, Calendar, FileText, Activity, Microscope } from "lucide-react";

export const Exams = () => {
  const availableResults = [
    {
      id: 1,
      name: "Hemograma Completo",
      type: "laboratorio",
      date: "10/01/2024",
      doctor: "Dr. João Silva",
      status: "disponível",
      hasReport: true
    },
    {
      id: 2,
      name: "Raio-X Tórax",
      type: "imagem",
      date: "08/01/2024",
      doctor: "Dra. Ana Costa",
      status: "disponível",
      hasReport: true,
      hasImages: true
    },
    {
      id: 3,
      name: "Eletrocardiograma",
      type: "cardiaco",
      date: "05/01/2024",
      doctor: "Dr. Carlos Mendes",
      status: "disponível",
      hasReport: true
    }
  ];

  const pendingExams = [
    {
      id: 4,
      name: "Ultrassom Abdominal",
      type: "imagem",
      scheduledDate: "20/01/2024",
      scheduledTime: "09:00",
      status: "agendado",
      location: "Setor de Imagem - Térreo"
    },
    {
      id: 5,
      name: "Exame de Urina",
      type: "laboratorio",
      scheduledDate: "22/01/2024",
      scheduledTime: "07:30",
      status: "agendado",
      location: "Laboratório Central"
    }
  ];

  const getExamIcon = (type: string) => {
    switch (type) {
      case 'laboratorio':
        return Microscope;
      case 'imagem':
        return Eye;
      case 'cardiaco':
        return Activity;
      default:
        return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'laboratorio':
        return 'bg-blue-100 text-blue-800';
      case 'imagem':
        return 'bg-green-100 text-green-800';
      case 'cardiaco':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'laboratorio':
        return 'Laboratório';
      case 'imagem':
        return 'Imagem';
      case 'cardiaco':
        return 'Cardíaco';
      default:
        return 'Exame';
    }
  };

  return (
    <Layout title="Exames">
      <div className="p-4 space-y-4">
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="results">Resultados</TabsTrigger>
            <TabsTrigger value="scheduled">Agendados</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-4">
            {availableResults.map((exam) => {
              const Icon = getExamIcon(exam.type);
              
              return (
                <Card key={exam.id} className="w-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-base">{exam.name}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getTypeColor(exam.type)}>
                              {getTypeName(exam.type)}
                            </Badge>
                            <Badge variant="default">
                              Disponível
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      Realizado em {exam.date}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      Solicitado por: {exam.doctor}
                    </p>

                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </Button>
                      <Button variant="default" size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                    
                    {exam.hasImages && (
                      <Button variant="secondary" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Imagens
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            {pendingExams.map((exam) => {
              const Icon = getExamIcon(exam.type);
              
              return (
                <Card key={exam.id} className="w-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-accent/10 rounded-lg">
                          <Icon className="h-5 w-5 text-accent" />
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-base">{exam.name}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getTypeColor(exam.type)}>
                              {getTypeName(exam.type)}
                            </Badge>
                            <Badge variant="secondary">
                              Agendado
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-accent/10 p-3 rounded-lg">
                      <div className="flex items-center text-sm font-medium text-accent-foreground mb-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        {exam.scheduledDate} às {exam.scheduledTime}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Local: {exam.location}
                      </p>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-blue-800 mb-1">
                        Instruções Importantes:
                      </p>
                      <p className="text-sm text-blue-700">
                        {exam.type === 'laboratorio' 
                          ? "Jejum de 8 horas. Chegue 30 minutos antes do horário."
                          : "Chegue 15 minutos antes do horário marcado."
                        }
                      </p>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Reagendar
                      </Button>
                      <Button variant="destructive" size="sm" className="flex-1">
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};