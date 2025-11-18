// ===============================================
// 📌 VALIDAÇÕES DE CONTATO - PROFISSIONAL E CONSISTENTE
// ===============================================
// Este módulo centraliza todas as validações de contato para:
// - Criação de novos contatos
// - Atualização de contatos existentes
// - Prevenção de duplicidade
// Mantém o código limpo, organizado e reutilizável.
// ===============================================

import type { Contact, ContactValidation } from "../types/index.js";

// ===============================================
// 🔎 VALIDAÇÕES BÁSICAS (campos obrigatórios)
// ===============================================
// Valida os campos essenciais de um contato.
// Retorna mensagem de erro ou null se tudo estiver válido.
export function validateBasicFields(contact: ContactValidation): string | null {
  const { fullName, surname, email, phone } = contact;

  // 🔹 Validação: Nome (mínimo 2 caracteres)
  if (!fullName || fullName.trim().length < 2) {
    return "Nome precisa ter pelo menos 2 caracteres.";
  }

  // 🔹 Validação: Sobrenome (mínimo 3 caracteres)
  if (!surname || surname.trim().length < 3) {
    return "Sobrenome precisa ter pelo menos 3 caracteres.";
  }

  // 🔹 Validação: Email (formato básico com @)
  if (email && !email.includes("@")) {
    return "Email inválido. Deve conter @";
  }

  // 🔹 Validação: Telefone (mínimo 8 dígitos numéricos)
  if (phone) {
    const digitsOnly = phone.replace(/\D/g, ""); // Remove caracteres não numéricos
    if (digitsOnly.length < 8) {
      return "Telefone precisa ter pelo menos 8 dígitos.";
    }
  }

  return null; // ✔ Sem erros
}

// ===============================================
// 🔐 VERIFICAÇÃO DE ID DUPLICADO
// ===============================================
// Verifica se já existe um contato com o mesmo ID na lista.
// Retorna mensagem de erro ou null se o ID for único.
export function validateDuplicateId(
  id: string | number,
  list: Contact[]
): string | null {
  if (id && list.some((c) => c.id === id)) {
    return `O ID "${id}" já existe. Escolha outro ID.`;
  }
  return null; // ✔ ID único
}

// ===============================================
// 🔐 VERIFICAÇÃO DE CAMPOS DUPLICADOS
// ===============================================
// Verifica duplicidade baseando-se em:
// • Combinação fullName + surname (case-insensitive)
// • Email (case-insensitive)
// • Telefone (apenas dígitos)
//
// IMPORTANTE: Nome e sobrenome são validados JUNTOS, não separadamente.
// Isso permite cadastrar "João Silva" e "João Santos" sem conflito.
export function validateDuplicateFields(
  contact: Partial<ContactValidation>,
  list: Contact[]
): string | null {
  const { fullName, surname, email, phone } = contact;

  // 🔹 Validação: Combinação Nome + Sobrenome
  // Permite múltiplos "João" desde que o sobrenome seja diferente
  // Só valida se AMBOS fullName e surname estiverem presentes
  if (fullName && surname) {
    const nameKey = `${fullName.toLowerCase().trim()}-${surname
      .toLowerCase()
      .trim()}`;

    const hasDuplicateName = list.some((c) => {
      const existingKey = `${c.fullName.toLowerCase().trim()}-${c.surname
        .toLowerCase()
        .trim()}`;
      return existingKey === nameKey;
    });

    if (hasDuplicateName) {
      return `O contato "${fullName} ${surname}" já está cadastrado.`;
    }
  }

  // 🔹 Validação: Email duplicado (case-insensitive)
  if (email) {
    const emailKey = email.toLowerCase().trim();
    const hasDuplicateEmail = list.some(
      (c) => c.email?.toLowerCase().trim() === emailKey
    );

    if (hasDuplicateEmail) {
      return `O email "${email}" já está em uso.`;
    }
  }

  // 🔹 Validação: Telefone duplicado (compara apenas números)
  if (phone) {
    const phoneKey = phone.replace(/\D/g, ""); // Remove tudo exceto dígitos
    const hasDuplicatePhone = list.some((c) => {
      const existingPhone = c.phone?.replace(/\D/g, "");
      return existingPhone === phoneKey;
    });

    if (hasDuplicatePhone) {
      return `O telefone "${phone}" já está cadastrado.`;
    }
  }

  return null; // ✔ Sem duplicidade
}

// ===============================================
// 🔍 LOCALIZAR ÍNDICE DE UM CONTATO PELO ID
// ===============================================
// Percorre a lista de contatos e retorna o índice do contato
// que possui o ID informado. Retorna -1 se não encontrar.
export function findContactIndex(
  id: string | number,
  list: Contact[]
): number {
  return list.findIndex((c) => c.id === id);
}

// ===============================================
// ✅ VALIDAÇÃO COMPLETA PARA CRIAÇÃO DE CONTATO
// ===============================================
// Valida todos os requisitos necessários para criar um novo contato:
// 1. Campos básicos obrigatórios
// 2. ID único (se fornecido)
// 3. Sem duplicidade de dados (nome+sobrenome, email, telefone)
export function validateContactCreation(
  contact: ContactValidation,
  list: Contact[]
): string | null {
  // 1️⃣ Validar campos obrigatórios
  const basicError = validateBasicFields(contact);
  if (basicError) return basicError;

  // 2️⃣ Validar ID duplicado (se ID for fornecido)
  if (contact.id) {
    const idError = validateDuplicateId(contact.id, list);
    if (idError) return idError;
  }

  // 3️⃣ Validar duplicidade de dados
  const duplicateError = validateDuplicateFields(contact, list);
  if (duplicateError) return duplicateError;

  return null; // ✔ Tudo válido, pode criar
}

// ===============================================
// ♻️ VALIDAÇÃO PARA ATUALIZAÇÃO DE CONTATO
// ===============================================
// Valida a atualização de um contato existente.
// Diferente da criação, aqui os campos são opcionais (Partial).
// Ignora o próprio contato sendo atualizado ao verificar duplicidades.
export function validateContactUpdate(
  contact: Partial<ContactValidation>,
  list: Contact[],
  currentId: string | number
): string | null {
  // 🔹 Se campos foram enviados, validar apenas os que existem
  if (contact.fullName !== undefined || contact.surname !== undefined) {
    // Validação de tamanho mínimo
    if (contact.fullName !== undefined && contact.fullName.trim().length < 2) {
      return "Nome precisa ter pelo menos 2 caracteres.";
    }

    if (contact.surname !== undefined && contact.surname.trim().length < 3) {
      return "Sobrenome precisa ter pelo menos 3 caracteres.";
    }
  }

  // 🔹 Validar email se foi enviado
  if (contact.email !== undefined && contact.email && !contact.email.includes("@")) {
    return "Email inválido. Deve conter @";
  }

  // 🔹 Validar telefone se foi enviado
  if (contact.phone !== undefined && contact.phone) {
    const digitsOnly = contact.phone.replace(/\D/g, "");
    if (digitsOnly.length < 8) {
      return "Telefone precisa ter pelo menos 8 dígitos.";
    }
  }

  // 🔹 Remover o próprio contato da lista antes de verificar duplicidades
  // Isso evita que ele "conflite consigo mesmo"
  const filteredList = list.filter((c) => c.id !== currentId);

  // 🔹 Validar duplicidade nos demais contatos
  const duplicateError = validateDuplicateFields(contact, filteredList);
  if (duplicateError) return duplicateError;

  return null; // ✔ Atualização válida
}