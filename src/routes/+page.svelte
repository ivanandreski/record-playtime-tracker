<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="p-6">
	{#if data.releases.length === 0}
		<p class="text-muted-foreground">No albums yet. Import your collection to get started.</p>
	{:else}
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
			{#each data.releases as release}
				<a href="/album/{release.id}" class="group flex flex-col gap-2">
					<div class="aspect-square w-full overflow-hidden rounded-md bg-neutral-800">
						{#if release.album.imageUrl}
							<img
								src={release.album.imageUrl}
								alt="{release.album.title} cover"
								class="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
							/>
						{:else}
							<div class="flex h-full w-full items-center justify-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-12 w-12 text-neutral-500"
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
					<div class="min-w-0">
						<p class="truncate text-sm font-medium group-hover:underline">{release.album.title}</p>
						<p class="truncate text-xs text-neutral-400">{release.album.artist}</p>
						{#if release.album.year}
							<p class="text-xs text-neutral-500">{release.album.year}</p>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
