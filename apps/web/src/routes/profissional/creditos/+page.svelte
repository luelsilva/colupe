<script lang="ts">
	import { onMount } from 'svelte';
	import { Coins, CheckCircle, ArrowLeft, ShieldCheck, Zap, History } from 'lucide-svelte';
	import { alert, confirm } from '@colupe/ui';
	import { generateSnowflakeId } from '@colupe/shared';
	import { API_URL } from '$lib/config/api';

	interface PackageItem {
		id: number;
		name: string;
		creditsAmount: number;
		bonusCredits: number;
		priceCents: number;
		orderIndex: number;
	}

	let userCredits = $state(45);
	let isPurchasing = $state(false);
	let packages = $state<PackageItem[]>([]);
	let isLoadingPackages = $state(true);

	onMount(async () => {
		try {
			const res = await fetch(`${API_URL}/catalog/packages`);
			if (res.ok) {
				const json = await res.json();
				packages = json.data ?? [];
			}
		} finally {
			isLoadingPackages = false;
		}
	});

	let transactions = $state([
		{
			id: generateSnowflakeId(),
			date: '03/10/2026 14:20',
			description: 'Bônus de Boas-Vindas no Cadastro',
			amount: '+20 Colupas',
			type: 'bonus'
		},
		{
			id: generateSnowflakeId(),
			date: '03/10/2026 16:45',
			description: 'Recarga - Pacote Básico',
			amount: '+50 Colupas',
			type: 'purchase'
		},
		{
			id: generateSnowflakeId(),
			date: '03/10/2026 17:10',
			description: 'Desbloqueio de Contato: Instalação de Ar Condicionado',
			amount: '-25 Colupas',
			type: 'unlock'
		}
	]);

	function formatPrice(cents: number) {
		return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
	}

	async function buyPackage(pkg: PackageItem) {
		const totalColupas = pkg.creditsAmount + pkg.bonusCredits;
		const formattedPrice = formatPrice(pkg.priceCents);
		const ok = await confirm.show({
			title: `Adquirir ${pkg.name}`,
			message: `Confirmar a compra de ${totalColupas} Colupas (${pkg.creditsAmount} + ${pkg.bonusCredits} bônus) pelo valor de ${formattedPrice}?`,
			confirmText: `Pagar ${formattedPrice}`,
			cancelText: 'Cancelar'
		});

		if (ok) {
			isPurchasing = true;
			setTimeout(() => {
				userCredits += totalColupas;
				transactions.unshift({
					id: generateSnowflakeId(),
					date: new Date().toLocaleString('pt-BR'),
					description: `Recarga - ${pkg.name}`,
					amount: `+${totalColupas} Colupas`,
					type: 'purchase'
				});
				isPurchasing = false;
				alert.success(`Recarga concluída! Você recebeu ${totalColupas} Colupas.`);
			}, 500);
		}
	}
</script>

<div class="container mx-auto px-4 py-8 max-w-5xl">
	<!-- Topo de Navegação -->
	<div class="flex items-center justify-between mb-8">
		<a href="/profissional" class="btn btn-ghost btn-sm gap-2 font-bold">
			<ArrowLeft class="w-4 h-4" />
			Voltar ao Dashboard
		</a>

		<!-- Saldo Atual -->
		<div class="bg-base-200 border-2 border-warning/50 px-4 py-2 rounded-xl flex items-center gap-3">
			<div class="p-2 bg-warning text-warning-content rounded-lg">
				<Coins class="w-5 h-5" />
			</div>
			<div>
				<span class="text-[10px] font-bold uppercase opacity-70 block">Seu Saldo Atual</span>
				<span class="text-xl font-black text-warning">{userCredits} Colupas</span>
			</div>
		</div>
	</div>

	<!-- Cabeçalho -->
	<div class="text-center mb-10">
		<div class="inline-flex items-center gap-2 badge badge-warning font-bold text-xs uppercase px-3 py-2 mb-3">
			<Zap class="w-3.5 h-3.5" />
			Créditos para Prestadores
		</div>
		<h1 class="text-3xl lg:text-4xl font-black mb-3">Adquira Colupas para seu Negócio</h1>
		<p class="text-sm opacity-80 max-w-xl mx-auto">
			Na Colupe, seus créditos são chamados de <strong>Colupas</strong>. Use suas Colupas para desbloquear contatos diretos de novos clientes prontos para contratar.
		</p>
	</div>

	<!-- Grade de Pacotes -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
		{#if isLoadingPackages}
			<div class="col-span-3 text-center py-12">
				<span class="loading loading-spinner loading-lg text-primary"></span>
			</div>
		{:else}
			{#each packages as pkg}
				{@const isPopular = pkg.orderIndex === 2}
				<div class="card bg-base-100 {isPopular ? 'border-2 border-primary shadow-xl' : 'border-2 border-base-300 shadow-sm'} flex flex-col justify-between">
					<div class="card-body">
						{#if isPopular}
							<div class="badge badge-primary font-bold text-xs uppercase self-start mb-1">Mais Escolhido</div>
						{/if}

						<h2 class="card-title text-xl font-black">{pkg.name}</h2>
						<p class="text-3xl font-black text-primary my-2">{formatPrice(pkg.priceCents)}</p>

						<div class="bg-base-200 p-3 rounded-lg my-3 border border-base-300">
							<span class="text-xs uppercase font-bold opacity-70 block">Você recebe:</span>
							<span class="text-xl font-black text-warning">
								{pkg.creditsAmount + pkg.bonusCredits} Colupas
							</span>
							{#if pkg.bonusCredits > 0}
								<span class="text-xs badge badge-warning font-bold ml-1">+{pkg.bonusCredits} bônus</span>
							{/if}
						</div>

						<p class="text-xs opacity-75 leading-relaxed mb-4">
							{pkg.creditsAmount} Colupas para desbloquear novos contatos.
						</p>

						<div class="space-y-2 text-xs font-semibold opacity-90 border-t border-base-300 pt-3">
							<div class="flex items-center gap-1.5">
								<CheckCircle class="w-4 h-4 text-success shrink-0" />
								<span>Sem mensalidade ou anuidade</span>
							</div>
							<div class="flex items-center gap-1.5">
								<CheckCircle class="w-4 h-4 text-success shrink-0" />
								<span>Colupas não expiram</span>
							</div>
							<div class="flex items-center gap-1.5">
								<CheckCircle class="w-4 h-4 text-success shrink-0" />
								<span>Liberação imediata</span>
							</div>
						</div>
					</div>

					<div class="p-6 pt-0">
						<button
							onclick={() => buyPackage(pkg)}
							disabled={isPurchasing}
							class="btn {isPopular ? 'btn-primary' : 'btn-outline'} btn-block font-bold"
						>
							Comprar {pkg.name}
						</button>
					</div>
				</div>
			{/each}
		{/if}
	</div>

	<!-- Informações e Dúvidas -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
		<div class="bg-base-100 border-2 border-base-300 p-6 rounded-xl">
			<h3 class="font-bold text-base mb-2 flex items-center gap-2">
				<ShieldCheck class="w-5 h-5 text-primary" />
				Como funcionam as Colupas?
			</h3>
			<p class="text-xs opacity-80 leading-relaxed">
				Ao visualizar um pedido no Feed de Oportunidades, você vê a descrição do serviço, cidade e bairro. Para acessar o WhatsApp, telefone e endereço do cliente, você investe uma quantidade fixa de Colupas. Cada lead é liberado para no máximo 4 profissionais.
			</p>
		</div>

		<div class="bg-base-100 border-2 border-base-300 p-6 rounded-xl">
			<h3 class="font-bold text-base mb-2 flex items-center gap-2">
				<Coins class="w-5 h-5 text-warning" />
				Garantia e Segurança
			</h3>
			<p class="text-xs opacity-80 leading-relaxed">
				Todos os clientes passam por verificação de telefone. Caso ocorra qualquer inconsistência no contato, nossa equipe de moderação avalia e estorna as Colupas para sua conta.
			</p>
		</div>
	</div>

	<!-- Histórico de Extrato de Colupas -->
	<div class="bg-base-100 border-2 border-base-300 rounded-xl p-6">
		<h3 class="font-bold text-base mb-4 flex items-center gap-2 border-b border-base-300 pb-3">
			<History class="w-5 h-5 text-primary" />
			Extrato de Colupas
		</h3>

		<div class="overflow-x-auto">
			<table class="table table-sm">
				<thead>
					<tr class="text-xs font-bold uppercase opacity-70">
						<th>Data / Hora</th>
						<th>Descrição</th>
						<th class="text-right">Movimentação</th>
					</tr>
				</thead>
				<tbody>
					{#each transactions as tx}
						<tr class="hover">
							<td class="text-xs opacity-75 font-mono">{tx.date}</td>
							<td class="text-xs font-medium">{tx.description}</td>
							<td class="text-right font-bold text-xs {tx.amount.startsWith('+') ? 'text-success' : 'text-error'}">
								{tx.amount}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
