import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Phone } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import am2Logo from "@/assets/am2-logo.jpg";
import am2LogoCompleto from "@/assets/am2-logo-completo-512.png";
import { getFormattedVersion } from "@/lib/version";
import { useOrganization } from "@/hooks/useOrganization";
import { useOrganizationBySlug } from "@/hooks/useOrganizationBySlug";

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [userType, setUserType] = useState<"patient" | "doctor">("patient");
  const [crm, setCrm] = useState("");
  const [specialty, setSpecialty] = useState("");
  
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { organization: userOrg } = useOrganization();
  const { organization: slugOrg } = useOrganizationBySlug();
  
  // Priorizar organização por slug (URL) sobre organização do usuário
  const organization = slugOrg || userOrg;

  useEffect(() => {
    if (user) {
      // Redirect to home which will handle role-based routing
      navigate('/home');
    }
  }, [user, navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao enviar email",
          description: error.message
        });
      } else {
        toast({
          title: "Email enviado!",
          description: "Verifique sua caixa de entrada para redefinir sua senha"
        });
        setIsResetPassword(false);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        
        if (error) {
          toast({
            variant: "destructive",
            title: "Erro ao fazer login",
            description: error.message === "Invalid login credentials" 
              ? "Email ou senha incorretos"
              : error.message
          });
        } else {
          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo de volta"
          });
        }
      } else {
        if (!fullName.trim()) {
          toast({
            variant: "destructive",
            title: "Nome obrigatório",
            description: "Por favor, informe seu nome completo"
          });
          setLoading(false);
          return;
        }

        if (userType === "doctor" && (!crm.trim() || !specialty.trim())) {
          toast({
            variant: "destructive",
            title: "Dados obrigatórios",
            description: "Por favor, informe seu CRM e especialidade"
          });
          setLoading(false);
          return;
        }

        const { data, error } = await signUp(email, password, fullName);
        
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              variant: "destructive",
              title: "Email já cadastrado",
              description: "Este email já está em uso. Faça login ou use outro email."
            });
          } else {
            toast({
              variant: "destructive",
              title: "Erro ao criar conta",
              description: error.message
            });
          }
        } else if (data.user) {
          // Se for médico, criar registro na tabela doctors
          if (userType === "doctor") {
            const { error: doctorError } = await supabase
              .from("doctors")
              .insert({
                user_id: data.user.id,
                crm: crm.trim(),
                crm_state: "PR", // Valor padrão, pode ser customizado
                specialty: specialty.trim(),
                full_name: fullName.trim(),
                email: email,
                is_active: false // Requer aprovação do admin
              });

            if (doctorError) {
              console.error("Erro ao criar perfil médico:", doctorError);
              toast({
                variant: "destructive",
                title: "Erro ao criar perfil médico",
                description: "A conta foi criada, mas houve um erro ao registrar os dados médicos."
              });
              setLoading(false);
              return;
            }

            // Criar role de médico
            const { error: roleError } = await supabase
              .from("user_roles")
              .insert({
                user_id: data.user.id,
                role: "doctor"
              });

            if (roleError) {
              console.error("Erro ao criar role de médico:", roleError);
            }
          } else {
            // Para pacientes, criar role padrão
            const { error: roleError } = await supabase
              .from("user_roles")
              .insert({
                user_id: data.user.id,
                role: "patient"
              });

            if (roleError) {
              console.error("Erro ao criar role de paciente:", roleError);
            }
          }

          toast({
            title: "Conta criada com sucesso!",
            description: userType === "doctor" 
              ? "Seu perfil médico foi criado. Aguarde aprovação do administrador."
              : "Você já pode acessar o portal"
          });
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await signInWithGoogle();
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao fazer login",
          description: error.message
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente."
      });
    } finally {
      setLoading(false);
    }
  };

  // Aplicar cores da organização se disponível
  const orgStyle = organization?.primary_color ? {
    '--primary': organization.primary_color.startsWith('#') 
      ? organization.primary_color.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16) / 255).join(' ')
      : organization.primary_color,
  } as React.CSSProperties : {};

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center p-4"
      style={orgStyle}
    >
      <div className="w-full max-w-md space-y-6">
        <Card className="w-full">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <img 
              src={organization?.logo_url || am2LogoCompleto} 
              alt={organization?.name || "AM2 Soluções"}
              className="h-28 object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold">
            {organization?.name || "Portal do Paciente"}
          </CardTitle>
          <CardDescription>
            Acesse seus dados médicos de forma segura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={isLogin ? "login" : "signup"} onValueChange={(v) => setIsLogin(v === "login")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              {isResetPassword ? (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Enviaremos um link para redefinir sua senha
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setIsResetPassword(false)}
                    >
                      Voltar
                    </Button>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Enviando..." : "Enviar"}
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <PasswordInput
                      id="login-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                  
                  <div className="relative my-4">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                      ou
                    </span>
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Entrar com Google
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="link" 
                    className="w-full text-sm"
                    onClick={() => setIsResetPassword(true)}
                  >
                    Esqueci minha senha
                  </Button>
                </form>
              )}
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-type">Tipo de Cadastro</Label>
                  <Select value={userType} onValueChange={(value: "patient" | "doctor") => setUserType(value)}>
                    <SelectTrigger id="user-type">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patient">Paciente</SelectItem>
                      <SelectItem value="doctor">Médico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nome Completo</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                
                {userType === "doctor" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="crm">CRM</Label>
                      <Input
                        id="crm"
                        type="text"
                        placeholder="Número do CRM"
                        value={crm}
                        onChange={(e) => setCrm(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialty">Especialidade</Label>
                      <Input
                        id="specialty"
                        type="text"
                        placeholder="Ex: Cardiologia"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <PasswordInput
                    id="signup-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Mínimo de 6 caracteres
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Criando conta..." : "Criar conta"}
                </Button>
                
                <div className="relative my-4">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                    ou
                  </span>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Cadastrar com Google
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Footer discreto e responsivo */}
      <div className="text-center space-y-3">
        <a 
          href="https://www.am2solucoes.com.br" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block opacity-60 hover:opacity-100 transition-opacity"
        >
          <img 
            src={am2LogoCompleto} 
            alt="AM2 Soluções" 
            className="h-8 mx-auto"
          />
        </a>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground/80">
          <a 
            href="tel:+5545999801802" 
            className="flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            <Phone className="h-3 w-3" />
            <span>(45) 99980-1802</span>
          </a>
          <span className="hidden sm:inline text-muted-foreground/40">•</span>
          <a 
            href="mailto:comercial@am2saude.com.br" 
            className="flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            <Mail className="h-3 w-3" />
            <span>comercial@am2saude.com.br</span>
          </a>
        </div>
        <p className="text-xs text-muted-foreground/60">
          Desenvolvido por AM2 Soluções
        </p>
        <p className="text-[10px] text-muted-foreground/40 font-mono">
          {getFormattedVersion()}
        </p>
      </div>
      </div>
    </div>
  );
};
