<script lang="ts">
	import {
		Wrench,
		BookOpen,
		Car,
		Briefcase,
		Laptop,
		PartyPopper,
		Scissors,
		Hammer,
		HeartPulse,
		Home,
		Folder,
		Sparkles,
		Brush,
		Truck,
		Camera,
		Music,
		Utensils
	} from 'lucide-svelte';

	interface Props {
		name?: string | null;
		class?: string;
	}

	let { name = '', class: className = 'w-5 h-5' }: Props = $props();

	let normalized = $derived((name ?? '').toLowerCase().trim().replace(/\s+/g, '-'));
</script>

{#if normalized === 'wrench'}
	<Wrench class={className} />
{:else if normalized === 'book-open' || normalized === 'book'}
	<BookOpen class={className} />
{:else if normalized === 'car'}
	<Car class={className} />
{:else if normalized === 'briefcase'}
	<Briefcase class={className} />
{:else if normalized === 'laptop' || normalized === 'code'}
	<Laptop class={className} />
{:else if normalized === 'party-popper' || normalized === 'party'}
	<PartyPopper class={className} />
{:else if normalized === 'scissors'}
	<Scissors class={className} />
{:else if normalized === 'hammer'}
	<Hammer class={className} />
{:else if normalized === 'heart-pulse' || normalized === 'heart'}
	<HeartPulse class={className} />
{:else if normalized === 'home'}
	<Home class={className} />
{:else if normalized === 'sparkles'}
	<Sparkles class={className} />
{:else if normalized === 'brush' || normalized === 'paint'}
	<Brush class={className} />
{:else if normalized === 'truck'}
	<Truck class={className} />
{:else if normalized === 'camera'}
	<Camera class={className} />
{:else if normalized === 'music'}
	<Music class={className} />
{:else if normalized === 'utensils'}
	<Utensils class={className} />
{:else}
	<Folder class={className} />
{/if}
