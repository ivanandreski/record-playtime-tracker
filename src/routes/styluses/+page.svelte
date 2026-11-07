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

<div class="styluses-page">
	<section class="styluses-page__section">
		<h2 class="styluses-page__heading">Active</h2>
		{#if activeStyluses.length === 0}
			<p class="styluses-page__empty">No active styluses.</p>
		{:else}
			<div class="styluses-page__table-wrap">
				<table class="styluses-table">
					<thead class="styluses-table__head">
						<tr>
							<th class="styluses-table__th">Name</th>
							<th class="styluses-table__th">Total Playtime</th>
							<th class="styluses-table__th">Description</th>
						</tr>
					</thead>
					<tbody class="styluses-table__body">
						{#each activeStyluses as stylus}
							<tr class="styluses-table__row">
								<td class="styluses-table__cell styluses-table__cell--name">{stylus.name ?? `Stylus #${stylus.id}`}</td>
								<td class="styluses-table__cell styluses-table__cell--numeric">{formatPlaytime(stylus.playtime)}</td>
								<td class="styluses-table__cell styluses-table__cell--muted">{stylus.description ?? '—'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>

	<section class="styluses-page__section">
		<h2 class="styluses-page__heading">Retired</h2>
		{#if retiredStyluses.length === 0}
			<p class="styluses-page__empty">No retired styluses.</p>
		{:else}
			<div class="styluses-page__table-wrap">
				<table class="styluses-table">
					<thead class="styluses-table__head">
						<tr>
							<th class="styluses-table__th">Name</th>
							<th class="styluses-table__th">Description</th>
							<th class="styluses-table__th">Total Playtime</th>
						</tr>
					</thead>
					<tbody class="styluses-table__body">
						{#each retiredStyluses as stylus}
							<tr class="styluses-table__row styluses-table__row--retired">
								<td class="styluses-table__cell styluses-table__cell--name">{stylus.name ?? `Stylus #${stylus.id}`}</td>
								<td class="styluses-table__cell styluses-table__cell--muted">{stylus.description ?? '—'}</td>
								<td class="styluses-table__cell styluses-table__cell--numeric">{formatPlaytime(stylus.playtime)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>
</div>
