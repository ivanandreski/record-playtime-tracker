<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';

	let { children } = $props();

	const navLinks = [
		{ href: '/', label: 'Collection' },
		{ href: '/play-sessions', label: 'Play Sessions' },
		{ href: '/styluses', label: 'Styluses' }
	];
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<header class="border-b border-neutral-800 bg-neutral-950 px-6 py-3">
	<nav class="flex items-center gap-6">
		{#each navLinks as link}
			<a
				href={link.href}
				class="text-sm transition-colors {$page.url.pathname === link.href
					? 'font-bold text-white'
					: 'font-normal text-neutral-400 hover:text-neutral-200'}"
			>
				{link.label}
			</a>
		{/each}
	</nav>
</header>

{@render children()}
