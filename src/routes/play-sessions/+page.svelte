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

<div class="sessions-page">
	<div class="sessions-filter">
		<label for="stylus-select" class="sessions-filter__label">Stylus</label>
		<select id="stylus-select" bind:value={selectedStylusId} class="sessions-filter__select">
			{#each data.styluses as stylus}
				<option value={String(stylus.id)}>{stylus.name ?? `Stylus #${stylus.id}`}</option>
			{/each}
		</select>
	</div>

	{#if filteredSessions.length === 0}
		<p class="sessions-empty">No play sessions found.</p>
	{:else}
		<div class="sessions-table-wrap">
			<table class="sessions-table">
				<thead class="sessions-table__head">
					<tr>
						<th></th>
						<th>Artist</th>
						<th>Album</th>
						<th>Year</th>
						<th>Playtime</th>
						<th>Date</th>
					</tr>
				</thead>
				<tbody class="sessions-table__body">
					{#each filteredSessions as session}
						<tr
							class="sessions-table__row"
							onclick={() => window.location.href = `/play-sessions/${session.id}`}
						>
							<td class="sessions-table__cover-cell">
								{#if session.albumRelease.album.imageUrl}
									<img src={session.albumRelease.album.imageUrl} alt="cover" class="sessions-table__cover" />
								{:else}
									<div class="sessions-table__cover-placeholder"></div>
								{/if}
							</td>
							<td class="sessions-table__cell sessions-table__cell--bold">{session.albumRelease.album.artist ?? '—'}</td>
							<td class="sessions-table__cell">{session.albumRelease.album.name ?? '—'}</td>
							<td class="sessions-table__cell sessions-table__cell--muted">{session.albumRelease.album.releaseYear ?? '—'}</td>
							<td class="sessions-table__cell sessions-table__cell--num">{formatPlaytime(session.playtime)}</td>
							<td class="sessions-table__cell sessions-table__cell--muted sessions-table__cell--num">{formatDate(session.createdAt)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="sessions-count">{filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}</p>
	{/if}
</div>
