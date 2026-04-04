import type { PageServerLoad } from './$types';
import { prisma } from '$lib/prisma';

export const load: PageServerLoad = async () => {
	const [styluses, playSessions] = await Promise.all([
		prisma.stylus.findMany({
			orderBy: { createdAt: 'desc' }
		}),
		prisma.playSession.findMany({
			orderBy: { createdAt: 'desc' },
			include: {
				albumRelease: {
					include: {
						album: {
							select: {
								name: true,
								artist: true,
								releaseYear: true,
								imageUrl: true
							}
						}
					}
				},
				stylus: {
					select: { id: true }
				}
			}
		})
	]);

	return {
		styluses,
		playSessions: playSessions.map((s) => ({
			...s,
			id: String(s.id),
			albumsReleaseId: String(s.albumReleaseId),
			stylusId: String(s.stylusId),
			stylus: { id: String(s.stylus.id) }
		}))
	};
};
