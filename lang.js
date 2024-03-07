// Recupera la lingua salvata nella memoria locale, se presente
let lingua = localStorage.getItem('lingua');

// Imposta la lingua predefinita come italiano se non è ancora stata memorizzata
if (!lingua) {
  lingua = 'it';
  localStorage.setItem('lingua', lingua);
}

// Mostra il contenuto corretto in base alla lingua salvata
mostraContenuto(lingua);

// Gestisce il click sui pulsanti IT e EN
console.log(document.getElementById('it-btn'))
document.getElementById('it-btn').addEventListener('click', function() {
  cambiaLingua('it');
});

document.getElementById('en-btn').addEventListener('click', function() {
  cambiaLingua('en');
});

// Funzione per cambiare la lingua e aggiornare il contenuto
function cambiaLingua(nuovaLingua) {
  lingua = nuovaLingua;
  localStorage.setItem('lingua', lingua);
  mostraContenuto(lingua);
}

// Funzione per mostrare il contenuto nella lingua corretta
function mostraContenuto(lingua) {
  const itElements = document.querySelectorAll('.it');
  const enElements = document.querySelectorAll('.en');

  if (lingua === 'it') {
    itElements.forEach(element => {
      element.classList.remove('d-none');
    });
    enElements.forEach(element => {
      element.classList.add('d-none');
    });
  } else if (lingua === 'en') {
    itElements.forEach(element => {
      element.classList.add('d-none');
    });
    enElements.forEach(element => {
      element.classList.remove('d-none');
    });
  }
}
