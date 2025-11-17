// ===============================================
// 🛠️ FUNÇÕES AUXILIARES PARA MANIPULAÇÃO DE ARQUIVOS (JSON por linha)
// ===============================================
// Este módulo fornece funções reutilizáveis para lidar com contatos
// armazenados em um arquivo texto, onde cada linha contém um JSON diferente.

// Importa funções assíncronas do sistema de arquivos.
// readFile  → ler arquivos
// writeFile → escrever arquivos
// mkdir     → criar pastas
import { readFile, writeFile, mkdir } from "fs/promises";

// Importa função síncrona para verificar se um arquivo ou pasta existe.
import { existsSync } from "fs";

// Importa módulo para montar caminhos de forma segura (Windows/Linux/Mac).
import path from "path";

// Importa o tipo Contact da pasta types
import type { Contact } from "../types/index.js";

// ===============================================
// ⚙️ CONFIGURAÇÕES
// ===============================================

// Padrão de codificação para leitura e escrita de arquivos.
const ENCODING = "utf8";

// Caminho relativo da pasta onde o arquivo será armazenado.
// "./data" significa que a pasta está no mesmo diretório do arquivo atual.
const DATA_DIR = "./data"; // 📁 Pasta onde ficará o arquivo list.txt

// Cria o caminho completo até o arquivo list.txt dentro da pasta DATA_DIR.
// Exemplo final: "./data/list.txt"
const FILE_NAME = path.join(DATA_DIR, "list.txt"); // 📄 Caminho completo do arquivo list.txt

// ===============================================
// 🔧 FUNÇÕES AUXILIARES
// ===============================================

/**
 * 📌 Verifica se a pasta de dados existe.
 * Caso não exista, cria automaticamente.
 * Isso evita erros ao tentar ler ou gravar arquivos.
 */
async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true }); // recursive → cria subpastas se necessário
  }
}

/**
 * 📌 Lê o arquivo list.txt e devolve um array de Contact.
 * Cada linha do arquivo é um JSON separado.
 *
 * Caso o arquivo não exista, retorna um array vazio.
 */
export async function readContactList(): Promise<Contact[]> {
  try {
    await ensureDataDir(); // garante que a pasta existe antes de ler

    // Lê o conteúdo do arquivo usando UTF-8.
    const data = await readFile(FILE_NAME, ENCODING);

    return data
      .split("\n") // separa por linha
      .map((line) => line.trim()) // remove espaços em branco
      .filter((line) => line !== "") // ignora linhas vazias
      .map((line) => {
        try {
          return JSON.parse(line) as Contact; // tenta converter de JSON para objeto
        } catch {
          return null; // se der erro (linha inválida), ignora
        }
      })
      .filter((c): c is Contact => c !== null); // remove itens nulos e garante o tipo
  } catch (err) {
    // Se o arquivo não existir ou der erro, retorna lista vazia
    return [];
  }
}

/**
 * 📌 Salva a lista de contatos no arquivo.
 * Cada contato será salvo como um JSON em uma linha separada.
 */
export async function saveContactList(list: Contact[]): Promise<void> {
  await ensureDataDir(); // garante que a pasta existe

  // Converte cada objeto para JSON e separa por linha
  const data = list.map((c) => JSON.stringify(c)).join("\n");

  // Escreve tudo no list.txt sobrescrevendo o conteúdo anterior
  await writeFile(FILE_NAME, data, ENCODING);
}

/**
 * 📌 Limpa completamente o arquivo list.txt.
 * Útil para "resetar" a lista de contatos.
 */
export async function clearContactList(): Promise<void> {
  await ensureDataDir(); // garante que a pasta existe

  // Sobrescreve o conteúdo do arquivo com vazio
  await writeFile(FILE_NAME, "", ENCODING);
}