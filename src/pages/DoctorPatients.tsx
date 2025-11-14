import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Search, UserCircle, Phone, Mail, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
}

export const DoctorPatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = patients.filter(patient =>
        patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.registry_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.cpf?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      
      // Buscar doctor_id do usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: doctorData } = await supabase
        .from('doctors')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!doctorData) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Perfil médico não encontrado"
        });
        return;
      }

      // Buscar pacientes da mesma organização
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('organization_id', doctorData.organization_id)
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      setPatients(data || []);
      setFilteredPatients(data || []);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os pacientes"
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

  return (
    <Layout title="Meus Pacientes">
      <div className="p-4 space-y-6">
        {/* Header com busca */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Pacientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, prontuário ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de pacientes */}
        <div className="grid gap-4">
          {loading ? (
            <Card>
              <CardContent className="pt-6 text-center">
                Carregando pacientes...
              </CardContent>
            </Card>
          ) : filteredPatients.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                Nenhum paciente encontrado
              </CardContent>
            </Card>
          ) : (
            filteredPatients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <UserCircle className="h-12 w-12 text-primary" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{patient.full_name}</h3>
                          {patient.bed_number && (
                            <Badge variant="outline">Leito {patient.bed_number}</Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          {patient.registry_number && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Prontuário: {patient.registry_number}
                            </div>
                          )}
                          {patient.birth_date && (
                            <div>Idade: {calculateAge(patient.birth_date)}</div>
                          )}
                          {patient.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {patient.phone}
                            </div>
                          )}
                          {patient.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {patient.email}
                            </div>
                          )}
                        </div>

                        {patient.allergies && patient.allergies.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="destructive" className="text-xs">
                              Alergias: {patient.allergies.join(", ")}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => navigate(`/doctor/patient/${patient.id}`)}
                      variant="outline"
                    >
                      Ver Prontuário
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};