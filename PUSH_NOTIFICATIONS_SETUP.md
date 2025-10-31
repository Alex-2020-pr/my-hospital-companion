# Configuração de Notificações Push

## Problema Identificado
As notificações push estão falhando porque as chaves VAPID no frontend não correspondem às chaves no backend.

## Solução

### 1. Gerar Novas Chaves VAPID
Execute este comando em um terminal Node.js:

```javascript
const webpush = require('web-push');
const vapidKeys = webpush.generateVAPIDKeys();
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);
```

Ou use este site: https://vapidkeys.com/

### 2. Configurar as Secrets no Backend
Adicione estas 3 secrets na Lovable Cloud:

- `VAPID_PUBLIC_KEY`: A chave pública gerada
- `VAPID_PRIVATE_KEY`: A chave privada gerada  
- `VAPID_SUBJECT`: `mailto:seu-email@exemplo.com` ou `https://seu-site.com`

### 3. Atualizar o Frontend
Atualize a linha 80 do arquivo `src/hooks/usePushNotifications.tsx` com a VAPID_PUBLIC_KEY gerada:

```typescript
const vapidPublicKey = "SUA_CHAVE_PUBLICA_AQUI";
```

### 4. Reinscrever Usuários
Todos os usuários que já ativaram notificações precisarão:
1. Desativar as notificações no perfil
2. Ativar novamente

## Notas Importantes
- As chaves VAPID devem ser as mesmas no frontend e backend
- Para notificações funcionarem com app fechado no celular, o usuário deve ter permissões ativadas no sistema
- O service worker foi atualizado para melhor suporte a notificações em background
