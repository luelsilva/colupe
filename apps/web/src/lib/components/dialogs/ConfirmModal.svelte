<script lang="ts">
	import { confirm } from './confirm.svelte';
	import { fade, scale } from 'svelte/transition';
</script>

{#if confirm.active}
	<!-- Backdrop sólido escuro sem blur -->
	<div
		transition:fade={{ duration: 150 }}
		class="fixed inset-0 bg-black/75 z-[9998] flex items-center justify-center p-4"
		onclick={confirm.cancel}
		onkeydown={(e) => {
			if (e.key === 'Escape') confirm.cancel();
		}}
		role="presentation"
	>
		<!-- Modal Box -->
		<div
			transition:scale={{ duration: 150, start: 0.96 }}
			class="bg-base-100 text-base-content border-2 border-base-300 shadow-2xl rounded-lg w-full max-w-md p-6 pointer-events-auto flex flex-col gap-4"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
			aria-labelledby="confirm-modal-title"
			tabindex="-1"
		>
			<div class="flex flex-col gap-2">
				<h3 id="confirm-modal-title" class="text-base font-bold flex items-center gap-2 text-primary">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5 text-warning shrink-0"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
					{confirm.active.title}
				</h3>
				<p class="text-sm opacity-80 leading-relaxed">
					{confirm.active.message}
				</p>
			</div>

			<!-- Actions (Cancel / Confirm) -->
			<div class="flex justify-end gap-2.5 mt-2">
				<button
					type="button"
					onclick={confirm.cancel}
					class="btn btn-sm btn-ghost border border-base-300"
				>
					{confirm.active.cancelText}
				</button>
				<button
					type="button"
					onclick={confirm.accept}
					class="btn btn-sm btn-primary"
				>
					{confirm.active.confirmText}
				</button>
			</div>
		</div>
	</div>
{/if}
