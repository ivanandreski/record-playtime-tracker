import type { PageServerLoad } from './$types';
import { prisma } from '$lib/prisma';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const session = await prisma.playSession.findUnique({
		where: { id: BigInt(params.id) },
		include: {
			stylus: { select: { id: true, name: true } },
			albumRelease: {
				include: {
					album: true
				}
			},
			tracks: {
				include: {
					track: true
				},
				orderBy: {
					track: { position: 'asc' }
				}
			}
		}
	});

	if (!session) {
		error(404, 'Play session not found');
	}

	return {
		session: {
			id: String(session.id),
			playtime: session.playtime,
			createdAt: session.createdAt,
			stylus: {
				id: String(session.stylus.id),
				name: session.stylus.name
			},
			albumRelease: {
				id: String(session.albumRelease.id),
				album: {
					...session.albumRelease.album,
					id: String(session.albumRelease.album.id)
				}
			},
			tracks: session.tracks.map((pt) => ({
				id: String(pt.track.id),
				name: pt.track.name,
				position: pt.track.position,
				duration: pt.track.duration
			}))
		}
	};
};
