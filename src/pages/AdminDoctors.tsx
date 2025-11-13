import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Stethoscope, Mail, Phone, User } from "lucide-react";
import { toast } from "sonner";

// DADOS DE EXEMPLO - Médicos
const DOCTORS_MOCK = [
  {
    id: "d1",
    name: "Dr. Carlos Silva",
    crm: "12345",
    crmState: "SP",
    specialty: "Cardiologia",
    email: "carlos.silva@hospital.com",
    phone: "(11) 98765-4321",
    avatar: null,
    isActive: true,
    organization: "Hospital Central"
  },
  {
    id: "d2",
    name: "Dra. Ana Costa",
    crm: "67890",
    crmState: "SP",
    specialty: "Endocrinologia",
    email: "ana.costa@hospital.com",
    phone: "(11) 91234-5678",
    avatar: null,
    isActive: true,
    organization: "Hospital Central"
  },
  {
    id: "d3",
    name: "Dr. Roberto Lima",
    crm: "54321",
    crmState: "RJ",
    specialty: "Ortopedia",
    email: "roberto.lima@hospital.com",
    phone: "(21) 99876-5432",
    avatar: null,
    isActive: false,
    organization: "Hospital Central"
  }
];

const SPECIALTIES = [
  "Cardiologia",
  "Endocrinologia",
  "Ortopedia",
  "Neurologia",
  "Pediatria",
  "Ginecologia",
  "Clínica Geral",
  "Cirurgia Geral",
  "Anestesiologia",
  "Radiologia"
];

const STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export default function AdminDoctors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [doctors] = useState(DOCTORS_MOCK);
  const [openDialog, setOpenDialog] = useState(false);

  const filteredDoctors = doctors.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.crm.includes(searchTerm) ||
    doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Médico cadastrado com sucesso!");
    setOpenDialog(false);
  };

  return (
    <Layout title="Gerenciar Médicos">
      <div className="min-h-screen bg-background pb-24">
        <div className="p-4 space-y-4">
          {/* Header com busca */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Médicos Cadastrados
                </CardTitle>
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Novo Médico
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Cadastrar Novo Médico</DialogTitle>
                      <DialogDescription>
                        Preencha os dados do médico para cadastrá-lo no sistema
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddDoctor} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo *</Label>
                        <Input id="name" placeholder="Dr. João Silva" required />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="crm">CRM *</Label>
                          <Input id="crm" placeholder="123456" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="crmState">UF *</Label>
                          <Select required>
                            <SelectTrigger id="crmState">
                              <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                              {STATES.map(state => (
                                <SelectItem key={state} value={state}>{state}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="specialty">Especialidade *</Label>
                        <Select required>
                          <SelectTrigger id="specialty">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {SPECIALTIES.map(spec => (
                              <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail *</Label>
                        <Input id="email" type="email" placeholder="medico@hospital.com" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input id="phone" type="tel" placeholder="(11) 99999-9999" />
                      </div>
                      <Button type="submit" className="w-full">
                        Cadastrar Médico
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, CRM ou especialidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Lista de Médicos */}
          <div className="space-y-3">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-14 w-14 border-2 border-border">
                      <AvatarImage src={doctor.avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {doctor.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h3 className="font-semibold text-base">{doctor.name}</h3>
                          <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                        </div>
                        <Badge variant={doctor.isActive ? "default" : "secondary"}>
                          {doctor.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <div className="space-y-1 mt-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>CRM {doctor.crm}/{doctor.crmState}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{doctor.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{doctor.phone}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" className="flex-1">
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          Mensagem
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDoctors.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Nenhum médico encontrado</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
