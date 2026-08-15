# AGENTS.md — UFERSA Mobile

Guia de contexto do projeto. Leia sempre que for iniciar uma sessão para não se perder.

## Visão geral

**UFERSA Mobile** — carteira universitária digital da UFERSA (QR do RU, grade de horários, disciplinas). App mobile-first, 100% offline: todos os dados são locais (mock + localStorage), não há backend nem chamadas de rede.

## Stack

- **React 18 + TypeScript** (strict)
- **Vite 6** + `vite-plugin-pwa` (PWA com service worker, `base: './'`)
- **Capacitor 8** (`@capacitor/android`) — empacotamento APK; appId `br.edu.ufersa.mobile`
- **Tailwind CSS 3** (modo dark via classe `.dark`)
- **lucide-react** (ícones)
- Sem biblioteca de navegação/estado: tabs controladas no `App.tsx`, estado via Context + localStorage

## Comandos

```bash
npm run dev           # dev server
npm run build         # tsc -b && vite build (gera dist/ com PWA)
npm run preview       # pré-visualiza build
npm run cap:sync      # build + copia web assets para android/
npm run build:android # cap:sync + gradle assembleDebug (gera APK debug)
```

Sempre rodar `npm run build` (valida TypeScript) após alterações.

**Build do APK**: requer Android SDK (`~/Android`) com platform 36 + build-tools; definir `ANDROID_HOME`. Primeiro build baixa Gradle/deps (demora).

## Estrutura

```
src/
  App.tsx                 # shell: tabs (home, schedule, ru, subjects) + modal de Settings
  main.tsx                # monta App dentro de MaterialsProvider
  types/index.ts          # Student, Subject, ScheduleEntry, QuickLink, ThemePreference, Material
  data/                   # dados padrão (mock): subjects, schedule, qrCode, student, quickLinks
  context/
    ScheduleContext.tsx   # grade+disciplinas persistidos em localStorage
    MaterialsContext.tsx  # materiais: metadados em localStorage, binário em disco/IndexedDB
  hooks/                  # useLocalStorage, useTheme, useProfile, useNow, useUserQrCode, useInstallPrompt, useCampus
  lib/
    storage.ts            # wrappers localStorage (prefixo ufersa-mobile:)
    fileStorage.ts        # adapter de arquivos: Capacitor Filesystem (APK) ou IndexedDB (web)
    materialFormat.ts     # ícone/cor por extensão + formatBytes
    time.ts, mockQr.ts, schedule.ts, subjectTone.ts
  data/                   # + campuses.ts (4 campi com horários do RU)
  pages/                  # HomePage, SchedulePage, RuPage, SubjectsPage, SettingsPage
  components/             # BottomNavigation, modais de forms, QRCodeDisplay, MaterialsSection, etc.
```

## Convenções

- **Idioma do código**: nomes/types/mensagens em inglês; textos de UI em pt-BR.
- **Persistência**: tudo passa por `src/lib/storage.ts` (prefixo `ufersa-mobile:`; migra chaves antigas `ufersa-pocket:` automaticamente) ou `useLocalStorage`. Falham silenciosamente.
- **Alias** `@/` → `src/`.
- **Estilo**: Tailwind, classes utilitárias, tema dark com prefixo `dark:`.
- **Sem comentários** salvo docstrings curtas explicando propósito.
- **UIDs**: helper `uid(prefix)` no `ScheduleContext` (`subj-*`, `ent-*`).

## Estado atual (branch `develop`)

- v1.0 funcional: QR do RU (mock), grade editável (disciplinas/eventos via modais), lista de disciplinas, perfil, tema light/dark/system.
- **Materiais por disciplina** (v1.1): importar PDF, Word, slides, imagens etc. via seletor de arquivos; abrir, compartilhar e excluir. Binário no disco do app (Capacitor) ou IndexedDB (web); metadados em localStorage.
- **Campus configurável**: os 4 campi da UFERSA (Mossoró, Angicos, Caraúbas, Pau dos Ferros) com horários do RU; escolha persistida em localStorage e refletida na tela do QR.
- **QR do RU editável** nas Configurações (campo de URL/data URL ou upload de imagem com preview).
- **Links úteis na Home**: apenas SIGAA, Portal do Discente e Site da UFERSA, com favicons reais armazenados em `public/favicons/`.
- **Identidade visual**: logo próprio (QR + capelo) em SVG/PNG — favicon, PWA e launcher Android (legado + adaptive + splash verde).
- Capacitor configurado (`capacitor.config.ts`, plataforma `android/`), APK debug buildável via `npm run build:android`.
- PWA configurada (manifest + service worker gerados no build). Sem deploy feito ainda.

## Roadmap

- ~~Empacotar como APK~~ via Capacitor — **feito** (appId `br.edu.ufersa.mobile`).
- ~~Upload de materiais~~ por disciplina — **feito** (armazenamento local, offline).
- Próximos passos possíveis: distribuição de materiais via backend, notificações, sincronização com serviços oficiais da UFERSA.