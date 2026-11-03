require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'alquimia_paginas'
  });

  const nome = 'Administrador Teste';
  const email = 'admin@teste.com';
  const cpf = '12345678909';
  const senha = 'Admin123456';
  const senhaHash = await bcrypt.hash(senha, 12);

  try {
    const [result] = await conn.execute(
      `INSERT INTO pessoa (nome, cpf, email, tipo, senha_hash)
       VALUES (?, ?, ?, 'Administrador', ?)
       ON DUPLICATE KEY UPDATE
         nome = VALUES(nome),
         cpf = VALUES(cpf),
         email = VALUES(email),
         tipo = VALUES(tipo),
         senha_hash = VALUES(senha_hash)`,
      [nome, cpf, email, senhaHash]
    );

    const idPessoa = result.insertId || (await conn.query('SELECT id_pessoa FROM pessoa WHERE email = ?', [email]))[0][0]?.id_pessoa;

    await conn.execute(
      `INSERT INTO administrador (id_pessoa, nivel_acesso)
       VALUES (?, 'total')
       ON DUPLICATE KEY UPDATE nivel_acesso = VALUES(nivel_acesso)`,
      [idPessoa]
    );

    console.log(JSON.stringify({
      email,
      senha,
      nome,
      cpf,
      idPessoa,
      status: 'admin_ok'
    }, null, 2));
  } finally {
    await conn.end();
  }
})();
