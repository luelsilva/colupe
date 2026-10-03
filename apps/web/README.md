# Colupe UI

Frontend do Marketplace de Serviços **Colupe** (estilo GetNinjas) desenvolvido com [SvelteKit](https://kit.svelte.dev), [Svelte 5](https://svelte.dev), [TailwindCSS](https://tailwindcss.com) e [DaisyUI v5](https://daisyui.com).

## 🚀 Como Executar

### 1. Instalar Dependências
```bash
bun install
```

### 2. Rodar em Desenvolvimento
```bash
bun run dev
```

O servidor iniciará em `http://localhost:5173`.

---

## 🧭 Rotas e Estrutura de Telas

1. **Site Público / Clientes:**
   - `/` - Página inicial com busca de serviços, categorias populares e fluxo de funcionamento.
   - `/pedir-servico` - Formulário dinâmico para os clientes solicitarem orçamentos gratuitos.

2. **Área dos Profissionais:**
   - `/profissional` - Dashboard do prestador com feed de pedidos, saldo de moedas e contatos desbloqueados.
   - `/profissional/cadastro` - Onboarding e cadastro de autônomos/empresas com seleção de especialidades e raio de atendimento.

3. **Painel do Administrador:**
   - `/admin` - Moderação e aprovação de prestadores pendentes, controle de catálogo e métricas do marketplace.

---

## 🎨 Diretrizes Visuais Aplicadas (AGENTS.md)
- Cores sólidas e alto contraste.
- Zero blur (`backdrop-blur` eliminado).
- Zero gradientes ou transparências excessivas.
- Componentes de Diálogo/Alertas integrados em `$lib/components/dialogs/`.
