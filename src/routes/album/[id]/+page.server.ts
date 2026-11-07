import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/prisma';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const [release, styluses] = await Promise.all([
		prisma.albumRelease.findUnique({
			where: { id: BigInt(params.id) },
			include: {
				album: true,
				tracks: {
					orderBy: { position: 'asc' }
				}
			}
		}),
		prisma.stylus.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } })
	]);

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
		styluses: styluses.map((s) => ({ id: String(s.id), name: s.name })),
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

export const actions: Actions = {
	logSession: async ({ request, params }) => {
		const form = await request.formData();
		const stylusId = form.get('stylusId');
		const trackIds = form.getAll('trackId') as string[];
		const playtimeOverride = form.get('playtimeOverride');

		if (!stylusId || typeof stylusId !== 'string') {
			return fail(400, { error: 'Stylus is required' });
		}
		if (trackIds.length === 0) {
			return fail(400, { error: 'No tracks selected' });
		}

		let playtime: number;

		if (playtimeOverride && Number(playtimeOverride) > 0) {
			playtime = Number(playtimeOverride);
		} else {
			const tracks = await prisma.track.findMany({
				where: { id: { in: trackIds.map(BigInt) } },
				select: { duration: true }
			});
			playtime = tracks.reduce((sum, t) => sum + t.duration, 0);
		}

		if (playtime <= 0) {
			return fail(400, { error: 'Playtime must be greater than 0' });
		}

		await prisma.playSession.create({
			data: {
				playtime,
				albumReleaseId: BigInt(params.id),
				stylusId: BigInt(stylusId),
				tracks: {
					createMany: {
						data: trackIds.map((id) => ({ trackId: BigInt(id) }))
					}
				}
			}
		});

		redirect(303, `/play-sessions`);
	}
};
