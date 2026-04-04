<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const activeStyluses = $derived(data.styluses.filter((s) => s.isActive));
	const retiredStyluses = $derived(data.styluses.filter((s) => !s.isActive));

	function formatPlaytime(seconds: number): string {
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		const s = seconds % 60;
		if (h > 0) return `${h}h ${m}m ${s}s`;
		if (m > 0) return `${m}m ${s}s`;
		return `${s}s`;
	}
</script>

<div class="p-6">
	<h1 class="mb-6 text-2xl font-bold tracking-tight">Styluses</h1>

	<section class="mb-10">
		<h2 class="mb-3 text-lg font-semibold text-neutral-200">Active</h2>
		{#if activeStyluses.length === 0}
			<p class="text-neutral-400">No active styluses.</p>
		{:else}
			<div class="overflow-x-auto rounded-md border border-neutral-700">
				<table class="w-full text-sm">
					<thead class="border-b border-neutral-700 bg-neutral-800 text-neutral-400">
						<tr>
							<th class="px-4 py-3 text-left font-semibold uppercase tracking-wider">Name</th>
							<th class="px-4 py-3 text-left font-semibold uppercase tracking-wider">Total Playtime</th>
              <th class="px-4 py-3 text-left font-semibold uppercase tracking-wider">Description</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-neutral-800">
						{#each activeStyluses as stylus}
							<tr class="hover:bg-neutral-800/40">
								<td class="px-4 py-3 font-medium text-neutral-200">{stylus.name ?? `Stylus #${stylus.id}`}</td>
								<td class="px-4 py-3 text-left tabular-nums text-neutral-300">{formatPlaytime(stylus.playtime)}</td>
                <td class="px-4 py-3 text-neutral-400">{stylus.description ?? '—'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>

	<section>
		<h2 class="mb-3 text-lg font-semibold text-neutral-400">Retired</h2>
		{#if retiredStyluses.length === 0}
			<p class="text-neutral-500">No retired styluses.</p>
		{:else}
			<div class="overflow-x-auto rounded-md border border-neutral-700">
				<table class="w-full text-sm">
					<thead class="border-b border-neutral-700 bg-neutral-800 text-neutral-400">
						<tr>
							<th class="px-4 py-3 text-left font-semibold uppercase tracking-wider">Name</th>
							<th class="px-4 py-3 text-left font-semibold uppercase tracking-wider">Description</th>
							<th class="px-4 py-3 text-left font-semibold uppercase tracking-wider">Total Playtime</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-neutral-800">
						{#each retiredStyluses as stylus}
							<tr class="hover:bg-neutral-800/40 opacity-60">
								<td class="px-4 py-3 font-medium text-neutral-300">{stylus.name ?? `Stylus #${stylus.id}`}</td>
								<td class="px-4 py-3 text-neutral-500">{stylus.description ?? '—'}</td>
								<td class="px-4 py-3 text-left tabular-nums text-neutral-400">{formatPlaytime(stylus.playtime)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>
</div>
