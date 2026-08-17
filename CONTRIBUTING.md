# Contribuindo com o UFERSA Mobile

Obrigado pelo interesse em contribuir! Este documento explica como participar
do projeto da forma certa.

## Índice

- [Código de conduta](#código-de-conduta)
- [Como começar](#como-começar)
- [Convenções do projeto](#convenções-do-projeto)
- [Fluxo de contribuição](#fluxo-de-contribuição)
- [Rodando o projeto](#rodando-o-projeto)
- [Testes e validação](#testes-e-validação)
- [Licença e uso institucional/comercial](#licença-e-uso-institucionalcomercial)

## Código de conduta

Este projeto preza por um ambiente respeitoso e colaborativo. Seja cordial,
forneça contexto nas discussões e aceite feedback construtivo. Comportamentos
abusivos não são tolerados.

## Como começar

1. **Leia o `AGENTS.md`** — ele contém o contexto do projeto, as convenções de
   código e as decisões de arquitetura (e os porquês de cada uma). **Não
   reverta decisões arquiteturais** sem antes conversar com o autor sobre o
   cenário que as justificaria.
2. **Crie um fork** do repositório e clone localmente.
3. **Escolha uma issue** (ou proponha uma nova) e comente que vai trabalhar
   nela.
4. **Crie uma branch** descritiva a partir de `develop`.

## Convenções do projeto

- **Idioma do código**: nomes, tipos e mensagens em **inglês**; textos de UI
  em **pt-BR**.
- **Sem comentários** salvo docstrings curtas explicando o propósito.
- **Persistência**: tudo passa por `src/lib/storage.ts` (prefixo
  `ufersa-mobile:`) ou `useLocalStorage`. Não use outra forma de comunicação
  cross-component para a mesma chave.
- **Alias** `@/` → `src/`.
- **Estilo**: Tailwind CSS, utilitários, tema dark com prefixo `dark:`.
- **UIDs**: use o helper `uid(prefix)` (`subj-*`, `ent-*`, `mat-*`).
- **Plugins nativos do Capacitor**: sempre importados dinamicamente
  (`import('@capacitor/...')`).
- **Migrações legadas**: a compatibilidade com o prefixo antigo
  `ufersa-pocket:` e o IndexedDB `ufersa-pocket-files` é intencional — **nunca
  remova**.

## Fluxo de contribuição

1. Faça suas alterações na branch.
2. Rode a validação (veja abaixo).
3. **Rode `npm run build`** — valida o TypeScript (strict, `noUnusedLocals`).
4. Commite com mensagens claras no padrão do projeto
   (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).
5. Abra um **Pull Request** para a branch `develop` descrevendo o que foi feito
   e por quê, e referenciando a issue relacionada (se houver).

## Rodando o projeto

```bash
npm install
npm run dev        # dev server
npm run build      # tsc -b && vite build (valida TypeScript)
npm run preview    # pré-visualiza o build
```

Para o APK Android, consulte [`docs/BUILDING.md`](docs/BUILDING.md).

## Testes e validação

- A validação principal é o **TypeScript strict** via `npm run build`.
- Não há suíte de testes automatizados hoje; mudanças devem ser verificadas
  manualmente no navegador (PWA) e, quando aplicável, no APK Android.
- Para mudanças visuais, teste os dois temas (claro e escuro).

## Licença e uso institucional/comercial

Ao contribuir, você concorda que sua contribuição estará sujeita à licença do
projeto ([`LICENSE.md`](LICENSE.md)): o software pode ser usado livremente para
**fins pessoais**, mas o uso **institucional ou comercial** exige autorização
prévia e por escrito do autor (Thierry de Andrade Fontes).

Contribuições são bem-vindas como **aprendizado e uso pessoal**. Se uma
instituição deseja usar ou distribuir o projeto (inclusive contribuições),
contate o autor.