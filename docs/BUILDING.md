# Build

Como compilar o **UFERSA Mobile** em todas as plataformas.

## Comandos principais

```bash
npm install             # instala dependências
npm run dev             # dev server (Vite)
npm run build           # tsc -b && vite build → dist/ (PWA completa)
npm run preview         # pré-visualiza o build de produção
npm run cap:sync        # build + copia web assets para android/
npm run build:android   # cap:sync + gradle assembleDebug → APK debug
```

Sempre rode `npm run build` após alterações — ele valida o **TypeScript strict**
(`noUnusedLocals`).

## Build web / PWA

- Vite 6 com `base: './'` (caminhos relativos — facilita empacotamento com
  Capacitor via `file://`).
- `vite-plugin-pwa` gera o manifest + service worker (mode `generateSW`).
- O `vercel.json` já está configurado para deploy na Vercel:
  - headers de segurança (CSP, HSTS, `X-Frame-Options`, `Permissions-Policy`…);
  - SPA rewrite;
  - cache imutável para `/assets/` e `/icons/`; `no-cache` para `index.html`,
    `sw.js`, `registerSW.js` e `manifest.webmanifest`.

```bash
npm run build
npm run preview          # testar localmente o build
# ou, para deploy: push na Vercel (framework: vite, output: dist)
```

## APK Android (Capacitor)

### Pré-requisitos

- **Android SDK** em `~/Android` (platform 36 + build-tools 36)
- **`ANDROID_HOME`** definido (ex.: `export ANDROID_HOME=$HOME/Android`)
- **Java 17+**
- Opcional: `android/local.properties` com `sdk.dir=/home/thierry/Android`
  (agiliza builds sem depender do `ANDROID_HOME`)

### Gerar o APK

```bash
npm run build:android
```

Resultado:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

> ⚠️ **Primeiro build**: baixa o Gradle e as dependências — pode demorar
> vários minutos.

### Ajustes específicos de Android

- `appId`: `br.edu.ufersa.mobile`
- `versionCode 2` / `versionName "1.2.0"` (AndroidManifest/gradle)
- Barras do sistema: `values-v35/styles.xml` usa
  `android:windowOptOutEdgeToEdgeEnforcement="true"` para o Android 15+ não
  desenhar sob a barra de navegação.

## Regenerando ícones (se o logo mudar)

A fonte do logo é `design/logo.svg` (QR + capelo). Para regenerar os PNGs
(PWA, iOS e Android):

```bash
node -e "const sharp=require('sharp'); const s='design/logo.svg'; (async()=>{for(const [f,sz] of [['public/icons/icon-192.png',192],['public/icons/icon-512.png',512],['public/icons/icon-1024.png',1024],['public/icons/icon-180.png',180]]) await sharp(s,{density:300}).resize(sz,sz).png().toFile(f)})()"
```

Os mipmaps do Android (`ic_launcher*`, `splash*`) e o foreground do adaptive
icon derivam do mesmo SVG. Se o logo mudar, regenerar com sharp e rodar
`npx cap sync android`.

## Segurança de build

- `npm audit` reporta 3 vulnerabilidades moderadas em `uuid` via `xcode` →
  `@capacitor/cli`. São **só tooling de build** — não vão para o bundle web
  nem para o APK. **Não** rodar `npm audit fix --force` (rebaixaria o
  `@capacitor/cli`). Ver [`SECURITY.md`](../SECURITY.md).