// ========================================
// 📦 Importações
// ========================================
import express from "express";
import helmet from "helmet";
import router from "./routes/router.js";

// ========================================
// 🚀 Criação do Servidor
// ========================================
const server = express();

// ========================================
// 🧩 Middlewares Globais
// ========================================
server.use(helmet());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// ========================================
// 🌐 Rotas
// ========================================
// 🔥 Prefixo único para todas as rotas de contatos
server.use("/api/contatos", router);

// ===============================================
// 🌐 ROTAS DA API DE CONTATOS
// ===============================================

// GET     /api/contatos
// Rota raiz da API. Retorna mensagem de status e lista de todas as rotas disponíveis.
// Útil para testar se a API está funcionando corretamente.

// POST    /api/contatos/contato
// Cria um novo contato. Recebe dados no corpo da requisição (JSON).
// Se não for enviado o ID, será gerado automaticamente um UUID.
// Campos obrigatórios: fullName, surname. Campos opcionais: email, phone.

// GET     /api/contatos/contatos
// Retorna todos os contatos salvos atualmente.
// Aceita query params opcionais: ?nome= e ?id= para filtrar resultados.
// Útil para listar todos os contatos existentes ou buscar contatos específicos.

// GET     /api/contatos/contato/:id
// Retorna um único contato pelo ID informado na URL.
// Útil para buscar dados antes de atualizar.

// PUT     /api/contatos/contato
// Atualiza um contato existente pelo ID.
// Apenas os campos enviados no corpo da requisição são atualizados.
// Campos obrigatórios: id. Campos opcionais para atualização: fullName, surname, email, phone.

// DELETE  /api/contatos/contato
// Remove um contato pelo ID informado no corpo da requisição.
// Retorna mensagem de sucesso ou erro caso o contato não exista.

// DELETE  /api/contatos/remove-duplicates
// Remove contatos duplicados com base em email, telefone ou combinação nome+sobrenome.
// Mantém a primeira ocorrência encontrada e remove todas as demais.
// Útil para limpar dados duplicados inseridos antes das validações serem implementadas.

// POST    /api/contatos/clear
// Limpa toda a lista de contatos, apagando o conteúdo do arquivo e criando um novo arquivo vazio.
// Útil para resetar a lista durante testes ou manutenção.

// ========================================
// 🚫 Tratamento de rotas não encontradas (404)
// ========================================
server.use((req, res) => {
  res.status(404).json({
    error: "Rota não encontrada",
    path: req.path,
    method: req.method,
    suggestion: "Acesse /api/contatos para ver as rotas disponíveis",
  });
});

// ========================================
// ⚙️ Inicialização do Servidor
// ========================================
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📋 Documentação: http://localhost:${PORT}/api/contatos`);
});