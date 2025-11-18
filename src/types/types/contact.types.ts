// ===============================================
// 📘 TIPOS RELACIONADOS A CONTATOS
// ===============================================
// Define as interfaces e tipos usados em toda a aplicação
// para manipulação de contatos.
// Mantém type safety e facilita manutenção do código.

// ===============================================
// 🔎 TIPOS PRINCIPAIS
// ===============================================

/**
 * Representa um contato completo no sistema.
 * Usado para armazenamento e retorno de dados.
 * 
 * @property id - Identificador único (string ou number)
 * @property fullName - Nome do contato (obrigatório)
 * @property surname - Sobrenome do contato (obrigatório)
 * @property email - Email do contato (opcional)
 * @property phone - Telefone do contato (opcional)
 */
export type Contact = {
  id: string | number;
  fullName: string;
  surname: string;
  email?: string | undefined;
  phone?: string | undefined;
};

// ===============================================
// 🔎 TIPOS PARA REQUISIÇÕES HTTP (REQUEST BODY)
// ===============================================

/**
 * Body da requisição POST /contato
 * Usado para criar um novo contato.
 * 
 * Campos obrigatórios: fullName, surname
 * Campos opcionais: id (será gerado se não fornecido), email, phone
 */
export interface CreateContactBody {
  id?: string | number | undefined;
  fullName: string;     // Obrigatório
  surname: string;      // Obrigatório
  email?: string | undefined;
  phone?: string | undefined;
}

/**
 * Body da requisição PUT /contato
 * Usado para atualizar um contato existente.
 * 
 * Apenas o ID é obrigatório para identificar qual contato atualizar.
 * Demais campos são opcionais - atualiza apenas o que for enviado.
 */
export interface UpdateContactBody {
  id: string | number;  // Obrigatório - identifica o contato
  fullName?: string | undefined;    // Opcional - atualiza se enviado
  surname?: string | undefined;     // Opcional - atualiza se enviado
  email?: string | undefined;       // Opcional - atualiza se enviado
  phone?: string | undefined;       // Opcional - atualiza se enviado
}

/**
 * Body da requisição DELETE /contato
 * Usado para deletar um contato pelo ID.
 */
export interface DeleteContactBody {
  id: string | number;  // Obrigatório - identifica qual contato deletar
}

// ===============================================
// 🔎 TIPOS PARA VALIDAÇÕES
// ===============================================

/**
 * Tipo base para validação de criação de contato.
 * Similar ao CreateContactBody, mas usado internamente nas validações.
 * Permite validar antes de criar o objeto Contact final.
 */
export interface ContactValidation {
  id?: string | number;
  fullName: string;
  surname: string;
  email?: string;
  phone?: string;
}

/**
 * Tipo para validação de atualização de contato.
 * Todos os campos são opcionais exceto o ID (usado apenas como referência).
 * Permite validar atualizações parciais.
 */
export type ContactUpdateValidation = Partial<ContactValidation> & {
  id: string | number;
};

// ===============================================
// 🔎 TIPOS PARA RESPOSTAS DA API (RESPONSES)
// ===============================================

/**
 * Resposta de sucesso padrão da API.
 * Usada em operações bem-sucedidas.
 */
export interface SuccessResponse {
  success: true;
  message: string;
  contato?: Contact;
  contatos?: Contact[];
  total?: number;
}

/**
 * Resposta de erro padrão da API.
 * Usada quando algo dá errado.
 */
export interface ErrorResponse {
  success?: false;
  error: string;
}

/**
 * Resposta específica para listagem de contatos.
 */
export interface ListContactsResponse {
  success: true;
  total: number;
  contatos: Contact[];
}

/**
 * Resposta específica para criação de contato.
 */
export interface CreateContactResponse {
  success: true;
  message: string;
  contato: Contact;
}

/**
 * Resposta específica para atualização de contato.
 */
export interface UpdateContactResponse {
  success: true;
  message: string;
  contato: Contact;
}

/**
 * Resposta específica para deleção de contato.
 */
export interface DeleteContactResponse {
  success: true;
  message: string;
}

/**
 * Resposta específica para remoção de duplicatas.
 */
export interface RemoveDuplicatesResponse {
  success: true;
  message: string;
  removidos: number;
  totalAntes: number;
  totalDepois: number;
}

/**
 * Resposta específica para limpeza da lista.
 */
export interface ClearContactsResponse {
  success: true;
  message: string;
}

// ===============================================
// 🔎 TIPOS UTILITÁRIOS
// ===============================================

/**
 * Tipo união de todas as possíveis respostas da API.
 * Útil para funções genéricas que lidam com qualquer resposta.
 */
export type ApiResponse =
  | SuccessResponse
  | ErrorResponse
  | ListContactsResponse
  | CreateContactResponse
  | UpdateContactResponse
  | DeleteContactResponse
  | RemoveDuplicatesResponse
  | ClearContactsResponse;