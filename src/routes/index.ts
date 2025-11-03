import express from "express";
import type { Request, Response } from "express";
import { readFile, writeFile } from "fs/promises";

const turnBuffetcodeIntoText = "utf8";
const fileName = "./data/list.txt";

const router = express.Router();

router.post("/contatos", async (req: Request, res: Response) => {
  // 🔹 Desestruturando os campos do body da requisição
  const { name, email, phone } = req.body;

  // ✅ Validação do nome - pelo menos 2 caracteres
  if (!name || name.length < 2) {
    return res
      .status(400)
      .json({ error: "Nome precisa ter pelo menos dois caracteres" });
  }

  // ✅ Validação do email - precisa conter '@'
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Email inválido" });
  }

  // ✅ Validação do telefone - mínimo 8 caracteres
  if (!phone || phone.length < 8) {
    return res.status(400).json({ error: "Telefone inválido" });
  }

  // ✅ Array de strings para armazenar contatos lidos do arquivo
  let list: string[] = [];

  // 🔹 Leitura do arquivo de contatos
  try {
    const data = await readFile(fileName, { encoding: turnBuffetcodeIntoText });
    // Remove linhas vazias
    list = data.split("\n").filter((line) => line.trim() !== "");
  } catch (err) {
    console.error("Erro ao ler o arquivo:", err); // registra erro de leitura
  }

  // 🔹 Adiciona o novo contato como uma linha no array
  const newContact = `${name},${email},${phone}`;
  list.push(newContact);

  // 🔹 Salva todos os contatos de volta no arquivo
  try {
    await writeFile(fileName, list.join("\n"), {
      encoding: turnBuffetcodeIntoText,
    });
  } catch (err) {
    console.error("Erro ao salvar no arquivo:", err);
    return res.status(500).json({ error: "Não foi possível salvar o contato" });
  }

  // ✅ Resposta de sucesso
  return res.status(201).json({
    message: "Envio abaixo meus contatos",
    contato: { name, email, phone },
  });
});

export default router;
