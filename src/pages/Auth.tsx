import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Phone } from "lucide-react";
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
  
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { organization: userOrg } = useOrganization();
  const { organization: slugOrg } = useOrganizationBySlug();
  
  // Priorizar organização por slug (URL) sobre organização do usuário
  const organization = slugOrg || userOrg;

  useEffect(() => {
    if (user) {
      navigate("/");
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

        const { error } = await signUp(email, password, fullName);
        
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
        } else {
          toast({
            title: "Conta criada com sucesso!",
            description: "Você já pode acessar o portal"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center p-4">
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
