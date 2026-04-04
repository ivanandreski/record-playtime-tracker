<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const release = $derived(data.release);
	const tracks = $derived(data.release.tracks);

	let checkedIds = $state<Set<string>>(new Set());
	let playtimeInput = $state<number>(0);
	let selectedStylusId = $state<string>('');
	$effect(() => {
		selectedStylusId = data.styluses[0]?.id ?? '';
	});

	// Group tracks by side (leading letter(s) of position, e.g. "A" from "A1")
	const sides = $derived.by(() => {
		const map = new Map<string, typeof tracks>();
		for (const track of tracks) {
			const side = track.position?.match(/^[A-Za-z]+/)?.[0]?.toUpperCase() ?? '?';
			if (!map.has(side)) map.set(side, []);
			map.get(side)!.push(track);
		}
		return map;
	});

	function formatDuration(seconds: number): string {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m}:${String(s).padStart(2, '0')}`;
	}

	function selectAll() {
		checkedIds = new Set(tracks.map((t) => t.id));
	}

	function reset() {
		checkedIds = new Set();
	}

	function toggleTrack(id: string) {
		const next = new Set(checkedIds);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		checkedIds = next;
	}

	const allTracksChecked = $derived(
		tracks.length > 0 && tracks.every((t) => checkedIds.has(t.id))
	);

	function autofillPlaytime() {
		playtimeInput = data.suggestedPlaytime!;
	}
</script>

<div class="album-page">
	<div class="album-page__layout">
		<!-- Album cover -->
		<div class="album-cover">
			{#if release.album.imageUrl}
				<img src={release.album.imageUrl} alt="cover" class="album-cover__img" />
			{:else}
				<div class="album-cover__placeholder">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
					</svg>
				</div>
			{/if}
			<div class="album-cover__info">
				<p class="album-cover__title">{release.album.name ?? '—'}</p>
				<p class="album-cover__artist">{release.album.artist ?? '—'}</p>
				{#if release.album.releaseYear}
					<p class="album-cover__year">{release.album.releaseYear}</p>
				{/if}
			</div>
		</div>

		<!-- Track list -->
		<div class="album-tracks">
			<!-- Controls -->
			<div class="album-tracks__controls">
				<button onclick={selectAll} class="btn btn-secondary btn-sm">Full Album</button>
				<button onclick={reset} class="btn btn-ghost btn-sm">Reset</button>
				{#if data.styluses.length > 0}
					<select bind:value={selectedStylusId} class="album-tracks__stylus-select">
						{#each data.styluses as stylus}
							<option value={stylus.id}>{stylus.name ?? `Stylus #${stylus.id}`}</option>
						{/each}
					</select>
				{/if}
			</div>

			<!-- Tracks grouped by side -->
			{#each sides as [side, sideTracks]}
				<div>
					<h3 class="album-tracks__side-label">Side {side}</h3>
					<div class="album-tracks__list">
						{#each sideTracks as track}
							<label class="album-tracks__row">
								<input
									type="checkbox"
									checked={checkedIds.has(track.id)}
									onchange={() => toggleTrack(track.id)}
									class="h-5 w-5 accent-black dark:accent-white"
								/>
								<span class="album-tracks__position">{track.position ?? ''}</span>
								<span class="album-tracks__name">{track.name ?? '—'}</span>
								<span class="album-tracks__duration">{formatDuration(track.duration)}</span>
							</label>
						{/each}
					</div>
				</div>
			{/each}

			<!-- Submit row -->
			<form method="POST" action="?/logSession" use:enhance class="album-log-form">
				{#if data.styluses.length === 0}
					<div class="album-log-form__no-stylus">
						<p class="album-log-form__no-stylus-text">You need a stylus before logging a session.</p>
						<a href="/styluses" class="btn btn-secondary btn-sm">Create Stylus</a>
					</div>
				{:else}
					<!-- Hidden inputs for checked track IDs -->
					{#each [...checkedIds] as id}
						<input type="hidden" name="trackId" value={id} />
					{/each}
					<input type="hidden" name="stylusId" value={selectedStylusId} />
					{#if data.allDurationsZero}
						<input type="hidden" name="playtimeOverride" value={playtimeInput} />
					{/if}

					<div class="album-log-form__actions">
						{#if data.allDurationsZero}
							<input
								type="number"
								bind:value={playtimeInput}
								placeholder="Override playtime (s)"
								class="album-log-form__playtime-input"
							/>
							{#if data.suggestedPlaytime !== null}
								<button type="button" onclick={autofillPlaytime} disabled={!allTracksChecked} class="btn btn-secondary">
									Autofill ({data.suggestedPlaytime}s)
								</button>
							{/if}
						{/if}
						<button type="submit" disabled={checkedIds.size === 0} class="btn btn-primary">
							Log Session
						</button>
					</div>
					{#if form?.error}
						<p class="album-log-form__error">{form.error}</p>
					{/if}
					{#if data.suggestedPlaytime !== null}
						<p class="album-log-form__hint">
							A previous play session was found for this album with a total playtime of
							<strong>{formatDuration(data.suggestedPlaytime)}</strong>.
						</p>
					{/if}
				{/if}
			</form>
		</div>
	</div>
</div>
