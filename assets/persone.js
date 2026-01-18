// Persone: elenco da persone.json + ricerca statuti in statuti_web.json

let personCurrentPage = 1;
let personResults = [];

let itemsPerPage = 3;
if (window.innerWidth < 767.98) {
  itemsPerPage = 4;
}

const parser = new DOMParser();

function safeText(text) {
  return (text || '').toString().replace(/\s+/g, ' ').trim();
}

Promise.all([
  fetch('assets/persone.json').then(r => r.json()),
  fetch('assets/statuti_web.json').then(r => r.json())
]).then(([people, data]) => {

  // Sort people by display name
  people.sort((a, b) => safeText(a.name).localeCompare(safeText(b.name), 'it', { sensitivity: 'base' }));

  const listContainer = document.querySelector('.people-list');

  function renderPeopleList() {
    listContainer.innerHTML = '';

    people.forEach(p => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'list-group-item list-group-item-action';
      btn.setAttribute('data-person-id', p.id);

      const title = document.createElement('p');
      title.className = 'fw-semibold';
      title.textContent = p.name || p.id;

      btn.appendChild(title);

      btn.addEventListener('click', () => {
        // active state
        const active = listContainer.querySelector('.list-group-item.active');
        if (active) active.classList.remove('active');
        btn.classList.add('active');

        setPersonIdInUrl(p.id);
        
        populateResultsPerson(p, 'people-results', personCurrentPage, personResults);
      });

      listContainer.appendChild(btn);
    });
  }

  renderPeopleList();

  function populateResultsPerson(person, tab, currentPage, results) {
    document.querySelector('.' + tab + ' .result-content').innerHTML = '';
    document.querySelector('.' + tab + ' .pagination').innerHTML = '';
    currentPage = 1;
    results = [];

    // Title box with attributes
    const titleBox = document.querySelector('.' + tab + ' .result-title');
    const metaBox = document.querySelector('.' + tab + ' .result-meta');

    titleBox.innerHTML = person?.name ? person.name : '';

    metaBox.innerHTML = ['occupation','residence','note','ref']
      .filter(k => person?.[k]?.trim())
      .map(k => `
        <div class="meta-line">
          <b><span class="k it ${lingua === 'en' ? 'd-none' : ''}">
            ${({occupation:'Occupazione',residence:'Residenza',note:'Descrizione',ref:'Wikidata'})[k]}:
          </span>
          <span class="k en ${lingua === 'it' ? 'd-none' : ''}">
            ${({occupation:'Occupation',residence:'Residence',note:'Description',ref:'Wikidata'})[k]}:
          </span></b>
          <span class="v">
            ${k === 'ref'
              ? `<a href="${person[k]}" target="_blank" rel="noopener noreferrer">${person[k]}</a>`
              : person[k]
            }
          </span>
        </div>
      `).join('');

    if (person && person.id) {
      const needle = `#${person.id}`;

      for (const v_i of Object.keys(data).keys ? [] : Object.keys(data)) {
        // This block intentionally left blank; kept for older environments
      }

      // Walk the nested structure exactly like categories.js
      for (let v_i = 0; v_i < Object.keys(data).length; v_i++) {
        const v_key = Object.keys(data)[v_i];
        const volume_content = data[v_key];
        if (typeof volume_content === 'object') {
          const books = Object.keys(volume_content);
          for (let b_i = 0; b_i < books.length; b_i++) {
            const b_key = books[b_i];
            const book_content = volume_content[b_key];
            if (typeof book_content === 'object') {
              const rubrics = Object.keys(book_content);
              for (let r_i = 0; r_i < rubrics.length; r_i++) {
                const r_key = rubrics[r_i];
                const rubric_content = book_content[r_key];

                const rubricDoc = parser.parseFromString(rubric_content, 'text/xml');

                if (r_key!="Indice"){
                  // match <persName corresp="#ID">
                  const hits = rubricDoc.querySelectorAll(`persName[corresp="${needle}"]`);
                  if (hits && hits.length > 0) {
                    results.push([rubricDoc, [v_i, b_i, r_i]]);
                  }
                }
              }
            }
          }
        }
        else {
          const specialDoc = parser.parseFromString(data[v_key], 'text/xml');

          // match <persName corresp="#ID">
          const hits = specialDoc.querySelectorAll(`persName[corresp="${needle}"]`);
          if (hits && hits.length > 0) {
            results.push([specialDoc, [v_i, null, null]]);
          }
        }
      }
    }

    displayCurrentPage(results, tab, currentPage);
    if (results.length > itemsPerPage) {
      generatePaginationLinks(results, tab, currentPage);
    }

    // If no results, show a hint
    if (results.length === 0) {
      const wrap = document.querySelector('.' + tab + ' .result-content');
      const msg = document.createElement('div');
      msg.className = 'alert alert-light border';
      msg.textContent = 'Nessuna rubrica trovata per questa persona.';
      wrap.appendChild(msg);
    }
  }

  function displayCurrentPage(results, tab, currentPage) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToShow = results.slice(startIndex, endIndex);

    const container = document.querySelector('.' + tab + ' .result-content');
    container.innerHTML = '';

    itemsToShow.forEach((doc) => {
      const xmlDoc = doc[0];
      const headElement = xmlDoc.getElementsByTagName('h1')[0];

      if (headElement) {
        const resultElementVolume = (doc[1][0] === 1) ? 'Statuti del Comune' : (doc[1][0] === 2) ? 'Statuti del Popolo' : '';
        const resultElementBook = 'Libro ' + doc[1][1];
        const rubricNumNode = xmlDoc.querySelector('.numeroRubrica num');
        const rubricNum = rubricNumNode ? rubricNumNode.getAttribute('value') : (doc[1][2] + 1);
        const resultElementRubric = 'Rubrica ' + rubricNum;

        const card = document.createElement('div');
        card.classList.add('card', 'mb-3');

        const cardHeader = document.createElement('div');
        cardHeader.classList.add('card-header');

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        const cardTitle = document.createElement('h5');
        cardTitle.classList.add('card-title');

        const cardLink = document.createElement('a');
        cardLink.href = 'https://statutiascoli.it/statuti.html?id=' + doc[1].join('_');
        cardLink.textContent = resultElementVolume + ', ' + resultElementBook + ', ' + resultElementRubric;
        cardLink.target = '_blank';
        cardTitle.appendChild(cardLink);

        const cardDescription = document.createElement('p');
        cardDescription.classList.add('card-text');
        cardDescription.textContent = headElement.textContent;

        const readLink = document.createElement('a');
        readLink.href = cardLink.href;
        readLink.textContent = ' (Leggi Rubrica)';
        readLink.target = '_blank';
        cardDescription.appendChild(readLink);

        cardHeader.appendChild(cardTitle);
        cardBody.appendChild(cardDescription);
        card.appendChild(cardHeader);
        card.appendChild(cardBody);

        container.appendChild(card);
      }
      else {
        const resultElementTitle = (doc[1][0] === 0) ? 'Introduzione' : (doc[1][0] === 3) ? 'Conclusione' : "";
       
        const card = document.createElement('div');
        card.classList.add('card', 'mb-3');

        const cardHeader = document.createElement('div');
        cardHeader.classList.add('card-header');

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        const cardTitle = document.createElement('h5');
        cardTitle.classList.add('card-title');

        const cardLink = document.createElement('a');
        cardLink.href = 'https://statutiascoli.it/statuti.html?id=' + doc[1][0]
        cardLink.textContent = resultElementTitle;
        cardLink.target = '_blank';
        cardTitle.appendChild(cardLink);

        const cardDescription = document.createElement('p');
        cardDescription.classList.add('card-text');
        cardDescription.textContent = resultElementTitle;

        const readLink = document.createElement('a');
        readLink.href = cardLink.href;
        readLink.textContent = ' (Leggi Testo)';
        readLink.target = '_blank';
        cardDescription.appendChild(readLink);

        cardHeader.appendChild(cardTitle);
        cardBody.appendChild(cardDescription);
        card.appendChild(cardHeader);
        card.appendChild(cardBody);

        container.appendChild(card);
      }
    });
  }

  function generatePaginationLinks(results, tab, currentPage) {
    const pageCount = Math.ceil(results.length / itemsPerPage);
    const pag = document.querySelector('.' + tab + ' .pagination');
    pag.innerHTML = '';

    for (let i = 1; i <= pageCount; i++) {
      const li = document.createElement('li');
      li.classList.add('page-item');

      const button = document.createElement('button');
      button.classList.add('page-link');
      button.textContent = i;

      li.appendChild(button);
      pag.appendChild(li);

      if (i === 1) button.classList.add('active');

      addButtonEventListener(button, i, results, tab, currentPage);
    }
  }

  function addButtonEventListener(button, page, results, tab, currentPage) {
    button.addEventListener('click', () => {
      currentPage = page;
      displayCurrentPage(results, tab, currentPage);

      const allButtons = document.querySelector('.' + tab + ' .pagination').querySelectorAll('.page-link');
      allButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    });
  }


  function setPersonIdInUrl(personId) {
    const url = new URL(window.location.href);
    if (personId) {
      url.searchParams.set('id', personId);
    } else {
      url.searchParams.delete('id');
    }
    window.history.replaceState({}, '', url.toString());
  }

  function getPersonIdFromUrl() {
    try {
      const url = new URL(window.location.href);
      const raw = url.searchParams.get('id');
      return safeText(raw); // trims + normalizes whitespace
    } catch (e) {
      return '';
    }
  }

  function selectPersonById(personId) {
    if (!personId) return false;

    const person = people.find(p => safeText(p.id).toLowerCase() === personId.toLowerCase());
    if (!person) return false;

    const btn = listContainer.querySelector(`button[data-person-id="${CSS.escape(person.id)}"]`);
    if (!btn) return false;

    const active = listContainer.querySelector('.list-group-item.active');
    if (active) active.classList.remove('active');
    btn.classList.add('active');

    populateResultsPerson(person, 'people-results', personCurrentPage, personResults);
    btn.scrollIntoView({ block: 'nearest' });
    return true;
  }
  const pid = getPersonIdFromUrl();
  selectPersonById(pid);

}).catch(err => {
  console.error('Errore nel caricamento persone/statuti:', err);
});
