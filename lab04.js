const { URL } = require('url');
const { normalizarLinks } = require('./lab03');
const fs = require('fs').promises;

const visitados = new Set();
const todosLinks = new Set();
const LIMITE_PAGINAS = 5;

/**
 * Crawl recursivo com profundidade limitada.
 * @param {string} urlInicial
 * @param {number} profundidade
 */
async function crawl(urlInicial, profundidade = 1) {
	const origem = new URL(urlInicial).origin;

	async function _crawl(url, profundidadeAtual) {
		if (visitados.size >= LIMITE_PAGINAS) return;
		if (visitados.has(url)) return;
		visitados.add(url);
		console.log(`[${visitados.size}/${LIMITE_PAGINAS}] Visitando: ${url}`);

		let html = '';
		try {
			const res = await fetch(url);
			if (!res.ok) return;
			html = await res.text();
		} catch (err) {
			console.error(`Falha ao buscar ${url}: ${err.message}`);
			return;
		}

		const hrefs = Array.from(html.matchAll(/href\s*=\s*["']([^"']+)["']/gi)).map(m => m[1]);
		const normalizados = normalizarLinks(hrefs, url);

		for (const l of normalizados) todosLinks.add(l);

		const internos = normalizados.filter(l => {
			try {
				return new URL(l).origin === origem;
			} catch {
				return false;
			}
		});

		// Se ainda houver profundidade disponível, visitar cada link interno
		if (profundidadeAtual < profundidade) {
			for (const link of internos) {
				if (visitados.size >= LIMITE_PAGINAS) break;
				await _crawl(link, profundidadeAtual + 1);
			}
		}
	}

	await _crawl(urlInicial, 0);

	try {
		await fs.writeFile('links.json', JSON.stringify(Array.from(todosLinks), null, 2), 'utf8');
		console.log('links.json salvo.');
	} catch (err) {
		console.error('Erro ao salvar links.json:', err.message);
	}
}

if (require.main === module) {
	crawl('https://books.toscrape.com', 1).then(() => {
		console.log(`\nTotal de links únicos: ${todosLinks.size}`);
		console.log(`Páginas visitadas: ${visitados.size}`);
	});
}