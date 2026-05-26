const https = require('https');
const URL_ALVO = 'https://books.toscrape.com';

function buscarHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let html = '';
      res.on('data', chunk => { html += chunk; });
      res.on('end', () => resolve(html));
    }).on('error', err => reject(err));
  });
}

function extrairLinks(html) {
  const re = /href=\"([^\"]*)\"/g;
  const links = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    links.push(m[1]);
  }
  return links;
}

buscarHTML(URL_ALVO)
  .then(html => {
    const links = extrairLinks(html);
    console.log(`Total de links encontrados: ${links.length}`);
    links.forEach(link => console.log(link));
  })
  .catch(err => console.error('Erro:', err.message));

// Se a URL usar http em vez de https, o módulo https não funciona.
// Para HTTP é preciso usar o módulo http.
// O evento 'data' pode ser disparado várias vezes porque a resposta chega em pedaços
// (chunks) e o Node.js emite cada pedaço separadamente antes de completar o download.