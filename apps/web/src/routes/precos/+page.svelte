<script lang="ts">
	import { Coins, Check, Zap, HelpCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-svelte';

	const packages = [
		{
			id: 4001,
			name: 'Pacote Básico',
			price: 'R$ 49,90',
			colupas: 50,
			bonus: 0,
			description: 'Ideal para profissionais autônomos iniciando na plataforma e testando novos serviços.',
			popular: false
		},
		{
			id: 4002,
			name: 'Pacote Profissional',
			price: 'R$ 99,90',
			colupas: 120,
			bonus: 15,
			description: 'O melhor custo-benefício para quem quer atender vários clientes semanalmente.',
			popular: true
		},
		{
			id: 4003,
			name: 'Pacote Premium',
			price: 'R$ 199,90',
			colupas: 300,
			bonus: 60,
			description: 'Para empresas e profissionais de alta demanda com 60 Colupas extras de bônus.',
			popular: false
		}
	];
</script>

<svelte:head>
	<title>Planos e Colupas - Preços Transparentes | Colupe</title>
</svelte:head>

<!-- Header de Preços -->
<section class="border-b-2 border-base-300 bg-base-200 py-16">
	<div class="container mx-auto px-4 max-w-4xl text-center">
		<div class="inline-flex items-center gap-2 bg-warning/15 text-warning-content px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-6 border border-warning/30 bg-warning/20">
			<Coins class="w-3.5 h-3.5 text-warning" />
			<span class="text-base-content">Moeda Oficial Colupe</span>
		</div>
		<h1 class="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
			Preços simples, justos e sem surpresas
		</h1>
		<p class="text-lg opacity-80 max-w-2xl mx-auto leading-relaxed">
			Para clientes, a plataforma é <strong class="text-success">100% gratuita</strong>. Profissionais adquirem créditos chamados <strong class="text-primary">Colupas</strong> apenas para desbloquear os contatos dos serviços que desejam atender.
		</p>
	</div>
</section>

<!-- Cards de Planos -->
<section class="py-16 bg-base-100">
	<div class="container mx-auto px-4 max-w-6xl">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
			{#each packages as pkg}
				<div class="card bg-base-100 border-2 rounded-2xl flex flex-col justify-between transition-all {pkg.popular ? 'border-primary shadow-xl ring-2 ring-primary/20 bg-primary/5' : 'border-base-300 shadow-md'}">
					<div class="p-8">
						{#if pkg.popular}
							<div class="inline-flex items-center gap-1.5 badge badge-primary font-bold text-xs uppercase mb-4 py-3 px-3">
								<Sparkles class="w-3.5 h-3.5" />
								Mais Escolhido
							</div>
						{/if}

						<h3 class="text-2xl font-black mb-2">{pkg.name}</h3>
						<p class="text-xs opacity-70 mb-6">{pkg.description}</p>

						<div class="mb-6">
							<span class="text-4xl font-black tracking-tight">{pkg.price}</span>
							<span class="text-xs opacity-60"> / pagamento único</span>
						</div>

						<div class="p-4 rounded-xl bg-base-200 border border-base-300 mb-6">
							<div class="flex items-center justify-between font-black text-lg text-primary">
								<span>{pkg.colupas} Colupas</span>
								{#if pkg.bonus > 0}
									<span class="badge badge-warning text-xs font-black">+{pkg.bonus} Bônus</span>
								{/if}
							</div>
						</div>

						<ul class="space-y-3 text-sm opacity-85">
							<li class="flex items-center gap-2">
								<Check class="w-4 h-4 text-success shrink-0" />
								Desbloqueio direto de WhatsApp e telefone
							</li>
							<li class="flex items-center gap-2">
								<Check class="w-4 h-4 text-success shrink-0" />
								Créditos sem data de expiração
							</li>
							<li class="flex items-center gap-2">
								<Check class="w-4 h-4 text-success shrink-0" />
								Sem comissão sobre o valor do serviço
							</li>
						</ul>
					</div>

					<div class="p-8 pt-0 mt-auto">
						<a
							href="/profissional/creditos"
							class="btn btn-block font-black {pkg.popular ? 'btn-primary' : 'btn-outline border-base-300'}"
						>
							Comprar Colupas
							<ArrowRight class="w-4 h-4" />
						</a>
					</div>
				</div>
			{/each}
		</div>

		<!-- Como funcionam as Colupas -->
		<div class="mt-16 bg-base-200 border-2 border-base-300 rounded-3xl p-8 md:p-10 max-w-4xl mx-auto">
			<div class="flex items-start gap-4">
				<div class="p-3 bg-primary/10 text-primary rounded-2xl shrink-0">
					<Coins class="w-7 h-7" />
				</div>
				<div>
					<h3 class="text-xl font-black mb-2">Como funcionam as Colupas?</h3>
					<p class="text-sm opacity-80 leading-relaxed mb-4">
						Cada pedido de orçamento publicado por um cliente tem um custo fixo de desbloqueio (geralmente entre 15 e 30 Colupas, dependendo da complexidade do trabalho).
					</p>
					<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs font-medium">
						<div class="bg-base-100 p-3 rounded-xl border border-base-300">
							<strong>1. Sem mensalidade</strong>
							<p class="opacity-75 mt-1">Você não fica preso a planos mensais obrigatórios.</p>
						</div>
						<div class="bg-base-100 p-3 rounded-xl border border-base-300">
							<strong>2. Lucro 100% seu</strong>
							<p class="opacity-75 mt-1">O valor combinado com o cliente é integralmente seu.</p>
						</div>
						<div class="bg-base-100 p-3 rounded-xl border border-base-300">
							<strong>3. Bônus no Cadastro</strong>
							<p class="opacity-75 mt-1">Novos prestadores ganham Colupas grátis para começar.</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
