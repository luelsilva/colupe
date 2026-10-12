<script lang="ts">
	import { onMount } from 'svelte';
	import { CategoryIcon, alert } from '@colupe/ui';
	import { APP_ERRORS } from '@colupe/shared';
	import { API_URL } from '$lib/config/api';
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
		Coins,
		CheckCircle2,
		XCircle
	} from 'lucide-svelte';

	// ── Estado ─────────────────────────────────────────────────────────────────
	type Category    = { id: number | string; name: string; slug: string; icon: string | null; description: string | null; isActive: boolean; orderIndex: number };
	type Subcategory = { id: number | string; categoryId: number | string; name: string; slug: string; isActive: boolean; orderIndex: number; categoryName: string | null };
	type Service     = { id: number | string; subcategoryId: number | string; name: string; slug: string; href: string | null; leadCostCredits: number; isActive: boolean; subcategoryName: string | null; categoryName: string | null };

	let categories    = $state<Category[]>([]);
	let subcategories = $state<Subcategory[]>([]);
	let services      = $state<Service[]>([]);

	let loading    = $state({ categories: true, subcategories: true, services: true });
	let error      = $state({ categories: '', subcategories: '', services: '' });
	let togglingId = $state<string | number | null>(null);

	let searchCat  = $state('');
	let searchSub  = $state('');
	let searchSvc  = $state('');

	// Filtros por seleção
	let selectedCategoryId    = $state<number | string | null>(null);
	let selectedSubcategoryId = $state<number | string | null>(null);

	// ── Derivados ───────────────────────────────────────────────────────────────
	let filteredCategories = $derived(
		categories.filter(c => c.name.toLowerCase().includes(searchCat.toLowerCase()))
	);

	let filteredSubcategories = $derived(
		subcategories
			.filter(s => selectedCategoryId === null || String(s.categoryId) === String(selectedCategoryId))
			.filter(s => s.name.toLowerCase().includes(searchSub.toLowerCase()))
	);

	let filteredServices = $derived(
		services
			.filter(s => selectedSubcategoryId === null || String(s.subcategoryId) === String(selectedSubcategoryId))
			.filter(s => selectedCategoryId === null || subcategories.find(sub => String(sub.id) === String(s.subcategoryId))?.categoryId?.toString() === String(selectedCategoryId))
			.filter(s => s.name.toLowerCase().includes(searchSvc.toLowerCase()))
	);

	// ── Fetch ──────────────────────────────────────────────────────────────────
	async function fetchAll() {
		loading = { categories: true, subcategories: true, services: true };
		error   = { categories: '', subcategories: '', services: '' };

		await Promise.all([
			fetch(`${API_URL}/catalog/categories`)
				.then(r => r.json())
				.then(j => { categories = j.data ?? []; })
				.catch(() => { error.categories = APP_ERRORS.CATEGORY_FETCH_ERROR; })
				.finally(() => { loading.categories = false; }),

			fetch(`${API_URL}/catalog/subcategories`)
				.then(r => r.json())
				.then(j => { subcategories = j.data ?? []; })
				.catch(() => { error.subcategories = APP_ERRORS.SUBCATEGORY_FETCH_ERROR; })
				.finally(() => { loading.subcategories = false; }),

			fetch(`${API_URL}/catalog/services`)
				.then(r => r.json())
				.then(j => { services = j.data ?? []; })
				.catch(() => { error.services = APP_ERRORS.SERVICE_FETCH_ERROR; })
				.finally(() => { loading.services = false; }),
		]);
	}

	function selectCategory(id: number | string) {
		selectedCategoryId    = String(selectedCategoryId) === String(id) ? null : id;
		selectedSubcategoryId = null;
	}

	function selectSubcategory(id: number | string) {
		selectedSubcategoryId = String(selectedSubcategoryId) === String(id) ? null : id;
	}

	// ── Ações de Ativar / Desativar ────────────────────────────────────────────
	async function toggleCategory(id: number | string, e: MouseEvent) {
		e.stopPropagation();
		const cat = categories.find(c => String(c.id) === String(id));
		if (!cat || togglingId) return;

		const prevStatus = cat.isActive;
		cat.isActive = !prevStatus;
		togglingId = `cat-${id}`;

		try {
			const res = await fetch(`${API_URL}/catalog/categories/${id}/toggle`, { method: 'PATCH' });
			if (!res.ok) throw new Error();
			alert.success(`Categoria "${cat.name}" ${cat.isActive ? 'ativada' : 'desativada'} com sucesso.`);
		} catch {
			cat.isActive = prevStatus;
			alert.error(APP_ERRORS.CATEGORY_STATUS_UPDATE_ERROR);
		} finally {
			togglingId = null;
		}
	}

	async function toggleSubcategory(id: number | string, e: MouseEvent) {
		e.stopPropagation();
		const sub = subcategories.find(s => String(s.id) === String(id));
		if (!sub || togglingId) return;

		const prevStatus = sub.isActive;
		sub.isActive = !prevStatus;
		togglingId = `sub-${id}`;

		try {
			const res = await fetch(`${API_URL}/catalog/subcategories/${id}/toggle`, { method: 'PATCH' });
			if (!res.ok) throw new Error();
			alert.success(`Subcategoria "${sub.name}" ${sub.isActive ? 'ativada' : 'desativada'} com sucesso.`);
		} catch {
			sub.isActive = prevStatus;
			alert.error(APP_ERRORS.SUBCATEGORY_STATUS_UPDATE_ERROR);
		} finally {
			togglingId = null;
		}
	}

	async function toggleService(id: number | string, e: MouseEvent) {
		e.stopPropagation();
		const svc = services.find(s => String(s.id) === String(id));
		if (!svc || togglingId) return;

		const prevStatus = svc.isActive;
		svc.isActive = !prevStatus;
		togglingId = `svc-${id}`;

		try {
			const res = await fetch(`${API_URL}/catalog/services/${id}/toggle`, { method: 'PATCH' });
			if (!res.ok) throw new Error();
			alert.success(`Serviço "${svc.name}" ${svc.isActive ? 'ativado' : 'desativado'} com sucesso.`);
		} catch {
			svc.isActive = prevStatus;
			alert.error(APP_ERRORS.SERVICE_STATUS_UPDATE_ERROR);
		} finally {
			togglingId = null;
		}
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
					<p class="text-xs opacity-60">Gerenciamento, Ativação e Desativação em Tempo Real</p>
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
			{ label: 'Categorias',    count: categories.length,    active: categories.filter(c => c.isActive).length,    icon: FolderTree, color: 'text-primary'   },
			{ label: 'Subcategorias', count: subcategories.length, active: subcategories.filter(s => s.isActive).length, icon: Layers,     color: 'text-secondary' },
			{ label: 'Serviços',      count: services.length,      active: services.filter(s => s.isActive).length,      icon: Wrench,     color: 'text-accent'    },
		] as stat}
			<div class="bg-base-100 border-2 border-base-300 rounded-xl px-5 py-3 flex items-center justify-between gap-3">
				<div class="flex items-center gap-3">
					<stat.icon class="w-6 h-6 {stat.color} shrink-0" />
					<div>
						<p class="text-2xl font-black leading-none">{stat.count}</p>
						<p class="text-xs opacity-60 font-semibold">{stat.label}</p>
					</div>
				</div>
				<div class="text-right text-xs">
					<span class="badge badge-success badge-sm font-bold gap-1">
						<CheckCircle2 class="w-3 h-3" /> {stat.active} ativos
					</span>
					{#if stat.count - stat.active > 0}
						<span class="badge badge-ghost badge-sm opacity-60 ml-1 font-bold">
							{stat.count - stat.active} inativos
						</span>
					{/if}
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
					<input type="text" placeholder="Buscar categoria..." bind:value={searchCat} class="grow text-xs" />
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
						<div
							role="button"
							tabindex="0"
							onclick={() => selectCategory(cat.id)}
							onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') selectCategory(cat.id); }}
							class="w-full text-left px-4 py-3 border-b border-base-200 last:border-0 hover:bg-base-200 transition-colors flex items-center gap-3 cursor-pointer
								{isSelected ? 'bg-primary/10 border-l-2 border-l-primary' : ''} {!cat.isActive ? 'opacity-50 bg-base-200/50' : ''}"
						>
							<div class="w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center text-primary shrink-0">
								<CategoryIcon name={cat.icon} class="w-4 h-4" />
							</div>
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-1.5">
									<p class="font-bold text-sm truncate {cat.isActive ? '' : 'line-through text-base-content/60'}">{cat.name}</p>
									{#if !cat.isActive}
										<span class="badge badge-ghost badge-xs text-[10px] uppercase font-bold">Inativa</span>
									{/if}
								</div>
								<p class="text-xs opacity-50 truncate">{cat.slug}</p>
							</div>
							<div class="flex items-center gap-2 shrink-0">
								<!-- Botão Interativo Ativar/Desativar -->
								<button
									type="button"
									onclick={(e) => toggleCategory(cat.id, e)}
									disabled={togglingId === `cat-${cat.id}`}
									class="btn btn-ghost btn-xs btn-circle hover:bg-base-300"
									title={cat.isActive ? 'Clique para desativar' : 'Clique para ativar'}
								>
									{#if cat.isActive}
										<ToggleRight class="w-5 h-5 text-success" />
									{:else}
										<ToggleLeft class="w-5 h-5 opacity-40 hover:opacity-80" />
									{/if}
								</button>
								<ChevronRight class="w-3.5 h-3.5 opacity-30 {isSelected ? 'text-primary opacity-100' : ''}" />
							</div>
						</div>
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
					<input type="text" placeholder="Buscar subcategoria..." bind:value={searchSub} class="grow text-xs" />
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
						<div
							role="button"
							tabindex="0"
							onclick={() => selectSubcategory(sub.id)}
							onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') selectSubcategory(sub.id); }}
							class="w-full text-left px-4 py-3 border-b border-base-200 last:border-0 hover:bg-base-200 transition-colors flex items-center gap-3 cursor-pointer
								{isSelected ? 'bg-secondary/10 border-l-2 border-l-secondary' : ''} {!sub.isActive ? 'opacity-50 bg-base-200/50' : ''}"
						>
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-1.5">
									<p class="font-bold text-sm truncate {sub.isActive ? '' : 'line-through text-base-content/60'}">{sub.name}</p>
									{#if !sub.isActive}
										<span class="badge badge-ghost badge-xs text-[10px] uppercase font-bold">Inativa</span>
									{/if}
								</div>
								<p class="text-xs opacity-40 truncate">{sub.categoryName ?? '—'}</p>
							</div>
							<div class="flex items-center gap-2 shrink-0">
								<!-- Botão Interativo Ativar/Desativar -->
								<button
									type="button"
									onclick={(e) => toggleSubcategory(sub.id, e)}
									disabled={togglingId === `sub-${sub.id}`}
									class="btn btn-ghost btn-xs btn-circle hover:bg-base-300"
									title={sub.isActive ? 'Clique para desativar' : 'Clique para ativar'}
								>
									{#if sub.isActive}
										<ToggleRight class="w-5 h-5 text-success" />
									{:else}
										<ToggleLeft class="w-5 h-5 opacity-40 hover:opacity-80" />
									{/if}
								</button>
								<ChevronRight class="w-3.5 h-3.5 opacity-30 {isSelected ? 'text-secondary opacity-100' : ''}" />
							</div>
						</div>
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
					<input type="text" placeholder="Buscar serviço..." bind:value={searchSvc} class="grow text-xs" />
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
						<div class="px-4 py-3 border-b border-base-200 last:border-0 flex items-start gap-3 hover:bg-base-200 transition-colors {!svc.isActive ? 'opacity-50 bg-base-200/50' : ''}">
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-1.5">
									<p class="font-bold text-sm truncate {svc.isActive ? '' : 'line-through text-base-content/60'}">{svc.name}</p>
									{#if !svc.isActive}
										<span class="badge badge-ghost badge-xs text-[10px] uppercase font-bold">Inativo</span>
									{/if}
								</div>
								<p class="text-xs opacity-40 truncate">
									{svc.categoryName ?? '—'} › {svc.subcategoryName ?? '—'}
								</p>
								{#if svc.href}
									<p class="text-xs opacity-30 truncate font-mono mt-0.5">{svc.href}</p>
								{/if}
							</div>
							<div class="flex items-center gap-2 shrink-0">
								<div class="flex items-center gap-1 badge badge-sm badge-ghost font-bold" title="Custo em Colupas">
									<Coins class="w-3 h-3 text-warning" />
									{svc.leadCostCredits}
								</div>

								<!-- Botão Interativo Ativar/Desativar Serviço -->
								<button
									type="button"
									onclick={(e) => toggleService(svc.id, e)}
									disabled={togglingId === `svc-${svc.id}`}
									class="btn btn-ghost btn-xs btn-circle hover:bg-base-300"
									title={svc.isActive ? 'Clique para desativar serviço' : 'Clique para ativar serviço'}
								>
									{#if svc.isActive}
										<ToggleRight class="w-5 h-5 text-success" />
									{:else}
										<ToggleLeft class="w-5 h-5 opacity-40 hover:opacity-80" />
									{/if}
								</button>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>

	</div>
</div>
