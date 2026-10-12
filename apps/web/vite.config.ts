import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	envDir: '../../',
	envPrefix: ['VITE_', 'PUBLIC_'],
	plugins: [tailwindcss(), sveltekit()]
});
