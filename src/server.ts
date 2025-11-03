import express from "express";                     // ✅ Importa o framework Express para criar o servidor
import helmet from "helmet";                       // ✅ Importa Helmet para adicionar segurança HTTP ao servidor
import router from "./routes/index.js";           // ✅ Importa o roteador principal da aplicação

const server = express();                          // ✅ Cria uma instância do servidor Express

// Middlewares
server.use(helmet());                              // ✅ Adiciona Helmet como middleware para proteger cabeçalhos HTTP
server.use(express.json());                        // ✅ Habilita o servidor para entender requisições com JSON no corpo (body)
server.use(express.urlencoded({ extended: true })); // ✅ Habilita o servidor a interpretar dados enviados via formulário (x-www-form-urlencoded)

// Rotas
server.use('/', router);                           // ✅ Todas as requisições que chegam na raiz '/' serão tratadas pelo router

// Definição da porta HTTP
const PORT = 3000;                                 // ✅ Define a porta em que o servidor vai rodar
server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`); // ✅ Mensagem no console quando o servidor iniciar
});
