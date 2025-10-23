import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield } from "lucide-react";

export const AdminSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [canSetup, setCanSetup] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    checkIfSetupNeeded();
  }, []);

  const checkIfSetupNeeded = async () => {
    try {
      // Verifica na tabela system_config se o primeiro admin já foi criado
      const { data, error } = await supabase
        .from('system_config')
        .select('first_admin_created')
        .eq('id', 1)
        .single();

      if (error) throw error;

      if (data?.first_admin_created) {
        toast({
          title: "Setup já realizado",
          description: "Já existe um administrador no sistema. Faça login normalmente.",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      setCanSetup(true);
    } catch (error) {
      console.error('Error checking setup status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível verificar o status do sistema.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      // Primeiro tenta fazer login com as credenciais fornecidas
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      let userId: string;

      if (signInError) {
        // Se o login falhar, tenta criar uma nova conta
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName
            }
          }
        });

        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error('Usuário não foi criado');
        
        userId = authData.user.id;
      } else {
        // Se o login foi bem sucedido, usa o ID do usuário existente
        userId = signInData.user.id;
      }

      // Adiciona a role de super_admin
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'super_admin'
        });

      if (roleError) {
        // Se já existe a role, ignora o erro
        if (!roleError.message.includes('duplicate') && !roleError.message.includes('unique')) {
          throw roleError;
        }
      }

      toast({
        title: "Sucesso!",
        description: "Conta de administrador configurada com sucesso!",
      });

      // Aguarda um pouco e redireciona para a página admin
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
      
    } catch (error: any) {
      console.error('Error during setup:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível configurar a conta de administrador.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!canSetup) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Setup Inicial</CardTitle>
          <CardDescription>
            Crie a primeira conta de administrador do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                disabled={submitting}
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Conta de Administrador"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
