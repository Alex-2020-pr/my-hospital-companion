import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Search, UserCircle, Phone, Mail, MapPin, ArrowLeft } from "lucide-react";
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

// Pacientes de exemplo para demonstração
const EXAMPLE_PATIENTS: Patient[] = [
  {
    id: 'ex-1',
    full_name: 'Maria Silva Santos',
    cpf: '123.456.789-00',
    phone: '(11) 98765-4321',
    email: 'maria.santos@email.com',
    birth_date: '1965-03-15',
    bed_number: '101-A',
    registry_number: 'P-2024-001',
    allergies: ['Penicilina', 'Dipirona']
  },
  {
    id: 'ex-2',
    full_name: 'João Carlos Oliveira',
    cpf: '987.654.321-00',
    phone: '(11) 97654-3210',
    email: 'joao.oliveira@email.com',
    birth_date: '1978-07-22',
    bed_number: '102-B',
    registry_number: 'P-2024-002',
    allergies: ['Látex']
  },
  {
    id: 'ex-3',
    full_name: 'Ana Paula Costa',
    cpf: '456.789.123-00',
    phone: '(11) 96543-2109',
    email: 'ana.costa@email.com',
    birth_date: '1990-11-08',
    bed_number: '103-A',
    registry_number: 'P-2024-003',
    allergies: []
  },
  {
    id: 'ex-4',
    full_name: 'Pedro Henrique Souza',
    cpf: '321.654.987-00',
    phone: '(11) 95432-1098',
    email: 'pedro.souza@email.com',
    birth_date: '1955-05-30',
    bed_number: '104-B',
    registry_number: 'P-2024-004',
    allergies: ['Contraste iodado', 'AAS']
  },
  {
    id: 'ex-5',
    full_name: 'Carla Fernandes Lima',
    cpf: '654.321.987-00',
    phone: '(11) 94321-0987',
    email: 'carla.lima@email.com',
    birth_date: '1982-09-18',
    bed_number: '105-A',
    registry_number: 'P-2024-005',
    allergies: ['Morfina']
  }
];

export const DoctorPatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showExamples, setShowExamples] = useState(false);
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
      
      // Buscar usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar organização a partir do papel de MÉDICO
      const { data: doctorRole, error: roleError } = await supabase
        .from('user_roles')
        .select('organization_id, role')
        .eq('user_id', user.id)
        .eq('role', 'doctor')
        .maybeSingle();

      if (roleError) {
        console.error('Erro ao buscar role de médico:', roleError);
      }

      if (!doctorRole || !doctorRole.organization_id) {
        console.log('DoctorPatients: role de médico não encontrada ou sem organização', doctorRole);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Perfil médico não encontrado ou sem organização vinculada"
        });
        return;
      }

      // Buscar pacientes da mesma organização
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('organization_id', doctorRole.organization_id)
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      
      // Se não houver pacientes reais, mostrar exemplos
      if (!data || data.length === 0) {
        setShowExamples(true);
        setPatients(EXAMPLE_PATIENTS);
        setFilteredPatients(EXAMPLE_PATIENTS);
      } else {
        setPatients(data);
        setFilteredPatients(data);
      }
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      // Em caso de erro, mostrar exemplos
      setShowExamples(true);
      setPatients(EXAMPLE_PATIENTS);
      setFilteredPatients(EXAMPLE_PATIENTS);
      toast({
        title: "Modo Demonstração",
        description: "Exibindo pacientes de exemplo"
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
        {/* Back button */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/medico-dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Meus Pacientes</h1>
            <p className="text-muted-foreground">
              Selecione um paciente para ver o prontuário
            </p>
          </div>
        </div>

        {/* Header com busca */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Pacientes</CardTitle>
              {showExamples && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Dados de Exemplo
                </Badge>
              )}
            </div>
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
                      onClick={() => {
                        if (showExamples) {
                          toast({
                            title: "Modo Demonstração",
                            description: "Esta é uma visualização de exemplo. Conecte pacientes reais para acessar prontuários."
                          });
                        } else {
                          navigate(`/doctor/patient/${patient.id}`);
                        }
                      }}
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