<script lang="ts">
	import { alert } from '$lib/components/dialogs/alerts.svelte';
	import { confirm } from '$lib/components/dialogs/confirm.svelte';
	import {
		ShieldAlert,
		Users,
		CheckCircle2,
		XCircle,
		Coins,
		TrendingUp,
		FolderTree,
		Phone,
		MapPin
	} from 'lucide-svelte';

	let activeTab = $state<'moderation' | 'categories' | 'metrics'>('moderation');

	// Profissionais pendentes de aprovação
	let pendingProfessionals = $state([
		{
			id: '8001',
			name: 'Marcos Eletro Instalações ME',
			contactName: 'Marcos Pereira',
			docType: 'CNPJ',
			docNumber: '34.567.890/0001-12',
			whatsapp: '(48) 99876-1122',
			services: ['Eletricista', 'Ar-Condicionado'],
			city: 'Criciúma',
			state: 'SC',
			createdAt: 'Hoje às 14:30',
			experienceYears: 6,
			bio: 'Especialista em instalações elétricas residenciais e comerciais, manutenção de quadros e comandos.'
		},
		{
			id: '8002',
			name: 'Juliana Reformas & Pinturas',
			contactName: 'Juliana Machado',
			docType: 'CPF',
			docNumber: '089.456.123-99',
			whatsapp: '(48) 99112-3344',
			services: ['Pintor Residencial', 'Diarista'],
			city: 'Içara',
			state: 'SC',
			createdAt: 'Hoje às 11:15',
			experienceYears: 4,
			bio: 'Serviços de pintura decorativa, texturas, massa corrida e limpeza fina pós-obra.'
		}
	]);

	async function approveProfessional(prof: typeof pendingProfessionals[0]) {
		const ok = await confirm.show({
			title: 'Aprovar Profissional',
			message: `Deseja aprovar o cadastro de "${prof.name}"? O profissional receberá 20 moedas de bônus e poderá desbloquear leads imediatamente.`,
			confirmText: 'Aprovar Cadastro',
			cancelText: 'Cancelar'
		});

		if (ok) {
			pendingProfessionals = pendingProfessionals.filter(p => p.id !== prof.id);
			alert.success(`Profissional "${prof.name}" aprovado com sucesso!`);
		}
	}

	async function rejectProfessional(prof: typeof pendingProfessionals[0]) {
		const ok = await confirm.show({
			title: 'Rejeitar Cadastro',
			message: `Deseja rejeitar o cadastro de "${prof.name}"?`,
			confirmText: 'Rejeitar',
			cancelText: 'Voltar'
		});

		if (ok) {
			pendingProfessionals = pendingProfessionals.filter(p => p.id !== prof.id);
			alert.info(`Cadastro de "${prof.name}" rejeitado.`);
		}
	}
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<!-- Header do Painel Admin -->
	<div class="border-b-2 border-base-300 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<div class="inline-flex items-center gap-1.5 badge badge-secondary font-bold text-xs mb-2">
				<ShieldAlert class="w-3.5 h-3.5" /> Administração
			</div>
			<h1 class="text-3xl font-black">Painel de Controle Colupe</h1>
			<p class="text-sm opacity-70">Moderação de cadastros, controle de catálogo e métricas do marketplace</p>
		</div>

		<div class="flex items-center gap-3">
			<button
				onclick={() => activeTab = 'moderation'}
				class="btn btn-sm {activeTab === 'moderation' ? 'btn-primary' : 'btn-ghost'} font-bold"
			>
				Moderação ({pendingProfessionals.length})
			</button>
			<button
				onclick={() => activeTab = 'metrics'}
				class="btn btn-sm {activeTab === 'metrics' ? 'btn-primary' : 'btn-ghost'} font-bold"
			>
				Métricas
			</button>
		</div>
	</div>

	<!-- Cards de Resumo Geral -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
		<div class="bg-base-100 border-2 border-base-300 p-5 rounded-xl">
			<div class="flex items-center justify-between opacity-70 text-xs font-bold uppercase mb-2">
				<span>Prestadores Ativos</span>
				<Users class="w-4 h-4 text-primary" />
			</div>
			<span class="text-3xl font-black">148</span>
			<span class="text-xs text-success font-semibold block mt-1">+12 nesta semana</span>
		</div>

		<div class="bg-base-100 border-2 border-base-300 p-5 rounded-xl">
			<div class="flex items-center justify-between opacity-70 text-xs font-bold uppercase mb-2">
				<span>Pedidos Publicados</span>
				<TrendingUp class="w-4 h-4 text-secondary" />
			</div>
			<span class="text-3xl font-black">384</span>
			<span class="text-xs text-success font-semibold block mt-1">89% com contatos realizados</span>
		</div>

		<div class="bg-base-100 border-2 border-base-300 p-5 rounded-xl">
			<div class="flex items-center justify-between opacity-70 text-xs font-bold uppercase mb-2">
				<span>Moedas em Circulação</span>
				<Coins class="w-4 h-4 text-warning" />
			</div>
			<span class="text-3xl font-black">4.250</span>
			<span class="text-xs opacity-70 font-semibold block mt-1">R$ 4.250 em volume transacionado</span>
		</div>

		<div class="bg-base-100 border-2 border-base-300 p-5 rounded-xl">
			<div class="flex items-center justify-between opacity-70 text-xs font-bold uppercase mb-2">
				<span>Categorias Ativas</span>
				<FolderTree class="w-4 h-4 text-accent" />
			</div>
			<span class="text-3xl font-black">6</span>
			<span class="text-xs opacity-70 font-semibold block mt-1">32 especialidades</span>
		</div>
	</div>

	<!-- Conteúdo da Aba Moderação -->
	{#if activeTab === 'moderation'}
		<div class="space-y-6">
			<div class="flex items-center justify-between">
				<h2 class="text-xl font-black">Cadastros de Profissionais Pendentes</h2>
				<span class="text-xs font-bold opacity-70">{pendingProfessionals.length} aguardando análise</span>
			</div>

			{#if pendingProfessionals.length === 0}
				<div class="bg-base-100 border-2 border-base-300 p-12 text-center rounded-xl">
					<CheckCircle2 class="w-12 h-12 text-success mx-auto mb-3" />
					<p class="font-bold text-lg">Tudo em dia!</p>
					<p class="text-sm opacity-70">Nenhum cadastro de profissional aguardando moderação no momento.</p>
				</div>
			{:else}
				<div class="space-y-4">
					{#each pendingProfessionals as prof}
						<div class="bg-base-100 border-2 border-base-300 rounded-xl p-6 shadow-sm space-y-4">
							<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-base-200 pb-3">
								<div>
									<h3 class="text-lg font-black">{prof.name}</h3>
									<p class="text-xs opacity-70 font-semibold">
										Responsável: {prof.contactName} • {prof.docType}: {prof.docNumber}
									</p>
								</div>
								<span class="badge badge-warning text-xs font-bold">Pendente de Moderação</span>
							</div>

							<div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-base-200 p-4 rounded-lg">
								<div>
									<span class="text-xs font-bold uppercase opacity-70 block">Especialidades</span>
									<div class="flex gap-1 flex-wrap mt-1">
										{#each prof.services as s}
											<span class="badge badge-sm badge-outline font-semibold">{s}</span>
										{/each}
									</div>
								</div>
								<div>
									<span class="text-xs font-bold uppercase opacity-70 block">Localização & Contato</span>
									<p class="font-semibold flex items-center gap-1 mt-1">
										<MapPin class="w-3.5 h-3.5 text-primary" />
										{prof.city} - {prof.state}
									</p>
									<p class="text-xs opacity-80 flex items-center gap-1 mt-0.5">
										<Phone class="w-3 h-3 text-success" />
										{prof.whatsapp}
									</p>
								</div>
								<div>
									<span class="text-xs font-bold uppercase opacity-70 block">Experiência & Bio</span>
									<p class="text-xs opacity-80 mt-1 italic leading-relaxed">
										"{prof.bio}" ({prof.experienceYears} anos de exp.)
									</p>
								</div>
							</div>

							<div class="flex justify-end gap-3 pt-2">
								<button
									onclick={() => rejectProfessional(prof)}
									class="btn btn-sm btn-outline btn-error font-bold gap-1.5"
								>
									<XCircle class="w-4 h-4" /> Rejeitar
								</button>
								<button
									onclick={() => approveProfessional(prof)}
									class="btn btn-sm btn-success font-bold gap-1.5"
								>
									<CheckCircle2 class="w-4 h-4" /> Aprovar e Liberar Acesso
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{:else}
		<!-- Métricas -->
		<div class="bg-base-100 border-2 border-base-300 p-8 rounded-xl">
			<h2 class="text-xl font-black mb-4">Relatório de Desempenho do Marketplace</h2>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div class="border border-base-300 p-4 rounded-lg">
					<span class="text-xs font-bold uppercase opacity-70 block">Taxa de Conversão de Leads</span>
					<span class="text-2xl font-black text-success">92.4%</span>
					<p class="text-xs opacity-75 mt-1">Pedidos com ao menos 1 profissional que desbloqueou o contato.</p>
				</div>
				<div class="border border-base-300 p-4 rounded-lg">
					<span class="text-xs font-bold uppercase opacity-70 block">Tempo Médio de Primeiro Contato</span>
					<span class="text-2xl font-black text-primary">14 min</span>
					<p class="text-xs opacity-75 mt-1">Agilidade no atendimento ao cliente final.</p>
				</div>
				<div class="border border-base-300 p-4 rounded-lg">
					<span class="text-xs font-bold uppercase opacity-70 block">Avaliação Média dos Prestadores</span>
					<span class="text-2xl font-black text-warning">4.88 / 5.0</span>
					<p class="text-xs opacity-75 mt-1">Baseado em 210 avaliações de clientes.</p>
				</div>
			</div>
		</div>
	{/if}
</div>
