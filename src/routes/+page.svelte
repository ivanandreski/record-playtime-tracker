<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="p-6">
	{#if data.releases.length === 0}
		<p class="text-neutral-400">No albums yet. Import your collection to get started.</p>
	{:else}
		<div class="collection-grid">
			{#each data.releases as release}
				<a href="/album/{release.id}" class="collection-item">
					<div class="collection-item__cover">
						{#if release.album.imageUrl}
							<img src={release.album.imageUrl} alt="{release.album.name} cover" />
						{:else}
							<div class="collection-item__cover-placeholder">
								<svg
									xmlns="http://www.w3.org/2000/svg"
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
					</div>
					<div class="collection-item__info">
						<p class="collection-item__title">{release.album.name}</p>
						<p class="collection-item__artist">{release.album.artist}</p>
						{#if release.album.releaseYear}
							<p class="collection-item__year">{release.album.releaseYear}</p>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
