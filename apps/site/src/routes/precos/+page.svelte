<script lang="ts">
	const packages = [
		{
			id: 4001,
			name: 'Pacote Básico',
			price: 'R$ 49,90',
			colupas: 50,
			bonus: 0,
			description: 'Ideal para profissionais autônomos iniciando na plataforma.',
			popular: false
		},
		{
			id: 4002,
			name: 'Pacote Profissional',
			price: 'R$ 99,90',
			colupas: 120,
			bonus: 15,
			description: 'O melhor custo-benefício com 15 Colupas de bônus.',
			popular: true
		},
		{
			id: 4003,
			name: 'Pacote Premium',
			price: 'R$ 199,90',
			colupas: 300,
			bonus: 60,
			description: 'Para empresas e profissionais de alto volume com 60 Colupas de bônus.',
			popular: false
		}
	];
</script>

<section class="py-16 px-4 max-w-5xl mx-auto">
	<div class="text-center mb-12">
		<span class="badge badge-warning font-bold text-xs uppercase mb-2">Moeda Oficial Colupe</span>
		<h1 class="text-3xl lg:text-5xl font-black mb-4">Planos e Colupas para Profissionais</h1>
		<p class="text-base-content/70 max-w-2xl mx-auto">
			Para clientes o serviço é 100% gratuito. Profissionais adquirem créditos chamados <strong>Colupas</strong> para desbloquear contatos diretos de clientes e fechar orçamentos.
		</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
		{#each packages as pkg}
			<div class="card bg-base-100 {pkg.popular ? 'border-2 border-primary shadow-xl' : 'border border-base-300 shadow-md'}">
				<div class="card-body">
					{#if pkg.popular}
						<div class="badge badge-primary font-bold">Mais Popular</div>
					{/if}
					<h2 class="card-title {pkg.popular ? 'mt-2' : ''}">{pkg.name}</h2>
					<p class="text-3xl font-black text-primary my-4">{pkg.price}</p>
					
					<div class="space-y-1 mb-4">
						<p class="text-lg font-bold text-warning">
							{pkg.colupas} Colupas
							{#if pkg.bonus > 0}
								<span class="text-xs badge badge-warning font-bold ml-1">+{pkg.bonus} Bônus</span>
							{/if}
						</p>
						<p class="text-xs opacity-75">{pkg.description}</p>
					</div>

					<div class="card-actions mt-auto pt-4">
						<a
							href="http://localhost:3000/profissional/creditos"
							class="btn {pkg.popular ? 'btn-primary' : 'btn-outline'} btn-block font-bold"
						>
							Adquirir Colupas
						</a>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<div class="mt-16 bg-base-200 border-2 border-base-300 rounded-2xl p-8 text-center max-w-3xl mx-auto">
		<h3 class="text-xl font-bold mb-2">Como funcionam as Colupas?</h3>
		<p class="text-sm opacity-80 leading-relaxed">
			Cada serviço possui um custo fixo em Colupas para desbloquear as informações de contato completas do cliente (WhatsApp, telefone e endereço). Sem mensalidade ou taxa de cancelamento: você só usa suas Colupas nos serviços que escolher atender.
		</p>
	</div>
</section>
