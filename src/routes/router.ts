// ===============================================
// 📘 CRUD DE CONTATOS COM EXPRESS E NODE.JS
// ===============================================
// Este módulo define rotas para criar, listar, atualizar, deletar
// e limpar contatos, utilizando funções auxiliares importadas
// de utils/fileHelpers e validações de validations/contactValidations.

import express from "express";
import type { Request, Response } from "express";
import {
  readContactList,
  saveContactList,
  clearContactList,
} from "../utils/fileHelpers.js";
import { randomUUID } from "crypto";
import {
  findContactIndex, // Localiza o índice de um contato na lista pelo ID
  validateContactCreation, // Valida todos os campos necessários para criar um novo contato
} from "../validations/contactValidations.js";
import type {
  Contact,
  CreateContactBody,
  UpdateContactBody,
  DeleteContactBody,
} from "../types/index.js";

const router = express.Router(); // ✅ Instância do roteador Express

// ===============================================
// 🌐 ROTAS PRINCIPAIS
// ===============================================

// GET / → Confirma que a API está ativa e funcionando
router.get("/", (req, res) => {
  res.json({
    message: "API de Contatos funcionando!",
    routes: [
      "POST   /api/contatos/contato", // Criar novo contato
      "GET    /api/contatos/contatos", // Listar todos os contatos (aceita ?nome= e ?id=)
      "GET    /api/contatos/contato/:id", // Buscar apenas um contato pelo ID
      "PUT    /api/contatos/contato", // Atualizar contato existente
      "DELETE /api/contatos/contato", // Deletar contato
      "DELETE /api/contatos/remove-duplicates", // Remover contatos duplicados
      "POST   /api/contatos/clear", // Limpar toda a lista de contatos
    ],
  });
});

// ===============================================
// POST /contato → Criar um novo contato
// ===============================================
router.post(
  "/contato",
  async (req: Request<{}, {}, CreateContactBody>, res: Response) => {
    const { id, fullName, surname, email, phone } = req.body; // Recebe dados do corpo da requisição

    try {
      const list = await readContactList(); // 📂 Lê a lista do arquivo/ cria um (list) que armazena a lista de contato

      const validationError = validateContactCreation(
        { id, fullName, surname, email, phone }, // dados do contato
        list // lista de contatos existentes
      );

      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      // 🆕 Cria o novo contato (usa o ID enviado ou gera UUID)
      const newContact: Contact = {
        id: id ?? randomUUID(),
        fullName,
        surname,
        email,
        phone,
      };

      list.push(newContact);
      await saveContactList(list);

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
// GET /contatos → Listar todos os contatos (com filtros opcionais)
// ===============================================
router.get(
  "/contatos",
  async (
    req: Request<{}, {}, {}, { nome?: string; id?: string }>,
    res: Response
  ) => {
    try {
      let list = await readContactList();

      // 🔍 Filtro por nome (busca em fullName e surname, case-insensitive)
      if (req.query.nome) {
        const searchName = req.query.nome.toLowerCase();
        list = list.filter(
          (c) =>
            c.fullName.toLowerCase().includes(searchName) ||
            c.surname.toLowerCase().includes(searchName)
        );
      }

      // 🔍 Filtro por ID (busca exata)
      if (req.query.id) {
        list = list.filter((c) => String(c.id) === String(req.query.id));
      }

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
// GET /contato/:id → Buscar um único contato pelo ID
// ===============================================
router.get("/contato/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const list = await readContactList();
    const contact = list.find((c) => String(c.id) === String(id));

    if (!contact) {
      return res.status(404).json({ error: "Contato não encontrado." });
    }

    return res.json({ success: true, contato: contact });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar contato." });
  }
});

// ===============================================
// PUT /contato → Atualizar contato pelo ID
// ===============================================
router.put(
  "/contato",
  async (req: Request<{}, {}, UpdateContactBody>, res: Response) => {
    const { id, fullName, surname, email, phone } = req.body;

    if (!id)
      return res
        .status(400)
        .json({ error: "ID do contato é obrigatório para atualizar." });

    try {
      const list = await readContactList();
      const index = findContactIndex(id, list);

      if (index === -1)
        return res.status(404).json({ error: "Contato não encontrado." });

      const contactToUpdate = list[index];
      if (!contactToUpdate)
        return res
          .status(500)
          .json({ error: "Erro interno ao localizar contato." });

      list[index] = {
        ...contactToUpdate,
        fullName: fullName ?? contactToUpdate.fullName,
        surname: surname ?? contactToUpdate.surname,
        email: email ?? contactToUpdate.email,
        phone: phone ?? contactToUpdate.phone,
      };

      await saveContactList(list);

      return res.json({
        success: true,
        message: "Contato atualizado com sucesso",
        contato: list[index],
      });
    } catch (err) {
      return res.status(500).json({ error: "Erro ao atualizar contato." });
    }
  }
);

// ===============================================
// DELETE /contato → Remover contato pelo ID
// ===============================================
router.delete(
  "/contato",
  async (req: Request<{}, {}, DeleteContactBody>, res: Response) => {
    const { id } = req.body;

    if (!id)
      return res
        .status(400)
        .json({ error: "É necessário informar o ID para deletar o contato." });

    try {
      const list = await readContactList();
      const filteredList = list.filter((c) => c.id !== id);

      if (filteredList.length === list.length)
        return res.status(404).json({ error: "Contato não encontrado." });

      await saveContactList(filteredList);

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
// 🗑️ DELETE /remove-duplicates → Remover contatos duplicados
// ===============================================
// Esta rota percorre toda a lista de contatos e remove duplicações
// com base em:
//  • email (case-insensitive)
//  • phone (apenas números)
//  • combinação fullName + surname (case-insensitive)
//
// Mantém sempre a primeira ocorrência e remove as demais.
// Útil para limpar dados antigos inseridos antes das validações.
// ===============================================
router.delete("/remove-duplicates", async (_req: Request, res: Response) => {
  try {
    const list = await readContactList(); // 📂 Lê a lista atual

    const seenEmails = new Set<string>(); // 🔹 Armazena emails já vistos para identificar duplicatas (case-insensitive)
    const seenPhones = new Set<string>(); // 🔹 Armazena números de telefone já vistos para identificar duplicatas (somente números)
    const seenNames = new Set<string>(); // 🔹 Armazena combinações fullName + surname já vistas para identificar duplicatas (case-insensitive)

    const cleanedList: Contact[] = [];
    let removedCount = 0;

    for (const c of list) {
      // 🔹 Cria uma chave de email (minúscula e sem espaços extras) para checar duplicatas
      const emailKey = c.email?.toLowerCase().trim();

      // 🔹 Cria uma chave de telefone removendo todos os caracteres não numéricos
      const phoneKey = c.phone?.replace(/\D/g, "");

      // 🔹 Cria uma chave combinando fullName + surname (minúscula e sem espaços extras)
      const nameKey = `${c.fullName.toLowerCase().trim()}-${c.surname
        .toLowerCase()
        .trim()}`;

      // 🔹 Verifica se já vimos esse email, telefone ou combinação de nome
      const isDuplicate =
        (emailKey && seenEmails.has(emailKey)) ||
        (phoneKey && seenPhones.has(phoneKey)) ||
        seenNames.has(nameKey);

      // 🔹 Se for duplicado, incrementa contador e pula para o próximo contato
      if (isDuplicate) {
        removedCount++;
        continue; // ❌ ignora contatos duplicados
      }

      // Marca como visto ✔
      if (emailKey) seenEmails.add(emailKey);
      if (phoneKey) seenPhones.add(phoneKey);
      seenNames.add(nameKey);

      cleanedList.push(c);
    }

    // ✍️ Salva somente os contatos únicos
    await saveContactList(cleanedList);

    return res.json({
      success: true,
      message: "Contatos duplicados removidos com sucesso!",
      removidos: removedCount,
      totalAntes: list.length,
      totalDepois: cleanedList.length,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Erro ao remover contatos duplicados.",
    });
  }
});

// ===============================================
// POST /clear → Limpar toda a lista de contatos
// ===============================================
router.post("/clear", async (_req: Request, res: Response) => {
  try {
    await clearContactList();
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
