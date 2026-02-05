import { type RequestHandler } from "@sveltejs/kit";
import { discogsImporterService } from "../../../service/discogs-importer-service";

export const GET: RequestHandler = ({ url }) => {
	discogsImporterService.initImport();

	return new Response("Started import in the background");
};