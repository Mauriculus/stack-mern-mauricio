# Diretrizes do Projeto

## Contexto do Projeto
- O objetivo descrito no README é um sistema para ensino de autonomia doméstica, com foco em usuários e aulas/conteúdo compartilhado.
- O repositório ainda contém nomes herdados do template original, como "appointments" e "agendamentos". Trate esses nomes como legado quando isso não conflitar com a implementação atual.
- Priorize manter a linguagem visível ao usuário em português.

## Build e Execução
- Instale as dependências separadamente em cada pasta: `/server` e `/client`.
- Inicie o backend com `npm run dev` dentro de `/server`.
- Inicie o frontend com `npm start` dentro de `/client`.
- A URL padrão do backend é `http://localhost:7777`.
- Há script de teste no frontend via `react-scripts`, mas não existe suíte automatizada própria configurada no backend.

## Ambiente e Banco de Dados
- Crie um arquivo `.env` dentro de `/server` antes de executar o servidor.
- Variáveis obrigatórias: `MONGO_URI`, `JWT_SECRET`, `PORT`.
- Se o `JWT_SECRET` estiver ausente ou incorreto, a autenticação por token falha.

## Arquitetura Backend e Frontend
- O backend fica em `/server` e usa CommonJS (`require` e `module.exports`).
- A entrada principal é `server/server.js`, que conecta o banco e monta as rotas `/api/users` e `/api/appointments`.
- O backend segue o fluxo rota -> controller -> model.
- Os models ficam em `/server/models` e usam Mongoose.
- O middleware de autenticação está em `server/middleware/authMiddleware.js`.
- O frontend fica em `/client`, com React e Bootstrap.
- A estrutura mais importante do frontend é:
  - `/src/pages` para as páginas React
  - `/src/components` para componentes reutilizáveis
  - `/public/index.html` como página base da aplicação
  - `/public/images` para imagens estáticas

## Convenções
- No frontend, siga o padrão atual do projeto com imports/exports normais nos arquivos React; não presuma que o pacote está configurado como `type: module`.
- Mantenha os nomes dos Schemas explícitos nas definições do Mongoose para evitar problemas de nomenclatura e pluralização.
- Mantenha rotas protegidas com `authMiddleware` antes dos controllers quando a rota exigir autenticação.
- Se surgir necessidade de regra por perfil, valide primeiro se já existe middleware correspondente antes de introduzir uma nova camada.
- Siga o estilo atual dos controllers: funções assíncronas com `try/catch` e respostas HTTP claras.
- Preserve a consistência dos textos e comentários já existentes ao editar arquivos com interface voltada ao usuário.

## Armadilhas Comuns
- Não assuma que `server/server.js` carrega models automaticamente; ele apenas inicializa o servidor, conecta o banco e registra rotas.
- Não use o caminho `server/middlewares`; neste repositório o diretório é `server/middleware`.
- Não aponte a pasta de imagens para `public/imagens`; o caminho real é `public/images`.
- As rotas e páginas relacionadas a agendamentos podem ser parte de um legado do template e não devem ser tratadas como requisito central sem confirmar com o README.

## Referências Principais
- [README.md](../README.md) para o contexto funcional do projeto
- [server/server.js](../server/server.js) para inicialização e montagem de rotas
- [server/routes/userRoutes.js](../server/routes/userRoutes.js) para o padrão de rotas
- [server/controllers/userController.js](../server/controllers/userController.js) para o padrão de respostas e erros
- [server/middleware/authMiddleware.js](../server/middleware/authMiddleware.js) para autenticação JWT
- [client/src/App.js](../client/src/App.js) para as rotas do frontend