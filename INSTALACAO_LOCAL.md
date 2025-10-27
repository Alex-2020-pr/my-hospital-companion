# Manual de Instalação Local - AM2 Saúde Digital

Este documento descreve como instalar e executar o sistema AM2 Saúde Digital em um servidor local dentro de um hospital.

---

## 📋 Índice

1. [Requisitos do Sistema](#requisitos-do-sistema)
2. [Instalação - Windows](#instalação---windows)
3. [Instalação - Linux](#instalação---linux)
4. [Instalação - Docker](#instalação---docker)
5. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
6. [Scripts de Criação do Banco](#scripts-de-criação-do-banco)
7. [Configuração de Rede](#configuração-de-rede)
8. [Manutenção](#manutenção)
9. [Solução de Problemas](#solução-de-problemas)
10. [Suporte Técnico](#suporte-técnico)

---

## 🖥️ Requisitos do Sistema

### Hardware Mínimo Recomendado
- **Processador**: Intel Core i5 (4 núcleos) ou equivalente
- **Memória RAM**: 8GB (recomendado 16GB para produção)
- **Espaço em Disco**: 50GB livres (SSD recomendado)
- **Conexão de Rede**: 100Mbps (1Gbps recomendado)

### Hardware para Servidor de Produção
- **Processador**: Intel Xeon ou AMD EPYC (8+ núcleos)
- **Memória RAM**: 32GB+
- **Espaço em Disco**: 500GB+ SSD em RAID
- **Conexão de Rede**: 1Gbps dedicada

### Software Necessário

#### Para Instalação Padrão
- **Sistema Operacional**: Windows Server 2019+, Ubuntu 20.04+ ou CentOS 8+
- **Node.js**: Versão 18.x ou superior
- **PostgreSQL**: Versão 14+ (para banco de dados local)
- **Git**: Para clonar o repositório

#### Para Instalação com Docker
- **Sistema Operacional**: Windows 10/11 Pro, Ubuntu 20.04+ ou CentOS 8+
- **Docker**: Versão 20.x ou superior
- **Docker Compose**: Versão 2.x ou superior

---

## 🪟 Instalação - Windows

### 1. Instalar Node.js

1. Acesse: https://nodejs.org/
2. Baixe a versão **LTS** (Long Term Support)
3. Execute o instalador como Administrador
4. Marque a opção "Automatically install the necessary tools"
5. Após a instalação, abra o PowerShell como Administrador:
   ```powershell
   node --version
   npm --version
   ```

### 2. Instalar PostgreSQL

1. Acesse: https://www.postgresql.org/download/windows/
2. Baixe o instalador do PostgreSQL 14+
3. Durante a instalação:
   - Defina uma senha forte para o usuário `postgres`
   - Porta padrão: `5432`
   - Locale: `Portuguese, Brazil`
4. Adicione o PostgreSQL ao PATH do Windows

### 3. Obter os Arquivos do Sistema

**Opção A: Download Direto**
1. Solicite o arquivo ZIP à AM2 Soluções
2. Extraia para: `C:\AM2-Sistema`

**Opção B: Usando Git**
```powershell
cd C:\
git clone [URL-DO-REPOSITORIO] AM2-Sistema
cd AM2-Sistema
```

### 4. Configurar o Banco de Dados

Abra o pgAdmin ou psql:

```sql
-- Criar banco de dados
CREATE DATABASE am2_saude
    WITH 
    ENCODING = 'UTF8'
    LC_COLLATE = 'Portuguese_Brazil.1252'
    LC_CTYPE = 'Portuguese_Brazil.1252';

-- Criar usuário
CREATE USER am2_user WITH ENCRYPTED PASSWORD 'senha_forte_aqui';
GRANT ALL PRIVILEGES ON DATABASE am2_saude TO am2_user;
```

### 5. Configurar Variáveis de Ambiente

Crie o arquivo `.env` na pasta raiz:

```env
# Banco de Dados Local
DATABASE_URL=postgresql://am2_user:senha_forte_aqui@localhost:5432/am2_saude

# Supabase (Opcional - para funcionalidades avançadas)
VITE_SUPABASE_URL=https://sua-url-supabase.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica
VITE_SUPABASE_PROJECT_ID=seu-project-id

# Configurações do Servidor
PORT=8080
NODE_ENV=production
```

### 6. Instalar Dependências e Executar

```powershell
# Instalar dependências
npm install

# Executar migrações do banco
npm run migrate

# Compilar para produção
npm run build

# Instalar servidor HTTP global
npm install -g serve

# Executar
serve -s dist -l 8080
```

### 7. Configurar como Serviço Windows

**Usando NSSM (Non-Sucking Service Manager):**

1. Baixe NSSM: https://nssm.cc/download
2. Extraia e execute como Administrador:

```powershell
# Instalar serviço
nssm install AM2Sistema "C:\Program Files\nodejs\node.exe" "C:\AM2-Sistema\node_modules\serve\bin\serve.js" "-s" "C:\AM2-Sistema\dist" "-l" "8080"

# Iniciar serviço
nssm start AM2Sistema

# Configurar para iniciar automaticamente
sc config AM2Sistema start= auto
```

---

## 🐧 Instalação - Linux (Ubuntu/Debian)

### 1. Atualizar Sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Instalar Node.js

```bash
# Adicionar repositório NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Instalar Node.js
sudo apt install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 3. Instalar PostgreSQL

```bash
# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verificar status
sudo systemctl status postgresql
```

### 4. Configurar Banco de Dados

```bash
# Acessar PostgreSQL como usuário postgres
sudo -u postgres psql

# Dentro do psql:
CREATE DATABASE am2_saude WITH ENCODING 'UTF8' LC_COLLATE = 'pt_BR.UTF-8' LC_CTYPE = 'pt_BR.UTF-8';
CREATE USER am2_user WITH ENCRYPTED PASSWORD 'senha_forte_aqui';
GRANT ALL PRIVILEGES ON DATABASE am2_saude TO am2_user;
\q
```

### 5. Obter os Arquivos

```bash
cd /opt
sudo git clone [URL-DO-REPOSITORIO] am2-sistema
cd am2-sistema
sudo chown -R $USER:$USER /opt/am2-sistema
```

### 6. Configurar Ambiente

```bash
# Criar arquivo .env
cat > .env << EOF
DATABASE_URL=postgresql://am2_user:senha_forte_aqui@localhost:5432/am2_saude
VITE_SUPABASE_URL=https://sua-url-supabase.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica
VITE_SUPABASE_PROJECT_ID=seu-project-id
PORT=8080
NODE_ENV=production
EOF
```

### 7. Instalar e Executar

```bash
# Instalar dependências
npm install

# Executar migrações
npm run migrate

# Compilar
npm run build

# Instalar serve globalmente
sudo npm install -g serve
```

### 8. Configurar como Serviço Systemd

```bash
# Criar arquivo de serviço
sudo nano /etc/systemd/system/am2.service
```

Adicione o seguinte conteúdo:

```ini
[Unit]
Description=AM2 Sistema de Saúde Digital
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/am2-sistema
ExecStart=/usr/bin/serve -s /opt/am2-sistema/dist -l 8080
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

```bash
# Habilitar e iniciar serviço
sudo systemctl daemon-reload
sudo systemctl enable am2
sudo systemctl start am2
sudo systemctl status am2
```

### 9. Configurar Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 8080/tcp
sudo ufw allow 5432/tcp  # PostgreSQL (apenas se necessário acesso remoto)
sudo ufw reload

# Firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload
```

---

## 🐳 Instalação - Docker

### 1. Instalar Docker

**Ubuntu/Debian:**
```bash
# Remover versões antigas
sudo apt remove docker docker-engine docker.io containerd runc

# Instalar dependências
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Adicionar chave GPG
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Adicionar repositório
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verificar instalação
sudo docker --version
sudo docker compose version
```

**Windows:**
1. Acesse: https://docs.docker.com/desktop/install/windows-install/
2. Baixe e instale Docker Desktop
3. Reinicie o computador
4. Habilite WSL 2 se solicitado

### 2. Criar Arquivos Docker

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Compilar aplicação
RUN npm run build

# Instalar serve para servir arquivos estáticos
RUN npm install -g serve

# Expor porta
EXPOSE 8080

# Comando para iniciar
CMD ["serve", "-s", "dist", "-l", "8080"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: am2-postgres
    environment:
      POSTGRES_DB: am2_saude
      POSTGRES_USER: am2_user
      POSTGRES_PASSWORD: senha_forte_aqui
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --lc-collate=pt_BR.UTF-8 --lc-ctype=pt_BR.UTF-8"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - am2-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U am2_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: .
    container_name: am2-app
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgresql://am2_user:senha_forte_aqui@postgres:5432/am2_saude
      - NODE_ENV=production
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - am2-network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: am2-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    networks:
      - am2-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  am2-network:
    driver: bridge
```

**nginx/nginx.conf:**
```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:8080;
    }

    server {
        listen 80;
        server_name _;
        
        # Redirecionar HTTP para HTTPS
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name _;

        # Certificados SSL (gere seus próprios certificados)
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # Configurações SSL seguras
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # Headers de segurança
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### 3. Executar com Docker

```bash
# Construir e iniciar containers
sudo docker compose up -d

# Ver logs
sudo docker compose logs -f

# Verificar status
sudo docker compose ps

# Parar containers
sudo docker compose down

# Parar e remover volumes (CUIDADO: apaga dados)
sudo docker compose down -v
```

---

## 🗄️ Configuração do Banco de Dados

### Estrutura do Banco

O sistema utiliza PostgreSQL com as seguintes características:
- **Encoding**: UTF8
- **Collation**: pt_BR.UTF-8
- **Timezone**: America/Sao_Paulo
- **Schema Principal**: public
- **Extensões**: uuid-ossp, pgcrypto

### Configurações Recomendadas (postgresql.conf)

```ini
# Memória
shared_buffers = 256MB              # 25% da RAM
effective_cache_size = 1GB          # 50-75% da RAM
work_mem = 16MB
maintenance_work_mem = 128MB

# WAL
wal_buffers = 16MB
checkpoint_completion_target = 0.9
wal_compression = on

# Performance
random_page_cost = 1.1              # Para SSD
effective_io_concurrency = 200

# Logging
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_min_duration_statement = 1000   # Log queries > 1s
log_line_prefix = '%t [%p]: user=%u,db=%d,app=%a,client=%h '
log_timezone = 'America/Sao_Paulo'

# Conexões
max_connections = 100
```

### Backup e Restore

**Backup Automático (Linux):**

```bash
# Criar script de backup
sudo nano /usr/local/bin/backup-am2.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/am2"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup do banco
pg_dump -U am2_user -h localhost am2_saude | gzip > $BACKUP_DIR/am2_$DATE.sql.gz

# Manter apenas últimos 30 dias
find $BACKUP_DIR -name "am2_*.sql.gz" -mtime +30 -delete

echo "Backup concluído: am2_$DATE.sql.gz"
```

```bash
# Tornar executável
sudo chmod +x /usr/local/bin/backup-am2.sh

# Agendar backup diário (crontab)
sudo crontab -e
# Adicionar: 0 2 * * * /usr/local/bin/backup-am2.sh
```

**Restore:**
```bash
# Descompactar e restaurar
gunzip -c /var/backups/am2/am2_YYYYMMDD_HHMMSS.sql.gz | psql -U am2_user -h localhost am2_saude
```

---

## 📜 Scripts de Criação do Banco

### Script Completo de Inicialização

**database/init.sql:**

```sql
-- ============================================
-- AM2 SAÚDE DIGITAL - SCRIPT DE INICIALIZAÇÃO
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABELAS PRINCIPAIS
-- ============================================

-- Tabela de Usuários (Profiles)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    cpf VARCHAR(14) UNIQUE,
    phone VARCHAR(20),
    birth_date DATE,
    avatar_url TEXT,
    organization_id UUID,
    storage_used_bytes BIGINT DEFAULT 0,
    storage_limit_bytes BIGINT DEFAULT 10485760, -- 10MB
    notification_preferences JSONB DEFAULT '{"medication_reminders": true, "vital_signs": true, "scheduled_appointments": true, "scheduled_exams": true, "exam_preparation": true, "physical_activity": true, "show_examples": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Organizações (Hospitais/Clínicas)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('hospital', 'clinic')),
    cnpj VARCHAR(18),
    address TEXT,
    website VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Papéis de Usuário
CREATE TYPE app_role AS ENUM ('super_admin', 'hospital_admin', 'patient');

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role, organization_id)
);

-- Tabela de Consultas
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    mode VARCHAR(20) DEFAULT 'manual' CHECK (mode IN ('manual', 'integrated')),
    doctor_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(100),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    location TEXT,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'pending')),
    notes TEXT,
    hospital_contact JSONB, -- {phone, whatsapp, email}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Exames
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    mode VARCHAR(20) DEFAULT 'manual' CHECK (mode IN ('manual', 'integrated')),
    doctor_name VARCHAR(255),
    exam_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')),
    result_summary TEXT,
    preparation_instructions TEXT,
    has_images BOOLEAN DEFAULT false,
    file_url TEXT,
    hospital_contact JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Medicamentos
CREATE TABLE IF NOT EXISTS medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    instructions TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Horários de Medicamentos
CREATE TABLE IF NOT EXISTS medication_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    time TIME NOT NULL,
    taken BOOLEAN DEFAULT false,
    taken_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Sinais Vitais
CREATE TABLE IF NOT EXISTS vital_signs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    measurement_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    heart_rate INTEGER,
    glucose NUMERIC(5,2),
    weight NUMERIC(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Documentos
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    description TEXT,
    document_date DATE NOT NULL,
    file_url TEXT,
    file_size INTEGER,
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'archived', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Mensagens
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    sender_type VARCHAR(50) DEFAULT 'user' CHECK (sender_type IN ('user', 'hospital', 'system')),
    sender_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Mensagens Organizacionais
CREATE TABLE IF NOT EXISTS organization_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    target_type VARCHAR(20) DEFAULT 'all' CHECK (target_type IN ('all', 'specific')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Leitura de Mensagens
CREATE TABLE IF NOT EXISTS message_reads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES organization_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, user_id)
);

-- Tabela de Tokens de API
CREATE TABLE IF NOT EXISTS organization_api_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by UUID REFERENCES profiles(id),
    revoke_reason TEXT
);

-- Tabela de Parceiros de Integração
CREATE TABLE IF NOT EXISTS integration_partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX idx_profiles_organization ON profiles(organization_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_appointments_user_date ON appointments(user_id, appointment_date);
CREATE INDEX idx_exams_user_date ON exams(user_id, exam_date);
CREATE INDEX idx_medications_user_active ON medications(user_id, is_active);
CREATE INDEX idx_vital_signs_user_date ON vital_signs(user_id, measurement_date);
CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_messages_user_status ON messages(user_id, status);

-- ============================================
-- TRIGGERS
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON exams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNÇÕES AUXILIARES
-- ============================================

-- Função para gerar token de API
CREATE OR REPLACE FUNCTION generate_api_token()
RETURNS TEXT AS $$
DECLARE
    token_value TEXT;
BEGIN
    token_value := encode(gen_random_bytes(32), 'hex');
    RETURN 'org_' || token_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para validar token
CREATE OR REPLACE FUNCTION validate_org_api_token(_token TEXT)
RETURNS TABLE(organization_id UUID, organization_name TEXT, token_id UUID, is_valid BOOLEAN) AS $$
BEGIN
    UPDATE organization_api_tokens
    SET last_used_at = CURRENT_TIMESTAMP
    WHERE token = _token
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP);

    RETURN QUERY
    SELECT 
        oat.organization_id,
        o.name as organization_name,
        oat.id as token_id,
        (oat.is_active AND (oat.expires_at IS NULL OR oat.expires_at > CURRENT_TIMESTAMP)) as is_valid
    FROM organization_api_tokens oat
    JOIN organizations o ON o.id = oat.organization_id
    WHERE oat.token = _token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Inserir configuração do sistema
CREATE TABLE IF NOT EXISTS system_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    first_admin_created BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO system_config (id, first_admin_created) 
VALUES (1, false) 
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PERMISSÕES
-- ============================================

-- Conceder permissões ao usuário am2_user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO am2_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO am2_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO am2_user;

-- Garantir que permissões sejam aplicadas a tabelas futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO am2_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO am2_user;

-- ============================================
-- FINALIZAÇÃO
-- ============================================

-- Definir timezone
SET timezone = 'America/Sao_Paulo';

COMMIT;
```

---

## 🌐 Configuração de Rede

### Permitir Acesso na Rede Local

#### 1. Descobrir IP do Servidor

**Windows:**
```powershell
ipconfig
# Procure "IPv4 Address"
```

**Linux:**
```bash
ip addr show
# ou
hostname -I
```

#### 2. Configurar Firewall

**Windows Firewall:**
```powershell
# PowerShell como Administrador
New-NetFirewallRule -DisplayName "AM2 Sistema" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
```

**Linux (UFW):**
```bash
sudo ufw allow 8080/tcp
sudo ufw allow from 192.168.1.0/24 to any port 8080  # Apenas rede local
sudo ufw reload
```

#### 3. Configurar DNS Local (Opcional)

**Windows Server:**
1. Server Manager → DNS → Forward Lookup Zones
2. Criar registro A: `am2-saude.hospital.local` → IP do servidor

**Linux (dnsmasq):**
```bash
sudo apt install dnsmasq
echo "address=/am2-saude.hospital.local/192.168.1.100" | sudo tee -a /etc/dnsmasq.conf
sudo systemctl restart dnsmasq
```

### Configurar HTTPS com Certificado SSL

**Gerar Certificado Auto-assinado (Desenvolvimento):**

```bash
# Criar diretório
mkdir -p nginx/ssl
cd nginx/ssl

# Gerar certificado
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout key.pem \
  -out cert.pem \
  -subj "/C=BR/ST=PR/L=Cascavel/O=Hospital/CN=am2-saude.hospital.local"
```

**Certificado Válido (Produção):**
1. Obtenha um certificado de uma CA (Let's Encrypt, etc.)
2. Configure no nginx conforme exemplo acima

---

## 🔧 Manutenção

### Backup Regular

**Script de Backup Completo:**

```bash
#!/bin/bash
BACKUP_ROOT="/var/backups/am2"
DATE=$(date +%Y%m%d_%H%M%S)

# Criar diretório de backup
mkdir -p "$BACKUP_ROOT/$DATE"

# Backup do banco de dados
pg_dump -U am2_user -h localhost am2_saude | gzip > "$BACKUP_ROOT/$DATE/database.sql.gz"

# Backup de arquivos de configuração
tar -czf "$BACKUP_ROOT/$DATE/config.tar.gz" /opt/am2-sistema/.env

# Backup de arquivos uploadados (se houver)
if [ -d "/opt/am2-sistema/uploads" ]; then
    tar -czf "$BACKUP_ROOT/$DATE/uploads.tar.gz" /opt/am2-sistema/uploads
fi

# Log do backup
echo "Backup concluído em $(date)" >> "$BACKUP_ROOT/backup.log"

# Manter apenas últimos 30 dias
find "$BACKUP_ROOT" -maxdepth 1 -type d -mtime +30 -exec rm -rf {} \;
```

### Monitoramento

**Script de Monitoramento Simples:**

```bash
#!/bin/bash
# /usr/local/bin/monitor-am2.sh

# Verificar se o serviço está rodando
if ! systemctl is-active --quiet am2; then
    echo "ALERTA: Serviço AM2 parado!" | mail -s "AM2 Sistema Parado" admin@hospital.com
    systemctl start am2
fi

# Verificar conexão ao banco
if ! pg_isready -U am2_user -h localhost -q; then
    echo "ALERTA: PostgreSQL indisponível!" | mail -s "PostgreSQL Parado" admin@hospital.com
fi

# Verificar espaço em disco
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "ALERTA: Disco com ${DISK_USAGE}% de uso!" | mail -s "Espaço em Disco" admin@hospital.com
fi
```

**Agendar Monitoramento:**
```bash
sudo crontab -e
# Adicionar:
*/5 * * * * /usr/local/bin/monitor-am2.sh
```

### Atualização do Sistema

```bash
# 1. Fazer backup
/usr/local/bin/backup-am2.sh

# 2. Parar serviço
sudo systemctl stop am2

# 3. Atualizar código
cd /opt/am2-sistema
git pull  # ou descompactar nova versão

# 4. Atualizar dependências
npm install

# 5. Executar migrações
npm run migrate

# 6. Compilar
npm run build

# 7. Reiniciar serviço
sudo systemctl start am2

# 8. Verificar logs
sudo journalctl -u am2 -f
```

---

## ❓ Solução de Problemas

### Problema: "Conexão recusada ao banco de dados"

**Sintomas:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Soluções:**
1. Verificar se PostgreSQL está rodando:
   ```bash
   sudo systemctl status postgresql
   ```
2. Verificar configuração de `pg_hba.conf`:
   ```bash
   sudo nano /etc/postgresql/14/main/pg_hba.conf
   # Adicionar: local   all   am2_user   md5
   sudo systemctl restart postgresql
   ```

### Problema: "Porta 8080 já em uso"

**Solução:**
```bash
# Ver o que está usando a porta
sudo lsof -i :8080

# Matar o processo
sudo kill -9 <PID>

# Ou usar outra porta
serve -s dist -l 3000
```

### Problema: "npm ERR! EACCES"

**Solução (Linux):**
```bash
# Reconfigurar npm
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Problema: Alta latência ou lentidão

**Diagnóstico:**
```bash
# Verificar carga do sistema
top
htop

# Verificar I/O de disco
sudo iotop

# Verificar conexões PostgreSQL
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

**Soluções:**
1. Aumentar `shared_buffers` no PostgreSQL
2. Otimizar consultas lentas (verificar logs)
3. Adicionar mais RAM
4. Usar SSD ao invés de HDD

### Problema: "Cannot find module"

**Solução:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

## 📞 Suporte Técnico

### AM2 Soluções em Saúde

**Contatos:**
- 📞 **Telefone**: (45) 99990-1902
- 📧 **Email**: comercial@am2solucoes.com.br
- 🌐 **Website**: https://www.am2solucoes.com.br
- 📍 **Localização**: Cascavel - PR

**Horário de Atendimento:**
- Segunda a Sexta: 8h às 18h
- Sábado: 8h às 12h
- Emergências 24/7: Telefone de plantão fornecido no contrato

**Informações para Suporte:**
Ao entrar em contato, tenha em mãos:
1. Número do contrato
2. Descrição detalhada do problema
3. Logs de erro (se disponíveis)
4. Versão do sistema instalada
5. Sistema operacional e versão

### Logs do Sistema

**Localização dos Logs:**

**Linux:**
```bash
# Logs do serviço
sudo journalctl -u am2 -n 100

# Logs do PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Logs do Nginx (se usando)
sudo tail -f /var/log/nginx/error.log
```

**Docker:**
```bash
docker compose logs am2-app
docker compose logs postgres
```

---

## 🔒 Notas de Segurança

### Checklist de Segurança

- [ ] Alterar senhas padrão do PostgreSQL
- [ ] Configurar firewall para permitir apenas IPs da rede local
- [ ] Habilitar HTTPS com certificado válido
- [ ] Configurar backup automático diário
- [ ] Atualizar sistema regularmente
- [ ] Monitorar logs de acesso
- [ ] Restringir acesso físico ao servidor
- [ ] Implementar autenticação de dois fatores (2FA)
- [ ] Documentar procedimentos de recuperação de desastres
- [ ] Treinar equipe em procedimentos de segurança

### Hardening do Sistema

**PostgreSQL:**
```sql
-- Configurar timeout de conexão
ALTER SYSTEM SET statement_timeout = '30s';
ALTER SYSTEM SET idle_in_transaction_session_timeout = '10min';

-- Limitar conexões
ALTER SYSTEM SET max_connections = 100;

-- Recarregar configuração
SELECT pg_reload_conf();
```

**Linux:**
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Configurar fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Desabilitar root SSH
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no
sudo systemctl restart sshd
```

---

## 📄 Licença e Contrato

Este sistema é propriedade da **AM2 Soluções em Saúde** e está licenciado exclusivamente para o hospital/clínica contratante conforme termos do contrato de licenciamento de software.

**Restrições:**
- Uso limitado às instalações do hospital contratante
- Proibida redistribuição ou sublicenciamento
- Modificações permitidas apenas com autorização escrita
- Obrigatório manter créditos e marcas registradas

Para detalhes completos, consulte o contrato de licenciamento fornecido durante a aquisição.

---

## 📋 Apêndice

### Comandos Úteis

```bash
# Verificar versão do Node.js
node --version

# Verificar versão do PostgreSQL
psql --version

# Verificar portas abertas
sudo netstat -tulpn | grep LISTEN

# Espaço em disco
df -h

# Uso de memória
free -h

# Processos
ps aux | grep node

# Reiniciar todos os serviços
sudo systemctl restart am2 postgresql nginx
```

### Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    Navegador Web                         │
│                 (Chrome, Firefox, Edge)                  │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS
                        ▼
┌─────────────────────────────────────────────────────────┐
│                 Nginx (Proxy Reverso)                    │
│              Load Balancer & SSL/TLS                     │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP
                        ▼
┌─────────────────────────────────────────────────────────┐
│               Node.js Application Server                 │
│                  (React + Vite Build)                    │
└───────────────────────┬─────────────────────────────────┘
                        │
           ┌────────────┴────────────┐
           │                         │
           ▼                         ▼
┌──────────────────────┐   ┌──────────────────────┐
│   PostgreSQL 14+     │   │  Supabase (Cloud)    │
│   (Local Database)   │   │  (Opcional/Backup)   │
└──────────────────────┘   └──────────────────────┘
```

---

**Versão do Manual**: 2.0  
**Última Atualização**: Outubro 2025  
**Sistema**: AM2 Saúde Digital v2.0  
**Autor**: AM2 Soluções em Saúde  
**Contato**: comercial@am2solucoes.com.br
