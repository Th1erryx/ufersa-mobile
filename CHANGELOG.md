# Changelog

Todas as mudanças relevantes do **UFERSA Mobile**.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o
projeto adere ao [SemVer](https://semver.org/lang/pt-BR/).

## [1.2.0] — 2026-08

### Adicionado

- **Onboarding** no primeiro acesso (nome, curso e período) com gate em
  `App.tsx`.
- **Notificações por categoria** com canais Android separados (aulas/provas/RU)
  e textos contextuais (aula com sala, prova "Bom estudo!", RU com horário de
  fechamento).
- Alarme inexato + `allowWhileIdle` (dispara com o app fechado no Android 12+,
  sem exigir a permissão especial de "alarmes exatos").
- Seção **Instalar** sempre visível nas Configurações (com instruções por
  plataforma: Android, iOS e navegador).
- Documentação completa do projeto (README, LICENSE, CONTRIBUTING, SECURITY,
  docs/ e CHANGELOG).

### Corrigido

- Foto e informações do perfil não se apagam mais mutuamente (merge no
  `useProfile.update`).
- Barra de navegação do Android não cobre mais as abas após reload
  (`values-v35/styles.xml` com opt-out do edge-to-edge no Android 15+).
- Mês das provas em base 0 para o plugin nativo (agendava no mês errado).
- Dia da semana deslocado 1 dia no caminho web das notificações
  (`nextOccurrence`).
- Detecção de iPadOS 13+ para a seção Instalar.

### Mudado

- Renomeado para **UFERSA Mobile** (rebranding Pocket → Mobile preservando os
  dados via migração automática de prefixos).
- Versão Android: `versionCode 2` / `versionName "1.2.0"`.

## [1.1.0] — 2026-07

### Adicionado

- Empacotamento como **APK** via Capacitor (`br.edu.ufersa.mobile`).
- **Materiais por disciplina** (importação em lote, renomear, categorizar,
  pin, reordenar, abrir, compartilhar e excluir) — binário no disco do app ou
  IndexedDB.
- **Campus configurável** (Mossoró, Angicos, Caraúbas, Pau dos Ferros).
- **QR do RU editável** (upload de imagem pelo usuário).
- **Links úteis** na Home com favicons locais (SIGAA, Portal do Discente, site
  da UFERSA).
- **Backup/restore** em um único JSON (incluindo binários dos materiais).
- **Apagar todos os dados** com dupla confirmação.
- Notificações locais (aulas, provas, RU) — nativas no APK, Web Notifications
  no navegador.
- Tema claro/escuro/sistema.

### Corrigido

- Diversos ajustes de UX e identidade visual.

## [1.0.0] — 2026-06

### Adicionado

- **UFERSA Pocket** (nome original): carteira universitária digital com QR do
  RU, grade de horários, disciplinas e dados locais.
- PWA configurada (manifest + service worker).
- Base: React 18 + TypeScript + Vite + Tailwind CSS.