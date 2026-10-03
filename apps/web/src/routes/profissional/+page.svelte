<script lang="ts">
	import { alert } from '$lib/components/dialogs/alerts.svelte';
	import { confirm } from '$lib/components/dialogs/confirm.svelte';
	import {
		Coins,
		MapPin,
		Clock,
		Unlock,
		CheckCircle,
		Phone,
		MessageSquare,
		Filter,
		Briefcase,
		UserCheck
	} from 'lucide-svelte';

	let credits = $state(45);
	let activeTab = $state<'feed' | 'unlocked'>('feed');

	// Leads de exemplo disponíveis no feed
	let leads = $state([
		{
			id: '9001',
			title: 'Troca de Fiação do Chuveiro e Disjuntor',
			category: 'Reformas e Reparos',
			service: 'Eletricista',
			costCredits: 15,
			city: 'Criciúma',
			neighborhood: 'Centro',
			state: 'SC',
			urgency: 'immediate',
			description: 'O chuveiro está desarmando o disjuntor constantemente. Preciso de avaliação da fiação antiga e substituição por disjuntor adequado.',
			createdAt: 'Há 25 minutos',
			unlocksCount: 1,
			maxUnlocks: 4,
			unlocked: false,
			client: {
				name: 'Mariana Silva',
				phone: '(48) 99876-5432',
				address: 'Rua Coronel Pedro Benedet, 340 - Apto 502'
			}
		},
		{
			id: '9002',
			title: 'Instalação de 3 Pontos de Iluminação LED',
			category: 'Reformas e Reparos',
			service: 'Eletricista',
			costCredits: 15,
			city: 'Içara',
			neighborhood: 'Jardim Elizabete',
			state: 'SC',
			urgency: 'this_week',
			description: 'Instalação de spots de LED no teto de gesso da sala de estar e sala de jantar.',
			createdAt: 'Há 1 hora',
			unlocksCount: 2,
			maxUnlocks: 4,
			unlocked: false,
			client: {
				name: 'Roberto Souza',
				phone: '(48) 98765-4321',
				address: 'Rua Vitória, 120'
			}
		},
		{
			id: '9003',
			title: 'Pintura Completa de Apartamento 70m²',
			category: 'Reformas e Reparos',
			service: 'Pintor Residencial',
			costCredits: 12,
			city: 'Criciúma',
			neighborhood: 'Pio Corrêa',
			state: 'SC',
			urgency: 'flexible',
			description: 'Pintura de paredes internas e teto com massa corrida em pontos específicos. Tinta já comprada.',
			createdAt: 'Há 3 horas',
			unlocksCount: 3,
			maxUnlocks: 4,
			unlocked: false,
			client: {
				name: 'Fernanda Lima',
				phone: '(48) 99123-4567',
				address: 'Av. Santos Dumont, 890'
			}
		}
	]);

	let unlockedLeads = $derived(leads.filter(l => l.unlocked));
	let feedLeads = $derived(leads.filter(l => !l.unlocked));

	async function unlockLead(lead: typeof leads[0]) {
		if (credits < lead.costCredits) {
			alert.error('Saldo insuficiente! Recarregue suas Colupas para desbloquear este contato.');
			return;
		}

		const ok = await confirm.show({
			title: 'Desbloquear Contato do Cliente',
			message: `Você deseja gastar ${lead.costCredits} Colupas para ter acesso imediato ao WhatsApp, telefone e endereço completo do cliente "${lead.client.name}"?`,
			confirmText: `Desbloquear (${lead.costCredits} Colupas)`,
			cancelText: 'Voltar'
		});

		if (ok) {
			credits -= lead.costCredits;
			lead.unlocked = true;
			lead.unlocksCount += 1;
			alert.success('Contato desbloqueado com sucesso! Entre em contato com o cliente.');
		}
	}
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<!-- Header do Dashboard do Profissional -->
	<div class="bg-base-100 border-2 border-base-300 rounded-xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
		<div class="flex items-center gap-4">
			<div class="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center font-black text-2xl border-2 border-primary">
				LC
			</div>
			<div>
				<div class="flex items-center gap-2">
					<h1 class="text-2xl font-black">Carlos Eletricista & Cia</h1>
					<span class="badge badge-success badge-sm font-bold gap-1">
						<UserCheck class="w-3 h-3" /> Verificado
					</span>
				</div>
				<p class="text-xs opacity-70">
					Eletricista Residencial e Predial • Criciúma e Região (Raio de 35 km)
				</p>
			</div>
		</div>

		<!-- Card de Colupas / Saldo -->
		<div class="bg-base-200 border-2 border-warning/40 p-4 rounded-xl flex items-center gap-6 w-full md:w-auto justify-between">
			<div class="flex items-center gap-3">
				<div class="p-2.5 bg-warning text-warning-content rounded-lg">
					<Coins class="w-6 h-6" />
				</div>
				<div>
					<span class="text-xs font-bold uppercase opacity-70 block">Saldo de Colupas</span>
					<span class="text-2xl font-black text-warning">{credits} Colupas</span>
				</div>
			</div>

			<a href="/profissional/creditos" class="btn btn-sm btn-warning font-bold">
				Comprar Colupas
			</a>
		</div>
	</div>

	<!-- Abas Feed vs Desbloqueados -->
	<div class="flex items-center gap-4 border-b-2 border-base-300 mb-6 pb-2">
		<button
			onclick={() => activeTab = 'feed'}
			class="btn btn-sm {activeTab === 'feed' ? 'btn-primary' : 'btn-ghost'} font-bold gap-2"
		>
			<Briefcase class="w-4 h-4" />
			Oportunidades Disponíveis ({feedLeads.length})
		</button>
		<button
			onclick={() => activeTab = 'unlocked'}
			class="btn btn-sm {activeTab === 'unlocked' ? 'btn-primary' : 'btn-ghost'} font-bold gap-2"
		>
			<Unlock class="w-4 h-4" />
			Meus Contatos Desbloqueados ({unlockedLeads.length})
		</button>
	</div>

	<!-- Lista de Oportunidades (Feed) -->
	{#if activeTab === 'feed'}
		<div class="space-y-4">
			{#if feedLeads.length === 0}
				<div class="bg-base-100 border-2 border-base-300 p-12 text-center rounded-xl">
					<p class="font-bold opacity-70">Nenhuma oportunidade pendente no momento para sua região.</p>
				</div>
			{:else}
				{#each feedLeads as lead}
					<div class="bg-base-100 border-2 border-base-300 hover:border-primary/60 transition-all rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6">
						<div class="space-y-2 flex-1">
							<div class="flex items-center gap-2 flex-wrap">
								<span class="badge badge-primary badge-outline text-xs font-bold">{lead.service}</span>
								<span class="text-xs opacity-60 font-semibold">• {lead.createdAt}</span>
								<span class="badge badge-neutral badge-sm font-semibold">
									{lead.unlocksCount}/{lead.maxUnlocks} profissionais interessados
								</span>
								{#if lead.urgency === 'immediate'}
									<span class="badge badge-error text-xs font-bold">Urgente</span>
								{/if}
							</div>

							<h3 class="text-xl font-bold">{lead.title}</h3>
							<p class="text-sm opacity-80 leading-relaxed">{lead.description}</p>

							<div class="flex items-center gap-4 text-xs opacity-75 pt-2">
								<span class="flex items-center gap-1 font-semibold">
									<MapPin class="w-3.5 h-3.5 text-primary" />
									{lead.neighborhood}, {lead.city} - {lead.state}
								</span>
							</div>
						</div>

						<!-- Ação de Desbloqueio -->
						<div class="flex flex-col items-center md:items-end justify-center gap-2 shrink-0 md:border-l-2 md:border-base-200 md:pl-6">
							<div class="text-center md:text-right">
								<span class="text-xs opacity-70 block font-semibold">Custo de Desbloqueio</span>
								<span class="text-lg font-black text-warning flex items-center gap-1">
									<Coins class="w-4 h-4" /> {lead.costCredits} Colupas
								</span>
							</div>

							<button
								onclick={() => unlockLead(lead)}
								class="btn btn-primary font-bold gap-2 w-full md:w-auto"
							>
								<Unlock class="w-4 h-4" />
								Desbloquear Contato
							</button>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	{:else}
		<!-- Lista de Leads Desbloqueados -->
		<div class="space-y-4">
			{#if unlockedLeads.length === 0}
				<div class="bg-base-100 border-2 border-base-300 p-12 text-center rounded-xl">
					<p class="font-bold opacity-70">Você ainda não desbloqueou nenhum contato.</p>
				</div>
			{:else}
				{#each unlockedLeads as lead}
					<div class="bg-base-100 border-2 border-success/40 rounded-xl p-6 shadow-sm space-y-4">
						<div class="flex items-center justify-between border-b border-base-300 pb-3">
							<div>
								<span class="badge badge-success text-xs font-bold">Contato Desbloqueado</span>
								<h3 class="text-xl font-black mt-1">{lead.title}</h3>
							</div>
							<span class="text-xs opacity-60">{lead.neighborhood}, {lead.city}</span>
						</div>

						<!-- Dados Revelados do Cliente -->
						<div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-base-200 p-4 rounded-lg border border-base-300">
							<div>
								<span class="text-xs font-bold uppercase opacity-70 block">Nome do Cliente</span>
								<span class="text-base font-bold">{lead.client.name}</span>
							</div>
							<div>
								<span class="text-xs font-bold uppercase opacity-70 block">WhatsApp / Telefone</span>
								<span class="text-base font-bold text-primary">{lead.client.phone}</span>
							</div>
							<div>
								<span class="text-xs font-bold uppercase opacity-70 block">Endereço Completo</span>
								<span class="text-sm font-medium">{lead.client.address}</span>
							</div>
						</div>

						<div class="flex items-center gap-3 pt-2">
							<a
								href="https://wa.me/55{lead.client.phone.replace(/\D/g, '')}"
								target="_blank"
								class="btn btn-sm btn-success font-bold gap-1.5"
							>
								<MessageSquare class="w-4 h-4" /> Chamar no WhatsApp
							</a>
							<a
								href="tel:{lead.client.phone}"
								class="btn btn-sm btn-outline border-base-300 font-bold gap-1.5"
							>
								<Phone class="w-4 h-4" /> Ligar
							</a>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	{/if}
</div>
