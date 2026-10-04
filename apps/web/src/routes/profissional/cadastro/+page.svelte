<script lang="ts">
	import { onMount } from 'svelte';
	import { alert } from '$lib/components/dialogs/alerts.svelte';
	import { validateDocument, APP_ERRORS } from '@colupe/shared';
	import {
		Phone,
		User,
		Mail,
		Building,
		Briefcase,
		MapPin,
		FileText,
		CheckCircle,
		XCircle,
		ArrowRight,
		ArrowLeft,
		Sparkles,
		ShieldCheck,
		Search,
		Layers
	} from 'lucide-svelte';

	// ─── INTERFACES ───────────────────────────────────────────────────────
	interface Category {
		id: number;
		name: string;
		slug: string;
		icon: string;
		isActive?: boolean;
	}

	interface Service {
		id: number;
		subcategoryId: number;
		name: string;
		slug: string;
		categoryId?: number;
		categoryName?: string;
		subcategoryName?: string;
		isActive?: boolean;
		subcategoryIsActive?: boolean;
		categoryIsActive?: boolean;
	}

	// ─── ESTADOS DO FORMULÁRIO ───────────────────────────────────────────
	let currentStep = $state(1);
	const totalSteps = 5;

	// Passo 1: Telefone
	let phone = $state('');

	// Passo 2: Dados Pessoais
	let fullName = $state('');
	let email = $state('');
	let companyName = $state('');

	// Passo 3: Categorias e Especialidades
	let categories = $state<Category[]>([]);
	let services = $state<Service[]>([]);
	let selectedCategoryId = $state<number | null>(null);
	let selectedServices = $state<number[]>([]);
	let searchService = $state('');
	let isLoadingCatalog = $state(false);

	// Passo 4: Identificação (CPF / CNPJ)
	let docType = $state<'CPF' | 'CNPJ'>('CPF');
	let docNumber = $state('');

	// Passo 5: Localização e Raio de Atendimento
	let city = $state('Criciúma');
	let stateUf = $state('SC');
	let serviceRadiusKm = $state(35);

	let isSubmitting = $state(false);
	let isCompleted = $state(false);

	// ─── CARREGAR CATÁLOGO DA API ─────────────────────────────────────────
	onMount(async () => {
		try {
			isLoadingCatalog = true;
			const [catRes, svcRes] = await Promise.all([
				fetch('http://localhost:3333/catalog/categories').catch(() => null),
				fetch('http://localhost:3333/catalog/services').catch(() => null)
			]);

			if (catRes?.ok) {
				const json = await catRes.json();
				categories = json.data || [];
			}

			if (svcRes?.ok) {
				const json = await svcRes.json();
				services = json.data || [];
			}
		} catch (e) {
			console.warn('Erro ao carregar catálogo da API');
		} finally {
			isLoadingCatalog = false;
		}
	});

	// ─── MÁSCARAS E FORMATAÇÃO ────────────────────────────────────────────
	function formatPhone(val: string) {
		const digits = val.replace(/\D/g, '').slice(0, 11);
		if (digits.length <= 2) return digits;
		if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
		return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
	}

	function formatDoc(val: string, type: 'CPF' | 'CNPJ') {
		const digits = val.replace(/\D/g, '');
		if (type === 'CPF') {
			const d = digits.slice(0, 11);
			if (d.length <= 3) return d;
			if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
			if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
			return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
		} else {
			const d = digits.slice(0, 14);
			if (d.length <= 2) return d;
			if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
			if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
			if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
			return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
		}
	}

	function handlePhoneInput(e: Event) {
		const target = e.target as HTMLInputElement;
		phone = formatPhone(target.value);
	}

	function handleDocInput(e: Event) {
		const target = e.target as HTMLInputElement;
		docNumber = formatDoc(target.value, docType);
	}

	// ─── FILTROS DE SERVIÇOS E CATEGORIAS ATIVAS ──────────────────────────
	let activeCategories = $derived.by(() => {
		return categories.filter(c => c.isActive !== false);
	});

	let activeServices = $derived.by(() => {
		return services.filter(s =>
			s.isActive !== false &&
			s.subcategoryIsActive !== false &&
			s.categoryIsActive !== false
		);
	});

	let filteredServices = $derived.by(() => {
		let list = activeServices;

		// Filtro por Categoria Selecionada
		if (selectedCategoryId !== null) {
			list = list.filter(s => s.categoryId === selectedCategoryId);
		}

		// Filtro por Busca de Texto
		if (searchService.trim()) {
			const q = searchService.toLowerCase();
			list = list.filter(s =>
				s.name.toLowerCase().includes(q) ||
				(s.subcategoryName && s.subcategoryName.toLowerCase().includes(q)) ||
				(s.categoryName && s.categoryName.toLowerCase().includes(q))
			);
		}

		return list;
	});

	let validSelectedServices = $derived.by(() => {
		return selectedServices.filter(id => activeServices.some(s => s.id === id));
	});

	// ─── VALIDAÇÃO MATEMÁTICA DE DOCUMENTO ────────────────────────────────
	let cleanDocLength = $derived(docNumber.replace(/\D/g, '').length);
	let expectedDocLength = $derived(docType === 'CPF' ? 11 : 14);
	let isDocComplete = $derived(cleanDocLength === expectedDocLength);
	let isDocValid = $derived(validateDocument(docNumber, docType));
	let isDocInvalid = $derived(isDocComplete && !isDocValid);

	function toggleService(id: number) {
		if (selectedServices.includes(id)) {
			selectedServices = selectedServices.filter(s => s !== id);
		} else {
			selectedServices = [...selectedServices, id];
		}
	}

	// ─── NAVEGAÇÃO ENTRE PASSOS COM VALIDAÇÃO ─────────────────────────────
	function nextStep() {
		if (currentStep === 1) {
			const cleanPhone = phone.replace(/\D/g, '');
			if (cleanPhone.length < 10) {
				alert.error(APP_ERRORS.INVALID_PHONE);
				return;
			}
		} else if (currentStep === 2) {
			if (!fullName.trim() || fullName.trim().split(' ').length < 2) {
				alert.error(APP_ERRORS.INVALID_FULL_NAME);
				return;
			}
			if (!email.trim() || !email.includes('@')) {
				alert.error(APP_ERRORS.INVALID_EMAIL);
				return;
			}
		} else if (currentStep === 3) {
			selectedServices = validSelectedServices;
			if (selectedServices.length === 0) {
				alert.error(APP_ERRORS.INVALID_SERVICES_SELECTION);
				return;
			}
		} else if (currentStep === 4) {
			if (!isDocValid) {
				alert.error(docType === 'CPF' ? APP_ERRORS.INVALID_CPF : APP_ERRORS.INVALID_CNPJ);
				return;
			}
		}

		if (currentStep < totalSteps) {
			currentStep += 1;
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	function prevStep() {
		if (currentStep > 1) {
			currentStep -= 1;
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' && currentStep < totalSteps && !isCompleted) {
			e.preventDefault();
			nextStep();
		}
	}

	async function handleSubmit() {
		if (!isDocValid) {
			alert.error(docType === 'CPF' ? APP_ERRORS.INVALID_CPF : APP_ERRORS.INVALID_CNPJ);
			return;
		}
		if (!city.trim() || !stateUf.trim()) {
			alert.error(APP_ERRORS.INVALID_LOCATION);
			return;
		}

		isSubmitting = true;
		setTimeout(() => {
			isSubmitting = false;
			isCompleted = true;
			alert.success('Cadastro enviado com sucesso! Você ganhou 20 Colupas de bônus.');
		}, 900);
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<div class="min-h-[85vh] flex flex-col justify-between py-6 px-4 max-w-lg mx-auto select-none">
	<!-- Topo com Navegação e Modo DEV -->
	<header class="flex items-center justify-between mb-6">
		{#if currentStep > 1 && !isCompleted}
			<button onclick={prevStep} class="btn btn-ghost btn-sm gap-1.5 font-bold text-base-content/80 -ml-2">
				<ArrowLeft class="w-4 h-4" />
				Voltar
			</button>
		{:else}
			<div class="w-16"></div>
		{/if}

		<!-- Marcador de Desenvolvimento (Apenas para diálogo de dev / debug) -->
		<div class="dropdown dropdown-end">
			<div
				tabindex="0"
				role="button"
				class="badge badge-neutral badge-sm font-mono text-[10px] opacity-60 hover:opacity-100 cursor-pointer"
			>
				DEV: Passo {currentStep}/{totalSteps}
			</div>
			<ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-50 w-44 p-2 shadow-lg border border-base-300 text-xs mt-1">
				<li><span class="font-bold opacity-50 uppercase text-[10px]">Pular para:</span></li>
				{#each [1, 2, 3, 4, 5] as stepNum}
					<li>
						<button
							onclick={() => currentStep = stepNum}
							class="{currentStep === stepNum ? 'active font-bold' : ''}"
						>
							Passo {stepNum}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</header>

	<!-- Conteúdo Central Focado (Clean & No-Distraction) -->
	<main class="flex-1 flex flex-col justify-center">
		{#if isCompleted}
			<!-- TELA DE SUCESSO / BOAS-VINDAS -->
			<div class="text-center space-y-6 animate-fade-in">
				<div class="w-20 h-20 bg-success text-success-content rounded-full flex items-center justify-center mx-auto shadow-md">
					<CheckCircle class="w-12 h-12" />
				</div>

				<div class="space-y-2">
					<h2 class="text-3xl font-black">Cadastro Realizado!</h2>
					<p class="text-sm opacity-80 max-w-xs mx-auto">
						Seu perfil foi criado. Nossa equipe fará a validação em breve.
					</p>
				</div>

				<!-- Card do Bônus em Colupas -->
				<div class="bg-base-100 border-2 border-warning/60 rounded-2xl p-5 shadow-sm text-left flex items-center gap-4">
					<div class="p-3 bg-warning text-warning-content rounded-xl shrink-0 font-black text-2xl">
						🎁
					</div>
					<div>
						<span class="badge badge-warning font-bold text-[10px] uppercase">Bônus Exclusivo</span>
						<h4 class="text-lg font-black text-warning">20 Colupas Liberadas</h4>
						<p class="text-xs opacity-75">Use suas Colupas para desbloquear seus primeiros contatos de clientes.</p>
					</div>
				</div>

				<a href="/profissional" class="btn btn-primary btn-lg btn-block font-black text-base shadow-md">
					Ir para o Feed de Oportunidades
					<ArrowRight class="w-5 h-5 ml-1" />
				</a>
			</div>
		{:else}
			<!-- ─── PASSO 1: TELEFONE / WHATSAPP ─────────────────────────────── -->
			{#if currentStep === 1}
				<div class="space-y-6">
					<div class="space-y-2">
						<span class="badge badge-primary font-bold text-xs uppercase">Passo Inicial</span>
						<h1 class="text-3xl lg:text-4xl font-black tracking-tight">Qual é o seu WhatsApp?</h1>
						<p class="text-sm opacity-70 leading-relaxed">
							Seu número de celular é utilizado para acessar a sua conta, sem a necessidade de senhas difíceis.
						</p>
					</div>

					<div class="form-control w-full pt-2">
						<label for="input-phone" class="text-xs font-bold uppercase opacity-75 mb-2 block">
							Número de Celular com DDD
						</label>
						<div class="relative">
							<input
								id="input-phone"
								type="tel"
								inputmode="numeric"
								placeholder="(00) 00000-0000"
								value={phone}
								oninput={handlePhoneInput}
								class="input input-bordered w-full text-xl font-bold h-14 pl-12 bg-base-100 focus:border-primary"
								autofocus
							/>
							<Phone class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-80" />
						</div>
					</div>

					<button
						onclick={nextStep}
						disabled={phone.replace(/\D/g, '').length < 10}
						class="btn btn-primary btn-lg btn-block font-bold text-base h-14 shadow-sm"
					>
						Continuar
						<ArrowRight class="w-5 h-5 ml-1" />
					</button>
				</div>

			<!-- ─── PASSO 2: NOME E E-MAIL ──────────────────────────────────── -->
			{:else if currentStep === 2}
				<div class="space-y-5">
					<div class="space-y-2">
						<h1 class="text-3xl lg:text-4xl font-black tracking-tight">Como você se chama?</h1>
						<p class="text-sm opacity-70">
							Informe seus dados de contato para personalizar seu perfil e receber notificações.
						</p>
					</div>

					<div class="space-y-4 pt-2">
						<div>
							<label for="input-name" class="text-xs font-bold uppercase opacity-75 mb-1.5 block">
								Nome Completo *
							</label>
							<div class="relative">
								<input
									id="input-name"
									type="text"
									placeholder="Ex: Carlos Eduardo Silva"
									bind:value={fullName}
									class="input input-bordered w-full text-base font-semibold h-13 pl-11 bg-base-100"
									autofocus
								/>
								<User class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-80" />
							</div>
						</div>

						<div>
							<label for="input-email" class="text-xs font-bold uppercase opacity-75 mb-1.5 block">
								E-mail de Contato *
							</label>
							<div class="relative">
								<input
									id="input-email"
									type="email"
									placeholder="seuemail@exemplo.com"
									bind:value={email}
									class="input input-bordered w-full text-base font-semibold h-13 pl-11 bg-base-100"
								/>
								<Mail class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-80" />
							</div>
						</div>

						<div>
							<label for="input-company" class="text-xs font-bold uppercase opacity-75 mb-1.5 block">
								Nome Fantasia / Empresa <span class="text-xs lowercase opacity-60 font-normal">(opcional)</span>
							</label>
							<div class="relative">
								<input
									id="input-company"
									type="text"
									placeholder="Ex: Silva Instalações Elétricas"
									bind:value={companyName}
									class="input input-bordered w-full text-base font-semibold h-13 pl-11 bg-base-100"
								/>
								<Building class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-80" />
							</div>
						</div>
					</div>

					<button
						onclick={nextStep}
						disabled={!fullName.trim() || !email.includes('@')}
						class="btn btn-primary btn-lg btn-block font-bold text-base h-14 mt-4 shadow-sm"
					>
						Continuar
						<ArrowRight class="w-5 h-5 ml-1" />
					</button>
				</div>

			<!-- ─── PASSO 3: ESPECIALIDADES & SERVIÇOS ───────────────────────── -->
			{:else if currentStep === 3}
				<div class="space-y-4">
					<div class="space-y-1">
						<h1 class="text-2xl lg:text-3xl font-black tracking-tight">O que você faz?</h1>
						<p class="text-xs opacity-70">
							Selecione uma categoria ou busque pelo nome dos serviços que você realiza.
						</p>
					</div>

					<!-- Filtro por Categoria (Abas/Chips com Scroll Horizontal) -->
					{#if activeCategories.length > 0}
						<div class="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
							<button
								type="button"
								onclick={() => selectedCategoryId = null}
								class="btn btn-xs rounded-full shrink-0 font-bold {selectedCategoryId === null ? 'btn-primary' : 'btn-ghost bg-base-200'}"
							>
								Todas
							</button>
							{#each activeCategories as cat}
								<button
									type="button"
									onclick={() => selectedCategoryId = cat.id}
									class="btn btn-xs rounded-full shrink-0 font-bold {selectedCategoryId === cat.id ? 'btn-primary' : 'btn-ghost bg-base-200'}"
								>
									{cat.name}
								</button>
							{/each}
						</div>
					{/if}

					<!-- Busca Rápida de Serviços -->
					<div class="relative">
						<input
							type="text"
							placeholder="Buscar serviço (ex: Eletricista, Pintor, Diarista)..."
							bind:value={searchService}
							class="input input-bordered w-full text-sm pl-10 h-11 bg-base-100"
						/>
						<Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
					</div>

					<!-- Contador de Selecionados -->
					{#if validSelectedServices.length > 0}
						<div class="flex items-center justify-between text-xs font-bold px-1">
							<span class="text-primary">{validSelectedServices.length} serviço{validSelectedServices.length > 1 ? 's' : ''} selecionado{validSelectedServices.length > 1 ? 's' : ''}</span>
							<button type="button" onclick={() => selectedServices = []} class="text-xs opacity-50 hover:opacity-100 hover:underline">
								Limpar seleção
							</button>
						</div>
					{/if}

					<!-- Lista de Serviços Touch-Friendly -->
					<div class="max-h-64 overflow-y-auto space-y-1.5 pr-1">
						{#if isLoadingCatalog}
							<div class="p-8 text-center text-xs opacity-60">
								<span class="loading loading-spinner loading-sm mb-2 block mx-auto text-primary"></span>
								Carregando catálogo de serviços...
							</div>
						{:else if filteredServices.length === 0}
							<div class="p-6 text-center text-xs opacity-50 bg-base-100 rounded-xl border border-base-300">
								Nenhum serviço disponível ou encontrado nesta categoria.
							</div>
						{:else}
							{#each filteredServices as s}
								{@const selected = selectedServices.includes(s.id)}
								<button
									type="button"
									onclick={() => toggleService(s.id)}
									class="w-full text-left p-3 rounded-xl border-2 transition-all flex items-center justify-between gap-3
										{selected ? 'border-primary bg-primary/10 font-bold' : 'border-base-300 bg-base-100 hover:border-base-400'}"
								>
									<div class="min-w-0 flex-1">
										<span class="text-sm block truncate">{s.name}</span>
										{#if s.categoryName}
											<span class="text-[11px] opacity-50 block truncate">{s.categoryName} &bull; {s.subcategoryName ?? ''}</span>
										{/if}
									</div>
									<div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0 {selected ? 'bg-primary text-primary-content' : 'border border-base-400'}">
										{#if selected}
											<CheckCircle class="w-4 h-4" />
										{/if}
									</div>
								</button>
							{/each}
						{/if}
					</div>

					<button
						onclick={nextStep}
						disabled={validSelectedServices.length === 0}
						class="btn btn-primary btn-lg btn-block font-bold text-base h-14 shadow-sm"
					>
						Continuar ({validSelectedServices.length} {validSelectedServices.length === 1 ? 'selecionado' : 'selecionados'})
						<ArrowRight class="w-5 h-5 ml-1" />
					</button>
				</div>

			<!-- ─── PASSO 4: IDENTIFICAÇÃO (CPF/CNPJ MATEMATICAMENTE CONFERIDO) ── -->
			{:else if currentStep === 4}
				<div class="space-y-5">
					<div class="space-y-2">
						<div class="inline-flex items-center gap-1.5 badge badge-primary font-bold text-xs uppercase px-2.5 py-1">
							<ShieldCheck class="w-3.5 h-3.5" />
							Validação de Identidade
						</div>
						<h1 class="text-3xl font-black tracking-tight">Identificação Profissional</h1>
						<p class="text-xs opacity-70">
							Informe seu CPF ou CNPJ. Realizamos a conferência dos dígitos verificadores para a segurança de todos.
						</p>
					</div>

					<div class="space-y-4 pt-1">
						<!-- Toggle CPF vs CNPJ -->
						<div class="grid grid-cols-2 gap-2 p-1 bg-base-300 rounded-xl">
							<button
								type="button"
								onclick={() => { docType = 'CPF'; docNumber = ''; }}
								class="btn btn-sm {docType === 'CPF' ? 'btn-primary shadow' : 'btn-ghost'} font-bold text-xs"
							>
								Pessoa Física (CPF)
							</button>
							<button
								type="button"
								onclick={() => { docType = 'CNPJ'; docNumber = ''; }}
								class="btn btn-sm {docType === 'CNPJ' ? 'btn-primary shadow' : 'btn-ghost'} font-bold text-xs"
							>
								Empresa (CNPJ)
							</button>
						</div>

						<div>
							<div class="flex items-center justify-between mb-1.5">
								<label for="input-doc" class="text-xs font-bold uppercase opacity-75">
									Número do {docType} *
								</label>
								{#if isDocValid}
									<span class="badge badge-success font-bold text-[11px] gap-1 py-1 px-2 text-success-content">
										<CheckCircle class="w-3.5 h-3.5" />
										{docType} Válido
									</span>
								{:else if isDocInvalid}
									<span class="badge badge-error font-bold text-[11px] gap-1 py-1 px-2 text-error-content">
										<XCircle class="w-3.5 h-3.5" />
										{docType} Inválido
									</span>
								{/if}
							</div>

							<div class="relative">
								<input
									id="input-doc"
									type="tel"
									inputmode="numeric"
									placeholder={docType === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'}
									value={docNumber}
									oninput={handleDocInput}
									class="input input-bordered w-full text-lg font-mono font-bold h-14 pl-11 bg-base-100 {isDocValid ? 'border-success' : isDocInvalid ? 'border-error' : ''}"
									autofocus
								/>
								<FileText class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-80" />
							</div>

							{#if isDocInvalid}
								<p class="text-[11px] text-error font-semibold mt-1.5 pl-1">
									Os dígitos verificadores do {docType} não conferem. Verifique o número digitado.
								</p>
							{/if}
						</div>
					</div>

					<button
						onclick={nextStep}
						disabled={!isDocValid}
						class="btn btn-primary btn-lg btn-block font-bold text-base h-14 mt-4 shadow-sm"
					>
						Continuar
						<ArrowRight class="w-5 h-5 ml-1" />
					</button>
				</div>

			<!-- ─── PASSO 5: LOCALIZAÇÃO, RAIO & CONCLUSÃO ───────────────────── -->
			{:else if currentStep === 5}
				<div class="space-y-5">
					<div class="space-y-2">
						<div class="inline-flex items-center gap-1.5 badge badge-success text-success-content font-bold text-xs uppercase px-2.5 py-1.5">
							<ShieldCheck class="w-3.5 h-3.5" />
							Último Passo
						</div>
						<h1 class="text-3xl lg:text-4xl font-black tracking-tight">Onde você atende?</h1>
						<p class="text-sm opacity-70">
							Defina sua cidade base e a distância máxima que você se desloca para realizar serviços.
						</p>
					</div>

					<div class="space-y-4 pt-1">
						<div class="grid grid-cols-3 gap-3">
							<div class="col-span-2">
								<label for="input-city" class="text-xs font-bold uppercase opacity-75 mb-1.5 block">
									Cidade Base *
								</label>
								<div class="relative">
									<input
										id="input-city"
										type="text"
										bind:value={city}
										class="input input-bordered w-full text-base font-semibold h-13 pl-10 bg-base-100"
										required
									/>
									<MapPin class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-primary opacity-80" />
								</div>
							</div>

							<div>
								<label for="input-state" class="text-xs font-bold uppercase opacity-75 mb-1.5 block">
									UF *
								</label>
								<input
									id="input-state"
									type="text"
									bind:value={stateUf}
									maxlength="2"
									class="input input-bordered w-full text-base font-semibold h-13 text-center uppercase bg-base-100"
									required
								/>
							</div>
						</div>

						<!-- Slider de Raio de Atendimento -->
						<div class="bg-base-100 border-2 border-base-300 rounded-2xl p-5 space-y-3">
							<div class="flex items-center justify-between">
								<span class="text-xs font-bold uppercase opacity-75">Raio de Atendimento</span>
								<span class="badge badge-primary font-black text-sm px-3 py-2">
									Até {serviceRadiusKm} km
								</span>
							</div>

							<input
								type="range"
								min="5"
								max="100"
								step="5"
								bind:value={serviceRadiusKm}
								class="range range-primary range-sm"
							/>

							<p class="text-[11px] opacity-60">
								Você receberá notificações de clientes localizados em até {serviceRadiusKm} km a partir do centro de {city}.
							</p>
						</div>

						<!-- Destaque do Bônus em Colupas -->
						<div class="bg-warning/10 border-2 border-warning/40 rounded-2xl p-4 flex items-start gap-3.5">
							<Sparkles class="w-6 h-6 text-warning shrink-0 mt-0.5" />
							<div class="space-y-0.5">
								<h4 class="font-bold text-xs uppercase text-warning">Bônus de Boas-Vindas</h4>
								<p class="text-xs opacity-80 leading-relaxed">
									Ao concluir seu cadastro, você recebe <strong>20 Colupas grátis</strong> para começar a desbloquear contatos imediatamente.
								</p>
							</div>
						</div>
					</div>

					<button
						onclick={handleSubmit}
						disabled={isSubmitting || !city.trim() || !stateUf.trim() || !isDocValid}
						class="btn btn-primary btn-lg btn-block font-black text-base h-14 mt-4 shadow-md gap-2"
					>
						{#if isSubmitting}
							<span class="loading loading-spinner"></span>
							Finalizando Cadastro...
						{:else}
							Concluir e Ganhar 20 Colupas
							<ArrowRight class="w-5 h-5" />
						{/if}
					</button>
				</div>
			{/if}
		{/if}
	</main>

	<!-- Rodapé minimalista -->
	<footer class="pt-6 text-center text-xs opacity-50">
		Colupe &bull; Plataforma Segura para Profissionais
	</footer>
</div>
