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

    // ATENÇÃO: Se a senha estiver em texto puro no banco, use:
    // if ($admin && $admin['senha'] === $senha)
    
    // Se estiver com hash:
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
    <title>Login | Admin</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <div class="container" style="max-width: 420px; margin-top: 100px;">
        <h1 style="font-family: var(--titulo); text-align: center; margin-bottom: 30px;">Área Administrativa</h1>
        
        <?php if ($erro): ?>
            <p style="color: var(--erro); text-align: center; margin-bottom: 20px;"><?= $erro ?></p>
        <?php endif; ?>

        <form method="POST" style="background: var(--papel); padding: 30px; border-radius: var(--raio); box-shadow: var(--sombra);">
            <div style="margin-bottom: 18px;">
                <label>E-mail</label><br>
                <input type="email" name="email" required style="width: 100%; padding: 12px; margin-top: 6px; border: 1px solid var(--borda); border-radius: 8px;">
            </div>
            <div style="margin-bottom: 24px;">
                <label>Senha</label><br>
                <input type="password" name="senha" required style="width: 100%; padding: 12px; margin-top: 6px; border: 1px solid var(--borda); border-radius: 8px;">
            </div>
            <button type="submit" class="btn-primario" style="width: 100%; border: none; cursor: pointer;">Entrar</button>
        </form>
    </div>
</body>
</html>