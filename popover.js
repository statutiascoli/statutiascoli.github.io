function lerobbe() {
  var persNames = document.querySelectorAll('persName');
  var placeNames = document.querySelectorAll('placeName');
  var corrs = document.querySelectorAll('corr');
  var gaps = document.querySelectorAll('gap');
  var segs = document.querySelectorAll('seg[type="festa"]');

  // Funzione per trasformare gli elementi in bottoni e aggiungere attributi
  function transformElementsToButtons(elements) {
    elements.forEach(function (element) {
      element.setAttribute('data-bs-toggle', 'popover');
      element.setAttribute('title', element.tagName);
      element.setAttribute('data-bs-content', 'Informazioni aggiuntive per ' + element.tagName);
      var options = {
          placement: 'top',
          html: true
        };
    
        var instance = new bootstrap.Popover(element, options);
    
        element.addEventListener('mouseenter', function () {
          instance.show();
        });
    });
  }

  // Trasforma gli elementi e aggiungi attributi
  transformElementsToButtons(persNames);
  transformElementsToButtons(placeNames);
  transformElementsToButtons(corrs);
  transformElementsToButtons(gaps);
  transformElementsToButtons(segs);

}