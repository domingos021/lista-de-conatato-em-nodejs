// ===============================================
// 🛠️ FUNÇÕES AUXILIARES PARA MANIPULAÇÃO DE ARQUIVOS
// ===============================================
// Este módulo fornece funções reutilizáveis para lidar com contatos
// armazenados em um arquivo texto, onde cada linha contém um JSON diferente.
// Formato do arquivo: JSON Lines (JSONL) - um JSON por linha.

import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import type { Contact } from "../types/index.js";

// ===============================================
// ⚙️ CONFIGURAÇÕES
// ===============================================

// Codificação padrão para leitura e escrita de arquivos
const ENCODING = "utf8";

// Pasta onde o arquivo será armazenado
const DATA_DIR = "./data";

// Caminho completo do arquivo de dados
// Exemplo: "./data/list.txt"
const FILE_NAME = path.join(DATA_DIR, "list.txt");

// ===============================================
// 🔧 FUNÇÕES AUXILIARES PRIVADAS
// ===============================================

/**
 * 📁 Garante que a pasta de dados existe.
 * Se não existir, cria automaticamente de forma recursiva.
 * Isso previne erros de "ENOENT: no such file or directory".
 */
async function ensureDataDir(): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

/**
 * ✅ Valida se um objeto possui a estrutura básica de um Contact.
 * Retorna true se válido, false caso contrário.
 */
function isValidContact(obj: unknown): obj is Contact {
  if (!obj || typeof obj !== "object") return false;

  const contact = obj as Record<string, unknown>;

  return (
    typeof contact.id === "string" ||
    typeof contact.id === "number" &&
    typeof contact.fullName === "string" &&
    typeof contact.surname === "string" &&
    (contact.email === undefined || typeof contact.email === "string") &&
    (contact.phone === undefined || typeof contact.phone === "string")
  );
}

// ===============================================
// 📖 LER LISTA DE CONTATOS
// ===============================================
/**
 * Lê o arquivo list.txt e retorna um array de Contact.
 * 
 * Processo:
 * 1. Verifica se a pasta existe
 * 2. Lê o arquivo linha por linha
 * 3. Parseia cada linha como JSON
 * 4. Valida a estrutura de cada contato
 * 5. Remove linhas inválidas ou corrompidas
 * 
 * @returns Array de contatos válidos (vazio se arquivo não existir)
 */
export async function readContactList(): Promise<Contact[]> {
  try {
    await ensureDataDir();

    // 📂 Lê o conteúdo completo do arquivo
    const data = await readFile(FILE_NAME, ENCODING);

    // 📋 Processa cada linha do arquivo
    const contacts = data
      .split("\n") // Separa por linha
      .map((line) => line.trim()) // Remove espaços em branco
      .filter((line) => line !== "") // Ignora linhas vazias
      .map((line, index) => {
        try {
          const parsed = JSON.parse(line);

          // ✅ Valida estrutura do contato
          if (!isValidContact(parsed)) {
            console.warn(
              `⚠️ Contato inválido na linha ${index + 1} - ignorado`
            );
            return null;
          }

          return parsed;
        } catch (error) {
          // 🔴 Log de erro para debug
          console.warn(
            `⚠️ Erro ao parsear linha ${index + 1} - JSON inválido - ignorado`
          );
          return null;
        }
      })
      .filter((c): c is Contact => c !== null); // Remove nulos e garante tipo

    return contacts;
  } catch (err) {
    // 📭 Se o arquivo não existir ou houver erro de leitura, retorna lista vazia
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      // Arquivo não existe ainda - normal na primeira execução
      return [];
    }

    // 🔴 Erro inesperado - loga para debug
    console.error("❌ Erro ao ler lista de contatos:", err);
    return [];
  }
}

// ===============================================
// 💾 SALVAR LISTA DE CONTATOS
// ===============================================
/**
 * Salva a lista de contatos no arquivo.
 * Cada contato é convertido para JSON e salvo em uma linha separada.
 * 
 * Formato: JSON Lines (JSONL)
 * Exemplo:
 * {"id":"1","fullName":"João","surname":"Silva","email":"joao@example.com"}
 * {"id":"2","fullName":"Maria","surname":"Santos","email":"maria@example.com"}
 * 
 * @param list - Array de contatos a serem salvos
 * @throws Erro se houver problema na escrita do arquivo
 */
export async function saveContactList(list: Contact[]): Promise<void> {
  try {
    await ensureDataDir();

    // ✅ Valida cada contato antes de salvar
    const validContacts = list.filter((contact, index) => {
      if (!isValidContact(contact)) {
        console.warn(
          `⚠️ Contato inválido no índice ${index} - não será salvo`,
          contact
        );
        return false;
      }
      return true;
    });

    // 🔄 Converte cada contato para JSON e junta com quebra de linha
    const data = validContacts.map((c) => JSON.stringify(c)).join("\n");

    // 💾 Escreve no arquivo (sobrescreve conteúdo anterior)
    await writeFile(FILE_NAME, data, ENCODING);
  } catch (err) {
    // 🔴 Log de erro detalhado
    console.error("❌ Erro ao salvar lista de contatos:", err);
    throw new Error("Falha ao salvar contatos no arquivo");
  }
}

// ===============================================
// 🗑️ LIMPAR LISTA DE CONTATOS
// ===============================================
/**
 * Limpa completamente o arquivo list.txt.
 * Remove todos os contatos, deixando o arquivo vazio.
 * 
 * ⚠️ ATENÇÃO: Esta operação não pode ser desfeita!
 * 
 * @throws Erro se houver problema na escrita do arquivo
 */
export async function clearContactList(): Promise<void> {
  try {
    await ensureDataDir();

    // 🗑️ Sobrescreve o arquivo com string vazia
    await writeFile(FILE_NAME, "", ENCODING);
  } catch (err) {
    // 🔴 Log de erro detalhado
    console.error("❌ Erro ao limpar lista de contatos:", err);
    throw new Error("Falha ao limpar arquivo de contatos");
  }
}