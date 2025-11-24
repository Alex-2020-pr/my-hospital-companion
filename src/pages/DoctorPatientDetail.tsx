import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  FileText, 
  Activity, 
  Pill, 
  Calendar,
  AlertCircle,
  User,
  Heart
} from "lucide-react";

interface Patient {
  id: string;
  full_name: string;
  cpf: string;
  phone: string;
  email: string;
  birth_date: string;
  bed_number: string;
  registry_number: string;
  allergies: string[];
  user_id: string;
}

export const DoctorPatientDetail = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [vitalSigns, setVitalSigns] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);

      // Buscar dados do paciente
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      if (!patientData.user_id) return;

      // Buscar sinais vitais
      const { data: vitalsData } = await supabase
        .from('patient_vital_signs')
        .select('*')
        .eq('patient_id', patientId)
        .order('measurement_date', { ascending: false })
        .limit(10);
      setVitalSigns(vitalsData || []);

      // Buscar medicamentos
      const { data: medsData } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', patientData.user_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      setMedications(medsData || []);

      // Buscar documentos
      const { data: docsData } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', patientData.user_id)
        .order('created_at', { ascending: false })
        .limit(10);
      setDocuments(docsData || []);

      // Buscar exames
      const { data: examsData } = await supabase
        .from('exams')
        .select('*')
        .eq('user_id', patientData.user_id)
        .order('exam_date', { ascending: false })
        .limit(10);
      setExams(examsData || []);

    } catch (error) {
      console.error('Erro ao buscar dados do paciente:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os dados do paciente"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return "N/A";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} anos`;
  };

  if (loading) {
    return (
      <Layout title="Prontuário do Paciente">
        <div className="p-4">
          <Card>
            <CardContent className="pt-6 text-center">
              Carregando dados do paciente...
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!patient) {
    return (
      <Layout title="Prontuário do Paciente">
        <div className="p-4">
          <Card>
            <CardContent className="pt-6 text-center">
              Paciente não encontrado
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Prontuário do Paciente">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/doctor/patients')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{patient.full_name}</h1>
            <p className="text-muted-foreground">
              {patient.registry_number && `Prontuário: ${patient.registry_number}`}
            </p>
          </div>
        </div>

        {/* Informações do Paciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Paciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Idade</p>
                <p className="font-medium">{calculateAge(patient.birth_date)}</p>
              </div>
              {patient.bed_number && (
                <div>
                  <p className="text-sm text-muted-foreground">Leito</p>
                  <p className="font-medium">{patient.bed_number}</p>
                </div>
              )}
              {patient.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{patient.phone}</p>
                </div>
              )}
              {patient.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{patient.email}</p>
                </div>
              )}
            </div>

            {patient.allergies && patient.allergies.length > 0 && (
              <div className="mt-4 p-4 bg-destructive/10 rounded-lg">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-semibold">Alergias</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {patient.allergies.map((allergy, index) => (
                    <Badge key={index} variant="destructive">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs com informações clínicas */}
        <Tabs defaultValue="vitals" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="vitals">
              <Heart className="h-4 w-4 mr-2" />
              Sinais Vitais
            </TabsTrigger>
            <TabsTrigger value="medications">
              <Pill className="h-4 w-4 mr-2" />
              Medicamentos
            </TabsTrigger>
            <TabsTrigger value="exams">
              <Activity className="h-4 w-4 mr-2" />
              Exames
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="h-4 w-4 mr-2" />
              Documentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vitals">
            <Card>
              <CardHeader>
                <CardTitle>Últimos Sinais Vitais</CardTitle>
                <CardDescription>Histórico de medições recentes</CardDescription>
              </CardHeader>
              <CardContent>
                {vitalSigns.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum registro de sinais vitais
                  </p>
                ) : (
                  <div className="space-y-4">
                    {vitalSigns.map((vital) => (
                      <div key={vital.id} className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">
                          {new Date(vital.measurement_date).toLocaleString('pt-BR')}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {vital.blood_pressure_systolic && (
                            <div>
                              <p className="text-xs text-muted-foreground">Pressão</p>
                              <p className="font-medium">
                                {vital.blood_pressure_systolic}/{vital.blood_pressure_diastolic} mmHg
                              </p>
                            </div>
                          )}
                          {vital.heart_rate && (
                            <div>
                              <p className="text-xs text-muted-foreground">FC</p>
                              <p className="font-medium">{vital.heart_rate} bpm</p>
                            </div>
                          )}
                          {vital.temperature && (
                            <div>
                              <p className="text-xs text-muted-foreground">Temperatura</p>
                              <p className="font-medium">{vital.temperature}°C</p>
                            </div>
                          )}
                          {vital.oxygen_saturation && (
                            <div>
                              <p className="text-xs text-muted-foreground">SpO2</p>
                              <p className="font-medium">{vital.oxygen_saturation}%</p>
                            </div>
                          )}
                        </div>
                        {vital.notes && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            Obs: {vital.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medications">
            <Card>
              <CardHeader>
                <CardTitle>Medicamentos Ativos</CardTitle>
                <CardDescription>Prescrições em uso</CardDescription>
              </CardHeader>
              <CardContent>
                {medications.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum medicamento ativo
                  </p>
                ) : (
                  <div className="space-y-4">
                    {medications.map((med) => (
                      <div key={med.id} className="p-4 border rounded-lg">
                        <h4 className="font-semibold">{med.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {med.dosage} - {med.frequency}
                        </p>
                        {med.instructions && (
                          <p className="text-sm mt-2">{med.instructions}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exams">
            <Card>
              <CardHeader>
                <CardTitle>Exames Recentes</CardTitle>
                <CardDescription>Histórico de exames realizados</CardDescription>
              </CardHeader>
              <CardContent>
                {exams.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum exame registrado
                  </p>
                ) : (
                  <div className="space-y-4">
                    {exams.map((exam) => (
                      <div key={exam.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{exam.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(exam.exam_date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <Badge variant={exam.status === 'completed' ? 'default' : 'secondary'}>
                            {exam.status === 'completed' ? 'Concluído' : 'Pendente'}
                          </Badge>
                        </div>
                        {exam.result_summary && (
                          <p className="text-sm mt-2">{exam.result_summary}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documentos</CardTitle>
                <CardDescription>Arquivos e laudos do paciente</CardDescription>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum documento disponível
                  </p>
                ) : (
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="p-4 border rounded-lg flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{doc.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {doc.type} - {new Date(doc.document_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        {doc.file_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                              Visualizar
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};