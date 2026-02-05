import { fetchCollection } from "./discogs-api-service";

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

const startImport = () => {
  console.log("Starting import");
  state.isRunning = true;
  state.percentage = 0;
};

const endImport = () => {
  console.log("Ending import");
  state.isRunning = false;
  state.percentage = null;
  state.message = null;
};

const initImport = async (): Promise<boolean> => {
  try {
    startImport();

    await fetchCollection();

    endImport();
    return true;
  } catch (e) {
    endImport();
    return false;
  }
};

export const discogsImporterService = {
  getState(): Readonly<DiscogsImportState> {
    return state;
  },
  initImport,
};
