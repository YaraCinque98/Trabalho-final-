require('dotenv').config();

const bcrypt = require('bcryptjs');
const express = require('express');
const session = require('express-session');
const mysql = require('mysql2/promise');

const app = express();
const port = Number(process.env.PORT || 3000);
const root = __dirname;
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error('SESSION_SECRET deve ter pelo menos 32 caracteres. Configure o arquivo .env.');
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'alquimia_paginas',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10
});

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function requireAdmin(req, res, next) {
  if (!req.session.admin) {
    return next(new HttpError(401, 'Faça login para continuar.'));
  }
  next();
}

function requireSameOrigin(req, res, next) {
  const origin = req.get('origin');
  if (!origin || origin !== `${req.protocol}://${req.get('host')}`) {
    return next(new HttpError(403, 'Origem da solicitação não permitida.'));
  }
  next();
}

function validarLivro(body) {
  body = body && typeof body === 'object' ? body : {};
  const nome = typeof body.nome === 'string' ? body.nome.trim() : '';
  const autor = typeof body.autor === 'string' ? body.autor.trim() : '';
  const edicao = typeof body.edicao === 'string' ? body.edicao.trim() : null;
  const editora = typeof body.editora === 'string' ? body.editora.trim() : null;
  const capa = typeof body.capa === 'string' ? body.capa.trim() : null;
  const idAssunto = Number(body.id_assunto);
  const preco = Number(body.preco);
  const ano = body.ano === '' || body.ano == null ? null : Number(body.ano);
  const status = typeof body.status === 'string' ? body.status : 'disponivel';
  const statusPermitidos = ['disponivel', 'indisponivel', 'reservado', 'vendido'];

  if (!nome || nome.length > 150 || !autor || autor.length > 100) {
    throw new HttpError(400, 'Título e autor são obrigatórios e devem respeitar os limites de caracteres.');
  }
  if (!Number.isInteger(idAssunto) || idAssunto < 1) {
    throw new HttpError(400, 'Selecione um assunto válido.');
  }
  if (!Number.isFinite(preco) || preco < 0 || preco > 99999999.99) {
    throw new HttpError(400, 'Informe um preço válido.');
  }
  if (ano !== null && (!Number.isInteger(ano) || ano < 0 || ano > 9999)) {
    throw new HttpError(400, 'Informe um ano válido.');
  }
  if (edicao && edicao.length > 30) {
    throw new HttpError(400, 'A edição deve ter até 30 caracteres.');
  }
  if (editora && editora.length > 80) {
    throw new HttpError(400, 'A editora deve ter até 80 caracteres.');
  }
  if (capa && capa.length > 255) {
    throw new HttpError(400, 'O caminho da capa deve ter até 255 caracteres.');
  }
  if (!statusPermitidos.includes(status)) {
    throw new HttpError(400, 'Status do livro inválido.');
  }

  return { nome, autor, edicao, editora, ano, idAssunto, capa, preco, status };
}

const camposLivro = `
  l.id_livro AS id,
  l.nome,
  l.autor,
  l.edicao,
  l.editora,
  l.ano,
  l.id_assunto,
  a.nome_assunto AS assunto,
  l.capa,
  l.preco,
  l.status`;

app.use(express.json({ limit: '20kb' }));
app.use(session({
  name: 'alquimia.sid',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 2
  }
}));

app.get('/api/assuntos', asyncRoute(async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT id_assunto AS id, nome_assunto AS nome FROM assunto ORDER BY nome_assunto'
  );
  res.json(rows);
}));

app.get('/api/livros', asyncRoute(async (req, res) => {
  const termo = typeof req.query.busca === 'string' ? req.query.busca.trim().slice(0, 100) : '';
  const idAssunto = req.query.assunto ? Number(req.query.assunto) : null;
  const limite = req.query.limite ? Number(req.query.limite) : 100;
  if (idAssunto !== null && (!Number.isInteger(idAssunto) || idAssunto < 1)) {
    throw new HttpError(400, 'Assunto inválido.');
  }
  if (!Number.isInteger(limite) || limite < 1 || limite > 100) {
    throw new HttpError(400, 'Limite de resultados inválido.');
  }

  const filtros = ["l.status = 'disponivel'"];
  const parametros = [];
  if (termo) {
    filtros.push('(l.nome LIKE ? OR l.autor LIKE ? OR l.editora LIKE ?)');
    parametros.push(`%${termo}%`, `%${termo}%`, `%${termo}%`);
  }
  if (idAssunto !== null) {
    filtros.push('l.id_assunto = ?');
    parametros.push(idAssunto);
  }

  const [rows] = await pool.execute(
    `SELECT ${camposLivro}
     FROM livro l JOIN assunto a ON a.id_assunto = l.id_assunto
     WHERE ${filtros.join(' AND ')}
     ORDER BY l.id_livro DESC LIMIT ?`,
    [...parametros, limite]
  );
  res.json(rows);
}));

app.get('/api/livros/:id', asyncRoute(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    throw new HttpError(400, 'Identificador de livro inválido.');
  }
  const [rows] = await pool.execute(
    `SELECT ${camposLivro}
     FROM livro l JOIN assunto a ON a.id_assunto = l.id_assunto
     WHERE l.id_livro = ?`,
    [id]
  );
  if (!rows.length) {
    throw new HttpError(404, 'Livro não encontrado.');
  }
  res.json(rows[0]);
}));

app.get('/api/admin/sessao', (req, res) => {
  res.json({ autenticado: Boolean(req.session.admin), admin: req.session.admin || null });
});

app.post('/api/admin/login', requireSameOrigin, asyncRoute(async (req, res) => {
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const senha = typeof body.senha === 'string' ? body.senha : '';
  if (!email || !senha || email.length > 100) {
    throw new HttpError(400, 'Informe e-mail e senha.');
  }

  const [rows] = await pool.execute(
    `SELECT p.id_pessoa, p.nome, p.email, p.senha_hash
     FROM pessoa p
     JOIN administrador a ON a.id_pessoa = p.id_pessoa
     WHERE p.email = ? AND p.tipo = 'Administrador'
     LIMIT 1`,
    [email]
  );
  const admin = rows[0];
  if (!admin || !admin.senha_hash || !(await bcrypt.compare(senha, admin.senha_hash))) {
    throw new HttpError(401, 'E-mail ou senha incorretos.');
  }

  await new Promise((resolve, reject) => {
    req.session.regenerate(error => error ? reject(error) : resolve());
  });
  req.session.admin = { id: admin.id_pessoa, nome: admin.nome, email: admin.email };
  res.json({ autenticado: true, admin: req.session.admin });
}));

app.post('/api/admin/logout', requireSameOrigin, requireAdmin, asyncRoute(async (req, res) => {
  await new Promise((resolve, reject) => {
    req.session.destroy(error => error ? reject(error) : resolve());
  });
  res.clearCookie('alquimia.sid', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  });
  res.json({ sucesso: true });
}));

app.get('/api/admin/livros', requireAdmin, asyncRoute(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT ${camposLivro}
     FROM livro l JOIN assunto a ON a.id_assunto = l.id_assunto
     ORDER BY l.id_livro DESC`
  );
  res.json(rows);
}));

app.post('/api/admin/livros', requireSameOrigin, requireAdmin, asyncRoute(async (req, res) => {
  const livro = validarLivro(req.body);
  const [result] = await pool.execute(
    `INSERT INTO livro (nome, autor, edicao, editora, ano, id_assunto, capa, preco, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [livro.nome, livro.autor, livro.edicao, livro.editora, livro.ano, livro.idAssunto, livro.capa, livro.preco, livro.status]
  );
  res.status(201).json({ id: result.insertId });
}));

app.put('/api/admin/livros/:id', requireSameOrigin, requireAdmin, asyncRoute(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    throw new HttpError(400, 'Identificador de livro inválido.');
  }
  const livro = validarLivro(req.body);
  const [result] = await pool.execute(
    `UPDATE livro
     SET nome = ?, autor = ?, edicao = ?, editora = ?, ano = ?, id_assunto = ?, capa = ?, preco = ?, status = ?
     WHERE id_livro = ?`,
    [livro.nome, livro.autor, livro.edicao, livro.editora, livro.ano, livro.idAssunto, livro.capa, livro.preco, livro.status, id]
  );
  if (!result.affectedRows) {
    const [existing] = await pool.execute('SELECT id_livro FROM livro WHERE id_livro = ?', [id]);
    if (!existing.length) {
      throw new HttpError(404, 'Livro não encontrado.');
    }
  }
  res.json({ sucesso: true });
}));

app.delete('/api/admin/livros/:id', requireSameOrigin, requireAdmin, asyncRoute(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    throw new HttpError(400, 'Identificador de livro inválido.');
  }
  const [result] = await pool.execute('DELETE FROM livro WHERE id_livro = ?', [id]);
  if (!result.affectedRows) {
    throw new HttpError(404, 'Livro não encontrado.');
  }
  res.json({ sucesso: true });
}));

app.use('/api', (req, res, next) => next(new HttpError(404, 'Rota da API não encontrada.')));
app.use((req, res, next) => {
  const caminho = req.path.toLowerCase();
  if (
    caminho === '/server.js' ||
    caminho === '/package.json' ||
    caminho.startsWith('/scripts/') ||
    caminho.startsWith('/database/') ||
    caminho.startsWith('/node_modules/')
  ) {
    return res.sendStatus(404);
  }
  next();
});
app.use(express.static(root, { dotfiles: 'deny', index: 'index.html' }));

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ erro: 'O assunto selecionado não existe.' });
  }
  if (error.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({ erro: 'Não é possível excluir este livro porque há movimentações vinculadas.' });
  }
  if (error.status) {
    return res.status(error.status).json({ erro: error.message });
  }
  console.error(error);
  res.status(500).json({ erro: 'Erro interno. Verifique a conexão com o banco e os logs do servidor.' });
});

async function start() {
  await pool.query('SELECT 1');
  await pool.execute(
    `INSERT IGNORE INTO assunto (nome_assunto)
     VALUES (?), (?), (?), (?), (?), (?)`,
    ['Romance', 'Técnico', 'Infantil', 'Filosofia', 'História', 'Poesia']
  );
  app.listen(port, () => {
    console.log(`Alquimia das Páginas disponível em http://localhost:${port}`);
  });
}

start().catch(error => {
  console.error('Não foi possível iniciar o servidor. Verifique o MySQL e o arquivo .env.', error.message);
  process.exitCode = 1;
});
