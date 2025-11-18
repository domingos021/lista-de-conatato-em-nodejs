// ===============================================
// 📘 ROTAS DE CONTATOS - CAMADA DE CONTROLE
// ===============================================
// Este arquivo define apenas as rotas HTTP e delega toda a lógica
// de negócio para o Service Layer (contactService.ts).
// Responsabilidades: receber requisições, validar entrada, chamar services e retornar respostas.

import express from "express";
import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import {
  findContactIndex,
  validateContactCreation,
} from "../validations/contactValidations.js";
import {
  getContacts,
  searchContacts,
  getContactById,
  addContact,
  updateContactInList,
  deleteContactById,
  removeDuplicateContacts,
  clearAllContacts,
} from "../services/contactService.js";
import type {
  Contact,
  CreateContactBody,
  UpdateContactBody,
  DeleteContactBody,
} from "../types/index.js";

const router = express.Router();

// ===============================================
// 🌐 ROTA RAIZ - DOCUMENTAÇÃO DA API
// ===============================================
// GET / → Confirma que a API está ativa e lista todas as rotas disponíveis
router.get("/", (_req, res) => {
  res.json({
    message: "API de Contatos funcionando!",
    routes: [
      "POST   /api/contatos/contato",          // Criar novo contato
      "GET    /api/contatos/contatos",         // Listar todos (aceita ?nome= e ?id=)
      "GET    /api/contatos/contato/:id",      // Buscar um contato específico
      "PUT    /api/contatos/contato",          // Atualizar contato existente
      "DELETE /api/contatos/contato",          // Deletar contato
      "DELETE /api/contatos/remove-duplicates",// Remover duplicados
      "POST   /api/contatos/clear",            // Limpar toda a lista
    ],
  });
});

// ===============================================
// ➕ POST /contato → CRIAR NOVO CONTATO
// ===============================================
router.post(
  "/contato",
  async (req: Request<{}, {}, CreateContactBody>, res: Response) => {
    const { id, fullName, surname, email, phone } = req.body;

    // ✅ Validação prévia: campos obrigatórios devem existir
    if (!fullName || !surname) {
      return res.status(400).json({ 
        error: "Nome e sobrenome são obrigatórios." 
      });
    }

    try {
      // 📂 Busca a lista atual de contatos
      const list = await getContacts();

      // ✅ Valida os dados do novo contato
      // Usa spread condicional para passar apenas propriedades definidas (compatível com exactOptionalPropertyTypes)
      const validationError = validateContactCreation(
        {
          ...(id !== undefined && { id }),              // Só adiciona 'id' se não for undefined
          fullName,                                      // Campo obrigatório
          surname,                                       // Campo obrigatório
          ...(email !== undefined && { email }),        // Só adiciona 'email' se não for undefined
          ...(phone !== undefined && { phone }),        // Só adiciona 'phone' se não for undefined
        },
        list
      );

      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      // 🆕 Cria o objeto do novo contato (gera UUID se não houver ID)
      const newContact: Contact = {
        id: id ?? randomUUID(),
        fullName,
        surname,
        email,
        phone,
      };

      // 💾 Adiciona o contato na lista através do service
      await addContact(newContact);

      return res.status(201).json({
        success: true,
        message: "Contato salvo com sucesso",
        contato: newContact,
      });
    } catch (err) {
      return res.status(500).json({ error: "Erro ao salvar contato" });
    }
  }
);

// ===============================================
// 📋 GET /contatos → LISTAR CONTATOS (COM FILTROS OPCIONAIS)
// ===============================================
router.get(
  "/contatos",
  async (
    req: Request<{}, {}, {}, { nome?: string; id?: string }>,
    res: Response
  ) => {
    try {
      // 🔍 Busca contatos aplicando filtros opcionais (nome e/ou id)
      const list = await searchContacts({
        ...(req.query.nome && { nome: req.query.nome }),
        ...(req.query.id && { id: req.query.id }),
      });

      return res.json({
        success: true,
        total: list.length,
        contatos: list,
      });
    } catch (err) {
      return res.status(500).json({ error: "Erro ao listar contatos" });
    }
  }
);

// ===============================================
// 🔍 GET /contato/:id → BUSCAR UM ÚNICO CONTATO
// ===============================================
router.get("/contato/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  // ✅ Validação: ID é obrigatório
  if (!id) {
    return res.status(400).json({ error: "ID é obrigatório." });
  }

  try {
    // 🔍 Busca o contato pelo ID através do service
    const contact = await getContactById(id);

    if (!contact) {
      return res.status(404).json({ error: "Contato não encontrado." });
    }

    return res.json({ success: true, contato: contact });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar contato." });
  }
});

// ===============================================
// ✏️ PUT /contato → ATUALIZAR CONTATO EXISTENTE
// ===============================================
router.put(
  "/contato",
  async (req: Request<{}, {}, UpdateContactBody>, res: Response) => {
    const { id, fullName, surname, email, phone } = req.body;

    // ✅ Validação: ID é obrigatório para atualização
    if (!id) {
      return res
        .status(400)
        .json({ error: "ID do contato é obrigatório para atualizar." });
    }

    try {
      // 📂 Busca a lista de contatos
      const list = await getContacts();

      // 🔍 Localiza o índice do contato na lista
      const index = findContactIndex(id, list);

      if (index === -1) {
        return res.status(404).json({ error: "Contato não encontrado." });
      }

      const contactToUpdate = list[index];
      if (!contactToUpdate) {
        return res
          .status(500)
          .json({ error: "Erro interno ao localizar contato." });
      }

      // 🔄 Cria o objeto atualizado mantendo valores anteriores se não fornecidos
      const updatedContact: Contact = {
        ...contactToUpdate,
        fullName: fullName ?? contactToUpdate.fullName,
        surname: surname ?? contactToUpdate.surname,
        email: email ?? contactToUpdate.email,
        phone: phone ?? contactToUpdate.phone,
      };

      // 💾 Salva a atualização através do service
      await updateContactInList(index, updatedContact);

      return res.json({
        success: true,
        message: "Contato atualizado com sucesso",
        contato: updatedContact,
      });
    } catch (err) {
      return res.status(500).json({ error: "Erro ao atualizar contato." });
    }
  }
);

// ===============================================
// 🗑️ DELETE /contato → REMOVER CONTATO POR ID
// ===============================================
router.delete(
  "/contato",
  async (req: Request<{}, {}, DeleteContactBody>, res: Response) => {
    const { id } = req.body;

    // ✅ Validação: ID é obrigatório para deletar
    if (!id) {
      return res
        .status(400)
        .json({ error: "É necessário informar o ID para deletar o contato." });
    }

    try {
      // 🗑️ Tenta deletar o contato através do service
      const wasDeleted = await deleteContactById(id);

      if (!wasDeleted) {
        return res.status(404).json({ error: "Contato não encontrado." });
      }

      return res.json({
        success: true,
        message: "Contato removido com sucesso.",
      });
    } catch (err) {
      return res
        .status(500)
        .json({ error: "Erro ao tentar remover o contato." });
    }
  }
);

// ===============================================
// 🧹 DELETE /remove-duplicates → REMOVER DUPLICADOS
// ===============================================
// Remove contatos duplicados baseado em:
// • Email (case-insensitive)
// • Telefone (apenas números)
// • Nome completo (fullName + surname, case-insensitive)
// Mantém sempre a primeira ocorrência encontrada.
router.delete("/remove-duplicates", async (_req: Request, res: Response) => {
  try {
    // 🧹 Remove duplicados através do service
    const result = await removeDuplicateContacts();

    return res.json({
      success: true,
      message: "Contatos duplicados removidos com sucesso!",
      removidos: result.removidos,
      totalAntes: result.totalAntes,
      totalDepois: result.totalDepois,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Erro ao remover contatos duplicados.",
    });
  }
});

// ===============================================
// 🗑️ POST /clear → LIMPAR TODA A LISTA
// ===============================================
router.post("/clear", async (_req: Request, res: Response) => {
  try {
    // 🗑️ Limpa todos os contatos através do service
    await clearAllContacts();

    return res.json({
      success: true,
      message: "Lista de contatos limpa com sucesso.",
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Erro ao limpar a lista de contatos." });
  }
});

// ===============================================
// 📤 EXPORTAÇÃO
// ===============================================
export default router;