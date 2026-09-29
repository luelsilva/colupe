<script lang="ts">
	import { alert } from '$lib/components/dialogs/alerts.svelte';
	import { UserCheck, Briefcase, MapPin, CheckCircle, ArrowRight } from 'lucide-svelte';

	let docType = $state<'CPF' | 'CNPJ'>('CPF');
	let docNumber = $state('');
	let fullName = $state('');
	let companyName = $state('');
	let email = $state('');
	let whatsapp = $state('');
	let city = $state('Criciúma');
	let stateUf = $state('SC');
	let serviceRadiusKm = $state(30);
	let bio = $state('');
	let experienceYears = $state(3);

	let selectedServices = $state<string[]>(['2001']);

	let isSubmitting = $state(false);
	let registered = $state(false);

	const availableServices = [
		{ id: '2001', name: 'Eletricista Residencial e Predial', category: 'Reformas' },
		{ id: '2002', name: 'Encanador e Desentupimento', category: 'Reformas' },
		{ id: '2003', name: 'Pintor Residencial e Comercial', category: 'Reformas' },
		{ id: '2004', name: 'Conserto de Celulares e Tablets', category: 'Assistência Técnica' },
		{ id: '2005', name: 'Diarista e Faxina Completa', category: 'Serviços Domésticos' },
		{ id: '2006', name: 'Criação de Sites e Marketing', category: 'Design & Tecnologia' }
	];

	function toggleService(id: string) {
		if (selectedServices.includes(id)) {
			selectedServices = selectedServices.filter(s => s !== id);
		} else {
			selectedServices = [...selectedServices, id];
		}
	}

	async function handleRegister(e: Event) {
		e.preventDefault();
		if (!fullName.trim() || !docNumber.trim() || !whatsapp.trim() || selectedServices.length === 0) {
			alert.error('Preencha os campos obrigatórios e selecione ao menos uma especialidade.');
			return;
		}

		isSubmitting = true;
		setTimeout(() => {
			isSubmitting = false;
			registered = true;
			alert.success('Cadastro realizado com sucesso! Aguarde a moderação da equipe.');
		}, 800);
	}
</script>

<div class="container mx-auto px-4 py-12 max-w-3xl">
	{#if registered}
		<div class="bg-base-100 border-2 border-primary rounded-2xl p-8 md:p-12 text-center shadow-lg">
			<div class="w-16 h-16 bg-primary text-primary-content rounded-full flex items-center justify-center mx-auto mb-6">
				<UserCheck class="w-10 h-10" />
			</div>
			<h2 class="text-3xl font-black mb-2">Cadastro Enviado para Análise!</h2>
			<p class="text-base opacity-80 max-w-lg mx-auto mb-6">
				Nossa equipe revisará suas informações em até 24 horas. Assim que aprovado, você receberá <strong>20 moedas de bônus</strong> para começar a desbloquear contatos de clientes.
			</p>
			<a href="/profissional" class="btn btn-primary font-bold px-8">
				Acessar Área do Profissional
			</a>
		</div>
	{:else}
		<div class="text-center mb-8">
			<h1 class="text-3xl font-black mb-2">Cadastre-se como Profissional no Colupe</h1>
			<p class="text-sm opacity-75">Conecte-se com clientes que precisam do seu trabalho todos os dias.</p>
		</div>

		<div class="bg-base-100 border-2 border-base-300 rounded-xl p-6 md:p-8 shadow-sm">
			<form onsubmit={handleRegister} class="space-y-6">
				<!-- Dados Pessoais / Fiscais -->
				<div>
					<h3 class="font-bold text-base border-b border-base-300 pb-2 mb-4 flex items-center gap-2">
						<Briefcase class="w-4 h-4 text-primary" />
						1. Dados Profissionais
					</h3>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
						<div>
							<label class="label text-xs font-bold uppercase">Nome Completo do Responsável *</label>
							<input type="text" bind:value={fullName} placeholder="Seu nome" class="input input-bordered w-full" required />
						</div>

						<div>
							<label class="label text-xs font-bold uppercase">Nome Fantasia / Empresa (Opcional)</label>
							<input type="text" bind:value={companyName} placeholder="Ex: Silva Instalações" class="input input-bordered w-full" />
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
						<div>
							<label class="label text-xs font-bold uppercase">Tipo de Documento</label>
							<select bind:value={docType} class="select select-bordered w-full">
								<option value="CPF">Pessoa Física (CPF)</option>
								<option value="CNPJ">Pessoa Jurídica (CNPJ)</option>
							</select>
						</div>

						<div class="md:col-span-2">
							<label class="label text-xs font-bold uppercase">Número do {docType} *</label>
							<input
								type="text"
								bind:value={docNumber}
								placeholder={docType === 'CPF' ? '000.000.000-00' : '00.000.000/0001-00'}
								class="input input-bordered w-full"
								required
							/>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label class="label text-xs font-bold uppercase">WhatsApp para Contato *</label>
							<input type="tel" bind:value={whatsapp} placeholder="(48) 99999-9999" class="input input-bordered w-full" required />
						</div>

						<div>
							<label class="label text-xs font-bold uppercase">E-mail de Acesso *</label>
							<input type="email" bind:value={email} placeholder="email@exemplo.com" class="input input-bordered w-full" required />
						</div>
					</div>
				</div>

				<!-- Especialidades -->
				<div>
					<h3 class="font-bold text-base border-b border-base-300 pb-2 mb-4">
						2. Escolha suas Especialidades de Atuação *
					</h3>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{#each availableServices as serv}
							<div
								onclick={() => toggleService(serv.id)}
								class="border-2 rounded-lg p-3 cursor-pointer flex items-center justify-between transition-all {selectedServices.includes(serv.id) ? 'border-primary bg-primary/10 font-bold' : 'border-base-300'}"
							>
								<div>
									<span class="text-xs opacity-60 block">{serv.category}</span>
									<span class="text-sm">{serv.name}</span>
								</div>
								{#if selectedServices.includes(serv.id)}
									<CheckCircle class="w-5 h-5 text-primary shrink-0" />
								{/if}
							</div>
						{/each}
					</div>
				</div>

				<!-- Região e Raio de Atendimento -->
				<div>
					<h3 class="font-bold text-base border-b border-base-300 pb-2 mb-4 flex items-center gap-2">
						<MapPin class="w-4 h-4 text-primary" />
						3. Região e Raio de Atendimento
					</h3>

					<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
						<div>
							<label class="label text-xs font-bold uppercase">Cidade Base *</label>
							<input type="text" bind:value={city} class="input input-bordered w-full" required />
						</div>

						<div>
							<label class="label text-xs font-bold uppercase">Estado (UF) *</label>
							<input type="text" bind:value={stateUf} class="input input-bordered w-full" required />
						</div>

						<div>
							<label class="label text-xs font-bold uppercase">Raio de Atendimento (km)</label>
							<input type="number" bind:value={serviceRadiusKm} class="input input-bordered w-full" min="5" max="150" />
						</div>
					</div>

					<div>
						<label class="label text-xs font-bold uppercase">Breve Apresentação / Bio</label>
						<textarea
							bind:value={bio}
							rows="3"
							placeholder="Conte sobre sua experiência, diferenciais e qualidade do seu serviço..."
							class="textarea textarea-bordered w-full"
						></textarea>
					</div>
				</div>

				<!-- Botão de Cadastro -->
				<div class="pt-4">
					<button
						type="submit"
						disabled={isSubmitting}
						class="btn btn-primary w-full text-base font-black py-3 h-auto gap-2"
					>
						{#if isSubmitting}
							<span class="loading loading-spinner"></span>
							Finalizando Cadastro...
						{:else}
							Concluir Cadastro e Ganhar 20 Moedas de Bônus
							<ArrowRight class="w-5 h-5" />
						{/if}
					</button>
				</div>
			</form>
		</div>
	{/if}
</div>
