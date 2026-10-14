# Instalar o app no celular

O app é o mesmo jogo do site, empacotado pelo Capacitor. Ele abre sempre deitado e em tela cheia.
Nada aqui exige conta paga.

## Android (APK)

1. A cada push na `main`, o GitHub gera o APK sozinho: no repositório, abra **Actions > APK Android**, clique na execução mais recente e baixe **honey-troop-apk** em *Artifacts* (vem num .zip com o `app-debug.apk` dentro).
2. Mande o `app-debug.apk` para o celular (WhatsApp, Drive, cabo) e abra.
3. O Android vai pedir para permitir instalar apps desta fonte. Permita e instale.

Para amigos, é só mandar o mesmo arquivo.

## iPhone (pelo seu Mac, com Apple ID grátis)

Uma vez só:

1. Instale o **Xcode** pela App Store do Mac e abra uma vez para ele terminar de instalar os componentes.
2. Instale o **Node 22** (https://nodejs.org) e o git, se ainda não tiver.
3. No Xcode, abra **Settings > Accounts**, clique em **+** e entre com seu Apple ID.
4. No iPhone, ative o **Modo de Desenvolvedor**: Ajustes > Privacidade e Segurança > Modo de Desenvolvedor (o iPhone reinicia). A opção só aparece depois que o iPhone for ligado ao Mac com o Xcode aberto.

Para instalar:

1. No Terminal do Mac:
   ```
   git clone https://github.com/pedrobortolanza/abelhas-mobile.git
   cd abelhas-mobile
   npm install
   npm run app:ios
   ```
   O último comando gera o jogo e abre o projeto no Xcode.
2. No Xcode, clique em **App** (na lateral) > aba **Signing & Capabilities** > em **Team**, escolha *Seu Nome (Personal Team)*. Se ele reclamar do *Bundle Identifier*, troque `com.pedrobortolanza.abelhas` por algo único, como `com.pedrobortolanza.abelhas.teste`.
3. Ligue o iPhone no Mac pelo cabo, desbloqueie e toque em **Confiar**.
4. No topo do Xcode, escolha o seu iPhone como destino e clique em **▶ (Run)**.
5. Na primeira vez o iPhone bloqueia o app: vá em Ajustes > Geral > VPN e Gerenciamento de Dispositivo, toque no seu Apple ID e em **Confiar**. Depois abra o Honey Troop.

Limites da conta grátis da Apple: o app para de abrir depois de **7 dias** (é só repetir o passo 4 com o iPhone ligado ao Mac) e cada Apple ID pode ter até 3 apps assim ao mesmo tempo. Para o iPhone de um amigo, ligue o aparelho dele no seu Mac e repita os passos 3 a 5.

## Atualizar depois de mudanças no jogo

```
git pull
npm install
npm run app:ios      # iPhone (depois ▶ no Xcode)
```
No Android, baixe o APK novo em Actions e instale por cima.
