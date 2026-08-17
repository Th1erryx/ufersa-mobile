# Armazenamento

Como o **UFERSA Mobile** guarda os dados no dispositivo.

## Camadas

1. **`localStorage`** — dados pequenos e estruturados (grade, perfil, preferências).
2. **Disco do app / IndexedDB** — binários dos materiais.

Toda escrita passa por `src/lib/storage.ts` ou `useLocalStorage`.

## Prefixo e migração

- Chaves atuais usam o prefixo **`ufersa-mobile:`**.
- Chaves legadas **`ufersa-pocket:`** são migradas automaticamente na leitura
  (o app foi renomeado Pocket → Mobile preservando os dados). **Não remover**
  essa compatibilidade.
- O `index.html` lê os dois prefixos para aplicar o tema antes da renderização.

## Chaves de `localStorage`

| Chave                     | Tipo            | Uso                                   |
| ------------------------- | --------------- | ------------------------------------- |
| `ufersa-mobile:onboarded` | `boolean`       | Gate de onboarding (primeiro acesso)  |
| `ufersa-mobile:schedule`  | `object`        | Grade: `{ subjects, entries }`        |
| `ufersa-mobile:materials` | `array`         | Metadados dos materiais               |
| `ufersa-mobile:grades`    | `array`         | Notas por disciplina                  |
| `ufersa-mobile:profile`   | `object`        | Nome, curso, período, RA, foto        |
| `ufersa-mobile:qrCode`    | `string`        | QR do RU (data URL) — **dado sensível** |
| `ufersa-mobile:campus`    | `string`        | ID do campus selecionado              |
| `ufersa-mobile:theme`     | `string`        | `light` \| `dark` \| `system`         |
| `ufersa-mobile:notifications` | `object`    | Toggles de notificações               |
| `ufersa-mobile:quickLinks` | `array`        | Links úteis personalizados            |

> Todas as chaves podem estar ausentes (falha silenciosa); os hooks aplicam
> valores padrão.

## Materiais (binário)

| Plataforma | Armazenamento                       |
| ---------- | ----------------------------------- |
| APK        | Disco do app (Capacitor `Directory.Data/materials/{id}`) |
| Web/PWA    | IndexedDB `ufersa-mobile-files`     |

- O IndexedDB legado `ufersa-pocket-files` também é migrado.
- `src/lib/fileStorage.ts` resolve o adaptador correto por plataforma.
- `src/lib/materialFormat.ts` mapeia extensão → ícone/cor e formata tamanhos.

## Sincronização entre abas

`saveJson`/`saveString` disparam o evento `ufersa-mobile:storage` na `window`.
`useLocalStorage` escuta esse evento e atualiza instâncias da mesma chave
(ex.: mudar uma preferência nas Configurações reflete na Home sem reload).

## Backup

`src/lib/backup.ts` empacota todas as chaves acima (mais os binários dos
materiais em base64) em um único JSON exportável/restaurável.