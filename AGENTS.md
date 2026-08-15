# AGENTS.md — UFERSA Mobile

Guia de contexto do projeto. Leia sempre que for iniciar uma sessão para não se perder.

## Visão geral

**UFERSA Mobile** — carteira universitária digital da UFERSA (QR do RU, grade de horários, disciplinas, materiais). App mobile-first, 100% offline: todos os dados são locais (mock + localStorage + disco/IndexedDB), não há backend nem chamadas de rede. Distribuído como **APK** via Capacitor (e também PWA).

## Stack

- **React 18 + TypeScript** (strict, `noUnusedLocals`)
- **Vite 6** + `vite-plugin-pwa` (PWA com service worker, `base: './'`)
- **Capacitor 8** — APK; `appId: br.edu.ufersa.mobile`; plugins: `@capacitor/filesystem`, `@capacitor-community/file-opener`, `@capacitor/share`
- **Tailwind CSS 3** (modo dark via classe `.dark`)
- **lucide-react** (ícones)
- **sharp** (devDependency) — usado para rasterizar o logo SVG → PNG
- Sem biblioteca de navegação/estado: tabs controladas no `App.tsx`, estado via Context + localStorage

## Comandos

```bash
npm run dev            # dev server
npm run build          # tsc -b && vite build (gera dist/ com PWA)
npm run preview        # pré-visualiza build
npm run cap:sync       # build + copia web assets para android/
npm run build:android  # cap:sync + gradle assembleDebug (gera APK debug)
```

Sempre rodar `npm run build` (valida TypeScript) após alterações.

**Build do APK**: requer Android SDK em `~/Android` (platform 36 + build-tools 36) com `ANDROID_HOME` definido. Primeiro build baixa Gradle/deps (demora).

**APK**: `android/app/build/outputs/apk/debug/app-debug.apk`.

## Estrutura

```
design/logo.svg          # fonte do logo (QR + capelo); ícones são gerados a partir dela
public/
  favicon.svg            # versão reduzida do logo
  icons/                 # icon-180/192/512/1024.png (PWA + iOS)
  favicons/              # favicons reais dos links úteis (offline)
src/
  App.tsx                # shell: tabs (home, schedule, ru, subjects) + modal de Settings
  main.tsx               # monta App dentro de MaterialsProvider
  types/index.ts         # Student, Subject, ScheduleEntry, QuickLink, ThemePreference, Material
  data/                  # dados padrão (mock): subjects, schedule, qrCode, student, quickLinks, campuses
  context/
    ScheduleContext.tsx  # grade+disciplinas persistidos em localStorage ('schedule')
    MaterialsContext.tsx # materiais: metadados em localStorage ('materials'), binário em disco/IndexedDB
  hooks/                 # useLocalStorage, useTheme, useProfile, useNow, useUserQrCode, useInstallPrompt, useCampus
  lib/
    storage.ts           # wrappers localStorage (prefixo ufersa-mobile:; migra ufersa-pocket:)
    fileStorage.ts       # adapter de arquivos: Capacitor Filesystem (APK) ou IndexedDB (web)
    materialFormat.ts    # ícone/cor por extensão + formatBytes
    time.ts, mockQr.ts, schedule.ts, subjectTone.ts
  pages/                 # HomePage, SchedulePage, RuPage, SubjectsPage, SettingsPage
  components/            # BottomNavigation, modais de forms, QRCodeDisplay, MaterialsSection, etc.
android/                 # projeto Android (gradle), configurado pelo Capacitor
```

## Convenções

- **Idioma do código**: nomes/types/mensagens em inglês; textos de UI em pt-BR.
- **Persistência**: tudo passa por `src/lib/storage.ts` (prefixo `ufersa-mobile:`) ou `useLocalStorage`. Falham silenciosamente. Chaves antigas `ufersa-pocket:` são migradas automaticamente; o `index.html` lê os dois prefixos para o tema.
- **Alias** `@/` → `src/`.
- **Estilo**: Tailwind, classes utilitárias, tema dark com prefixo `dark:`.
- **Sem comentários** salvo docstrings curtas explicando propósito.
- **UIDs**: helper `uid(prefix)` (`subj-*`, `ent-*`, `mat-*`).
- Plugins nativos do Capacitor importados dinamicamente (`import('@capacitor/...')`) para não inflar o bundle web.

## Estado atual (branch `develop`)

- **QR do RU**: mock por padrão (`src/data/qrCode.ts`, `USER_QR_CODE = ''`); o usuário define o próprio QR nas Configurações (upload de imagem → data URL no localStorage `qrCode`).
- **Campus configurável**: `src/data/campuses.ts` (Mossoró, Angicos, Caraúbas, Pau dos Ferros — padrão Pau dos Ferros) + `useCampus` (localStorage `campus`); refletido na tela do RU.
- **Grade editável** via modais (disciplinas + eventos avulsos) em `ScheduleContext`.
- **Materiais por disciplina**: importar/abrir/compartilhar/excluir (PDF, Word, slides, imagens…). Binário no disco do app (Capacitor `Directory.Data/materials/{id}`) ou IndexedDB `ufersa-mobile-files` (migra de `ufersa-pocket-files`).
- **Links úteis na Home**: SIGAA, Portal do Discente e Site da UFERSA, com favicons locais em `public/favicons/`.
- **Identidade visual**: logo QR+capelo (fonte `design/logo.svg`) em favicon, PWA e launcher Android (legado + adaptive icon + splash verde `#1d6a43`).
- Perfil, tema light/dark/system e notificações (visual) nas Configurações.
- PWA configurada (manifest + service worker no build). **Sem deploy feito** — PWA ainda não hospedada.

## Roadmap

- ~~Empacotar como APK~~ via Capacitor — **feito** (`br.edu.ufersa.mobile`).
- ~~Upload de materiais~~ por disciplina — **feito** (armazenamento local, offline).
- ~~Campus configurável~~ e ~~QR editável~~ — **feito**.
- Próximos passos possíveis: distribuição de materiais via backend, notificações push, sincronização com serviços oficiais da UFERSA.

## Regenerando ícones (se mudar o logo)

```bash
# A partir de design/logo.svg, gerar os PNGs (PWA, iOS e Android):
node -e "const sharp=require('sharp'); const s='design/logo.svg'; (async()=>{for(const [f,sz] of [['public/icons/icon-192.png',192],['public/icons/icon-512.png',512],['public/icons/icon-1024.png',1024],['public/icons/icon-180.png',180]]) await sharp(s,{density:300}).resize(sz,sz).png().toFile(f)})()"
```

Os mipmaps do Android (`ic_launcher*`, `splash*`) e o foreground do adaptive icon são derivados do mesmo SVG (ver `render-android` histórico); se o logo mudar, regenerar com sharp e `npx cap sync android`.