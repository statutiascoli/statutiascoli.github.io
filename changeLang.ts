
    // Funzione per cambiare la lingua
    function changeLanguage(lang) {
      document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
      });

      document.querySelectorAll('.' + lang).forEach(elem => {
        elem.style.display = 'block';
      });

      document.querySelectorAll('.' + (lang === 'it' ? 'en' : 'it')).forEach(elem => {
        elem.style.display = 'none';
      });

      document.querySelector('.' + lang + '.lang-btn').classList.add('active');

      document.documentElement.lang = lang;
    }

    // Impostare la lingua predefinita
    changeLanguage('it');