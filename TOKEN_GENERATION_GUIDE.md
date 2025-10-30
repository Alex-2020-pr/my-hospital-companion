# Guia de Regeneração de Chaves VAPID

## Por que regenerar?

As chaves VAPID (Voluntary Application Server Identification) são necessárias para enviar notificações push. Se você está recebendo erros 403 "invalid JWT provided", precisa regenerar essas chaves.

## Como gerar novas chaves VAPID

### Opção 1: Usando web-push CLI (Recomendado)

```bash
# Instalar web-push globalmente
npm install -g web-push

# Gerar chaves VAPID
web-push generate-vapid-keys
```

Isso vai gerar algo como:
```
Public Key: BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U
Private Key: bdSiNzUhUP6piAxLH-tW88zfBlWWveIx0dAsDO66aVU
```

### Opção 2: Usando Node.js

Crie um arquivo `generate-vapid.js`:
```javascript
const webpush = require('web-push');
const vapidKeys = webpush.generateVAPIDKeys();
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);
```

Execute:
```bash
node generate-vapid.js
```

## Configurar as chaves no projeto

Depois de gerar as chaves, você precisa configurá-las em 2 lugares:

### 1. Secrets do Supabase (Backend)

As chaves já existem como secrets, você só precisa atualizá-las com os novos valores:

- `VAPID_PUBLIC_KEY` - Cole a Public Key gerada
- `VAPID_PRIVATE_KEY` - Cole a Private Key gerada  
- `VAPID_SUBJECT` - Use `mailto:seu-email@exemplo.com` ou a URL do seu app

**IMPORTANTE:** O `VAPID_SUBJECT` deve ser um email válido com formato `mailto:email@dominio.com` ou uma URL `https://seu-dominio.com`

### 2. Hook de Push Notifications (Frontend)

Atualize o arquivo `src/hooks/usePushNotifications.tsx`:

Encontre a linha com `vapidPublicKey` e substitua pelo valor da sua nova Public Key:
```typescript
const vapidPublicKey = 'SUA_NOVA_PUBLIC_KEY_AQUI';
```

## Testar as notificações

Após atualizar as chaves:

1. Limpe o cache do navegador
2. Desative e reative as notificações no app
3. Feche completamente o app
4. Peça para alguém te enviar uma notificação
5. A notificação deve aparecer na tela bloqueada do celular

## Troubleshooting

### Erro 403 "invalid JWT provided"
- Verifique se a VAPID_PUBLIC_KEY no frontend é exatamente igual à configurada no backend
- Confirme que VAPID_SUBJECT está no formato correto (`mailto:` ou `https://`)
- Regenere as chaves e configure novamente

### Notificação não aparece
- Confirme que as permissões estão habilitadas no dispositivo
- Verifique se o app está completamente fechado (não apenas minimizado)
- Confira os logs do edge function para ver se há erros

### Service Worker não registra
- Limpe o cache do navegador
- Desregistre service workers antigos em DevTools > Application > Service Workers
- Recarregue a página com Ctrl+Shift+R (ou Cmd+Shift+R no Mac)

## Links úteis

- [Web Push Protocol](https://web.dev/push-notifications-overview/)
- [VAPID Specification](https://tools.ietf.org/html/rfc8292)
- [web-push npm package](https://www.npmjs.com/package/web-push)
