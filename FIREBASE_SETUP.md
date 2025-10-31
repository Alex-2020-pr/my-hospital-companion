# Configuração Firebase Cloud Messaging (FCM)

## ✅ Backend Configurado

As credenciais do Firebase já foram adicionadas como secrets:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`

## 📱 Como Funciona

O FCM (Firebase Cloud Messaging) é superior ao Web Push API porque:
- ✅ **Gratuito** - 100% gratuito, sem limites
- ✅ **Funciona com app fechado** - Notificações chegam mesmo com o aplicativo completamente fechado no celular
- ✅ **Melhor entrega** - Taxa de entrega muito superior, especialmente em dispositivos móveis
- ✅ **Suporte iOS e Android** - Funciona perfeitamente em ambas as plataformas

## 🔧 Configuração Adicional Necessária

### 1. Obter as Configurações Web do Firebase

No Firebase Console:
1. Vá em **Project Settings** (ícone de engrenagem)
2. Na aba **General**, role até **Your apps**
3. Se ainda não tiver um app web, clique em **Add app** → **Web** (ícone `</>`)
4. Registre o app com um nome (ex: "AM2 Web App")
5. Copie as configurações que aparecem

Você verá algo assim:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc123"
};
```

### 2. Gerar o VAPID Key

Na mesma página do Firebase Console:
1. Vá para **Cloud Messaging** na navegação lateral
2. Role até **Web configuration**
3. Em **Web Push certificates**, clique em **Generate key pair**
4. Copie a chave pública (VAPID key)

### 3. Adicionar Variáveis de Ambiente

Adicione essas variáveis no arquivo `.env`:

```env
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc123
VITE_FIREBASE_VAPID_KEY=sua-vapid-key-aqui
```

### 4. Atualizar os Arquivos

Atualize `src/hooks/usePushNotifications.tsx`:
- Substitua os valores placeholder pelas suas credenciais reais
- Atualize o `vapidKey` na função `subscribe()`

Atualize `public/firebase-messaging-sw.js`:
- Substitua os valores placeholder pelas suas credenciais reais

## 🧪 Testando

1. **Ativar notificações**: Vá no perfil do usuário e ative as notificações
2. **Enviar teste**: Como super admin, vá em Notificações Push e envie uma mensagem
3. **Testar com app fechado**: 
   - Feche completamente o navegador/app
   - Bloqueie a tela do celular
   - Envie uma notificação
   - Deve aparecer na tela de bloqueio!

## 📝 Notas Importantes

- O FCM funciona melhor em HTTPS (em produção)
- Em localhost, o FCM ainda funciona para testes
- As notificações aparecem mesmo com o app fechado (diferente do Web Push API)
- Para iOS Safari, é necessário adicionar o app à tela inicial primeiro

## 🔍 Troubleshooting

Se as notificações não funcionarem:

1. **Verificar permissões**: Certifique-se de que o navegador tem permissão para notificações
2. **Console logs**: Abra o DevTools e veja se há erros no console
3. **Service Worker**: Em DevTools → Application → Service Workers, verifique se está ativo
4. **Credenciais**: Confirme que todas as variáveis de ambiente estão corretas
5. **Firebase Console**: Verifique os logs no Firebase Console → Cloud Messaging

## 📚 Documentação

- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [FCM Web Setup](https://firebase.google.com/docs/cloud-messaging/js/client)
