<?php
// Verifica se il metodo di richiesta è POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Verifica se tutti i campi obbligatori sono stati compilati
    if (isset($_POST["name"]) && isset($_POST["email"]) && isset($_POST["message"])) {
        
        // Filtra e sanitizza i dati inviati dal form
        $name = filter_var($_POST["name"], FILTER_SANITIZE_STRING);
        $email = filter_var($_POST["email"], FILTER_SANITIZE_EMAIL);
        $message = filter_var($_POST["message"], FILTER_SANITIZE_STRING);

        // Verifica se il campo reCAPTCHA è stato inviato
        if (isset($_POST['g-recaptcha-response'])) {
            $captcha = $_POST['g-recaptcha-response'];
        } else {
            // Mostra un errore se il reCAPTCHA non è stato inviato
            die("Errore: si prega di completare il reCAPTCHA.");
        }

        // Verifica il reCAPTCHA
        $secretKey = "YOUR_RECAPTCHA_SECRET_KEY";
        $response = file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret=" . $secretKey . "&response=" . $captcha);
        $responseKeys = json_decode($response, true);

        // Se il reCAPTCHA è valido, procedi con l'invio dell'email
        if (intval($responseKeys["success"]) === 1) {
            // Configura i dettagli per l'invio dell'email
            $to = "info.ascolicomune@gmail.com";
            $subject = "Nuovo messaggio dal form di contatto";
            $messageBody = "Nome: $name\n";
            $messageBody .= "Email: $email\n";
            $messageBody .= "Messaggio:\n$message";

            // Invia l'email
            $headers = "From: $name <$email>";

            if (mail($to, $subject, $messageBody, $headers)) {
                // Successo: mostra un messaggio di ringraziamento
                echo "Grazie per averci contattato. Ti risponderemo al più presto.";
            } else {
                // Mostra un errore se non è possibile inviare l'email
                echo "Errore: si è verificato un problema nell'invio dell'email.";
            }
        } else {
            // Mostra un errore se il reCAPTCHA non è valido
            echo "Errore: reCAPTCHA non valido. Si prega di riprovare.";
        }
    } else {
        // Mostra un errore se non tutti i campi sono stati compilati
        echo "Errore: si prega di compilare tutti i campi del modulo.";
    }
} else {
    // Mostra un errore se il metodo di richiesta non è POST
    echo "Errore: richiesta non valida.";
}
?>

