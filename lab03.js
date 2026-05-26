const { URL } = require('url'); // módulo nativo
const URL_BASE = 'https://books.toscrape.com';

function normalizarLinks(links, urlBase) {
	const base = urlBase || URL_BASE;
	if (!Array.isArray(links)) return [];
	const seen = new Set();
	for (const link of links) {
		try {
			const resolved = new URL(link, base);
			if (resolved.protocol === 'http:' || resolved.protocol === 'https:') {
				seen.add(resolved.href);
			}
		} catch (err) {
			continue;
		}
	}
	return Array.from(seen);
}

module.exports = { normalizarLinks };

if (require.main === module) {
	const exemplos = [
		'/catalogue/livro_1/index.html',
		'catalogue/livro_1/index.html',
		'http://books.toscrape.com/catalogue/livro_1/',
		'mailto:alguem@exemplo.com',
		'javascript:void(0)',
		'//books.toscrape.com/catalogue/livro_1/',
		'https://books.toscrape.com/catalogue/livro_1/'
	];
	console.log(normalizarLinks(exemplos, URL_BASE));
}