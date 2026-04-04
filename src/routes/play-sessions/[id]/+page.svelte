<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const session = $derived(data.session);
	const album = $derived(data.session.albumRelease.album);

	function formatDuration(seconds: number): string {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m}:${String(s).padStart(2, '0')}`;
	}

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

	const sides = $derived.by(() => {
		const map = new Map<string, typeof session.tracks>();
		for (const track of session.tracks) {
			const side = track.position?.match(/^[A-Za-z]+/)?.[0]?.toUpperCase() ?? '?';
			if (!map.has(side)) map.set(side, []);
			map.get(side)!.push(track);
		}
		return map;
	});
</script>

<div class="p-6">
	<a href="/play-sessions" class="mb-6 inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-200">
		← Play Sessions
	</a>

	<div class="mt-4 flex gap-8">
		<!-- Album cover -->
		<div class="w-56 shrink-0">
			{#if album.imageUrl}
				<img src={album.imageUrl} alt="cover" class="w-full rounded-md object-cover shadow-md" />
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
			<div class="mt-3 flex flex-col gap-0.5">
				<p class="font-semibold text-white">{album.name ?? '—'}</p>
				<p class="text-sm text-neutral-400">{album.artist ?? '—'}</p>
				{#if album.releaseYear}
					<p class="text-xs text-neutral-500">{album.releaseYear}</p>
				{/if}
				<div class="mt-3 flex flex-col gap-1 border-t border-neutral-800 pt-3">
					<p class="text-xs text-neutral-500">
						<span class="text-neutral-400">Date</span> — {formatDate(session.createdAt)}
					</p>
					<p class="text-xs text-neutral-500">
						<span class="text-neutral-400">Playtime</span> — {formatPlaytime(session.playtime)}
					</p>
					<p class="text-xs text-neutral-500">
						<span class="text-neutral-400">Stylus</span> — {session.stylus.name ?? `Stylus #${session.stylus.id}`}
					</p>
				</div>
			</div>
		</div>

		<!-- Track list -->
		<div class="flex min-w-0 flex-1 flex-col gap-4">
			{#each sides as [side, sideTracks]}
				<div>
					<h3 class="mb-1 text-xs font-semibold uppercase tracking-widest text-neutral-500">
						Side {side}
					</h3>
					<div class="divide-y divide-neutral-800 rounded-md border border-neutral-700">
						{#each sideTracks as track}
							<div class="flex items-center gap-3 px-3 py-2">
								<span class="w-8 shrink-0 text-xs text-neutral-500">{track.position ?? ''}</span>
								<span class="flex-1 text-sm text-neutral-200">{track.name ?? '—'}</span>
								<span class="text-xs tabular-nums text-neutral-400">{formatDuration(track.duration)}</span>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
