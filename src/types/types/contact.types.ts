// ===============================================
// 📘 TIPOS RELACIONADOS A CONTATOS
// ===============================================
// Define as interfaces e tipos usados em toda a aplicação
// para manipulação de contatos.

// ===============================================
// 🔎 TIPOS PRINCIPAIS
// ===============================================

/**
 * Define o formato que um contato deve seguir dentro da aplicação.
 * A tipagem ajuda a detectar erros durante o desenvolvimento.
 */
export type Contact = {
  id: string | number; // Aceita número ou string (ex: "1", 1)
  fullName: string;
  surname: string;
  email?: string | undefined; // opcional - aceita undefined explicitamente
  phone?: string | undefined; // opcional - aceita undefined explicitamente
};

// ===============================================
// 🔎 TIPOS PARA REQUISIÇÕES (REQUEST BODY)
// ===============================================

/**
 * Tipo usado no body da requisição POST /contato
 * Para criar um novo contato
 */
export interface CreateContactBody {
  id?: string | number | undefined; // Opcional - aceita string, number ou undefined
  fullName: string;
  surname: string;
  email?: string | undefined; // Opcional - compatível com Contact
  phone?: string | undefined; // Opcional - compatível com Contact
}

/**
 * Tipo usado no body da requisição PUT /contato
 * Para atualizar um contato existente
 */
export interface UpdateContactBody {
  id: string | number; // Obrigatório para identificar qual contato atualizar
  fullName?: string | undefined; // Campos opcionais - atualiza apenas o que for enviado
  surname?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
}

/**
 * Tipo usado no body da requisição DELETE /contato
 * Para deletar um contato pelo ID
 */
export interface DeleteContactBody {
  id: string | number; // Obrigatório para identificar qual contato deletar
}

// ===============================================
// 🔎 TIPOS PARA VALIDAÇÕES
// ===============================================

/**
 * Tipo usado para validação de contatos
 * Aceita explicitamente undefined em todos os campos
 */
export interface ContactValidation {
  id?: string | number | undefined;
  fullName?: string | undefined;
  surname?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
}