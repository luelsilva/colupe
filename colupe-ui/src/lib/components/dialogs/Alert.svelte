<script lang="ts">
  import { alert, type AlertType } from './alerts.svelte';

  const icons: Record<AlertType, string> = {
    success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    error:   'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    info:    'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  };

  const styles: Record<AlertType, {
    wrapper: string;
    icon: string;
    title: string;
    msg: string;
    close: string;
    bar: string;
    label: string;
  }> = {
    success: {
      wrapper: 'bg-emerald-950 border-emerald-600 text-emerald-100 shadow-xl',
      icon:    'text-emerald-400',
      title:   'text-emerald-300',
      msg:     'text-emerald-200',
      close:   'text-emerald-400 hover:text-emerald-200 hover:bg-emerald-900',
      bar:     'bg-emerald-500',
      label:   'Sucesso',
    },
    error: {
      wrapper: 'bg-rose-950 border-rose-600 text-rose-100 shadow-xl',
      icon:    'text-rose-400',
      title:   'text-rose-300',
      msg:     'text-rose-200',
      close:   'text-rose-400 hover:text-rose-200 hover:bg-rose-900',
      bar:     'bg-rose-500',
      label:   'Erro',
    },
    warning: {
      wrapper: 'bg-amber-950 border-amber-600 text-amber-100 shadow-xl',
      icon:    'text-amber-400',
      title:   'text-amber-300',
      msg:     'text-amber-200',
      close:   'text-amber-400 hover:text-amber-200 hover:bg-amber-900',
      bar:     'bg-amber-500',
      label:   'Atenção',
    },
    info: {
      wrapper: 'bg-slate-900 border-sky-600 text-sky-100 shadow-xl',
      icon:    'text-sky-400',
      title:   'text-sky-300',
      msg:     'text-sky-200',
      close:   'text-sky-400 hover:text-sky-200 hover:bg-slate-800',
      bar:     'bg-sky-500',
      label:   'Informação',
    },
  };

  function slideIn(node: HTMLElement, { delay = 0, duration = 260 } = {}) {
    return {
      delay,
      duration,
      css: (t: number) => {
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        return `
          opacity: ${eased};
          transform: translateX(${(1 - eased) * 32}px);
        `;
      },
    };
  }

  function slideOut(node: HTMLElement, { duration = 200 } = {}) {
    return {
      duration,
      css: (t: number) => `
        opacity: ${t};
        transform: translateX(${(1 - t) * 32}px);
        max-height: ${t * 100}px;
        margin-bottom: ${t * 0.5}rem;
      `,
    };
  }
</script>

<div
  role="region"
  aria-label="Notificações"
  aria-live="polite"
  class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none"
>
  {#each alert.items as item (item.id)}
    {@const s = styles[item.type]}
    <div
      in:slideIn
      out:slideOut
      role="alert"
      class="pointer-events-auto relative flex items-start gap-3 w-[340px] max-w-[90vw]
             rounded-lg border-2 shadow-2xl px-4 py-3.5 overflow-hidden
             {s.wrapper}"
    >
      {#if item.duration > 0}
        <div
          class="absolute bottom-0 left-0 h-[3px] {s.bar} origin-left"
          style="animation: shrink {item.duration}ms linear forwards;"
        ></div>
      {/if}

      <div class="shrink-0 mt-0.5">
        <svg xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 {s.icon}"
          fill="none" viewBox="0 0 24 24"
          stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d={icons[item.type]} />
        </svg>
      </div>

      <div class="flex-1 min-w-0">
        <p class="text-xs font-bold uppercase tracking-wider {s.title}">{s.label}</p>
        <p class="text-sm leading-snug mt-0.5 font-medium {s.msg}">{item.message}</p>
      </div>

      <button
        onclick={() => alert.dismiss(item.id)}
        aria-label="Fechar notificação"
        class="shrink-0 rounded p-1 transition-colors duration-150 {s.close}"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
          viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  {/each}
</div>

<style>
  @keyframes shrink {
    from { transform: scaleX(1); }
    to   { transform: scaleX(0); }
  }
</style>
