export type DiscogsImportState = {
  isRunning: boolean;
  percentage: null | number;
  message: null | string;
}

export type DiscogsImporterService = {
  state: DiscogsImportState,
  initImport: () => Promise<boolean>
}

// TODO: make these editable only from inside, by providing a progress object as a return instead of the variables
export const discogsImporterService = (): DiscogsImporterService => {
  let state: DiscogsImporterService["state"] = {
    isRunning: false,
    percentage: null,
    message: null,
  }

  const startImport = () => {
    state.isRunning = true;
    state.percentage = 0;
  }

  const endImport = () => {
    state.isRunning = false;
    state.percentage = 0;
    state.message = null;
  }

  const initImport = async (): Promise<boolean> => {
    startImport();

    endImport();

    return false;
  }

  return {
    get state() {
      return this.state;
    },
    initImport
  }
}