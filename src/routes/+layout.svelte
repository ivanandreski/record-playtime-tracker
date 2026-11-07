<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';

	import { onMount } from 'svelte';

	let { children } = $props();

	let importState = $state<{ isRunning: boolean; percentage: number | null; message: string | null } | null>(null);
	let showPopup = $state(false);
	let timer: ReturnType<typeof setInterval> | undefined;

	async function poll() {
		importState = await (await fetch('/api/import/state')).json();
		if (!importState?.isRunning) {
			clearInterval(timer);
			timer = undefined;
		}
	}

	function startPolling() {
		showPopup = true;
		timer ??= setInterval(poll, 1000);
	}

	async function startImport() {
		await fetch('/api/import', { method: 'POST' }); // 409 just means already running
		await poll();
		startPolling();
	}

	onMount(() => {
		poll().then(() => importState?.isRunning && startPolling());
		return () => clearInterval(timer);
	});

	const navLinks = [
		{ href: '/', label: 'Collection' },
		{ href: '/play-sessions', label: 'Play Sessions' },
		{ href: '/styluses', label: 'Styluses' }
	];
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<header class="border-b border-neutral-200 bg-white px-6 py-3 dark:border-neutral-800 dark:bg-neutral-950">
	<nav class="flex items-center gap-6">
		{#each navLinks as link}
			<a
				href={link.href}
				class="text-sm transition-colors {$page.url.pathname === link.href
					? 'font-bold text-black dark:text-white'
					: 'font-normal text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-neutral-200'}"
			>
				{link.label}
			</a>
		{/each}
		<button
			onclick={startImport}
			disabled={importState?.isRunning}
			class="ml-auto rounded border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
		>
			Import
		</button>
	</nav>
</header>

{#if showPopup && importState}
	<div class="fixed top-4 right-4 z-50 w-72 rounded border border-neutral-200 bg-white p-3 shadow-lg dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200">
		<div class="flex items-start justify-between gap-2">
			<span class="text-sm font-bold">Discogs import</span>
			<button onclick={() => (showPopup = false)} aria-label="Close" class="text-neutral-500 hover:text-black dark:hover:text-white">×</button>
		</div>
		<div class="my-2 h-2 rounded bg-neutral-200 dark:bg-neutral-800">
			<div class="h-2 rounded bg-black dark:bg-white" style="width: {importState.percentage ?? 0}%"></div>
		</div>
		<p class="truncate text-xs text-neutral-500 dark:text-neutral-400">{importState.message}</p>
	</div>
{/if}

{@render children()}
