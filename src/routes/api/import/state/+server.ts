import { json, type RequestHandler } from "@sveltejs/kit";
import { discogsImporterService } from "@/service/discogs-importer-service";

export const GET: RequestHandler = () => json(discogsImporterService.getState());
