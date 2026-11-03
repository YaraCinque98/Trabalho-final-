require('dotenv').config();

const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const mysql = require('mysql2/promise');
const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');

async function main() {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  let connection;
  let transactionStarted = false;
  const modoDemo = process.argv.includes('--demo');

  try {
    const nome = modoDemo
      ? 'Administrador TCC'
      : (await rl.question('Nome do administrador: ')).trim();
    const email = modoDemo
      ? `admin-${Date.now()}@alquimia.local`
      : (await rl.question('E-mail do administrador: ')).trim().toLowerCase();
    const cpf = modoDemo
      ? `TCC-${crypto.randomBytes(5).toString('hex')}`
      : (await rl.question('CPF do administrador (somente números): ')).replace(/\D/g, '');
    const senha = modoDemo
      ? crypto.randomBytes(18).toString('base64url')
      : await rl.question('Senha (mínimo 12 caracteres): ');

    if (!nome || nome.length > 100) {
      throw new Error('Informe um nome com até 100 caracteres.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 100) {
      throw new Error('Informe um e-mail válido com até 100 caracteres.');
    }
    if (!modoDemo && !validarCpf(cpf)) {
      throw new Error('Informe um CPF válido com 11 dígitos.');
    }
    if (senha.length < 12) {
      throw new Error('A senha precisa ter pelo menos 12 caracteres.');
    }

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'alquimia_paginas',
      charset: 'utf8mb4'
    });

    const senhaHash = await bcrypt.hash(senha, 12);
    await connection.beginTransaction();
    transactionStarted = true;
    const [result] = await connection.execute(
      'INSERT INTO pessoa (nome, cpf, email, tipo, senha_hash) VALUES (?, ?, ?, ?, ?)',
      [nome, cpf, email, 'Administrador', senhaHash]
    );
    await connection.execute(
      'INSERT INTO administrador (id_pessoa, nivel_acesso) VALUES (?, ?)',
      [result.insertId, 'total']
    );
    await connection.commit();
    transactionStarted = false;
    if (modoDemo) {
      console.log('\nAcesso de demonstração criado:');
      console.log(`E-mail: ${email}`);
      console.log(`Senha: ${senha}`);
      console.log('\nGuarde essa senha: ela não será exibida novamente.');
    } else {
      console.log('Administrador criado com sucesso.');
    }
  } catch (error) {
    if (connection && transactionStarted) {
      await connection.rollback();
    }
    if (error.code === 'ER_DUP_ENTRY') {
      console.error('Já existe uma pessoa com esse e-mail ou identificador.');
    } else {
      console.error(error.message || 'Não foi possível criar o administrador.');
    }
    process.exitCode = 1;
  } finally {
    rl.close();
    if (connection) {
      await connection.end();
    }
  }
}

function validarCpf(cpf) {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  const digitos = cpf.split('').map(Number);
  for (let posicao = 9; posicao <= 10; posicao += 1) {
    const soma = digitos.slice(0, posicao)
      .reduce((total, digito, indice) => total + digito * (posicao + 1 - indice), 0);
    const resto = (soma * 10) % 11;
    const verificador = resto === 10 ? 0 : resto;
    if (verificador !== digitos[posicao]) return false;
  }
  return true;
}

main();
