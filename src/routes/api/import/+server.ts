import { json, type RequestHandler } from "@sveltejs/kit";
import { discogsImporterService } from "@/service/discogs-importer-service";

export const POST: RequestHandler = () => {
	if (discogsImporterService.getState().isRunning) {
		return json({ error: "Import already running" }, { status: 409 });
	}
	discogsImporterService.initImport();

	return json({ started: true });
};
