import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, 
  Shield,
  Edit
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const Profile = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        toast({
          title: "Erro ao carregar perfil",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user, toast]);

  const handleLogout = async () => {
    const { error } = await signOut();
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: error.message
      });
    } else {
      toast({
        title: "Logout realizado",
        description: "Até logo!"
      });
      navigate("/auth");
    }
  };

  if (loading) {
    return (
      <Layout title="Meu Perfil">
        <div className="p-4 flex items-center justify-center">
          <p>Carregando perfil...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Meu Perfil">
      <div className="p-4 space-y-6">
        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <User className="h-5 w-5 mr-2 text-primary" />
              Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input value={profile?.full_name || ''} readOnly />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data de Nascimento</Label>
                  <Input 
                    type="date"
                    value={profile?.birth_date || ''} 
                    readOnly 
                  />
                </div>
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input value={profile?.cpf || ''} readOnly />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={profile?.phone || ''} />
              </div>

              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input value={profile?.email || ''} readOnly />
              </div>

              <Button variant="outline" className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                Editar Informações
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Shield className="h-5 w-5 mr-2 text-primary" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Alterar Senha
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Configurar Autenticação de 2 Fatores
            </Button>
            <Button 
              variant="destructive" 
              className="w-full justify-start"
              onClick={handleLogout}
            >
              Sair da Conta
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};