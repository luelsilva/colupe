import "../../chunks/server.js";
//#region src/routes/+layout.svelte
function _layout($$renderer, $$props) {
	let { children } = $$props;
	$$renderer.push(`<div class="min-h-screen flex flex-col bg-base-100"><header class="navbar bg-base-200 border-b border-base-300 px-4 lg:px-8"><div class="flex-1"><a href="/" class="text-xl font-bold text-primary flex items-center gap-2"><span class="w-8 h-8 rounded-lg bg-primary text-primary-content flex items-center justify-center font-black">C</span> Colupe</a></div> <nav class="flex-none gap-2"><a href="/" class="btn btn-ghost btn-sm">Início</a> <a href="/precos" class="btn btn-ghost btn-sm">Preços</a> <a href="/sobre" class="btn btn-ghost btn-sm">Sobre</a> <a href="http://localhost:5173" class="btn btn-primary btn-sm ml-2">Acessar Plataforma</a></nav></header> <main class="flex-1">`);
	children($$renderer);
	$$renderer.push(`<!----></main> <footer class="footer sm:footer-horizontal bg-base-200 text-base-content p-10 border-t border-base-300"><aside><span class="font-bold text-lg text-primary">Colupe</span> <p>A melhor plataforma para contratar e prestar serviços no Brasil.<br/>© 2026 Colupe. Todos os direitos reservados.</p></aside> <nav><h6 class="footer-title">Institucional</h6> <a href="/sobre" class="link link-hover">Sobre Nós</a> <a href="/precos" class="link link-hover">Planos e Moedas</a> <a href="/" class="link link-hover">Termos de Uso</a></nav></footer></div>`);
}
//#endregion
export { _layout as default };
