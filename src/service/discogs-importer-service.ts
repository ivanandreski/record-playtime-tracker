import { fetchCollection } from "@/service/discogs-api-service";

export type DiscogsImportState = {
  isRunning: boolean;
  percentage: number | null;
  message: string | null;
};

const state: DiscogsImportState = {
  isRunning: false,
  percentage: null,
  message: null,
};

const initImport = async (): Promise<boolean> => {
  if (state.isRunning) return false;
  console.log("Starting import");
  state.isRunning = true;
  state.percentage = 0;
  state.message = "Starting…";

  try {
    const { totalProcessed, totalFailed } = await fetchCollection((done, total, title) => {
      state.percentage = total > 0 ? Math.round((done / total) * 100) : 0;
      state.message = `${done}/${total} — ${title}`;
    });
    state.message = `Imported ${totalProcessed}, failed ${totalFailed}`;
    return true;
  } catch (e) {
    console.error("Import failed", e);
    state.message = "Import failed";
    return false;
  } finally {
    console.log("Ending import");
    state.isRunning = false;
    state.percentage = 100;
  }
};

export const discogsImporterService = {
  getState(): Readonly<DiscogsImportState> {
    return state;
  },
  initImport,
};
