<?php
if($_SERVER["REQUEST_METHOD"] == "POST") {
    $nome = $_POST['nome'];
    $email = $_POST['email'];
    $messaggio = $_POST['messaggio'];

    // Puoi fare ulteriori elaborazioni qui, come inviare l'email o salvare i dati su un database

    // Esempio di invio email
    $to = "michela.parma@hotmail.it";
    $subject = "Nuovo messaggio dal form di contatto";
    $message = "Nome: $nome\n";
    $message .= "Email: $email\n";
    $message .= "Messaggio:\n$messaggio\n";
    $headers = "From: $email";

    mail($to, $subject, $message, $headers);
    
    // Reindirizza l'utente a una pagina di conferma o grazie
    header("Location: index.html");
    exit;
}
?>
