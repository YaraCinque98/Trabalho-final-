<?php
session_start();
require_once "../config/conexao.php";

// Verifica se o admin está logado
if (!isset($_SESSION['admin_logado'])) {
    header("Location: login.php");
    exit;
}

// Busca os livros no banco
$livros = $pdo->query("SELECT * FROM livro ORDER BY id DESC")->fetchAll();
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel Admin | Alquimia das Páginas</title>
    <link rel="stylesheet" href="../css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Source+Sans+3:wght@400;600&display=swap" rel="stylesheet">
</head>
<body>

<header class="topo">
    <div class="container topo-conteudo">
        <strong style="font-family: var(--titulo); font-size: 1.3rem; color: var(--primaria-escura);">
            Painel Administrativo
        </strong>
        <nav>
            <a href="painel.php" class="ativo">Livros</a>
            <a href="logout.php">Sair</a>
        </nav>
    </div>
</header>

<main class="container" style="padding: 50px 0;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
        <h1 class="titulo-pagina" style="margin: 0;">Livros Cadastrados</h1>
        <span style="color: var(--suave);">Total: <strong><?= count($livros) ?></strong> livros</span>
    </div>

    <?php if (count($livros) > 0): ?>
        <div style="background: var(--papel); border-radius: var(--raio); box-shadow: var(--sombra); overflow: hidden; border: 1px solid var(--borda);">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: var(--primaria); color: white;">
                        <th style="padding: 14px 18px; text-align: left;">ID</th>
                        <th style="padding: 14px 18px; text-align: left;">Título</th>
                        <th style="padding: 14px 18px; text-align: left;">Autor</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($livros as $livro): ?>
                        <tr style="border-bottom: 1px solid var(--borda);">
                            <td style="padding: 14px 18px;"><?= $livro['id'] ?></td>
                            <td style="padding: 14px 18px;"><?= htmlspecialchars($livro['titulo'] ?? '') ?></td>
                            <td style="padding: 14px 18px;"><?= htmlspecialchars($livro['autor'] ?? '') ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    <?php else: ?>
        <div style="background: var(--papel); padding: 40px; text-align: center; border-radius: var(--raio); border: 1px solid var(--borda);">
            <p style="color: var(--suave); font-size: 1.1rem;">Nenhum livro cadastrado ainda.</p>
        </div>
    <?php endif; ?>
</main>

</body>
</html>