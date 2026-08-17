# Segurança

Postura de segurança do **UFERSA Mobile** e como reportar vulnerabilidades.

## Modelo de ameaças

O app é **100% offline e sem backend**: não há servidor, credenciais,
chamadas de rede ou conteúdo dinâmico em runtime. Isso reduz drasticamente a
superfície de ataque. Os vetores relevantes são:

- **Dados sensíveis no dispositivo** — o **QR do RU** é o único dado
  sensível, e fica **em texto plano no `localStorage`**
  (`ufersa-mobile:qrCode`). Qualquer script injetado no webview consegue lê-lo.
- **Injeção de código no webview** — mitigada por não haver conteúdo remoto
  carregado em runtime (favicons/links úteis são estáticos em
  `public/favicons/`).
- **Dependências de build** — apenas tooling; não vão para o bundle web nem
  para o APK (ver abaixo).

## Práticas adotadas

- Headers de segurança no `vercel.json` (CSP, HSTS, `X-Frame-Options`,
  `Permissions-Policy` etc.).
- Sem chamadas de rede no app; PWA offline-first.
- Plugins nativos do Capacitor importados dinamicamente (não inflam o bundle).
- Permissões Android limitadas às estritamente necessárias
  (notificações, arquivos, alarmes exatos).

## Vulnerabilidades conhecidas (tooling de build)

`npm audit` reporta **3 vulnerabilidades moderadas**, todas em `uuid` via
`xcode` → `@capacitor/cli`. São **só tooling de build** (não vão para o bundle
web nem para o APK). **Não corrigir** com `npm audit fix --force`, pois
rebaixaria `@capacitor/cli` 8.5.0 → 8.4.2 (breaking) sem ganho real. Reavaliar
quando houver um 8.5.x/9.x estável com o fix.

## Reportando vulnerabilidades

Se você encontrou uma falha de segurança, **não abra uma issue pública** com os
detalhes. Envie um e-mail para o autor descrevendo:

- o passo a passo para reproduzir;
- o impacto potencial;
- a versão afetada.

Resposta esperada em até alguns dias. Obrigado por contribuir para a segurança
do projeto!