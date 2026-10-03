<script lang="ts">
	import '../app.css';
	import Alert from '$lib/components/dialogs/Alert.svelte';
	import ConfirmModal from '$lib/components/dialogs/ConfirmModal.svelte';
	import { Logo } from '@colupe/ui';
	import {
		Search,
		Briefcase,
		ShieldAlert,
		Sun,
		Moon,
		PlusCircle,
		User
	} from 'lucide-svelte';

	let { children } = $props();

	let isDark = $state(false);

	function toggleTheme() {
		isDark = !isDark;
		const html = document.querySelector('html');
		if (html) {
			html.setAttribute('data-theme', isDark ? 'dark' : 'light');
		}
	}
</script>

<div class="min-h-screen flex flex-col bg-base-100 text-base-content">
	<!-- Navbar Principal Sólida -->
	<header class="border-b-2 border-base-300 bg-base-200 sticky top-0 z-50">
		<div class="container mx-auto px-4 h-16 flex items-center justify-between">
			<!-- Logo Colupe Oficial -->
			<a href="/" class="flex items-center gap-2 hover:opacity-90 transition-opacity">
				<Logo size={34} textClass="text-2xl font-black tracking-wider text-primary" />
			</a>

			<!-- Navegação Principal -->
			<nav class="hidden md:flex items-center gap-6 font-medium text-sm">
				<a href="/" class="hover:text-primary transition-colors flex items-center gap-1.5">
					<Search class="w-4 h-4" />
					Buscar Serviços
				</a>
				<a href="/pedir-servico" class="hover:text-primary transition-colors flex items-center gap-1.5">
					<PlusCircle class="w-4 h-4" />
					Pedir Orçamento
				</a>
				<a href="/profissional" class="hover:text-primary transition-colors flex items-center gap-1.5">
					<Briefcase class="w-4 h-4" />
					Área do Profissional
				</a>
				<a href="/admin" class="hover:text-primary transition-colors flex items-center gap-1.5 text-secondary">
					<ShieldAlert class="w-4 h-4" />
					Painel Admin
				</a>
			</nav>

			<!-- Ações Direita -->
			<div class="flex items-center gap-3">
				<button
					onclick={toggleTheme}
					class="btn btn-sm btn-ghost btn-circle border border-base-300"
					aria-label="Alternar tema"
				>
					{#if isDark}
						<Sun class="w-4 h-4 text-warning" />
					{:else}
						<Moon class="w-4 h-4 text-neutral" />
					{/if}
				</button>

				<a href="/login" class="btn btn-sm btn-outline border-base-300 gap-1.5">
					<User class="w-4 h-4" />
					Entrar
				</a>

				<a href="/profissional/cadastro" class="btn btn-sm btn-primary font-bold">
					Cadastrar como Profissional
				</a>
			</div>
		</div>
	</header>

	<!-- Conteúdo Dinâmico -->
	<main class="flex-1">
		{@render children()}
	</main>

	<!-- Rodapé Sólido -->
	<footer class="border-t-2 border-base-300 bg-base-200 py-10 mt-16">
		<div class="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
			<div>
				<div class="mb-3">
					<Logo size={28} textClass="text-xl font-black text-primary" />
				</div>
				<p class="text-sm opacity-75">
					A maior plataforma para conectar clientes aos melhores profissionais e prestadores de serviços da região.
				</p>
			</div>

			<div>
				<h4 class="font-bold text-sm uppercase tracking-wider mb-3">Para Clientes</h4>
				<ul class="space-y-2 text-sm opacity-80">
					<li><a href="/" class="hover:underline">Como Funciona</a></li>
					<li><a href="/pedir-servico" class="hover:underline">Solicitar Orçamento Grátis</a></li>
					<li><a href="/categorias" class="hover:underline">Todas as Categorias</a></li>
				</ul>
			</div>

			<div>
				<h4 class="font-bold text-sm uppercase tracking-wider mb-3">Para Profissionais</h4>
				<ul class="space-y-2 text-sm opacity-80">
					<li><a href="/profissional/cadastro" class="hover:underline">Cadastre seu Negócio</a></li>
					<li><a href="/profissional" class="hover:underline">Feed de Oportunidades</a></li>
					<li><a href="/profissional/creditos" class="hover:underline">Pacotes de Moedas</a></li>
				</ul>
			</div>

			<div>
				<h4 class="font-bold text-sm uppercase tracking-wider mb-3">Administração</h4>
				<ul class="space-y-2 text-sm opacity-80">
					<li><a href="/admin" class="hover:underline">Moderação de Prestadores</a></li>
					<li><a href="/admin/categorias" class="hover:underline">Catálogo de Serviços</a></li>
					<li><a href="/admin/metricas" class="hover:underline">Métricas do Sistema</a></li>
				</ul>
			</div>
		</div>

		<div class="container mx-auto px-4 mt-8 pt-6 border-t border-base-300 text-center text-xs opacity-60">
			&copy; 2026 Colupe Serviços. Todos os direitos reservados.
		</div>
	</footer>

	<!-- Modais e Notificações Globais -->
	<Alert />
	<ConfirmModal />
</div>
