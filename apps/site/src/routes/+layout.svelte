<script lang="ts">
	import '../app.css';
	import { Logo } from '@colupe/ui';
	let { children } = $props();
</script>

<div class="min-h-screen flex flex-col bg-base-100">
	<!-- Navbar -->
	<header class="navbar bg-base-200 border-b border-base-300 px-4 lg:px-8">
		<div class="flex-1">
			<a href="/" class="hover:opacity-90 transition-opacity">
				<Logo size={32} textClass="text-2xl font-black text-primary" />
			</a>
		</div>
		<nav class="flex-none gap-2">
			<a href="/" class="btn btn-ghost btn-sm">Início</a>
			<a href="/precos" class="btn btn-ghost btn-sm">Preços</a>
			<a href="/sobre" class="btn btn-ghost btn-sm">Sobre</a>
			<a href="http://localhost:3000" class="btn btn-primary btn-sm ml-2">Acessar Plataforma</a>
		</nav>
	</header>

	<!-- Conteúdo Principal -->
	<main class="flex-1">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="footer sm:footer-horizontal bg-base-200 text-base-content p-10 border-t border-base-300">
		<aside>
			<Logo size={28} textClass="text-xl font-bold text-primary" />
			<p class="mt-2">A melhor plataforma para contratar e prestar serviços no Brasil.<br />© 2026 Colupe. Todos os direitos reservados.</p>
		</aside>
		<nav>
			<h6 class="footer-title">Institucional</h6>
			<a href="/sobre" class="link link-hover">Sobre Nós</a>
			<a href="/precos" class="link link-hover">Planos e Colupas</a>
			<a href="/" class="link link-hover">Termos de Uso</a>
		</nav>
	</footer>
</div>
