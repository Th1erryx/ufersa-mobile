# Arquitetura

Este documento descreve como o **UFERSA Mobile** é organizado, como os dados
fluem e por que as principais decisões técnicas foram tomadas. Leia junto com
o [`AGENTS.md`](../AGENTS.md) (que contém as convenções e os "porquês").

## Visão geral

Aplicativo **mobile-first**, **100% offline** e **sem backend**: todos os
dados são locais (mock + `localStorage` + disco/IndexedDB). Distribuído como
**APK** via Capacitor e também como **PWA**.

```
┌─────────────────────────────────────────────┐
│                  React 18                    │
│  App.tsx (shell + tabs + gate de onboarding) │
│        │           │           │             │
│  ┌─────┴───┐  ┌────┴─────┐  ┌──┴─────────┐   │
│  │ Pages   │  │ Contexts │  │ Hooks/libs │   │
│  │ (UI)    │  │ (estado) │  │ (lógica)   │   │
│  └─────────┘  └──────────┘  └────────────┘   │
│        │           │           │             │
│  ┌─────┴───────────┴───────────┴─────────┐   │
│  │        Persistência (local)           │   │
│  │  localStorage (ufersa-mobile:)        │   │
│  │  disco do app / IndexedDB (materiais) │   │
│  └───────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## Estado e navegação

- **Sem biblioteca de navegação/estado** — o app é pequeno e isso evita
  dependências. As tabs são controladas manualmente no `App.tsx`; o estado de
  dados vem de Contexts + `localStorage`.
- **Gate de onboarding**: a flag `onboarded` (localStorage) decide se o app
  mostra `OnboardingPage` ou o shell completo.

## Persistência

| Dado           | Onde fica                                   | Chave               |
| -------------- | ------------------------------------------- | ------------------- |
| Grade + disc.  | `localStorage` (ScheduleContext)            | `schedule`          |
| Materiais      | `localStorage` + binário em disco/IndexedDB | `materials`         |
| Notas          | `localStorage` (GradesContext)              | `grades`            |
| Perfil         | `localStorage` (useProfile)                 | `profile`           |
| QR do RU       | `localStorage` (useUserQrCode)              | `qrCode`            |
| Campus         | `localStorage` (useCampus)                  | `campus`            |
| Tema           | `localStorage` (useTheme)                   | `theme`             |
| Notificações   | `localStorage`                              | `notifications`     |
| Links úteis    | `localStorage` (useCustomLinks)             | `quickLinks`        |

Tudo passa por `src/lib/storage.ts` (prefixo `ufersa-mobile:`) ou
`useLocalStorage`. Detalhes em [`STORAGE.md`](STORAGE.md).

**Sincronização cross-component**: `saveJson`/`saveString` disparam o evento
`ufersa-mobile:storage` na janela; `useLocalStorage` escuta esse evento e
atualiza instâncias da mesma chave (ex.: Configurações → telas montadas).

## Materiais

- **Metadados** em `localStorage` (`materials`); **binário** no disco do app
  (Capacitor `Directory.Data/materials/{id}`) ou IndexedDB `ufersa-mobile-files`
  no navegador.
- `src/lib/fileStorage.ts` é o adaptador: resolve automaticamente entre o
  Filesystem do Capacitor (APK) e o IndexedDB (web).
- Importação em lote, renomear, categorizar, fixar (pin), reordenar manualmente,
  buscar, abrir, compartilhar e excluir.

## Notificações

- `src/lib/notifications.ts` monta os lembretes (aulas, provas, RU) e agenda.
- `useNotificationSync` (dentro de `ScheduleProvider`) **reagenda tudo** sempre
  que a grade, o campus ou as preferências mudam.
- **Android (APK)**: usa `@capacitor/local-notifications` → `AlarmManager`.
  Funciona **com o app fechado**. Canais separados por categoria
  (aulas/provas/RU).
- **Web/PWA**: usa a **Web Notifications API** com `setTimeout` até a próxima
  ocorrência (reagenda após disparar). Limitação: no navegador só disparam com
  o app aberto.
- **iOS**: não suportado — o projeto não tem a plataforma `ios/` e o Safari iOS
  não expõe a Web Notifications API.

## QR do RU

- Por usuário: upload de imagem → data URL em `localStorage` (`qrCode`).
- Valor padrão vazio mostra um QR mock (`src/data/qrCode.ts`).

## Campus

- Configurável via `useCampus` (localStorage `campus`); 4 campi com padrão
  Pau dos Ferros. Horários do RU em `src/data/campuses.ts`.

## Backup/restore

- `src/lib/backup.ts` exporta um JSON único (grade, perfil, QR, campus, tema,
  notificações, links e materiais com binários base64) e restaura tudo de
  volta (incluindo `importData`, `importMaterials` e `applyLinks`).

## Deploy / distribuição

- **PWA**: build Vite + `vite-plugin-pwa` (`dist/`). `vercel.json` configurado
  para deploy na Vercel (headers de segurança + SPA rewrite).
- **APK**: Capacitor → Android Gradle. `appId: br.edu.ufersa.mobile`.

## Decision log

Decisões arquiteturais deliberadas (não reverter sem conversar com o autor):

1. **100% offline, sem backend** — pessoal, dados locais.
2. **Sem login** — adiado de propósito; exigiria infraestrutura de contas.
3. **Materiais no dispositivo** — preserva offline, sem serviço externo.
4. **QR por usuário** — impossível conhecer o QR de cada pessoa; é configurável.
5. **APK via Capacitor** — opção "profissional".
6. **Renomeado Pocket → Mobile preservando dados** — migrações legadas nunca
   removidas.
7. **Sem biblioteca de navegação/estado** — app pequeno.
8. **Links úteis com favicons locais** — offline-first.
9. **Identidade visual própria** — logo QR+capelo (fonte `design/logo.svg`).