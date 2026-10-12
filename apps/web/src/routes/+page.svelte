<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Search,
		CheckCircle,
		ShieldCheck,
		Zap,
		Star,
		ArrowRight
	} from 'lucide-svelte';
	import { CategoryIcon } from '@colupe/ui';
	import { API_URL } from '$lib/config/api';

	interface CategoryItem {
		id: number;
		slug: string;
		name: string;
		description: string | null;
		icon: string | null;
		isActive: boolean;
		orderIndex: number;
	}

	let searchTerm = $state('');
	let categories = $state<CategoryItem[]>([]);
	let isLoading = $state(true);

	onMount(async () => {
		try {
			const res = await fetch(`${API_URL}/catalog/categories`);
			if (res.ok) {
				const json = await res.json();
				categories = (json.data ?? []).filter((c: CategoryItem) => c.isActive !== false);
			}
		} finally {
			isLoading = false;
		}
	});

	let filteredCategories = $derived(
		searchTerm.trim()
			? categories.filter(c =>
					c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					(c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
			  )
			: categories
	);
</script>

<!-- Hero Section Sólida -->
<section class="border-b-2 border-base-300 bg-base-200 py-16">
	<div class="container mx-auto px-4 max-w-4xl text-center">
		<div class="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider mb-6 border border-primary/20">
			<Zap class="w-3.5 h-3.5" />
			Plataforma de Serviços Rápidos e Confiáveis
		</div>

		<h1 class="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
			O que você precisa resolver hoje?
		</h1>

		<p class="text-lg opacity-80 mb-8 max-w-2xl mx-auto">
			Conectamos você aos melhores profissionais verificados da sua cidade. Receba até 4 orçamentos gratuitos em minutos.
		</p>

		<!-- Barra de Busca -->
		<div class="bg-base-100 p-2 rounded-xl border-2 border-base-300 shadow-md flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
			<div class="relative flex-1 flex items-center">
				<Search class="w-5 h-5 text-base-content/40 absolute left-3.5" />
				<input
					type="text"
					bind:value={searchTerm}
					placeholder="Ex: Eletricista, Encanador, Pintor, Diarista..."
					class="w-full pl-11 pr-4 py-3 bg-transparent border-0 focus:outline-none text-base"
				/>
			</div>
			<a
				href="/pedir-servico"
				class="btn btn-primary px-8 font-bold text-base h-auto py-3"
			>
				Buscar Orçamento
			</a>
		</div>

		<!-- Tags Rápidas -->
		<div class="mt-4 flex items-center justify-center gap-2 flex-wrap text-xs">
			<span class="opacity-60 font-semibold">Populares:</span>
			<a href="/pedir-servico?s=eletricista" class="badge badge-outline hover:badge-primary cursor-pointer">Eletricista</a>
			<a href="/pedir-servico?s=encanador" class="badge badge-outline hover:badge-primary cursor-pointer">Encanador</a>
			<a href="/pedir-servico?s=pintor" class="badge badge-outline hover:badge-primary cursor-pointer">Pintor</a>
			<a href="/pedir-servico?s=diarista" class="badge badge-outline hover:badge-primary cursor-pointer">Diarista</a>
			<a href="/pedir-servico?s=criacao-sites" class="badge badge-outline hover:badge-primary cursor-pointer">Criação de Sites</a>
		</div>
	</div>
</section>

<!-- Categorias em Destaque -->
<section class="py-16 bg-base-100">
	<div class="container mx-auto px-4">
		<div class="flex items-center justify-between mb-10">
			<div>
				<h2 class="text-2xl font-black">Categorias de Serviços</h2>
				<p class="text-sm opacity-70">Selecione a área para encontrar o profissional ideal</p>
			</div>
			<a href="/categorias" class="btn btn-sm btn-ghost gap-1.5 font-bold text-primary">
				Ver todas
				<ArrowRight class="w-4 h-4" />
			</a>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#if isLoading}
				<div class="col-span-3 text-center py-12">
					<span class="loading loading-spinner loading-lg text-primary"></span>
				</div>
			{:else}
				{#each filteredCategories as cat}
					<a
						href="/pedir-servico?cat={cat.slug}"
						class="card bg-base-100 border-2 border-base-300 hover:border-primary transition-all p-6 rounded-xl group hover:shadow-md flex flex-col justify-between"
					>
						<div>
							<div class="flex items-start justify-between mb-4">
								<div class="p-3 bg-base-200 group-hover:bg-primary group-hover:text-primary-content rounded-lg transition-colors">
									<CategoryIcon name={cat.icon || cat.slug} class="w-6 h-6" />
								</div>
							</div>

							<h3 class="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
								{cat.name}
							</h3>
							<p class="text-sm opacity-70 mb-4">
								{cat.description || 'Especialistas prontos para atender você.'}
							</p>
						</div>

						<div class="flex items-center justify-between pt-4 border-t border-base-200 text-xs font-semibold opacity-80">
							<span class="text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
								Solicitar <ArrowRight class="w-3.5 h-3.5" />
							</span>
						</div>
					</a>
				{/each}
			{/if}
		</div>
	</div>
</section>

<!-- Como Funciona Section -->
<section class="py-16 bg-base-200 border-y-2 border-base-300">
	<div class="container mx-auto px-4">
		<div class="text-center max-w-2xl mx-auto mb-12">
			<h2 class="text-3xl font-black mb-3">Como o Colupe Funciona</h2>
			<p class="text-base opacity-75">Simples, rápido e 100% gratuito para quem solicita orçamentos</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			<div class="bg-base-100 p-6 rounded-xl border-2 border-base-300 flex flex-col items-center text-center">
				<div class="w-12 h-12 bg-primary text-primary-content rounded-full flex items-center justify-center font-black text-lg mb-4">
					1
				</div>
				<h3 class="font-bold text-lg mb-2">1. Faça o seu Pedido</h3>
				<p class="text-sm opacity-75">
					Preencha o formulário em menos de 2 minutos detalhando o que você precisa e sua localização.
				</p>
			</div>

			<div class="bg-base-100 p-6 rounded-xl border-2 border-base-300 flex flex-col items-center text-center">
				<div class="w-12 h-12 bg-secondary text-secondary-content rounded-full flex items-center justify-center font-black text-lg mb-4">
					2
				</div>
				<h3 class="font-bold text-lg mb-2">2. Receba Contatos</h3>
				<p class="text-sm opacity-75">
					Até 4 profissionais qualificados e disponíveis na sua região entram em contato diretamente com você.
				</p>
			</div>

			<div class="bg-base-100 p-6 rounded-xl border-2 border-base-300 flex flex-col items-center text-center">
				<div class="w-12 h-12 bg-accent text-accent-content rounded-full flex items-center justify-center font-black text-lg mb-4">
					3
				</div>
				<h3 class="font-bold text-lg mb-2">3. Escolha e Negocie</h3>
				<p class="text-sm opacity-75">
					Compare preços, portfólios e avaliações de clientes para contratar o profissional que preferir.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Banner para Profissionais -->
<section class="py-16 bg-base-100">
	<div class="container mx-auto px-4">
		<div class="bg-neutral text-neutral-content rounded-2xl p-8 md:p-12 border-2 border-neutral flex flex-col md:flex-row items-center justify-between gap-8">
			<div class="max-w-xl">
				<span class="badge badge-warning font-bold text-xs uppercase mb-3">Para Prestadores</span>
				<h2 class="text-3xl font-black mb-3">Você é um profissional autônomo ou empresa?</h2>
				<p class="text-sm opacity-80 leading-relaxed mb-6">
					Aumente sua cartela de clientes e receba pedidos diários na sua área de atuação. Cadastre-se agora e ganhe Colupas de bônus para começar a desbloquear contatos.
				</p>
				<div class="flex items-center gap-4 flex-wrap">
					<div class="flex items-center gap-1.5 text-xs font-semibold">
						<CheckCircle class="w-4 h-4 text-success" />
						Sem mensalidade fixa
					</div>
					<div class="flex items-center gap-1.5 text-xs font-semibold">
						<ShieldCheck class="w-4 h-4 text-success" />
						Leads verificados
					</div>
					<div class="flex items-center gap-1.5 text-xs font-semibold">
						<Star class="w-4 h-4 text-warning" />
						Perfil com avaliações
					</div>
				</div>
			</div>

			<a href="/profissional/cadastro" class="btn btn-primary btn-lg font-black px-8 shrink-0">
				Quero Novos Clientes
			</a>
		</div>
	</div>
</section>
