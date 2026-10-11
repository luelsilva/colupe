<script lang="ts">
	import { ShieldCheck, Zap, Users, HeartHandshake, Award, ArrowRight, CheckCircle2 } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Sobre o Colupe - Nossa Missão e Valores</title>
</svelte:head>

<!-- Hero Institucional -->
<section class="border-b-2 border-base-300 bg-base-200 py-16">
	<div class="container mx-auto px-4 max-w-4xl text-center">
		<div class="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider mb-6 border border-primary/20">
			<HeartHandshake class="w-3.5 h-3.5" />
			Quem Somos
		</div>
		<h1 class="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
			Conectando quem precisa a quem sabe fazer
		</h1>
		<p class="text-lg opacity-80 max-w-2xl mx-auto leading-relaxed">
			O <strong>Colupe</strong> é a plataforma criada para aproximar clientes e profissionais autônomos em todo o Brasil de forma transparente, rápida e sem intermediários na negociação.
		</p>
	</div>
</section>

<!-- Propósito e Valores -->
<section class="py-16 bg-base-100">
	<div class="container mx-auto px-4 max-w-5xl">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			<div class="card bg-base-200 border-2 border-base-300 p-6 rounded-2xl">
				<div class="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
					<Zap class="w-6 h-6" />
				</div>
				<h3 class="text-xl font-black mb-2">Agilidade Real</h3>
				<p class="text-sm opacity-80 leading-relaxed">
					Clientes solicitam serviços em menos de 2 minutos e recebem contatos diretos no WhatsApp sem burocracias.
				</p>
			</div>

			<div class="card bg-base-200 border-2 border-base-300 p-6 rounded-2xl">
				<div class="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-4">
					<ShieldCheck class="w-6 h-6" />
				</div>
				<h3 class="text-xl font-black mb-2">100% Transparente</h3>
				<p class="text-sm opacity-80 leading-relaxed">
					Sem taxas ocultas ou porcentagens sobre o serviço contratado. Toda negociação é feita livremente entre as partes.
				</p>
			</div>

			<div class="card bg-base-200 border-2 border-base-300 p-6 rounded-2xl">
				<div class="w-12 h-12 rounded-xl bg-warning/10 text-warning flex items-center justify-center mb-4">
					<Award class="w-6 h-6" />
				</div>
				<h3 class="text-xl font-black mb-2">Qualidade e Avaliações</h3>
				<p class="text-sm opacity-80 leading-relaxed">
					Profissionais constroem sua reputação na plataforma com avaliações reais de clientes atendidos na comunidade.
				</p>
			</div>
		</div>

		<!-- História / Como Funciona -->
		<div class="mt-16 bg-base-200 border-2 border-base-300 rounded-3xl p-8 md:p-12">
			<h2 class="text-2xl md:text-3xl font-black mb-6">Por que escolher o Colupe?</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm opacity-85">
				<div class="flex items-start gap-3">
					<CheckCircle2 class="w-5 h-5 text-success shrink-0 mt-0.5" />
					<div>
						<strong class="block text-base-content font-bold mb-1">Gratuito para Clientes</strong>
						Quem precisa de um serviço nunca paga nada para solicitar orçamentos e comparar propostas.
					</div>
				</div>
				<div class="flex items-start gap-3">
					<CheckCircle2 class="w-5 h-5 text-success shrink-0 mt-0.5" />
					<div>
						<strong class="block text-base-content font-bold mb-1">Moeda Oficial: Colupas</strong>
						Profissionais autônomos usam créditos flexíveis apenas nos pedidos que têm interesse em atender.
					</div>
				</div>
				<div class="flex items-start gap-3">
					<CheckCircle2 class="w-5 h-5 text-success shrink-0 mt-0.5" />
					<div>
						<strong class="block text-base-content font-bold mb-1">Contato Direto</strong>
						Sem travas de chat interno: a comunicação flui por WhatsApp e telefone para fechar negócios com rapidez.
					</div>
				</div>
				<div class="flex items-start gap-3">
					<CheckCircle2 class="w-5 h-5 text-success shrink-0 mt-0.5" />
					<div>
						<strong class="block text-base-content font-bold mb-1">Cobertura Ampla</strong>
						De reformas residenciais a serviços digitais, temos categorias para todos os tipos de demandas.
					</div>
				</div>
			</div>

			<div class="mt-10 flex flex-wrap gap-4 pt-6 border-t border-base-300">
				<a href="/pedir-servico" class="btn btn-primary font-bold">
					Solicitar um Serviço Grátis
					<ArrowRight class="w-4 h-4" />
				</a>
				<a href="/profissional/cadastro" class="btn btn-outline border-base-300 font-bold">
					Quero Ser um Profissional
				</a>
			</div>
		</div>
	</div>
</section>
