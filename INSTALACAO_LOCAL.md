# Manual de Instalação Local - AM2 Saúde Digital

Este documento descreve como instalar e executar o sistema AM2 Saúde Digital em um servidor local dentro de um hospital.

## Requisitos do Sistema

### Hardware Mínimo Recomendado
- Processador: Intel Core i5 ou equivalente
- Memória RAM: 8GB
- Espaço em Disco: 20GB livres
- Conexão de Rede: 100Mbps

### Software Necessário
1. **Sistema Operacional**: Windows 10/11, Linux (Ubuntu 20.04+) ou macOS
2. **Node.js**: Versão 18.x ou superior
3. **Git**: Para clonar o repositório (opcional)

## Passo 1: Instalar o Node.js

### Windows
1. Acesse: https://nodejs.org/
2. Baixe a versão LTS (Long Term Support)
3. Execute o instalador e siga as instruções
4. Após a instalação, abra o Prompt de Comando e execute:
   ```bash
   node --version
   npm --version
   ```
   Ambos devem retornar números de versão.

### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

### macOS
```bash
# Usando Homebrew
brew install node@18
node --version
npm --version
```

## Passo 2: Obter os Arquivos do Sistema

### Opção A: Download Direto (Recomendado para usuários sem Git)
1. Solicite o arquivo ZIP do sistema à AM2
2. Extraia o arquivo para uma pasta, por exemplo: `C:\AM2-Sistema` (Windows) ou `/home/usuario/am2-sistema` (Linux)

### Opção B: Usando Git (Para desenvolvedores)
```bash
git clone [URL-DO-REPOSITORIO]
cd am2-sistema
```

## Passo 3: Configurar Variáveis de Ambiente

1. Na pasta raiz do projeto, copie o arquivo `.env.example` para `.env`:

**Windows (Prompt de Comando):**
```bash
copy .env.example .env
```

**Linux/macOS (Terminal):**
```bash
cp .env.example .env
```

2. Abra o arquivo `.env` em um editor de texto e configure as seguintes variáveis:

```env
# URLs do Supabase (fornecidas pela AM2)
VITE_SUPABASE_URL=https://sua-url-supabase.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica-aqui
VITE_SUPABASE_PROJECT_ID=seu-project-id
```

**IMPORTANTE**: Entre em contato com a AM2 para obter as credenciais corretas do Supabase para sua instalação.

## Passo 4: Instalar Dependências

Abra o terminal/prompt na pasta do projeto e execute:

```bash
npm install
```

Este processo pode levar alguns minutos dependendo da velocidade da internet.

## Passo 5: Executar o Sistema

### Modo de Desenvolvimento (Recomendado para testes)
```bash
npm run dev
```

O sistema estará disponível em: `http://localhost:8080`

### Modo de Produção (Para uso real no hospital)

1. Primeiro, compile o projeto:
```bash
npm run build
```

2. Instale um servidor HTTP (exemplo com 'serve'):
```bash
npm install -g serve
```

3. Execute o servidor:
```bash
serve -s dist -l 8080
```

O sistema estará disponível em: `http://localhost:8080`

## Passo 6: Acessar o Sistema

1. Abra um navegador web (Chrome, Firefox, Edge)
2. Acesse: `http://localhost:8080`
3. Use as credenciais de administrador fornecidas pela AM2

## Configuração de Rede Local (Hospital)

Para permitir que outros computadores na rede do hospital acessem o sistema:

### 1. Descobrir o IP Local do Servidor
**Windows:**
```bash
ipconfig
```
Procure por "IPv4 Address" (exemplo: 192.168.1.100)

**Linux/macOS:**
```bash
ifconfig
# ou
ip addr
```

### 2. Configurar o Firewall

**Windows:**
1. Painel de Controle → Sistema e Segurança → Windows Defender Firewall
2. Configurações Avançadas → Regras de Entrada
3. Nova Regra → Porta → TCP → 8080
4. Permitir a conexão → Aplicar

**Linux (UFW):**
```bash
sudo ufw allow 8080/tcp
sudo ufw reload
```

### 3. Acessar de Outros Computadores
- Os usuários podem acessar através de: `http://192.168.1.100:8080` (substitua pelo IP do servidor)

## Manutenção e Atualizações

### Atualizar o Sistema
1. Pare o servidor (Ctrl+C no terminal)
2. Obtenha a nova versão (da AM2 ou via Git)
3. Execute novamente:
```bash
npm install
npm run build
serve -s dist -l 8080
```

### Backup de Dados
**IMPORTANTE**: Os dados do sistema são armazenados no Supabase (nuvem). Para backup completo:
1. Entre em contato com a AM2 para procedimentos de backup do banco de dados
2. Mantenha cópias dos arquivos de configuração (.env)

## Solução de Problemas

### Problema: "npm: comando não encontrado"
**Solução**: Node.js não está instalado ou não está no PATH. Reinstale o Node.js.

### Problema: Porta 8080 já em uso
**Solução**: 
```bash
# Use outra porta
npm run dev -- --port 3000
# ou
serve -s dist -l 3000
```

### Problema: Erro "EACCES" ou "Permission denied"
**Solução** (Linux/macOS):
```bash
sudo npm install -g serve
```

### Problema: Página em branco ao acessar
**Soluções**:
1. Limpe o cache do navegador (Ctrl+Shift+Del)
2. Verifique se o arquivo `.env` está configurado corretamente
3. Verifique o console do navegador (F12) para erros

## Executar como Serviço (Avançado)

Para que o sistema inicie automaticamente com o servidor:

### Windows (usando NSSM)
1. Baixe NSSM: https://nssm.cc/download
2. Instale o serviço:
```bash
nssm install AM2Sistema
```
3. Configure o caminho do node.exe e o script

### Linux (usando systemd)
Crie o arquivo `/etc/systemd/system/am2.service`:
```ini
[Unit]
Description=AM2 Sistema de Saude
After=network.target

[Service]
Type=simple
User=seu-usuario
WorkingDirectory=/caminho/para/am2-sistema
ExecStart=/usr/bin/npm run dev
Restart=always

[Install]
WantedBy=multi-user.target
```

Execute:
```bash
sudo systemctl enable am2
sudo systemctl start am2
```

## Suporte Técnico

Para assistência técnica ou dúvidas sobre a instalação:

**AM2 - Soluções em Saúde Digital**
- Telefone: (11) 1234-5678
- Email: suporte@am2.com.br
- Website: www.am2.com.br
- Horário de Atendimento: Segunda a Sexta, 8h às 18h

## Notas de Segurança

1. **Nunca compartilhe as credenciais do arquivo .env**
2. **Use HTTPS em produção** (configure um certificado SSL)
3. **Mantenha o sistema sempre atualizado**
4. **Configure backups regulares**
5. **Limite o acesso à rede do hospital** (use VPN se necessário)

## Licença e Contrato

Este sistema é propriedade da AM2 e está licenciado para uso exclusivo do hospital contratante. Veja o contrato de licenciamento para detalhes completos.

---

**Versão do Manual**: 1.0  
**Última Atualização**: Outubro 2025  
**Sistema**: AM2 Saúde Digital v1.0
