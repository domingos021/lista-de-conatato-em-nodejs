// ===============================================
// 📦 SERVICE LAYER - LÓGICA DE NEGÓCIO DE CONTATOS
// ===============================================
// Este arquivo contém toda a lógica de negócio relacionada aos contatos.
// Responsabilidades: manipular dados, aplicar regras de negócio e interagir com a camada de persistência.
// O Router apenas chama estas funções, mantendo a separação de responsabilidades.

import {
  readContactList,
  saveContactList,
  clearContactList,
} from "../utils/fileHelpers.js";
import type { Contact } from "../types/index.js";

// ===============================================
// 📋 LISTAR TODOS OS CONTATOS
// ===============================================
// Retorna a lista completa de contatos sem filtros.
// Usada internamente por outras funções e pelo router quando não há filtros.
export const getContacts = async (): Promise<Contact[]> => {
  return await readContactList();
};

// ===============================================
// 🔍 BUSCAR CONTATOS COM FILTROS
// ===============================================
// Busca contatos aplicando filtros opcionais de nome e/ou ID.
// • nome: busca case-insensitive em fullName e surname
// • id: busca exata por ID
// Retorna array vazio se nenhum contato corresponder aos filtros.
export const searchContacts = async (filters: {
  nome?: string;
  id?: string;
}): Promise<Contact[]> => {
  let list = await readContactList();

  // 🔍 Filtro por nome (busca parcial em fullName e surname)
  if (filters.nome) {
    const searchName = filters.nome.toLowerCase();
    list = list.filter(
      (c) =>
        c.fullName.toLowerCase().includes(searchName) ||
        c.surname.toLowerCase().includes(searchName)
    );
  }

  // 🔍 Filtro por ID (busca exata)
  if (filters.id) {
    list = list.filter((c) => String(c.id) === String(filters.id));
  }

  return list;
};

// ===============================================
// 🔍 BUSCAR UM CONTATO POR ID
// ===============================================
// Busca um único contato pelo ID fornecido.
// Retorna o contato encontrado ou null se não existir.
export const getContactById = async (id: string): Promise<Contact | null> => {
  const list = await readContactList();
  const contact = list.find((c) => String(c.id) === String(id));
  return contact || null;
};

// ===============================================
// 🔍 BUSCAR CONTATOS POR NOME
// ===============================================
// Busca contatos que contenham o nome fornecido em fullName ou surname.
// Busca é case-insensitive e parcial.
// Retorna array de contatos encontrados (vazio se nenhum corresponder).
export const getContactByName = async (name: string): Promise<Contact[]> => {
  const list = await readContactList();
  const searchName = name.toLowerCase();
  
  return list.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchName) ||
      c.surname.toLowerCase().includes(searchName)
  );
};

// ===============================================
// ➕ ADICIONAR NOVO CONTATO
// ===============================================
// Adiciona um novo contato à lista existente e salva no arquivo.
// Não valida duplicatas (isso deve ser feito antes de chamar esta função).
export const addContact = async (contact: Contact): Promise<void> => {
  const list = await readContactList();
  list.push(contact);
  await saveContactList(list);
};

// ===============================================
// ✏️ ATUALIZAR CONTATO
// ===============================================
// Atualiza um contato específico na lista pelo seu índice.
// O índice deve ser encontrado antes de chamar esta função (usar findContactIndex).
export const updateContactInList = async (
  index: number,
  updatedContact: Contact
): Promise<void> => {
  const list = await readContactList();
  list[index] = updatedContact;
  await saveContactList(list);
};

// ===============================================
// 🗑️ DELETAR CONTATO
// ===============================================
// Remove um contato da lista pelo ID fornecido.
// Retorna true se o contato foi deletado, false se não foi encontrado.
export const deleteContactById = async (
  id: string | number
): Promise<boolean> => {
  const list = await readContactList();
  const filteredList = list.filter((c) => c.id !== id);

  // Se o tamanho não mudou, significa que o contato não foi encontrado
  if (filteredList.length === list.length) {
    return false;
  }

  await saveContactList(filteredList);
  return true;
};

// ===============================================
// 🧹 REMOVER CONTATOS DUPLICADOS
// ===============================================
// Percorre toda a lista e remove duplicações baseando-se em:
// • Email (case-insensitive, ignora espaços)
// • Telefone (compara apenas números)
// • Nome completo (fullName + surname, case-insensitive)
//
// Mantém sempre a primeira ocorrência e remove as demais.
// Útil para limpar dados antigos inseridos antes das validações.
//
// Retorna objeto com estatísticas da operação:
// • removidos: quantidade de contatos duplicados removidos
// • totalAntes: total de contatos antes da limpeza
// • totalDepois: total de contatos após a limpeza
export const removeDuplicateContacts = async (): Promise<{
  removidos: number;
  totalAntes: number;
  totalDepois: number;
}> => {
  const list = await readContactList();

  // 📊 Sets para rastrear valores já vistos
  const seenEmails = new Set<string>();    // Emails únicos
  const seenPhones = new Set<string>();    // Telefones únicos
  const seenNames = new Set<string>();     // Combinações nome + sobrenome únicas

  const cleanedList: Contact[] = [];
  let removedCount = 0;

  // 🔄 Processa cada contato da lista
  for (const c of list) {
    // 🔑 Cria chaves normalizadas para comparação

    // Email: minúsculo e sem espaços extras
    const emailKey = c.email?.toLowerCase().trim();

    // Telefone: apenas números (remove parênteses, hífens, espaços, etc)
    const phoneKey = c.phone?.replace(/\D/g, "");

    // Nome: combinação fullName + surname, minúsculo e sem espaços extras
    const nameKey = `${c.fullName.toLowerCase().trim()}-${c.surname
      .toLowerCase()
      .trim()}`;

    // ✅ Verifica se é duplicado comparando com os valores já vistos
    const isDuplicate =
      (emailKey && seenEmails.has(emailKey)) ||
      (phoneKey && seenPhones.has(phoneKey)) ||
      seenNames.has(nameKey);

    // ❌ Se for duplicado, incrementa contador e ignora este contato
    if (isDuplicate) {
      removedCount++;
      continue;
    }

    // ✔️ Marca como visto para futuras comparações
    if (emailKey) seenEmails.add(emailKey);
    if (phoneKey) seenPhones.add(phoneKey);
    seenNames.add(nameKey);

    // ✅ Adiciona à lista limpa (primeira ocorrência)
    cleanedList.push(c);
  }

  // 💾 Salva a lista sem duplicados
  await saveContactList(cleanedList);

  // 📊 Retorna estatísticas da operação
  return {
    removidos: removedCount,
    totalAntes: list.length,
    totalDepois: cleanedList.length,
  };
};

// ===============================================
// 🗑️ LIMPAR TODA A LISTA
// ===============================================
// Remove todos os contatos do arquivo, resetando a lista para vazio.
// Use com cuidado! Esta operação não pode ser desfeita.
export const clearAllContacts = async (): Promise<void> => {
  await clearContactList();
};