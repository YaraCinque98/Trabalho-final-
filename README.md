# Alquimia das Páginas

Site estático servido por uma API Node.js/Express, conectada ao MySQL `alquimia_paginas`. O navegador não acessa o banco diretamente: usuário e senha do MySQL ficam no arquivo local `.env`, fora do controle de versão.

## Requisitos

- Node.js 18 ou superior e npm.
- MySQL/MariaDB em execução.
- Banco criado com as tabelas do esquema do projeto.

> O SQL de criação enviado para este projeto contém comandos `DROP TABLE`. Execute-o somente em um banco vazio ou após confirmar que pode apagar os dados existentes. Não é necessário recriar o banco se ele já estiver instalado.

## Executar localmente

1. Copie `.env.example` para `.env` e preencha as credenciais do MySQL. No PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Gere uma chave de sessão aleatória e coloque o resultado em `SESSION_SECRET` no `.env`:

   ```powershell
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

3. Instale as dependências:

   ```powershell
   npm install
   ```

4. Ao iniciar, a API cadastra automaticamente os assuntos iniciais (`Romance`, `Técnico`, `Infantil`, `Filosofia`, `História` e `Poesia`) quando ainda não existem. Também é possível executar `database/seed.sql`; o comando não apaga nem sobrescreve assuntos.
5. Crie o primeiro administrador:

   ```powershell
   npm run create-admin
   ```

   Informe nome, e-mail, CPF válido e uma senha de pelo menos 12 caracteres. A senha é armazenada com hash bcrypt.

   Para um projeto local de TCC, também é possível gerar um acesso de demonstração sem informar CPF:

   ```powershell
   npm run create-admin:demo
   ```

   O comando gera uma senha aleatória e exibe o e-mail e a senha uma única vez no terminal. Esse modo é destinado somente a demonstrações locais.

6. Inicie o site e a API:

   ```powershell
   npm start
   ```

7. Abra `http://localhost:3000` (não abra os arquivos HTML diretamente). O painel fica em `http://localhost:3000/admin/login.html`.

No XAMPP, basta manter o serviço MySQL ligado; o Apache não é necessário para servir este projeto.

## O que está conectado

- Catálogo, busca por título/autor/editora, filtro por assunto e detalhes consultam as tabelas `livro` e `assunto`.
- Na inicialização, o servidor garante a presença dos assuntos básicos com `INSERT IGNORE`, preservando quaisquer assuntos já cadastrados.
- O painel permite entrar, listar, cadastrar, editar e excluir livros.
- A autenticação usa `pessoa` + `administrador`; somente administradores com `senha_hash` bcrypt podem entrar.
- A exclusão de livros referenciados em `movimentacao` é recusada pelo próprio banco e exibida no painel.
- Os botões de WhatsApp estão nas páginas públicas. Para direcioná-los diretamente ao número do sebo, preencha `WHATSAPP` em `js/dados.js` com DDI + DDD + número, sem `+` ou espaços (por exemplo, `5511999999999`). Sem número configurado, o link abre o WhatsApp com a mensagem pronta para escolher o destinatário.

A tabela `livro` fornecida não possui coluna de sinopse/descrição; por isso, o site apresenta os campos que existem no banco. As tabelas de clientes, endereços, movimentações e pagamentos ainda não são usadas por estas telas.

## API

- `GET /api/assuntos`
- `GET /api/livros` (somente disponíveis; aceita `busca`, `assunto` e `limite`)
- `GET /api/livros/:id`
- `GET /api/admin/sessao`
- `POST /api/admin/login` e `POST /api/admin/logout`
- `GET /api/admin/livros`
- `POST`, `PUT /api/admin/livros/:id` e `DELETE /api/admin/livros/:id` (sessão de administrador obrigatória)

Para produção, use HTTPS, um usuário MySQL com permissões mínimas e um armazenamento persistente de sessões no lugar do armazenamento em memória padrão do Express.
