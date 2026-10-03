<script lang="ts">
	import { alert } from '$lib/components/dialogs/alerts.svelte';
	import { CheckCircle2, MapPin, ClipboardList, Clock, Send } from 'lucide-svelte';

	let step = $state(1);
	let selectedCategory = $state('1001');
	let selectedService = $state('2001');
	let title = $state('');
	let description = $state('');
	let urgency = $state('medium');
	let city = $state('Criciúma');
	let stateUf = $state('SC');
	let neighborhood = $state('Centro');
	let addressFull = $state('');
	let clientName = $state('');
	let clientEmail = $state('');
	let clientPhone = $state('');

	let isSubmitting = $state(false);
	let submitted = $state(false);

	const servicesMap: Record<string, { id: string; name: string; cost: number }[]> = {
		'1001': [
			{ id: '2001', name: 'Eletricista', cost: 15 },
			{ id: '2002', name: 'Encanador', cost: 15 },
			{ id: '2003', name: 'Pintor Residencial', cost: 12 },
			{ id: '2007', name: 'Pedreiro / Alvenaria', cost: 15 }
		],
		'1002': [
			{ id: '2004', name: 'Conserto de Smartphone', cost: 10 },
			{ id: '2008', name: 'Manutenção de Notebook / PC', cost: 12 },
			{ id: '2009', name: 'Ar-Condicionado (Instalação/Limpeza)', cost: 15 }
		],
		'1003': [
			{ id: '2005', name: 'Diarista / Faxina', cost: 10 },
			{ id: '2010', name: 'Passadeira', cost: 8 }
		],
		'1005': [
			{ id: '2006', name: 'Criação de Sites e Landing Pages', cost: 20 },
			{ id: '2011', name: 'Designer Gráfico / Logotipo', cost: 15 }
		]
	};

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!title.trim() || !description.trim() || !clientName.trim() || !clientPhone.trim()) {
			alert.error('Por favor, preencha todos os campos obrigatórios.');
			return;
		}

		isSubmitting = true;
		// Simulação de envio para a API
		setTimeout(() => {
			isSubmitting = false;
			submitted = true;
			alert.success('Pedido publicado com sucesso! Em breve os profissionais entrarão em contato.');
		}, 800);
	}
</script>

<div class="container mx-auto px-4 py-12 max-w-3xl">
	{#if submitted}
		<div class="bg-base-100 border-2 border-success rounded-2xl p-8 md:p-12 text-center shadow-lg">
			<div class="w-16 h-16 bg-success text-success-content rounded-full flex items-center justify-center mx-auto mb-6">
				<CheckCircle2 class="w-10 h-10" />
			</div>
			<h2 class="text-3xl font-black text-success mb-2">Pedido Enviado com Sucesso!</h2>
			<p class="text-base opacity-80 max-w-lg mx-auto mb-6">
				Seu pedido já foi disponibilizado para até 4 profissionais qualificados da sua região. Fique atento ao seu WhatsApp e e-mail.
			</p>
			<div class="bg-base-200 p-4 rounded-lg border border-base-300 text-sm max-w-md mx-auto mb-8 text-left">
				<p><strong>Serviço:</strong> {title}</p>
				<p><strong>Local:</strong> {neighborhood}, {city} - {stateUf}</p>
				<p><strong>Urgência:</strong> {urgency === 'immediate' ? 'Urgente' : urgency === 'this_week' ? 'Esta semana' : 'Flexível'}</p>
			</div>
			<a href="/" class="btn btn-primary font-bold px-8">
				Voltar ao Início
			</a>
		</div>
	{:else}
		<div class="mb-8 text-center">
			<h1 class="text-3xl font-black mb-2">Solicitar Orçamento Gratuito</h1>
			<p class="text-sm opacity-75">Conte-nos o que você precisa e receba propostas de profissionais verificados.</p>
		</div>

		<div class="bg-base-100 border-2 border-base-300 rounded-xl p-6 md:p-8 shadow-sm">
			<form onsubmit={handleSubmit} class="space-y-6">
				<!-- Passo 1: Categoria e Serviço -->
				<div>
					<h3 class="font-bold text-base border-b border-base-300 pb-2 mb-4 flex items-center gap-2">
						<ClipboardList class="w-4 h-4 text-primary" />
						1. Qual é o tipo de serviço?
					</h3>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
						<div>
							<label class="label text-xs font-bold uppercase">Categoria</label>
							<select
								bind:value={selectedCategory}
								class="select select-bordered w-full"
							>
								<option value="1001">Reformas e Reparos</option>
								<option value="1002">Assistência Técnica</option>
								<option value="1003">Serviços Domésticos</option>
								<option value="1005">Design e Tecnologia</option>
							</select>
						</div>

						<div>
							<label class="label text-xs font-bold uppercase">Especialidade</label>
							<select
								bind:value={selectedService}
								class="select select-bordered w-full"
							>
								{#each (servicesMap[selectedCategory] || []) as serv}
									<option value={serv.id}>{serv.name}</option>
								{/each}
							</select>
						</div>
					</div>

					<div class="space-y-4">
						<div>
							<label class="label text-xs font-bold uppercase">Título do Pedido *</label>
							<input
								type="text"
								bind:value={title}
								placeholder="Ex: Troca de fiação do chuveiro e instalação de tomada 220V"
								class="input input-bordered w-full"
								required
							/>
						</div>

						<div>
							<label class="label text-xs font-bold uppercase">Descrição Detalhada do Trabalho *</label>
							<textarea
								bind:value={description}
								rows="4"
								placeholder="Descreva o que precisa ser feito, medidas, marcas ou detalhes que ajudem o profissional a formular o orçamento..."
								class="textarea textarea-bordered w-full"
								required
							></textarea>
						</div>
					</div>
				</div>

				<!-- Passo 2: Localização e Urgência -->
				<div>
					<h3 class="font-bold text-base border-b border-base-300 pb-2 mb-4 flex items-center gap-2">
						<MapPin class="w-4 h-4 text-primary" />
						2. Onde será realizado?
					</h3>

					<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
						<div>
							<label class="label text-xs font-bold uppercase">Cidade *</label>
							<input type="text" bind:value={city} class="input input-bordered w-full" required />
						</div>
						<div>
							<label class="label text-xs font-bold uppercase">Estado (UF) *</label>
							<input type="text" bind:value={stateUf} class="input input-bordered w-full" required />
						</div>
						<div>
							<label class="label text-xs font-bold uppercase">Bairro *</label>
							<input type="text" bind:value={neighborhood} class="input input-bordered w-full" required />
						</div>
					</div>

					<div class="mb-4">
						<label class="label text-xs font-bold uppercase">Endereço Completo (Rua e Número) *</label>
						<input
							type="text"
							bind:value={addressFull}
							placeholder="Rua das Flores, 123 - Apto 402"
							class="input input-bordered w-full"
							required
						/>
						<span class="text-xs opacity-60 mt-1 block">
							* O endereço completo só será revelado para os profissionais que desbloquearem seu contato.
						</span>
					</div>

					<div>
						<label class="label text-xs font-bold uppercase flex items-center gap-1.5">
							<Clock class="w-3.5 h-3.5 text-warning" />
							Para quando você precisa do serviço?
						</label>
						<div class="grid grid-cols-3 gap-3">
							<label class="border-2 rounded-lg p-3 text-center cursor-pointer transition-all {urgency === 'immediate' ? 'border-primary bg-primary/10 font-bold' : 'border-base-300'}">
								<input type="radio" bind:group={urgency} value="immediate" class="hidden" />
								<span class="text-xs block font-bold text-error">Urgente</span>
								<span class="text-[11px] opacity-70">Hoje ou amanhã</span>
							</label>
							<label class="border-2 rounded-lg p-3 text-center cursor-pointer transition-all {urgency === 'this_week' ? 'border-primary bg-primary/10 font-bold' : 'border-base-300'}">
								<input type="radio" bind:group={urgency} value="this_week" class="hidden" />
								<span class="text-xs block font-bold">Esta semana</span>
								<span class="text-[11px] opacity-70">Próximos dias</span>
							</label>
							<label class="border-2 rounded-lg p-3 text-center cursor-pointer transition-all {urgency === 'flexible' ? 'border-primary bg-primary/10 font-bold' : 'border-base-300'}">
								<input type="radio" bind:group={urgency} value="flexible" class="hidden" />
								<span class="text-xs block font-bold">Flexível</span>
								<span class="text-[11px] opacity-70">Sem pressa</span>
							</label>
						</div>
					</div>
				</div>

				<!-- Passo 3: Dados de Contato -->
				<div>
					<h3 class="font-bold text-base border-b border-base-300 pb-2 mb-4">
						3. Seus Dados de Contato
					</h3>

					<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label for="client-name" class="label text-xs font-bold uppercase">Seu Nome *</label>
							<input id="client-name" type="text" bind:value={clientName} placeholder="Nome completo" class="input input-bordered w-full" required />
						</div>
						<div>
							<label for="client-phone" class="label text-xs font-bold uppercase">Seu WhatsApp / Telefone *</label>
							<input id="client-phone" type="tel" bind:value={clientPhone} placeholder="(48) 99999-9999" class="input input-bordered w-full" required />
						</div>
						<div>
							<label for="client-email" class="label text-xs font-bold uppercase">Seu E-mail *</label>
							<input id="client-email" type="email" bind:value={clientEmail} placeholder="email@exemplo.com" class="input input-bordered w-full" required />
						</div>
					</div>
				</div>

				<!-- Botão de Envio -->
				<div class="pt-4">
					<button
						type="submit"
						disabled={isSubmitting}
						class="btn btn-primary w-full text-base font-black py-3 h-auto gap-2"
					>
						{#if isSubmitting}
							<span class="loading loading-spinner"></span>
							Publicando Pedido...
						{:else}
							<Send class="w-5 h-5" />
							Publicar Pedido e Receber Orçamentos
						{/if}
					</button>
				</div>
			</form>
		</div>
	{/if}
</div>
