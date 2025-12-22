# Golden Raspberry Awards API

Uma API RESTful para gerenciar e consultar dados do Golden Raspberry Awards (Prêmios Framboesa de Ouro).

## Arquitetura

Este projeto segue os princípios da Clean Architecture:

```
src/
├── domain/              # Lógica de negócio e entidades (independente de tecnologia)
│   ├── entities/        # Entidades de domínio (Movie, Producer)
│   ├── interfaces/      # Interfaces de repositório
│   └── value-objects/   # Objetos de valor (AwardInterval)
├── application/         # Casos de uso e serviços de negócio
│   ├── services/        # Serviços de lógica de negócio
│   └── dtos/           # Objetos de Transferência de Dados (DTOs)
├── infrastructure/      # Preocupações externas (DB, CSV, logging)
│   ├── repositories/    # Implementações de repositório
│   ├── data/           # Utilitários de carregamento de dados
│   └── logging/        # Implementação de logging
├── presentation/        # Camada de API (controllers, middleware)
│   ├── controllers/     # Controllers REST
│   └── middleware/      # Middleware Express
│   └── openapi/         # Definições OpenAPI/Swagger
└── config/             # Configuração da aplicação
```

### Princípios de Design

- Princípios SOLID
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple, Stupid)
- Clean Code
- Injeção de Dependência (TypeDI)
- Padrão Repository
- Roteamento baseado em Decoradores (routing-controllers)

## Funcionalidades

- Operações CRUD: Operações completas de Criação, Leitura, Atualização e Exclusão para filmes
- Intervalos de Produtores: Cálculo de intervalos mín/máx de prêmios para produtores
- Carregamento de Dados CSV: Ingestão automática de dados do CSV ao iniciar
- Testes Abrangentes: Testes unitários, de integração e E2E com cobertura >80%
- Segurança: Helmet, CORS, limitação de taxa (rate limiting)
- Logging: Logging estruturado com IDs de correlação (nível `http` para requisições)
- Health Check: Endpoint para monitoramento de integridade
- Suporte Docker: Dockerfile multi-estágio pronto para produção

## Pré-requisitos

- Node.js versão 24.12
- npm versão 11.6.2
- Docker (opcional)

## Instalação

### Desenvolvimento Local

1. Clone o repositório
   ```bash
   cd golden-raspberry-api
   ```

2. Instale as dependências
   ```bash
   npm install
   ```
> [!NOTE]
> Se você encontrar erros de resolução de dependência durante a instalação, use:
> `npm install --legacy-peer-deps`

3. Configure o ambiente
   ```bash
   cp .env.example .env
   # Edite o .env se necessário
   ```

4. Execute em modo de desenvolvimento
   ```bash
   npm run dev
   ```

   A API estará disponível em http://localhost:3000

### Via Docker

1. Construa e execute com Docker Compose
   ```bash
   docker-compose up -d
   ```

2. Ou construa manualmente
   ```bash
   docker build -t golden-raspberry-api .
   docker run -p 3000:3000 golden-raspberry-api
   ```

### Documentação Interativa (Swagger)

A API disponibiliza uma interface interativa do Swagger para exploração dos endpoints:

- **Swagger UI:** http://localhost:3000/api-docs
- **OpenAPI Spec (JSON):** http://localhost:3000/openapi.json

> [!NOTE]
> A documentação Swagger está disponível apenas em ambiente de desenvolvimento (`NODE_ENV !== 'production'`).

### Collections para Teste

Para facilitar os testes da API, foi incluida collection do Postman que pode ser importada:

- [Golden Raspberry API - Postman Collection](file:///Users/madmazz/Projects/test/golden-raspberry-api/golden-raspberry-api.postman_collection.json)

**Como importar:**
1. Abra o Postman ou Insomnia.
2. Clique em **Import**.
3. Selecione o arquivo `golden-raspberry-api.postman_collection.json` na raiz do projeto.
4. As requisições estarão organizadas por categorias (Health, Producers, Movies).

### Base URL
```
http://localhost:3000
```

### Endpoints

#### Verificação de Integridade (Health Check)
```http
GET /health
```

**Resposta:**
```json
{
  "status": "healthy",
  "uptime": 123,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

---

#### Obter Intervalos de Prêmios de Produtores
```http
GET /api/producers/award-intervals
```

Retorna os produtores com os intervalos mínimo e máximo entre prêmios consecutivos.

**Resposta:**
```json
{
  "min": [
    {
      "producer": "Producer Name",
      "interval": 1,
      "previousWin": 1990,
      "followingWin": 1991
    }
  ],
  "max": [
    {
      "producer": "Another Producer",
      "interval": 13,
      "previousWin": 2002,
      "followingWin": 2015
    }
  ]
}
```

---

#### Listar Todos os Filmes
```http
GET /api/movies
```

**Resposta:**
```json
[
  {
    "id": "uuid",
    "year": 1980,
    "title": "Can't Stop the Music",
    "studios": "Associated Film Distribution",
    "producers": ["Allan Carr"],
    "winner": true
  }
]
```

---

#### Obter Filme por ID
```http
GET /api/movies/:id
```

**Resposta:**
```json
{
  "id": "uuid",
  "year": 1980,
  "title": "Can't Stop the Music",
  "studios": "Associated Film Distribution",
  "producers": ["Allan Carr"],
  "winner": true
}
```

**Resposta de Erro (404):**
```json
{
  "error": {
    "message": "Movie with id {id} not found",
    "correlationId": "uuid",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### Criar Filme
```http
POST /api/movies
Content-Type: application/json
```

**Corpo da Requisição:**
```json
{
  "year": 2024,
  "title": "New Movie",
  "studios": "Studio Name",
  "producers": "Producer 1, Producer 2",
  "winner": false
}
```

**Resposta (201):**
```json
{
  "id": "generated-uuid",
  "year": 2024,
  "title": "New Movie",
  "studios": "Studio Name",
  "producers": ["Producer 1", "Producer 2"],
  "winner": false
}
```

**Regras de Validação:**
- year: Inteiro, mínimo 1900
- title: String, obrigatório, máximo 500 caracteres
- studios: String, obrigatório, máximo 500 caracteres
- producers: String, obrigatório, máximo 1000 caracteres
- winner: Booleano, obrigatório

---

#### Atualizar Filme
```http
PUT /api/movies/:id
Content-Type: application/json
```

**Corpo da Requisição (todos os campos opcionais):**
```json
{
  "title": "Updated Title",
  "winner": true
}
```

**Resposta (200):**
```json
{
  "id": "uuid",
  "year": 1980,
  "title": "Updated Title",
  "studios": "Original Studios",
  "producers": ["Original Producer"],
  "winner": true
}
```

---

#### Excluir Filme
```http
DELETE /api/movies/:id
```

**Resposta (204):** No content (Sem conteúdo)

**Resposta de Erro (404):**
```json
{
  "error": {
    "message": "Movie with id {id} not found",
    "correlationId": "uuid",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## Testes

### Executar Todos os Testes
```bash
npm test
```

### Executar Testes por Tipo
```bash
# Apenas testes unitários
npm run test:unit

# Apenas testes de integração
npm run test:integration

# Apenas testes E2E
npm run test:e2e

# Modo watch
npm run test:watch

# Relatório de cobertura
npm run test:coverage
```

### Limites de Cobertura
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

## Desenvolvimento

### Scripts Disponíveis

```bash
# Desenvolvimento com hot reload
npm run dev

# Build para produção
npm run build

# Iniciar build de produção
npm start

# Executar linter
npm run lint

# Corrigir problemas de linting
npm run lint:fix

# Formatar código
npm run format

# Verificar formatação
npm run format:check

# Verificação de tipos
npm run typecheck
```

### Ferramentas de Qualidade de Código

- TypeScript: Modo estrito habilitado
- ESLint: Guia de estilo Airbnb + regras TypeScript
- Prettier: Formatação de código consistente
- Jest: Framework de testes com cobertura

## Docker

### Build Multi-Estágio

O Dockerfile utiliza um build multi-estágio para otimização:

1. Base: Instala dependências de produção
2. Build: Compila o TypeScript
3. Test: Executa testes (opcional)
4. Production: Imagem de runtime mínima

### Otimização do Tamanho da Imagem

- Utiliza imagem base alpine
- Cache de camadas para dependências
- Apenas arquivos de produção na imagem final
- Usuário não-root para segurança

### Build Sem Testes
```bash
docker build --target production -t golden-raspberry-api .
```

### Build Com Testes
```bash
docker build -t golden-raspberry-api .
```

## Formato dos Dados

A aplicação carrega dados de `data/Movielist.csv` com o seguinte formato:

```csv
year;title;studios;producers;winner
1980;Can't Stop the Music;Associated Film Distribution;Allan Carr;yes
1980;Cruising;Lorimar Productions;Jerry Weintraub;
```

### Parsing de Produtores

Os produtores são extraídos do CSV usando as seguintes regras:
- Dividir por vírgula (,)
- Dividir pela palavra "and"
- Remover espaços em branco
- Filtrar strings vazias

Exemplo: "Producer 1, Producer 2 and Producer 3" -> ["Producer 1", "Producer 2", "Producer 3"]

## Recursos de Segurança

- Helmet: Cabeçalhos de segurança
- CORS: Compartilhamento de recursos entre origens configurável
- Rate Limiting: Prevenção de abusos (padrão de 100 requisições por 15 minutos)
- Validação de Entrada: class-validator para validação de DTOs
- Usuário Docker não-root: O container roda como um usuário sem privilégios de root

## Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|---------|-------------|
| NODE_ENV | development | Ambiente (development/production) |
| PORT | 3000 | Porta do servidor |
| HOST | 0.0.0.0 | Host do servidor |
| LOG_LEVEL | http | Nível de log (http/info/warn/error/debug) - Use `http` para ver logs de requisição |
| RATE_LIMIT_WINDOW_MS | 900000 | Janela de limite de taxa (15 minutos) |
| RATE_LIMIT_MAX_REQUESTS | 100 | Máximo de requisições por janela |
| CORS_ORIGIN | * | Origens permitidas pelo CORS |
| CSV_FILE_PATH | ./data/Movielist.csv | Caminho para o arquivo CSV de dados |

## Autor

Victor Mota Mazzei
