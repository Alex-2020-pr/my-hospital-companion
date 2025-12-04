import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  FileText, 
  Activity, 
  Pill, 
  AlertCircle,
  Heart,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  Bell,
  Phone,
  MessageSquare,
  Send,
  Plus,
  ClipboardList
} from "lucide-react";

// DADOS DE EXEMPLO - Paciente
const EXAMPLE_PATIENT = {
  id: "example-1",
  full_name: "Maria Silva Santos",
  cpf: "123.456.789-00",
  phone: "(11) 98765-4321",
  email: "maria.silva@email.com",
  birth_date: "1959-03-15",
  bed_number: "12A",
  registry_number: "REG-2024-00123",
  allergies: ["Dipirona", "Penicilina", "Frutos do Mar"],
  user_id: "example-user-1",
  avatar_url: null
};

// DADOS DE EXEMPLO - Diagnósticos
const EXAMPLE_DIAGNOSES = [
  { id: "1", diagnosis: "Insuficiência Cardíaca Congestiva (CID I50.0)", date: "2024-11-10", doctor: "Dr. Carlos Silva", notes: "Classe funcional NYHA II" },
  { id: "2", diagnosis: "Hipertensão Arterial Sistêmica (CID I10)", date: "2024-11-08", doctor: "Dr. Carlos Silva", notes: "Em uso de anti-hipertensivos" },
  { id: "3", diagnosis: "Diabetes Mellitus Tipo 2 (CID E11)", date: "2024-10-25", doctor: "Dra. Ana Costa", notes: "HbA1c: 7.2%" }
];

// DADOS DE EXEMPLO - Sinais Vitais
const EXAMPLE_VITALS = [
  { id: "1", time: "06:00", measurement_date: "2024-11-15T06:00:00", blood_pressure_systolic: 140, blood_pressure_diastolic: 90, heart_rate: 78, temperature: 36.8, oxygen_saturation: 95, respiratory_rate: 18 },
  { id: "2", time: "10:00", measurement_date: "2024-11-15T10:00:00", blood_pressure_systolic: 145, blood_pressure_diastolic: 92, heart_rate: 82, temperature: 36.9, oxygen_saturation: 94, respiratory_rate: 19 },
  { id: "3", time: "14:00", measurement_date: "2024-11-15T14:00:00", blood_pressure_systolic: 150, blood_pressure_diastolic: 95, heart_rate: 85, temperature: 37.1, oxygen_saturation: 93, respiratory_rate: 20 },
  { id: "4", time: "18:00", measurement_date: "2024-11-15T18:00:00", blood_pressure_systolic: 148, blood_pressure_diastolic: 94, heart_rate: 80, temperature: 37.0, oxygen_saturation: 94, respiratory_rate: 18 },
  { id: "5", time: "22:00", measurement_date: "2024-11-15T22:00:00", blood_pressure_systolic: 142, blood_pressure_diastolic: 88, heart_rate: 76, temperature: 36.7, oxygen_saturation: 96, respiratory_rate: 17 }
];

// DADOS DE EXEMPLO - Prescrições/Medicações
const EXAMPLE_PRESCRIPTIONS = [
  { id: "1", medication_name: "Losartana", dosage: "50mg", frequency: "1x ao dia", time: "08:00", instructions: "Administrar em jejum", is_active: true },
  { id: "2", medication_name: "Metformina", dosage: "850mg", frequency: "2x ao dia", time: "08:00 e 20:00", instructions: "Administrar após as refeições", is_active: true },
  { id: "3", medication_name: "Furosemida", dosage: "40mg", frequency: "1x ao dia", time: "08:00", instructions: "Monitorar eletrólitos", is_active: true },
  { id: "4", medication_name: "Ácido Acetilsalicílico", dosage: "100mg", frequency: "1x ao dia", time: "20:00", instructions: "Administrar após jantar", is_active: true },
  { id: "5", medication_name: "Omeprazol", dosage: "20mg", frequency: "1x ao dia", time: "07:00", instructions: "Administrar 30min antes do café", is_active: true }
];

// DADOS DE EXEMPLO - Exames
const EXAMPLE_EXAMS = [
  { id: "1", name: "Hemograma Completo", exam_date: "2024-11-12", status: "completed", result_summary: "Hemoglobina: 12.5 g/dL, Leucócitos: 8.500/mm³, Plaquetas: 220.000/mm³", has_images: false },
  { id: "2", name: "Raio-X Tórax PA", exam_date: "2024-11-11", status: "completed", result_summary: "Cardiomegalia leve. Campos pulmonares livres.", has_images: true, file_url: "https://via.placeholder.com/400x600/1E40AF/FFFFFF?text=RX+Torax" },
  { id: "3", name: "Eletrocardiograma", exam_date: "2024-11-10", status: "completed", result_summary: "Ritmo sinusal, FC 78bpm. Sobrecarga atrial esquerda.", has_images: true, file_url: "https://via.placeholder.com/600x400/10B981/FFFFFF?text=ECG" },
  { id: "4", name: "Ecocardiograma", exam_date: "2024-11-09", status: "completed", result_summary: "FE 45%. Disfunção diastólica grau I.", has_images: false },
  { id: "5", name: "Glicemia em Jejum", exam_date: "2024-11-08", status: "completed", result_summary: "126 mg/dL", has_images: false }
];

// DADOS DE EXEMPLO - Evoluções de Enfermagem
const EXAMPLE_NURSING_EVOLUTIONS = [
  { id: "1", evolution_date: "2024-11-15T14:00:00", evolution_type: "Evolução", nurse_name: "Enf. Paula Santos", subjective_data: "Paciente refere melhora da dispneia. Nega dor torácica.", objective_data: "Consciente, orientada, corada, hidratada. MV+ bilateralmente sem RA. MMII com edema +1/4.", assessment: "Paciente evoluindo satisfatoriamente", plan: "Manter cuidados. Estimular deambulação." },
  { id: "2", evolution_date: "2024-11-15T08:00:00", evolution_type: "Admissão", nurse_name: "Enf. Roberto Lima", subjective_data: "Paciente internada para compensação de ICC.", objective_data: "PA: 150/95, FC: 85, Tax: 36.8°C, SpO2: 93%. Edema MMII +2/4.", assessment: "Paciente com sinais de descompensação cardíaca", plan: "Repouso relativo. Monitorização contínua. Balanço hídrico rigoroso." },
  { id: "3", evolution_date: "2024-11-14T20:00:00", evolution_type: "Intercorrência", nurse_name: "Enf. Carla Mendes", subjective_data: "Paciente refere dispneia aos pequenos esforços.", objective_data: "SpO2: 89% em ar ambiente. FR: 24irpm. Uso de musculatura acessória.", assessment: "Desconforto respiratório", plan: "Instalado O2 suplementar 2L/min por CN. Comunicado médico plantonista." }
];

// DADOS DE EXEMPLO - Intercorrências
const EXAMPLE_EVENTS = [
  { id: "1", event_date: "2024-11-15T14:30:00", event_type: "Clínica", description: "Paciente apresentou episódio de hipotensão (PA: 90/60). Administrado SF 0,9% 250ml em bolus.", severity: "medium" },
  { id: "2", event_date: "2024-11-14T22:15:00", event_type: "Enfermagem", description: "Dificuldade para dormir. Administrado Zolpidem 10mg conforme prescrição.", severity: "low" },
  { id: "3", event_date: "2024-11-14T09:00:00", event_type: "Clínica", description: "Edema em MMII +2/4 com piora. Ajustado Furosemida para 80mg/dia.", severity: "medium" },
  { id: "4", event_date: "2024-11-13T16:00:00", event_type: "Queda", description: "Paciente escorregou ao ir ao banheiro. Sem lesões aparentes. Avaliada pelo médico.", severity: "high" }
];

// DADOS DE EXEMPLO - Mensagens de Chat
const EXAMPLE_CHAT_MESSAGES = [
  { id: "1", sender: "Enf. Paula Santos", message: "Paciente apresentou melhora significativa após ajuste da medicação.", time: "14:30", isDoctor: false },
  { id: "2", sender: "Dr. Carlos Silva", message: "Ótimo! Manter conduta e reavaliar amanhã.", time: "14:35", isDoctor: true },
  { id: "3", sender: "Enf. Roberto Lima", message: "Resultado do BNP disponível: 450 pg/mL", time: "15:00", isDoctor: false },
  { id: "4", sender: "Dr. Carlos Silva", message: "Valor ainda elevado. Vamos manter o diurético.", time: "15:10", isDoctor: true }
];

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
  avatar_url?: string | null;
}

export const DoctorPatientDetail = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [vitalSigns, setVitalSigns] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [nursingEvolutions, setNursingEvolutions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [useExamples, setUseExamples] = useState(false);

  // Estados das seções colapsáveis
  const [openSections, setOpenSections] = useState({
    diagnosis: true,
    vitals: true,
    prescriptions: true,
    exams: true,
    nursing: true,
    events: true
  });

  // Estados dos diálogos
  const [chatOpen, setChatOpen] = useState(false);
  const [prescribeOpen, setPrescribeOpen] = useState(false);
  const [examRequestOpen, setExamRequestOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState(EXAMPLE_CHAT_MESSAGES);

  // Estados do formulário de prescrição
  const [newPrescription, setNewPrescription] = useState({
    medication_name: "",
    dosage: "",
    frequency: "",
    instructions: ""
  });

  // Estados do formulário de exame
  const [newExamRequest, setNewExamRequest] = useState({
    exam_name: "",
    urgency: "routine",
    notes: ""
  });

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

      if (patientError || !patientData) {
        // Usar dados de exemplo se não encontrar
        setPatient(EXAMPLE_PATIENT);
        setDiagnoses(EXAMPLE_DIAGNOSES);
        setVitalSigns(EXAMPLE_VITALS);
        setPrescriptions(EXAMPLE_PRESCRIPTIONS);
        setExams(EXAMPLE_EXAMS);
        setNursingEvolutions(EXAMPLE_NURSING_EVOLUTIONS);
        setEvents(EXAMPLE_EVENTS);
        setUseExamples(true);
        return;
      }

      setPatient(patientData);

      // Buscar diagnósticos
      const { data: diagData } = await supabase
        .from('patient_diagnoses')
        .select('*')
        .eq('patient_id', patientId)
        .order('diagnosis_date', { ascending: false });
      
      if (diagData && diagData.length > 0) {
        setDiagnoses(diagData);
      } else {
        setDiagnoses(EXAMPLE_DIAGNOSES);
        setUseExamples(true);
      }

      // Buscar sinais vitais
      const { data: vitalsData } = await supabase
        .from('patient_vital_signs')
        .select('*')
        .eq('patient_id', patientId)
        .order('measurement_date', { ascending: false })
        .limit(10);
      
      if (vitalsData && vitalsData.length > 0) {
        setVitalSigns(vitalsData);
      } else {
        setVitalSigns(EXAMPLE_VITALS);
        setUseExamples(true);
      }

      // Buscar prescrições
      const { data: prescData } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_id', patientId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (prescData && prescData.length > 0) {
        setPrescriptions(prescData);
      } else {
        setPrescriptions(EXAMPLE_PRESCRIPTIONS);
        setUseExamples(true);
      }

      // Buscar exames
      if (patientData.user_id) {
        const { data: examsData } = await supabase
          .from('exams')
          .select('*')
          .eq('user_id', patientData.user_id)
          .order('exam_date', { ascending: false })
          .limit(10);
        
        if (examsData && examsData.length > 0) {
          setExams(examsData);
        } else {
          setExams(EXAMPLE_EXAMS);
          setUseExamples(true);
        }
      } else {
        setExams(EXAMPLE_EXAMS);
        setUseExamples(true);
      }

      // Buscar evoluções de enfermagem
      const { data: nursingData } = await supabase
        .from('nursing_evolutions')
        .select('*')
        .eq('patient_id', patientId)
        .order('evolution_date', { ascending: false })
        .limit(10);
      
      if (nursingData && nursingData.length > 0) {
        setNursingEvolutions(nursingData);
      } else {
        setNursingEvolutions(EXAMPLE_NURSING_EVOLUTIONS);
        setUseExamples(true);
      }

      // Buscar intercorrências
      const { data: eventsData } = await supabase
        .from('patient_events')
        .select('*')
        .eq('patient_id', patientId)
        .order('event_date', { ascending: false })
        .limit(10);
      
      if (eventsData && eventsData.length > 0) {
        setEvents(eventsData);
      } else {
        setEvents(EXAMPLE_EVENTS);
        setUseExamples(true);
      }

    } catch (error) {
      console.error('Erro ao buscar dados do paciente:', error);
      // Usar dados de exemplo em caso de erro
      setPatient(EXAMPLE_PATIENT);
      setDiagnoses(EXAMPLE_DIAGNOSES);
      setVitalSigns(EXAMPLE_VITALS);
      setPrescriptions(EXAMPLE_PRESCRIPTIONS);
      setExams(EXAMPLE_EXAMS);
      setNursingEvolutions(EXAMPLE_NURSING_EVOLUTIONS);
      setEvents(EXAMPLE_EVENTS);
      setUseExamples(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "text-destructive bg-destructive/10";
      case "medium": return "text-yellow-600 bg-yellow-50";
      default: return "text-muted-foreground bg-muted/50";
    }
  };

  const handleSendChatMessage = () => {
    if (!chatMessage.trim()) return;
    
    const newMessage = {
      id: Date.now().toString(),
      sender: "Dr. Você",
      message: chatMessage,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isDoctor: true
    };
    
    setChatMessages([...chatMessages, newMessage]);
    setChatMessage("");
    
    toast({
      title: "Mensagem enviada",
      description: "Sua mensagem foi enviada para a equipe de enfermagem."
    });
  };

  const handlePrescribe = () => {
    if (!newPrescription.medication_name || !newPrescription.dosage) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha pelo menos o nome do medicamento e a dosagem."
      });
      return;
    }

    const prescription = {
      id: Date.now().toString(),
      ...newPrescription,
      is_active: true,
      time: "Conforme prescrição"
    };

    setPrescriptions([prescription, ...prescriptions]);
    setNewPrescription({ medication_name: "", dosage: "", frequency: "", instructions: "" });
    setPrescribeOpen(false);

    toast({
      title: "Prescrição adicionada",
      description: `${newPrescription.medication_name} foi prescrito com sucesso.`
    });
  };

  const handleExamRequest = () => {
    if (!newExamRequest.exam_name) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha o nome do exame."
      });
      return;
    }

    const exam = {
      id: Date.now().toString(),
      name: newExamRequest.exam_name,
      exam_date: new Date().toISOString().split('T')[0],
      status: "pending",
      result_summary: `Urgência: ${newExamRequest.urgency === 'urgent' ? 'Urgente' : 'Rotina'}. ${newExamRequest.notes}`,
      has_images: false
    };

    setExams([exam, ...exams]);
    setNewExamRequest({ exam_name: "", urgency: "routine", notes: "" });
    setExamRequestOpen(false);

    toast({
      title: "Exame solicitado",
      description: `${newExamRequest.exam_name} foi solicitado com sucesso.`
    });
  };

  if (loading) {
    return (
      <Layout title="Prontuário do Paciente">
        <div className="p-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="animate-pulse space-y-4">
                <div className="h-16 w-16 bg-muted rounded-full mx-auto" />
                <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
                <div className="h-4 bg-muted rounded w-1/3 mx-auto" />
              </div>
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
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Paciente não encontrado</p>
              <Button className="mt-4" onClick={() => navigate('/doctor/patients')}>
                Voltar para lista de pacientes
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Prontuário do Paciente">
      <div className="min-h-screen bg-background pb-24">
        {/* Header do Paciente */}
        <div className="bg-card border-b border-border p-4 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/doctor/patients')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm text-muted-foreground">Voltar para lista</span>
          </div>

          <div className="flex items-start gap-3 mb-3">
            <Avatar className="h-16 w-16 border-2 border-border">
              <AvatarImage src={patient.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {patient.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg">{patient.full_name}</h2>
              <p className="text-sm text-muted-foreground">{calculateAge(patient.birth_date)}</p>
              <div className="flex gap-2 mt-1 flex-wrap">
                {patient.bed_number && (
                  <Badge variant="outline" className="text-xs">
                    Leito {patient.bed_number}
                  </Badge>
                )}
                {patient.registry_number && (
                  <Badge variant="outline" className="text-xs">
                    {patient.registry_number}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Alergias */}
          {patient.allergies && patient.allergies.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20 mb-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-destructive">ALERGIAS</p>
                <p className="text-sm text-destructive font-medium">{patient.allergies.join(", ")}</p>
              </div>
            </div>
          )}

          {/* Ações Rápidas */}
          <div className="grid grid-cols-2 gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Phone className="h-4 w-4" />
                  Enfermagem
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Contato Enfermagem</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Selecione o tipo de solicitação para a equipe de enfermagem:
                  </p>
                  <div className="grid gap-2">
                    <Button variant="outline" className="justify-start gap-2">
                      <Activity className="h-4 w-4" />
                      Solicitar aferição de sinais vitais
                    </Button>
                    <Button variant="outline" className="justify-start gap-2">
                      <Pill className="h-4 w-4" />
                      Administração de medicamento
                    </Button>
                    <Button variant="outline" className="justify-start gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Avaliação urgente do paciente
                    </Button>
                    <Button variant="outline" className="justify-start gap-2">
                      <ClipboardList className="h-4 w-4" />
                      Outras solicitações
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={prescribeOpen} onOpenChange={setPrescribeOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Pill className="h-4 w-4" />
                  Prescrever
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Prescrição</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="medication">Medicamento *</Label>
                    <Input 
                      id="medication" 
                      placeholder="Ex: Dipirona"
                      value={newPrescription.medication_name}
                      onChange={(e) => setNewPrescription({ ...newPrescription, medication_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dosage">Dosagem *</Label>
                    <Input 
                      id="dosage" 
                      placeholder="Ex: 500mg"
                      value={newPrescription.dosage}
                      onChange={(e) => setNewPrescription({ ...newPrescription, dosage: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequência</Label>
                    <Input 
                      id="frequency" 
                      placeholder="Ex: 8/8h"
                      value={newPrescription.frequency}
                      onChange={(e) => setNewPrescription({ ...newPrescription, frequency: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instructions">Instruções</Label>
                    <Textarea 
                      id="instructions" 
                      placeholder="Instruções especiais..."
                      value={newPrescription.instructions}
                      onChange={(e) => setNewPrescription({ ...newPrescription, instructions: e.target.value })}
                    />
                  </div>
                  <Button className="w-full" onClick={handlePrescribe}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Prescrição
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={examRequestOpen} onOpenChange={setExamRequestOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Solicitar Exame
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Solicitar Exame</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="exam_name">Nome do Exame *</Label>
                    <Input 
                      id="exam_name" 
                      placeholder="Ex: Hemograma Completo"
                      value={newExamRequest.exam_name}
                      onChange={(e) => setNewExamRequest({ ...newExamRequest, exam_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Urgência</Label>
                    <div className="flex gap-2">
                      <Button 
                        type="button"
                        variant={newExamRequest.urgency === "routine" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNewExamRequest({ ...newExamRequest, urgency: "routine" })}
                      >
                        Rotina
                      </Button>
                      <Button 
                        type="button"
                        variant={newExamRequest.urgency === "urgent" ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => setNewExamRequest({ ...newExamRequest, urgency: "urgent" })}
                      >
                        Urgente
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exam_notes">Indicação / Observações</Label>
                    <Textarea 
                      id="exam_notes" 
                      placeholder="Justificativa clínica..."
                      value={newExamRequest.notes}
                      onChange={(e) => setNewExamRequest({ ...newExamRequest, notes: e.target.value })}
                    />
                  </div>
                  <Button className="w-full" onClick={handleExamRequest}>
                    <Plus className="h-4 w-4 mr-2" />
                    Solicitar Exame
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={chatOpen} onOpenChange={setChatOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Chat - Equipe de Cuidados</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="h-64 overflow-y-auto space-y-3 p-3 bg-muted/30 rounded-lg">
                    {chatMessages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col ${msg.isDoctor ? 'items-end' : 'items-start'}`}
                      >
                        <div className={`max-w-[80%] p-2 rounded-lg ${msg.isDoctor ? 'bg-primary text-primary-foreground' : 'bg-card border'}`}>
                          <p className="text-xs font-semibold mb-1">{msg.sender}</p>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1">{msg.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Digite sua mensagem..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
                    />
                    <Button size="icon" onClick={handleSendChatMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {useExamples && (
            <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs text-yellow-700 dark:text-yellow-300 text-center">
                📋 Exibindo dados de exemplo para demonstração
              </p>
            </div>
          )}
        </div>

        <div className="px-4 space-y-3">
          {/* Resumo Clínico / Diagnósticos */}
          <Collapsible open={openSections.diagnosis} onOpenChange={() => toggleSection("diagnosis")}>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    Resumo Clínico
                  </CardTitle>
                  {openSections.diagnosis ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-2 pt-0">
                  {diagnoses.map((diag: any) => (
                    <div key={diag.id} className="p-3 bg-muted/50 rounded-lg">
                      <p className="font-medium text-sm">{diag.diagnosis}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {diag.diagnosis_date || diag.date} • {diag.doctor || "Médico não informado"}
                      </p>
                      {diag.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">{diag.notes}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Sinais Vitais */}
          <Collapsible open={openSections.vitals} onOpenChange={() => toggleSection("vitals")}>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Heart className="h-4 w-4 text-primary" />
                    Sinais Vitais (24h)
                  </CardTitle>
                  {openSections.vitals ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  {/* Mini-gráfico SpO2 */}
                  <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-end justify-between h-20 gap-1">
                      {vitalSigns.slice(0, 5).map((vs: any, idx: number) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                          <div 
                            className="w-full bg-primary/70 rounded-t transition-all"
                            style={{ height: `${((vs.oxygen_saturation || 95) - 85) * 5}%` }}
                          />
                          <span className="text-[10px] text-muted-foreground">
                            {vs.time || new Date(vs.measurement_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-2">SpO2 %</p>
                  </div>
                  
                  {/* Últimas medições */}
                  <div className="space-y-3">
                    {vitalSigns.slice(0, 2).map((vs: any, idx: number) => (
                      <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-2">
                          {vs.time || new Date(vs.measurement_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                          {vs.blood_pressure_systolic && (
                            <div>
                              <p className="text-xs text-muted-foreground">PA</p>
                              <p className="font-semibold">{vs.blood_pressure_systolic}/{vs.blood_pressure_diastolic} mmHg</p>
                            </div>
                          )}
                          {vs.heart_rate && (
                            <div>
                              <p className="text-xs text-muted-foreground">FC</p>
                              <p className="font-semibold">{vs.heart_rate} bpm</p>
                            </div>
                          )}
                          {vs.temperature && (
                            <div>
                              <p className="text-xs text-muted-foreground">Temp</p>
                              <p className="font-semibold">{vs.temperature}°C</p>
                            </div>
                          )}
                          {vs.oxygen_saturation && (
                            <div>
                              <p className="text-xs text-muted-foreground">SpO2</p>
                              <p className="font-semibold">{vs.oxygen_saturation}%</p>
                            </div>
                          )}
                          {vs.respiratory_rate && (
                            <div>
                              <p className="text-xs text-muted-foreground">FR</p>
                              <p className="font-semibold">{vs.respiratory_rate} irpm</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Prescrições/Medicamentos */}
          <Collapsible open={openSections.prescriptions} onOpenChange={() => toggleSection("prescriptions")}>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Pill className="h-4 w-4 text-primary" />
                    Prescrições Ativas
                  </CardTitle>
                  {openSections.prescriptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-2 pt-0">
                  {prescriptions.map((med: any) => (
                    <div key={med.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{med.medication_name}</p>
                          <p className="text-xs text-muted-foreground">{med.dosage} • {med.frequency}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">{med.time}</Badge>
                      </div>
                      {med.instructions && (
                        <p className="text-xs text-muted-foreground mt-2 italic">📝 {med.instructions}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Exames */}
          <Collapsible open={openSections.exams} onOpenChange={() => toggleSection("exams")}>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Últimos Exames
                  </CardTitle>
                  {openSections.exams ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-2 pt-0">
                  {exams.map((exam: any) => (
                    <div key={exam.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{exam.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(exam.exam_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Badge variant={exam.status === 'completed' ? 'default' : 'secondary'}>
                          {exam.status === 'completed' ? 'Disponível' : 'Pendente'}
                        </Badge>
                      </div>
                      {exam.result_summary && (
                        <p className="text-xs mt-2 p-2 bg-background rounded">{exam.result_summary}</p>
                      )}
                      {(exam.has_images || exam.file_url) && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="mt-2 w-full gap-2">
                              <FileText className="h-4 w-4" />
                              Ver Imagem
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[95vw] max-h-[95vh] p-2">
                            <img 
                              src={exam.file_url || "https://via.placeholder.com/600x400/1E40AF/FFFFFF?text=Exame"} 
                              alt={exam.name}
                              className="w-full h-full object-contain"
                            />
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Evoluções de Enfermagem */}
          <Collapsible open={openSections.nursing} onOpenChange={() => toggleSection("nursing")}>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    Evoluções de Enfermagem
                  </CardTitle>
                  {openSections.nursing ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-3 pt-0">
                  {nursingEvolutions.map((evolution: any) => (
                    <div key={evolution.id} className="p-3 bg-muted/50 rounded-lg border-l-4 border-primary">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Badge variant="outline" className="text-xs mb-1">{evolution.evolution_type}</Badge>
                          <p className="text-xs text-muted-foreground">
                            {new Date(evolution.evolution_date).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <p className="text-xs font-medium">{evolution.nurse_name || "Enfermagem"}</p>
                      </div>
                      {evolution.subjective_data && (
                        <div className="mb-2">
                          <p className="text-xs font-semibold text-muted-foreground">S (Subjetivo):</p>
                          <p className="text-sm">{evolution.subjective_data}</p>
                        </div>
                      )}
                      {evolution.objective_data && (
                        <div className="mb-2">
                          <p className="text-xs font-semibold text-muted-foreground">O (Objetivo):</p>
                          <p className="text-sm">{evolution.objective_data}</p>
                        </div>
                      )}
                      {evolution.assessment && (
                        <div className="mb-2">
                          <p className="text-xs font-semibold text-muted-foreground">A (Avaliação):</p>
                          <p className="text-sm">{evolution.assessment}</p>
                        </div>
                      )}
                      {evolution.plan && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground">P (Plano):</p>
                          <p className="text-sm">{evolution.plan}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Intercorrências */}
          <Collapsible open={openSections.events} onOpenChange={() => toggleSection("events")}>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    Intercorrências
                  </CardTitle>
                  {openSections.events ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-2 pt-0">
                  {events.map((event: any) => (
                    <div 
                      key={event.id} 
                      className={`p-3 rounded-lg border-l-4 ${getSeverityColor(event.severity)}`}
                    >
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <Badge variant="outline" className="text-xs">{event.event_type}</Badge>
                            <p className="text-xs text-muted-foreground">
                              {new Date(event.event_date).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <p className="text-sm">{event.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>
      </div>
    </Layout>
  );
};
