// ===============================================
// 📌 VALIDAÇÕES DE CONTATO — COMPLETO E PROFISSIONAL
// ===============================================
// Este módulo centraliza todas as validações de contato para:
// - criação
// - edição
// - prevenção de duplicidade
// Deixa o código limpo, organizado e reutilizável.
// ===============================================

import type { Contact, ContactValidation } from "../types/index.js";

// ===============================================
// 🔎 VALIDAÇÕES BÁSICAS (campos obrigatórios)
// ===============================================
export function validateBasicFields(contact: ContactValidation): string | null {
  const { fullName, surname, email, phone } = contact;

  if (!fullName || fullName.length < 2)
    return "Nome precisa ter pelo menos 2 caracteres";

  if (!surname || surname.length < 3)
    return "Sobrenome precisa ter pelo menos 3 caracteres";

  if (email && !email.includes("@"))
    return "Email inválido";

  if (phone && phone.length < 8)
    return "Telefone precisa ter pelo menos 8 dígitos";

  return null; // ✔ sem erros
}

// ===============================================
// 🔐 VERIFICAÇÃO DE ID DUPLICADO
// ===============================================
export function validateDuplicateId(id: string | number, list: Contact[]): string | null {
  if (id && list.some(c => c.id === id)) {
    return `O ID "${id}" já existe. Escolha outro ID.`;
  }
  return null;
}

// ===============================================
// 🔐 VERIFICAÇÃO DE CAMPOS DUPLICADOS
// ===============================================
export function validateDuplicateFields(
  contact: ContactValidation,
  list: Contact[]
): string | null {

  const { fullName, surname, email, phone } = contact;

  if (fullName && list.some(c => c.fullName.toLowerCase() === fullName.toLowerCase())) {
    return `O nome "${fullName}" já está cadastrado.`;
  }

  if (surname && list.some(c => c.surname.toLowerCase() === surname.toLowerCase())) {
    return `O sobrenome "${surname}" já está cadastrado.`;
  }

  if (email && list.some(c => c.email?.toLowerCase() === email.toLowerCase())) {
    return `O email "${email}" já está em uso.`;
  }

  if (phone && list.some(c => c.phone === phone)) {
    return `O telefone "${phone}" já está cadastrado.`;
  }

  return null; // ✔ sem duplicidade
}

// ===============================================
// 🔍 ENCONTRAR CONTATO PELO ID
// ===============================================
// ===============================================
// 🔍 LOCALIZAR ÍNDICE DE UM CONTATO PELO ID
// ===============================================
// Esta função percorre a lista de contatos e retorna o índice
// do contato que possui o ID informado. Se não encontrar,
// retorna -1.
export function findContactIndex(id: string | number, list: Contact[]): number {
  // 🔹 Procura o índice do primeiro contato cujo ID seja igual ao informado
  return list.findIndex(c => c.id === id);
}


// ===============================================
// ✅ VALIDAÇÃO COMPLETA PARA CRIAÇÃO DE CONTATO
// ===============================================
export function validateContactCreation(
  contact: ContactValidation,
  list: Contact[]
): string | null {

  // 1. Validar campos obrigatórios
  const basicError = validateBasicFields(contact);
  if (basicError) return basicError;

  // 2. Validar ID duplicado
  if (contact.id) {
    const idError = validateDuplicateId(contact.id, list);
    if (idError) return idError;
  }

  // 3. Validar duplicidade de nome/email/telefone/sobrenome
  const duplicateError = validateDuplicateFields(contact, list);
  if (duplicateError) return duplicateError;

  return null; // ✔ Tudo válido
}

// ===============================================
// ♻️ VALIDAÇÃO PARA ATUALIZAÇÃO (PATCH / PUT)
// ===============================================
export function validateContactUpdate(
  contact: Partial<ContactValidation>,
  list: Contact[],
  currentId: string | number
): string | null {

  // 1. Validar campos básicos (somente os enviados)
  const basicError = validateBasicFields(contact);
  if (basicError) return basicError;

  // 2. Evitar duplicidade, exceto o próprio item sendo atualizado
  const filteredList = list.filter(c => c.id !== currentId);

  const duplicateError = validateDuplicateFields(contact, filteredList);
  if (duplicateError) return duplicateError;

  return null; // ✔ Atualização válida
}
