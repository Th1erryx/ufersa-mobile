# AGENTS.md — UFERSA Mobile

Guia de contexto do projeto. Leia sempre que for iniciar uma sessão para não se perder.

## Visão geral

**UFERSA Mobile** — carteira universitária digital da UFERSA (QR do RU, grade de horários, disciplinas, materiais). App mobile-first, 100% offline: todos os dados são locais (mock + localStorage + disco/IndexedDB), não há backend nem chamadas de rede. Distribuído como **APK** via Capacitor (e também PWA).

## Stack

- **React 18 + TypeScript** (strict, `noUnusedLocals`)
- **Vite 6** + `vite-plugin-pwa` (PWA com service worker, `base: './'`)
- **Capacitor 8** — APK; `appId: br.edu.ufersa.mobile`; plugins: `@capacitor/filesystem`, `@capacitor-community/file-opener`, `@capacitor/share`, `@capacitor/local-notifications`
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
- **Persistência**: tudo passa por `src/lib/storage.ts` (prefixo `ufersa-mobile:`) ou `useLocalStorage`. Falham silenciosamente. Chaves antigas `ufersa-pocket:` são migradas automaticamente; o `index.html` lê os dois prefixos para o tema. **Sincronização**: `saveJson`/`saveString` disparam um evento `ufersa-mobile:storage` na janela; `useLocalStorage` escuta esse evento para instâncias da mesma chave se atualizarem (ex.: Configurações → telas montadas). Não usar outra forma de comunicação cross-component para a mesma chave.
- **Alias** `@/` → `src/`.
- **Estilo**: Tailwind, classes utilitárias, tema dark com prefixo `dark:`.
- **Sem comentários** salvo docstrings curtas explicando propósito.
- **UIDs**: helper `uid(prefix)` (`subj-*`, `ent-*`, `mat-*`).
- Plugins nativos do Capacitor importados dinamicamente (`import('@capacitor/...')`) para não inflar o bundle web.

## Decisões de arquitetura (porquês)

Estas escolhas foram deliberadas — respeite-as e **não as reverta sem antes conversar com o usuário sobre o cenário que as justificaria**:

- **100% offline, sem backend**: decisão consciente. O app é pessoal e os dados são locais. Backend **só** faria sentido se um dia houver distribuição central de materiais (professor → turma) ou sincronização entre dispositivos. Antes disso, é over-engineering.
- **Sem login**: adiado de propósito. Exigiria infraestrutura de contas (Firebase Auth, Supabase…), conexão com a internet e manutenção. Só vale no cenário acima.
- **Materiais ficam no dispositivo**: binário no disco do app (APK) ou IndexedDB (web); metadados em localStorage. Preserva a natureza offline e dispensa serviço externo.
- **QR do RU é por usuário**: impossível conhecer o QR de cada pessoa, então é configurável nas Configurações (upload de imagem → data URL em `localStorage qrCode`). Valor padrão vazio mostra QR mock (`src/data/qrCode.ts`).
- **Campus configurável**: o autor é de Pau dos Ferros, mas qualquer pessoa pode trocar (4 campi, padrão Pau dos Ferros). Horários do RU seguem o portal oficial e são editáveis em `src/data/campuses.ts`.
- **APK via Capacitor** em vez de instalação por PWA no navegador: opção "profissional". `appId: br.edu.ufersa.mobile`.
- **Renomeado Pocket → Mobile preservando dados**: a migração automática de prefixos (`ufersa-pocket:` → `ufersa-mobile:`) e do IndexedDB (`ufersa-pocket-files` → `ufersa-mobile-files`) é intencional — nunca remover a compatibilidade legada.
- **Sem biblioteca de navegação/estado**: tabs manuais no `App.tsx` + Context e localStorage. O app é pequeno; isso evita dependências desnecessárias.
- **Links úteis com favicons locais** (`public/favicons/`): baixados e versionados para manter o offline-first — não usar serviço externo de favicons em runtime.
- **Identidade visual própria** (logo QR+capelo, fonte `design/logo.svg`): ao mudar o logo, regenerar os PNGs e os mipmaps Android (ver "Regenerando ícones").

## Estado atual (branch `develop`)

- **QR do RU**: mock por padrão (`src/data/qrCode.ts`, `USER_QR_CODE = ''`); o usuário define o próprio QR nas Configurações (upload de imagem → data URL no localStorage `qrCode`).
- **Campus configurável**: `src/data/campuses.ts` (Mossoró, Angicos, Caraúbas, Pau dos Ferros — padrão Pau dos Ferros) + `useCampus` (localStorage `campus`); refletido na tela do RU.
- **Grade editável** via modais (disciplinas + eventos avulsos + **provas**) em `ScheduleContext`. Provas (`ScheduleEntry.kind === 'exam'`) têm destaque visual (rosa), modal próprio (`EventDetailModal`), filtram no `WeeklyGrid` e entram na contagem regressiva da Home (`src/lib/schedule.ts` → `upcomingExams`).
- **Materiais por disciplina**: importar em lote (vários arquivos de uma vez), renomear, classificar por categoria (lista de exercícios, slides, prova, livro, anotações, outros), buscar, filtrar, **fixar (pin)** no topo e **reordenar manualmente** (mover acima/abaixo — só dentro da mesma disciplina), abrir, compartilhar e excluir (PDF, Word, slides, imagens…). Binário no disco do app (Capacitor `Directory.Data/materials/{id}`) ou IndexedDB `ufersa-mobile-files` (migra de `ufersa-pocket-files`).
- **Notificações locais** (`src/lib/notifications.ts`): aulas, provas e aberturas do RU agendadas no dispositivo via `@capacitor/local-notifications` (importado dinamicamente, no APK/Android). No navegador/PWA usa a **Web Notifications API** (agenda com `setTimeout` até a próxima ocorrência, reagenda após disparar) — limitação: no web só disparam com o app aberto. Toggles em Configurações (localStorage `notifications`), sincronizadas por `useNotificationSync` quando a grade/campus/preferências mudam. A permissão é solicitada na abertura do app **e** ao habilitar um toggle. **Não funciona no iOS**: o projeto não tem a plataforma `ios/` (precisa `npm i @capacitor/ios` + `npx cap add ios` + Xcode), e o Safari iOS não expõe a Web Notifications API.
- **Backup/restore** (`src/lib/backup.ts`): exporta um JSON único com grade, perfil, QR, campus, tema, notificações, **links personalizados** e materiais (incluindo binários base64). Restaura tudo de volta (inclui `importData` no `ScheduleContext`, `importMaterials` no `MaterialsContext` e `applyLinks` para `useCustomLinks`).
- **Links úteis personalizados**: além dos atalhos oficiais, o usuário pode adicionar/remover links próprios na Home (`useCustomLinks`, localStorage `quickLinks`; modal `QuickLinkModal`). Entram no backup/restore.
- **Apagar todos os dados**: em Configurações → Dados, botão de exclusão total com dupla confirmação (grade, perfil, QR, links, notificações, tema, campus e materiais incluindo binários via `clearMaterials` no `MaterialsContext`).
- **Cartão de perfil**: seção "Perfil" no topo das Configurações com nome, curso, período e RA do estudante (gradiente brand). **Editável no próprio cartão**: botão de lápis expande os campos (nome, curso, período, RA) com Salvar/Padrão; a foto é trocada clicando nela — sem foto abre o seletor direto, com foto abre um **visualizador em tela cheia estilo WhatsApp** (foto ampliada + botões "Alterar foto" e "Remover"). Removida a antiga seção duplicada "Editar informações pessoais" em Configurações → Dados.
- **Aulas concluídas na Home**: itens do dia que já terminaram esmaecem (opacidade + texto riscado) via `ScheduleItem done`.
- **Performance**: countdown do card em destaque isolado em `CountdownChip` (memo auto-tick a cada 60s) para não re-pintar o LCP; seções longas (Configurações) usam `.section-virtualize` (`content-visibility: auto`).
- **Links úteis na Home**: SIGAA, Portal do Discente e Site da UFERSA, com favicons locais em `public/favicons/`.
- **Identidade visual**: logo QR+capelo (fonte `design/logo.svg`) em favicon, PWA e launcher Android (legado + adaptive icon + splash verde `#1d6a43`).
- Perfil, tema light/dark/system e notificações (reais no APK, Web Notifications no navegador) nas Configurações.
- PWA configurada (manifest + service worker no build). **Sem deploy feito** — PWA ainda não hospedada.

## Roadmap

- ~~Empacotar como APK~~ via Capacitor — **feito** (`br.edu.ufersa.mobile`).
- ~~Upload de materiais~~ por disciplina — **feito** (armazenamento local, offline).
- ~~Campus configurável~~ e ~~QR editável~~ — **feito**.
- ~~Notificações locais~~ (aulas, provas, RU) — **feito**.
- ~~Backup/restore dos dados~~ (JSON único) — **feito**.
- Próximos passos possíveis: distribuição de materiais via backend, notificações push, sincronização com serviços oficiais da UFERSA.

## Regenerando ícones (se mudar o logo)

```bash
# A partir de design/logo.svg, gerar os PNGs (PWA, iOS e Android):
node -e "const sharp=require('sharp'); const s='design/logo.svg'; (async()=>{for(const [f,sz] of [['public/icons/icon-192.png',192],['public/icons/icon-512.png',512],['public/icons/icon-1024.png',1024],['public/icons/icon-180.png',180]]) await sharp(s,{density:300}).resize(sz,sz).png().toFile(f)})()"
```

Os mipmaps do Android (`ic_launcher*`, `splash*`) e o foreground do adaptive icon são derivados do mesmo SVG (ver `render-android` histórico); se o logo mudar, regenerar com sharp e `npx cap sync android`.

## Segurança (npm audit)

`npm audit` hoje reporta **3 vulnerabilidades moderadas**, todas em `uuid` via `xcode` → `@capacitor/cli`. São **só tooling de build** (rodei na máquina, não vão pro bundle web nem pro APK) — **não corrigir** com `npm audit fix --force`, pois rebaixaria `@capacitor/cli` 8.5.0 → 8.4.2 (breaking) sem ganho real. Reavaliar quando houver um 8.5.x/9.x estável com o fix.

Superfície real de segurança do app (offline, sem backend):
- **QR do RU fica em texto plano no `localStorage`** (`ufersa-mobile:qrCode`) — qualquer JS injetado no webview lê. Único dado sensível.
- Favicons/links úteis são estáticos (`public/favicons/`) — sem runtime.
- Não há rede, credenciais nem conteúdo dinâmico no app.