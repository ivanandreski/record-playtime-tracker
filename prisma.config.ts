import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
	schema: 'prisma/schema.prisma',
	datasource: {
		// unset at image build time (prisma generate needs no DB)
		url: process.env.DATABASE_URL ?? '',
	},
});
