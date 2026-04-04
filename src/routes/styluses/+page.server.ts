import type { PageServerLoad } from './$types';
import { prisma } from '$lib/prisma';

export const load: PageServerLoad = async () => {
	const styluses = await prisma.stylus.findMany({
		orderBy: { createdAt: 'desc' }
	});

	return { styluses };
};
