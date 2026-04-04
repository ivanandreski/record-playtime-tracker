<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let selectedStylusId = $state<string>('');
	$effect(() => {
		selectedStylusId = String(data.styluses[0]?.id ?? '');
	});

	const filteredSessions = $derived(
		selectedStylusId
			? data.playSessions.filter((s) => String(s.stylus.id) === selectedStylusId)
			: data.playSessions
	);

	function formatPlaytime(seconds: number): string {
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		const s = seconds % 60;
		if (h > 0) return `${h}h ${m}m ${s}s`;
		if (m > 0) return `${m}m ${s}s`;
		return `${s}s`;
	}

	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div class="p-6">
	<h1 class="mb-6 text-2xl font-bold tracking-tight">Play Sessions</h1>

	<div class="mb-6">
		<label for="stylus-select" class="mb-1 block text-sm font-medium text-neutral-300">
			Stylus
		</label>
		<select
			id="stylus-select"
			bind:value={selectedStylusId}
			class="w-64 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neutral-500"
		>
			{#each data.styluses as stylus}
				<option value={String(stylus.id)}>{stylus.name ?? `Stylus #${stylus.id}`}</option>
			{/each}
		</select>
	</div>

	{#if filteredSessions.length === 0}
		<p class="text-neutral-400">No play sessions found.</p>
	{:else}
		<div class="overflow-x-auto rounded-md border border-neutral-700">
			<table class="w-full text-sm">
				<thead class="border-b border-neutral-700 bg-neutral-800 text-neutral-400">
					<tr>
						<th class="px-4 py-3"></th>
						<th class="px-4 py-3 text-left font-semibold uppercase tracking-wider">Artist</th>
						<th class="px-4 py-3 text-left font-semibold uppercase tracking-wider">Album</th>
						<th class="px-4 py-3 text-left font-semibold uppercase tracking-wider">Year</th>
						<th class="px-4 py-3 text-left font-semibold uppercase tracking-wider">Playtime</th>
						<th class="px-4 py-3 text-left font-semibold uppercase tracking-wider">Date</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-neutral-800">
					{#each filteredSessions as session}
						<tr class="hover:bg-neutral-800/40">
							<td class="px-3 py-2">
								{#if session.albumRelease.album.imageUrl}
									<img src={session.albumRelease.album.imageUrl} alt="cover" class="h-10 w-10 rounded object-cover" />
								{:else}
									<div class="h-10 w-10 rounded bg-neutral-700"></div>
								{/if}
							</td>
							<td class="px-4 py-3 text-left font-medium text-neutral-300">{session.albumRelease.album.artist ?? '—'}</td>
							<td class="px-4 py-3 text-left text-neutral-300">{session.albumRelease.album.name ?? '—'}</td>
							<td class="px-4 py-3 text-left text-neutral-400">{session.albumRelease.album.releaseYear ?? '—'}</td>
							<td class="px-4 py-3 text-left tabular-nums text-neutral-300">{formatPlaytime(session.playtime)}</td>
							<td class="px-4 py-3 text-left tabular-nums text-neutral-400">{formatDate(session.createdAt)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="mt-3 text-xs text-neutral-500">{filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}</p>
	{/if}
</div>
