import type { PageServerLoad } from './$types';
import { prisma } from '$lib/prisma';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const release = await prisma.albumRelease.findUnique({
		where: { id: BigInt(params.id) },
		include: {
			album: true,
			tracks: {
				orderBy: { position: 'asc' }
			}
		}
	});

	if (!release) {
		error(404, 'Album not found');
	}

	const allDurationsZero = release.tracks.length > 0 && release.tracks.every((t) => t.duration === 0);

	let suggestedPlaytime: number | null = null;

	if (allDurationsZero) {
		const sessions = await prisma.playSession.findMany({
			where: { albumReleaseId: release.id },
			include: { tracks: { select: { trackId: true } } },
			orderBy: { createdAt: 'desc' }
		});

		const allTrackIds = new Set(release.tracks.map((t) => String(t.id)));

		for (const session of sessions) {
			const sessionTrackIds = new Set(session.tracks.map((t) => String(t.trackId)));
			const isFullAlbum =
				sessionTrackIds.size === allTrackIds.size &&
				[...allTrackIds].every((id) => sessionTrackIds.has(id));
			if (isFullAlbum) {
				suggestedPlaytime = session.playtime;
				break;
			}
		}
	}

	return {
		allDurationsZero,
		suggestedPlaytime,
		release: {
			...release,
			id: String(release.id),
			albumId: String(release.albumId),
			album: {
				...release.album,
				id: String(release.album.id)
			},
			tracks: release.tracks.map((t) => ({
				...t,
				id: String(t.id),
				albumReleaseId: String(t.albumReleaseId)
			}))
		}
	};
};
