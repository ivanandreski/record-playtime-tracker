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

<div class="p-6">
	<div class="flex gap-8">
		<!-- Album cover -->
		<div class="w-56 shrink-0">
			{#if release.album.imageUrl}
				<img
					src={release.album.imageUrl}
					alt="cover"
					class="w-full rounded-md object-cover shadow-md"
				/>
			{:else}
				<div class="flex h-56 w-56 items-center justify-center rounded-md bg-neutral-800">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-16 w-16 text-neutral-500"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
						/>
					</svg>
				</div>
			{/if}
			<div class="mt-3">
				<p class="font-semibold text-white">{release.album.name ?? '—'}</p>
				<p class="text-sm text-neutral-400">{release.album.artist ?? '—'}</p>
				{#if release.album.releaseYear}
					<p class="text-xs text-neutral-500">{release.album.releaseYear}</p>
				{/if}
			</div>
		</div>

		<!-- Track list -->
		<div class="flex min-w-0 flex-1 flex-col gap-4">
			<!-- Controls -->
			<div class="flex items-center gap-2">
				<button onclick={selectAll} class="btn btn-secondary btn-sm">Full Album</button>
				<button onclick={reset} class="btn btn-ghost btn-sm">Reset</button>
				{#if data.styluses.length > 0}
					<select
						bind:value={selectedStylusId}
						class="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neutral-500"
					>
						{#each data.styluses as stylus}
							<option value={stylus.id}>{stylus.name ?? `Stylus #${stylus.id}`}</option>
						{/each}
					</select>
				{/if}
			</div>

			<!-- Tracks grouped by side -->
			{#each sides as [side, sideTracks]}
				<div>
					<h3 class="mb-1 text-xs font-semibold tracking-widest text-neutral-500 uppercase">
						Side {side}
					</h3>
					<div class="divide-y divide-neutral-800 rounded-md border border-neutral-700">
						{#each sideTracks as track}
							<label
								class="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-neutral-800/50"
							>
								<input
									type="checkbox"
									checked={checkedIds.has(track.id)}
									onchange={() => toggleTrack(track.id)}
									class="h-4 w-4 accent-white"
								/>
								<span class="w-8 shrink-0 text-xs text-neutral-500">{track.position ?? ''}</span>
								<span class="flex-1 text-sm text-neutral-200">{track.name ?? '—'}</span>
								<span class="text-xs text-neutral-400 tabular-nums"
									>{formatDuration(track.duration)}</span
								>
							</label>
						{/each}
					</div>
				</div>
			{/each}

			<!-- Submit row -->
			<form method="POST" action="?/logSession" use:enhance class="mt-2 flex flex-col gap-3">
				{#if data.styluses.length === 0}
					<div class="flex items-center justify-between rounded-md border border-neutral-700 bg-neutral-800/50 px-4 py-3">
						<p class="text-sm text-neutral-400">You need a stylus before logging a session.</p>
						<a href="/styluses" class="btn btn-secondary btn-sm">
							Create Stylus
						</a>
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

					<div class="flex items-center gap-3">
						{#if data.allDurationsZero}
							<input
								type="number"
								bind:value={playtimeInput}
								placeholder="Override playtime (s)"
								class="w-52 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:ring-2 focus:ring-neutral-500 focus:outline-none"
							/>
							{#if data.suggestedPlaytime !== null}
							<button
								type="button"
								onclick={autofillPlaytime}
								disabled={!allTracksChecked}
								class="btn btn-secondary"
							>
								Autofill ({data.suggestedPlaytime}s)
							</button>
							{/if}
						{/if}
						<button type="submit" disabled={checkedIds.size === 0} class="btn btn-primary">
							Log Session
						</button>
					</div>
					{#if form?.error}
						<p class="text-xs text-red-400">{form.error}</p>
					{/if}
					{#if data.suggestedPlaytime !== null}
						<p class="text-xs text-neutral-400">
							A previous play session was found for this album with a total playtime of
							<span class="font-medium text-neutral-200"
								>{formatDuration(data.suggestedPlaytime)}</span
							>.
						</p>
					{/if}
				{/if}
			</form>
		</div>
	</div>
</div>
