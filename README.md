# admin masterdata v2

Admin app VTEX IO para gerenciamento de entidades do **Master Data v2**.

## Tecnologias

| Builder    | Versão | Descrição                       |
| ---------- | ------ | ------------------------------- |
| `admin`    | 0.x    | Navegação e rotas no Admin VTEX |
| `react`    | 3.x    | Componentes frontend            |
| `node`     | 6.x    | Backend / resolvers GraphQL     |
| `graphql`  | 1.x    | Schema GraphQL                  |
| `messages` | 1.x    | Internacionalização (i18n)      |

**Dependências:** `vtex.styleguide@9.x`

---

## Estrutura

```
admin-masterdatav2/
├── manifest.json                  # Metadados e builders do app
├── .vtexignore
│
├── admin/
│   ├── navigation.json            # Itens do sidebar do Admin
│   └── routes.json                # Mapeamento rota → componente
│
├── messages/
│   ├── en-US.json                 # Strings em inglês
│   └── pt-BR.json                 # Strings em português
│
├── graphql/
│   └── schema.graphql             # Tipos, Queries e Mutations
│
├── node/
│   ├── index.ts                   # Entry point do serviço
│   ├── service.json               # Configuração do serviço
│   ├── package.json
│   ├── tsconfig.json
│   ├── clients/
│   │   ├── index.ts               # Agregador de clients
│   │   └── masterDataClient.ts    # HTTP client para Master Data v2
│   └── resolvers/
│       ├── query.ts               # Resolvers de Query
│       └── mutation.ts            # Resolvers de Mutation
│
└── react/
    ├── AdminApp.tsx               # Home / landing page
    ├── RecordsPage.tsx            # Página de registros (CRUD)
    ├── SchemaPage.tsx             # Página de visualização do schema
    ├── components/
    │   ├── AdminApp.tsx
    │   ├── RecordsPage.tsx
    │   └── SchemaPage.tsx
    └── graphql/
        └── queries.ts             # Queries/mutations para react-apollo
```

---

## Como rodar localmente

```bash
# 1. Faça login na sua conta VTEX
vtex login <sua-conta>

# 2. Use um workspace de desenvolvimento
vtex use dev

# 3. Instale dependências do node
cd node && yarn install && cd ..

# 4. Faça o link do app
vtex link
```

O app ficará disponível em:
`https://<workspace>--<conta>.myvtex.com/admin/masterdatav2`

---

## Páginas

| Rota                          | Componente    | Descrição                   |
| ----------------------------- | ------------- | --------------------------- |
| `/admin/masterdatav2`         | `AdminApp`    | Home com cards de navegação |
| `/admin/masterdatav2/records` | `RecordsPage` | CRUD completo de registros  |
| `/admin/masterdatav2/schema`  | `SchemaPage`  | Visualização do schema      |

---

## GraphQL

### Queries

- `getRecords(dataEntityId, page, pageSize, where, sort)` — lista registros com paginação
- `getRecord(dataEntityId, id)` — busca um registro
- `getSchema(dataEntityId)` — retorna o schema da entidade

### Mutations

- `createRecord(dataEntityId, fields)` — cria registro
- `updateRecord(dataEntityId, id, fields)` — atualiza registro
- `deleteRecord(dataEntityId, id)` — remove registro
