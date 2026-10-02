<script lang="ts">
	import { onMount } from 'svelte';
	import {
		ShieldAlert,
		Layers,
		FolderTree,
		Wrench,
		RefreshCw,
		ChevronRight,
		ToggleLeft,
		ToggleRight,
		Search,
		Coins
	} from 'lucide-svelte';

	const API = 'http://localhost:3333';

	// ── Estado ─────────────────────────────────────────────────────────────────
	type Category    = { id: string; name: string; slug: string; icon: string | null; description: string | null; isActive: boolean; orderIndex: number };
	type Subcategory = { id: string; categoryId: string; name: string; slug: string; isActive: boolean; orderIndex: number; categoryName: string | null };
	type Service     = { id: string; subcategoryId: string; name: string; slug: string; href: string | null; leadCostCredits: number; isActive: boolean; subcategoryName: string | null; categoryName: string | null };

	let categories    = $state<Category[]>([]);
	let subcategories = $state<Subcategory[]>([]);
	let services      = $state<Service[]>([]);

	let loading    = $state({ categories: true, subcategories: true, services: true });
	let error      = $state({ categories: '', subcategories: '', services: '' });

	let searchCat  = $state('');
	let searchSub  = $state('');
	let searchSvc  = $state('');

	// Filtros por seleção
	let selectedCategoryId    = $state<string | null>(null);
	let selectedSubcategoryId = $state<string | null>(null);

	// ── Derivados ───────────────────────────────────────────────────────────────
	let filteredCategories = $derived(
		categories.filter(c => c.name.toLowerCase().includes(searchCat.toLowerCase()))
	);

	let filteredSubcategories = $derived(
		subcategories
			.filter(s => !selectedCategoryId || s.categoryId === selectedCategoryId)
			.filter(s => s.name.toLowerCase().includes(searchSub.toLowerCase()))
	);

	let filteredServices = $derived(
		services
			.filter(s => !selectedSubcategoryId || s.subcategoryId === selectedSubcategoryId)
			.filter(s => !selectedCategoryId || subcategories.find(sub => sub.id === s.subcategoryId)?.categoryId === selectedCategoryId)
			.filter(s => s.name.toLowerCase().includes(searchSvc.toLowerCase()))
	);

	// ── Fetch ──────────────────────────────────────────────────────────────────
	async function fetchAll() {
		loading = { categories: true, subcategories: true, services: true };
		error   = { categories: '', subcategories: '', services: '' };

		await Promise.all([
			fetch(`${API}/catalog/categories`)
				.then(r => r.json())
				.then(j => { categories = j.data ?? []; })
				.catch(() => { error.categories = 'Erro ao carregar categorias'; })
				.finally(() => { loading.categories = false; }),

			fetch(`${API}/catalog/subcategories`)
				.then(r => r.json())
				.then(j => { subcategories = j.data ?? []; })
				.catch(() => { error.subcategories = 'Erro ao carregar subcategorias'; })
				.finally(() => { loading.subcategories = false; }),

			fetch(`${API}/catalog/services`)
				.then(r => r.json())
				.then(j => { services = j.data ?? []; })
				.catch(() => { error.services = 'Erro ao carregar serviços'; })
				.finally(() => { loading.services = false; }),
		]);
	}

	function selectCategory(id: string) {
		selectedCategoryId    = selectedCategoryId === id ? null : id;
		selectedSubcategoryId = null;
	}

	function selectSubcategory(id: string) {
		selectedSubcategoryId = selectedSubcategoryId === id ? null : id;
	}

	onMount(fetchAll);
</script>

<div class="min-h-screen bg-base-200">
	<!-- ── Header ────────────────────────────────────────────────────────────── -->
	<div class="bg-base-100 border-b-2 border-base-300 px-6 py-4">
		<div class="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
			<div class="flex items-center gap-3">
				<div class="inline-flex items-center gap-1.5 badge badge-secondary font-bold text-xs">
					<ShieldAlert class="w-3.5 h-3.5" /> Admin
				</div>
				<div>
					<h1 class="text-xl font-black leading-tight">Catálogo de Serviços</h1>
					<p class="text-xs opacity-60">Categorias · Subcategorias · Serviços</p>
				</div>
			</div>
			<button
				onclick={fetchAll}
				class="btn btn-sm btn-ghost gap-2 font-bold"
			>
				<RefreshCw class="w-4 h-4" /> Recarregar
			</button>
		</div>
	</div>

	<!-- ── Counters ──────────────────────────────────────────────────────────── -->
	<div class="max-w-[1600px] mx-auto px-6 pt-5 pb-0 grid grid-cols-3 gap-4">
		{#each [
			{ label: 'Categorias',    count: categories.length,    icon: FolderTree, color: 'text-primary'   },
			{ label: 'Subcategorias', count: subcategories.length, icon: Layers,     color: 'text-secondary' },
			{ label: 'Serviços',      count: services.length,      icon: Wrench,     color: 'text-accent'    },
		] as stat}
			<div class="bg-base-100 border-2 border-base-300 rounded-xl px-5 py-3 flex items-center gap-3">
				<stat.icon class="w-6 h-6 {stat.color} shrink-0" />
				<div>
					<p class="text-2xl font-black leading-none">{stat.count}</p>
					<p class="text-xs opacity-60 font-semibold">{stat.label}</p>
				</div>
			</div>
		{/each}
	</div>

	<!-- ── 3 painéis ─────────────────────────────────────────────────────────── -->
	<div class="max-w-[1600px] mx-auto px-6 py-5 grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

		<!-- ── Painel 1: Categorias ────────────────────────────────────────────── -->
		<div class="bg-base-100 border-2 border-base-300 rounded-xl flex flex-col overflow-hidden">
			<!-- cabeçalho -->
			<div class="px-4 pt-4 pb-3 border-b border-base-200">
				<div class="flex items-center gap-2 mb-3">
					<FolderTree class="w-4 h-4 text-primary shrink-0" />
					<h2 class="font-black text-sm">Categorias</h2>
					{#if selectedCategoryId}
						<button onclick={() => { selectedCategoryId = null; selectedSubcategoryId = null; }}
							class="ml-auto badge badge-primary badge-sm cursor-pointer font-bold">
							limpar filtro ✕
						</button>
					{/if}
				</div>
				<label class="input input-sm input-bordered flex items-center gap-2 w-full">
					<Search class="w-3.5 h-3.5 opacity-50 shrink-0" />
					<input type="text" placeholder="Buscar..." bind:value={searchCat} class="grow text-xs" />
				</label>
			</div>

			<!-- lista -->
			<div class="overflow-y-auto max-h-[calc(100vh-260px)]">
				{#if loading.categories}
					<div class="flex items-center justify-center py-12 gap-2 opacity-50">
						<span class="loading loading-spinner loading-sm"></span>
						<span class="text-xs">Carregando...</span>
					</div>
				{:else if error.categories}
					<p class="text-error text-xs text-center py-8 px-4">{error.categories}</p>
				{:else if filteredCategories.length === 0}
					<p class="text-xs text-center py-8 opacity-50">Nenhuma categoria encontrada</p>
				{:else}
					{#each filteredCategories as cat}
						{@const isSelected = selectedCategoryId === cat.id}
						<button
							onclick={() => selectCategory(cat.id)}
							class="w-full text-left px-4 py-3 border-b border-base-200 last:border-0 hover:bg-base-200 transition-colors flex items-center gap-3
								{isSelected ? 'bg-primary/10 border-l-2 border-l-primary' : ''}"
						>
							<span class="text-lg w-7 text-center shrink-0">{cat.icon ?? '📂'}</span>
							<div class="flex-1 min-w-0">
								<p class="font-bold text-sm truncate">{cat.name}</p>
								<p class="text-xs opacity-50 truncate">{cat.slug}</p>
							</div>
							<div class="flex items-center gap-1.5 shrink-0">
								{#if cat.isActive}
									<ToggleRight class="w-4 h-4 text-success" />
								{:else}
									<ToggleLeft class="w-4 h-4 opacity-30" />
								{/if}
								<ChevronRight class="w-3.5 h-3.5 opacity-30 {isSelected ? 'text-primary opacity-100' : ''}" />
							</div>
						</button>
					{/each}
				{/if}
			</div>
		</div>

		<!-- ── Painel 2: Subcategorias ─────────────────────────────────────────── -->
		<div class="bg-base-100 border-2 border-base-300 rounded-xl flex flex-col overflow-hidden">
			<div class="px-4 pt-4 pb-3 border-b border-base-200">
				<div class="flex items-center gap-2 mb-3">
					<Layers class="w-4 h-4 text-secondary shrink-0" />
					<h2 class="font-black text-sm">Subcategorias</h2>
					{#if selectedCategoryId}
						<span class="ml-auto badge badge-secondary badge-sm font-semibold text-xs">
							filtradas por categoria
						</span>
					{/if}
				</div>
				<label class="input input-sm input-bordered flex items-center gap-2 w-full">
					<Search class="w-3.5 h-3.5 opacity-50 shrink-0" />
					<input type="text" placeholder="Buscar..." bind:value={searchSub} class="grow text-xs" />
				</label>
			</div>

			<div class="overflow-y-auto max-h-[calc(100vh-260px)]">
				{#if loading.subcategories}
					<div class="flex items-center justify-center py-12 gap-2 opacity-50">
						<span class="loading loading-spinner loading-sm"></span>
						<span class="text-xs">Carregando...</span>
					</div>
				{:else if error.subcategories}
					<p class="text-error text-xs text-center py-8 px-4">{error.subcategories}</p>
				{:else if filteredSubcategories.length === 0}
					<p class="text-xs text-center py-8 opacity-50">
						{selectedCategoryId ? 'Nenhuma subcategoria nesta categoria' : 'Nenhuma subcategoria encontrada'}
					</p>
				{:else}
					{#each filteredSubcategories as sub}
						{@const isSelected = selectedSubcategoryId === sub.id}
						<button
							onclick={() => selectSubcategory(sub.id)}
							class="w-full text-left px-4 py-3 border-b border-base-200 last:border-0 hover:bg-base-200 transition-colors flex items-center gap-3
								{isSelected ? 'bg-secondary/10 border-l-2 border-l-secondary' : ''}"
						>
							<div class="flex-1 min-w-0">
								<p class="font-bold text-sm truncate">{sub.name}</p>
								<p class="text-xs opacity-40 truncate">{sub.categoryName ?? '—'}</p>
							</div>
							<div class="flex items-center gap-1.5 shrink-0">
								{#if sub.isActive}
									<ToggleRight class="w-4 h-4 text-success" />
								{:else}
									<ToggleLeft class="w-4 h-4 opacity-30" />
								{/if}
								<ChevronRight class="w-3.5 h-3.5 opacity-30 {isSelected ? 'text-secondary opacity-100' : ''}" />
							</div>
						</button>
					{/each}
				{/if}
			</div>
		</div>

		<!-- ── Painel 3: Serviços ──────────────────────────────────────────────── -->
		<div class="bg-base-100 border-2 border-base-300 rounded-xl flex flex-col overflow-hidden">
			<div class="px-4 pt-4 pb-3 border-b border-base-200">
				<div class="flex items-center gap-2 mb-3">
					<Wrench class="w-4 h-4 text-accent shrink-0" />
					<h2 class="font-black text-sm">Serviços</h2>
					{#if selectedSubcategoryId || selectedCategoryId}
						<span class="ml-auto badge badge-accent badge-sm font-semibold text-xs">
							filtrados
						</span>
					{/if}
				</div>
				<label class="input input-sm input-bordered flex items-center gap-2 w-full">
					<Search class="w-3.5 h-3.5 opacity-50 shrink-0" />
					<input type="text" placeholder="Buscar..." bind:value={searchSvc} class="grow text-xs" />
				</label>
			</div>

			<div class="overflow-y-auto max-h-[calc(100vh-260px)]">
				{#if loading.services}
					<div class="flex items-center justify-center py-12 gap-2 opacity-50">
						<span class="loading loading-spinner loading-sm"></span>
						<span class="text-xs">Carregando...</span>
					</div>
				{:else if error.services}
					<p class="text-error text-xs text-center py-8 px-4">{error.services}</p>
				{:else if filteredServices.length === 0}
					<p class="text-xs text-center py-8 opacity-50">
						{selectedSubcategoryId ? 'Nenhum serviço nesta subcategoria' : 'Nenhum serviço encontrado'}
					</p>
				{:else}
					{#each filteredServices as svc}
						<div class="px-4 py-3 border-b border-base-200 last:border-0 flex items-start gap-3 hover:bg-base-200 transition-colors">
							<div class="flex-1 min-w-0">
								<p class="font-bold text-sm truncate">{svc.name}</p>
								<p class="text-xs opacity-40 truncate">
									{svc.categoryName ?? '—'} › {svc.subcategoryName ?? '—'}
								</p>
								{#if svc.href}
									<p class="text-xs opacity-30 truncate font-mono mt-0.5">{svc.href}</p>
								{/if}
							</div>
							<div class="flex flex-col items-end gap-1 shrink-0">
								<div class="flex items-center gap-1 badge badge-sm badge-ghost font-bold">
									<Coins class="w-3 h-3 text-warning" />
									{svc.leadCostCredits}
								</div>
								{#if svc.isActive}
									<ToggleRight class="w-4 h-4 text-success" />
								{:else}
									<ToggleLeft class="w-4 h-4 opacity-30" />
								{/if}
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>

	</div>
</div>
