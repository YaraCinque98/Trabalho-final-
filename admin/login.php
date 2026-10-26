<?php
session_start();
require_once "../config/conexao.php";

if (isset($_SESSION['admin_logado'])) {
    header("Location: painel.php");
    exit;
}

$erro = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $senha = $_POST['senha'] ?? '';

    $stmt = $pdo->prepare("SELECT * FROM administrador WHERE email = ?");
    $stmt->execute([$email]);
    $admin = $stmt->fetch();

    // Se a senha estiver em texto puro no banco, use esta linha:
    // if ($admin && $admin['senha'] === $senha)

    // Se a senha estiver com hash (recomendado), use esta:
    if ($admin && password_verify($senha, $admin['senha'])) {
        $_SESSION['admin_logado'] = true;
        $_SESSION['admin_nome'] = $admin['nome'] ?? 'Administrador';
        header("Location: painel.php");
        exit;
    } else {
        $erro = "E-mail ou senha incorretos.";
    }
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login | Admin - Alquimia das Páginas</title>
    <link rel="stylesheet" href="../css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Source+Sans+3:wght@400;600&display=swap" rel="stylesheet">
</head>
<body>

<div class="container" style="max-width: 420px; margin: 100px auto;">
    <h1 style="font-family: var(--titulo); text-align: center; margin-bottom: 10px; color: var(--primaria-escura);">
        Área Administrativa
    </h1>
    <p style="text-align: center; color: var(--suave); margin-bottom: 30px;">Alquimia das Páginas</p>

    <?php if ($erro): ?>
        <div style="background: #fdecea; color: var(--erro); padding: 12px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <?= htmlspecialchars($erro) ?>
        </div>
    <?php endif; ?>

    <form method="POST" style="background: var(--papel); padding: 35px 30px; border-radius: var(--raio); box-shadow: var(--sombra); border: 1px solid var(--borda);">
        <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 6px; font-weight: 600;">E-mail</label>
            <input type="email" name="email" required 
                   style="width: 100%; padding: 12px 14px; border: 1px solid var(--borda); border-radius: 8px; font-size: 1rem;">
        </div>

        <div style="margin-bottom: 28px;">
            <label style="display: block; margin-bottom: 6px; font-weight: 600;">Senha</label>
            <input type="password" name="senha" required 
                   style="width: 100%; padding: 12px 14px; border: 1px solid var(--borda); border-radius: 8px; font-size: 1rem;">
        </div>

        <button type="submit" class="btn-primario" style="width: 100%; border: none; cursor: pointer; padding: 14px;">
            Entrar
        </button>
    </form>

    <p style="text-align: center; margin-top: 25px;">
        <a href="../index.php" style="color: var(--suave); text-decoration: none;">← Voltar ao site</a>
    </p>
</div>

</body>
</html>