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

<div class="session-detail">
	<a href="/play-sessions" class="session-detail__back">← Play Sessions</a>

	<div class="session-detail__layout">
		<!-- Album cover -->
		<div class="session-detail__cover-panel">
			{#if album.imageUrl}
				<img src={album.imageUrl} alt="cover" class="session-detail__cover-img" />
			{:else}
				<div class="session-detail__cover-placeholder">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="session-detail__cover-placeholder-icon"
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
			<div class="session-detail__meta">
				<p class="session-detail__album-name">{album.name ?? '—'}</p>
				<p class="session-detail__album-artist">{album.artist ?? '—'}</p>
				{#if album.releaseYear}
					<p class="session-detail__album-year">{album.releaseYear}</p>
				{/if}
				<div class="session-detail__info">
					<p class="session-detail__info-row">
						<span class="session-detail__info-label">Date</span> — {formatDate(session.createdAt)}
					</p>
					<p class="session-detail__info-row">
						<span class="session-detail__info-label">Playtime</span> — {formatPlaytime(session.playtime)}
					</p>
					<p class="session-detail__info-row">
						<span class="session-detail__info-label">Stylus</span> — {session.stylus.name ?? `Stylus #${session.stylus.id}`}
					</p>
				</div>
			</div>
		</div>

		<!-- Track list -->
		<div class="session-detail__tracks">
			{#each sides as [side, sideTracks]}
				<div>
					<h3 class="session-detail__side-label">Side {side}</h3>
					<div class="session-detail__side-tracks">
						{#each sideTracks as track}
							<div class="session-detail__track-row">
								<span class="session-detail__track-position">{track.position ?? ''}</span>
								<span class="session-detail__track-name">{track.name ?? '—'}</span>
								<span class="session-detail__track-duration">{formatDuration(track.duration)}</span>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
