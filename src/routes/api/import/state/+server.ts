import { error, type RequestHandler } from "@sveltejs/kit";
import { discogsImporterService } from "../../../../service/discogs-importer-service";

// TODO: init sse, use example from dashboard
export const GET: RequestHandler = ({ url }) => {
	return new Response(JSON.stringify(discogsImporterService.getState()));
};