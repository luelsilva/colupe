<script lang="ts">
  import { confirm } from "./confirm.svelte";
  import { fade, scale } from "svelte/transition";
</script>

{#if confirm.active}
  <!-- Backdrop sólido de alto contraste -->
  <div
    transition:fade={{ duration: 150 }}
    class="fixed inset-0 bg-black/80 z-[9998] flex items-center justify-center p-4"
    onclick={confirm.cancel}
    onkeydown={(e) => {
      if (e.key === "Escape") confirm.cancel();
    }}
    role="presentation"
  >
    <!-- Modal Box Sólido -->
    <div
      transition:scale={{ duration: 150, start: 0.96 }}
      class="bg-slate-900 border border-slate-800 shadow-2xl rounded-xl w-full max-w-md p-6 pointer-events-auto flex flex-col gap-4 text-slate-100"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      tabindex="-1"
    >
      <div class="flex flex-col gap-1.5">
        <h3 id="confirm-modal-title" class="text-base font-semibold text-slate-100 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-amber-500 shrink-0"
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
        <p class="text-[13px] text-slate-300 font-medium leading-relaxed mt-1">
          {confirm.active.message}
        </p>
      </div>

      <div class="flex justify-end gap-2.5 mt-2">
        <button
          type="button"
          onclick={confirm.cancel}
          class="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
        >
          {confirm.active.cancelText}
        </button>
        <button
          type="button"
          onclick={confirm.accept}
          class="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 active:bg-red-700 rounded-lg shadow-md transition-colors cursor-pointer"
        >
          {confirm.active.confirmText}
        </button>
      </div>
    </div>
  </div>
{/if}
