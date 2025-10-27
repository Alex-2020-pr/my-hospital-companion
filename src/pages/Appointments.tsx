import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Plus, User, Phone, MessageCircle, Mail, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Appointment {
  id: string;
  type: string;
  mode: 'manual' | 'integrated';
  doctor_name: string;
  specialty: string | null;
  appointment_date: string;
  appointment_time: string;
  location: string | null;
  status: string;
  notes: string | null;
  hospital_contact?: {
    phone?: string;
    whatsapp?: string;
    email?: string;
  };
}

export const Appointments = () => {
  const { user } = useAuth();
  const [scheduledAppointments, setScheduledAppointments] = useState<Appointment[]>([]);
  const [appointmentHistory, setAppointmentHistory] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [appointmentMode, setAppointmentMode] = useState<'manual' | 'integrated'>('manual');
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    type: '',
    doctor_name: '',
    specialty: '',
    appointment_date: '',
    appointment_time: '',
    location: '',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', user.id)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });

    if (error) {
      toast.error("Erro ao carregar consultas");
      setLoading(false);
      return;
    }

    // Obter data atual no formato YYYY-MM-DD sem conversão de timezone
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const scheduled = (data || []).filter(apt => {
      // Comparar strings de data diretamente para evitar problemas de timezone
      return apt.appointment_date >= todayStr && (apt.status === 'scheduled' || apt.status === 'confirmed');
    }).map(apt => ({
      ...apt,
      mode: apt.mode || 'manual',
      hospital_contact: apt.hospital_contact || undefined
    }));

    const history = (data || []).filter(apt => {
      // Comparar strings de data diretamente para evitar problemas de timezone
      return apt.appointment_date < todayStr || apt.status === 'completed' || apt.status === 'cancelled';
    }).map(apt => ({
      ...apt,
      mode: apt.mode || 'manual',
      hospital_contact: apt.hospital_contact || undefined
    }));

    setScheduledAppointments(scheduled as Appointment[]);
    setAppointmentHistory(history as Appointment[]);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado':
      case 'confirmed':
        return 'default';
      case 'agendado':
      case 'scheduled':
        return 'secondary';
      case 'realizada':
      case 'completed':
        return 'outline';
      case 'cancelada':
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmado':
      case 'confirmed':
        return 'Confirmado';
      case 'agendado':
      case 'scheduled':
        return 'Agendado';
      case 'realizada':
      case 'completed':
        return 'Concluído';
      case 'cancelada':
      case 'cancelled':
        return 'Cancelado';
      case 'pending':
        return 'Pendente';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          mode: appointmentMode,
          ...formData
        });

      if (error) throw error;

      toast.success(appointmentMode === 'integrated' 
        ? "Solicitação de consulta enviada! O hospital entrará em contato."
        : "Consulta registrada com sucesso!"
      );
      
      setDialogOpen(false);
      setFormData({
        type: '',
        doctor_name: '',
        specialty: '',
        appointment_date: '',
        appointment_time: '',
        location: '',
        notes: ''
      });
      fetchAppointments();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error("Erro ao criar consulta");
    }
  };

  const handleContactHospital = (method: 'phone' | 'whatsapp' | 'email') => {
    if (!selectedAppointment?.hospital_contact) return;

    const contact = selectedAppointment.hospital_contact;
    
    switch (method) {
      case 'phone':
        if (contact.phone) window.open(`tel:${contact.phone}`);
        break;
      case 'whatsapp':
        if (contact.whatsapp) {
          const message = encodeURIComponent(`Olá! Gostaria de confirmar minha consulta de ${selectedAppointment.type} no dia ${selectedAppointment.appointment_date.split('-').reverse().join('/')}`);
          window.open(`https://wa.me/${contact.whatsapp}?text=${message}`, '_blank');
        }
        break;
      case 'email':
        if (contact.email) {
          window.open(`mailto:${contact.email}?subject=Consulta - ${selectedAppointment.type}`);
        }
        break;
    }
    setContactDialogOpen(false);
  };

  return (
    <Layout title="Consultas">
      <div className="p-4 space-y-4">
        {/* Botão Agendar Nova Consulta */}
        <Button className="w-full" size="lg" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agendar Nova Consulta
        </Button>

        {/* Dialog de Agendamento */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Agendar Nova Consulta</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Escolha do Modo */}
              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <Label className="text-base font-semibold">Como deseja agendar?</Label>
                <RadioGroup value={appointmentMode} onValueChange={(v: 'manual' | 'integrated') => setAppointmentMode(v)}>
                  <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
                    <RadioGroupItem value="integrated" id="integrated" />
                    <Label htmlFor="integrated" className="flex-1 cursor-pointer">
                      <div className="font-medium flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Solicitar ao Hospital Integrado
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Envie uma solicitação para o hospital. Eles entrarão em contato para confirmar.
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
                    <RadioGroupItem value="manual" id="manual" />
                    <Label htmlFor="manual" className="flex-1 cursor-pointer">
                      <div className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Apenas Registrar (Lembrete)
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Registre consultas agendadas em outros locais para não esquecer.
                      </p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Formulário */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Tipo de Consulta *</Label>
                  <Input
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="Ex: Consulta Cardiológica"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="doctor_name">Nome do Médico *</Label>
                  <Input
                    id="doctor_name"
                    value={formData.doctor_name}
                    onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                    placeholder="Dr(a). Nome"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Input
                    id="specialty"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    placeholder="Ex: Cardiologia"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Local</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Hospital/Clínica"
                  />
                </div>
                <div>
                  <Label htmlFor="appointment_date">Data *</Label>
                  <Input
                    id="appointment_date"
                    type="date"
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="appointment_time">Horário *</Label>
                  <Input
                    id="appointment_time"
                    type="time"
                    value={formData.appointment_time}
                    onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informações adicionais..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {appointmentMode === 'integrated' ? 'Solicitar Agendamento' : 'Registrar Consulta'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Próximas</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Carregando consultas...
                </CardContent>
              </Card>
            ) : scheduledAppointments.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Nenhuma consulta agendada
                </CardContent>
              </Card>
            ) : (
              scheduledAppointments.map((appointment) => (
                <Card key={appointment.id} className="w-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{appointment.type}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="h-4 w-4 mr-1" />
                          {appointment.doctor_name}
                        </div>
                        {appointment.specialty && (
                          <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                        )}
                      </div>
                      <Badge variant={getStatusColor(appointment.status)}>
                        {getStatusText(appointment.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {appointment.appointment_date.split('-').reverse().join('/')}
                      <Clock className="h-4 w-4 ml-4 mr-2" />
                      {appointment.appointment_time.slice(0, 5)}
                    </div>
                    
                    {appointment.location && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        {appointment.location}
                      </div>
                    )}

                    {appointment.notes && (
                      <div className="bg-accent/10 p-3 rounded-lg">
                        <p className="text-sm font-medium text-accent-foreground">
                          Observações:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.notes}
                        </p>
                      </div>
                    )}

                    {appointment.mode === 'integrated' && appointment.hospital_contact && (
                      <div className="bg-primary/5 p-3 rounded-lg mb-3">
                        <p className="text-xs font-medium text-primary mb-2">Contato com Hospital:</p>
                        <div className="flex gap-2">
                          {appointment.hospital_contact.phone && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => window.open(`tel:${appointment.hospital_contact?.phone}`)}
                            >
                              <Phone className="h-3 w-3 mr-1" />
                              Ligar
                            </Button>
                          )}
                          {appointment.hospital_contact.whatsapp && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-green-50"
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setContactDialogOpen(true);
                              }}
                            >
                              <MessageCircle className="h-3 w-3 mr-1" />
                              WhatsApp
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Reagendar
                      </Button>
                      <Button variant="destructive" size="sm" className="flex-1">
                        Cancelar
                      </Button>
                    </div>
                    
                    {appointment.mode === 'manual' && (
                      <Badge variant="outline" className="mt-2">
                        Apenas Lembrete
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Carregando histórico...
                </CardContent>
              </Card>
            ) : appointmentHistory.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Nenhuma consulta no histórico
                </CardContent>
              </Card>
            ) : (
              appointmentHistory.map((appointment) => (
                <Card key={appointment.id} className="w-full">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1">
                        <h3 className="font-medium text-sm">{appointment.type}</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="h-4 w-4 mr-1" />
                          {appointment.doctor_name}
                        </div>
                        {appointment.specialty && (
                          <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                        )}
                      </div>
                      <Badge variant={getStatusColor(appointment.status)}>
                        {getStatusText(appointment.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {appointment.appointment_date.split('-').reverse().join('/')}
                      <Clock className="h-4 w-4 ml-4 mr-2" />
                      {appointment.appointment_time.slice(0, 5)}
                    </div>

                    <div className="flex space-x-2 pt-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        Ver Detalhes
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Reagendar Similar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Dialog de Contato com Hospital */}
        <AlertDialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Como deseja entrar em contato?</AlertDialogTitle>
              <AlertDialogDescription>
                Escolha o método preferido para contatar o hospital sobre sua consulta.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              {selectedAppointment?.hospital_contact?.phone && (
                <Button
                  variant="outline"
                  onClick={() => handleContactHospital('phone')}
                  className="w-full sm:w-auto"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Ligar
                </Button>
              )}
              {selectedAppointment?.hospital_contact?.whatsapp && (
                <Button
                  onClick={() => handleContactHospital('whatsapp')}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp
                </Button>
              )}
              {selectedAppointment?.hospital_contact?.email && (
                <Button
                  variant="outline"
                  onClick={() => handleContactHospital('email')}
                  className="w-full sm:w-auto"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Button>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};