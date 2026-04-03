import type { PageServerLoad } from './$types';
import { prisma } from '$lib/prisma';

export const load: PageServerLoad = async () => {
	const releases = await prisma.albumRelease.findMany({
		orderBy: [
			{ album: { artist: 'asc' } },
			{ album: { releaseYear: 'asc' } },
		],
		include: {
			album: {
				select: {
					name: true,
					artist: true,
					releaseYear: true,
					imageUrl: true,
				},
			},
		},
	});

	return { releases };
};
