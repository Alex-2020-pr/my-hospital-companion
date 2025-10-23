# Como Configurar o Primeiro Usuário Admin

## Método Simples (Recomendado)

### Acesse a página de Setup Inicial
1. Acesse a URL: `/admin/setup`
2. Preencha o formulário com seus dados:
   - Nome completo
   - Email
   - Senha (mínimo 6 caracteres)
   - Confirme a senha
3. Clique em "Criar Conta de Administrador"
4. Após a criação, faça login em `/auth` com as credenciais criadas

**Importante**: Esta página só funciona para criar o PRIMEIRO administrador. Depois que o primeiro super admin for criado, a página não permitirá mais cadastros e você deverá fazer login normalmente.

---

## Método Manual (Alternativo)

Caso prefira criar manualmente pelo banco de dados:

### Passo 1: Crie sua conta
Acesse `/auth` e crie uma conta normalmente no aplicativo.

### Passo 2: Adicione a role de Super Admin
Depois de criar sua conta, você precisa adicionar a role de super admin no banco de dados.

### Opção 1: Via Backend Lovable Cloud
1. Clique em "View Backend" no painel do projeto
2. Acesse a aba "SQL Editor" ou "Table Editor"
3. Execute o seguinte SQL (substitua `SEU_EMAIL@example.com` pelo email que você usou no cadastro):

```sql
-- Encontrar o user_id do usuário pelo email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::app_role
FROM auth.users
WHERE email = 'SEU_EMAIL@example.com';
```

### Opção 2: Via Table Editor
1. Abra a tabela `user_roles`
2. Clique em "Insert row"
3. Preencha:
   - `user_id`: copie o ID do usuário da tabela `auth.users` (busque pelo seu email na tabela profiles)
   - `role`: selecione `super_admin`

## Passo 3: Faça Login
Após adicionar a role, faça logout e login novamente. Você verá um ícone de escudo (🛡️) no canto superior direito que te levará ao painel administrativo.

## Rotas Administrativas

- **`/admin`** - Dashboard com estatísticas gerais
- **`/admin/organizations`** - Gerenciar hospitais e clínicas  
- **`/admin/partners`** - Gerenciar parceiros de integração e API keys
- **`/hospital`** - Painel do hospital (para usuários com role `hospital_admin`)

## Como Criar Outros Admins

### Super Admin (acesso total)
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('uuid-do-usuario', 'super_admin');
```

### Hospital Admin (acesso apenas à sua organização)
```sql
INSERT INTO public.user_roles (user_id, role, organization_id)
VALUES ('uuid-do-usuario', 'hospital_admin', 'uuid-da-organizacao');
```

### Paciente (role padrão)
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('uuid-do-usuario', 'patient');
```

## Nota de Segurança
- Apenas usuários com role `super_admin` podem acessar os painéis `/admin/*`
- Usuários com role `hospital_admin` só podem ver dados de sua organização
- As roles são verificadas no servidor via RLS policies, não podem ser manipuladas pelo cliente
