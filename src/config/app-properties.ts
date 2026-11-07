import { env } from '$env/dynamic/private'

export interface AppProperties {
  discogsToken: string;
  discogsUserAgent: string;
  discogsUsername: string;
}

// getters: read env at access time, not module load
export const appProperties: AppProperties = {
  get discogsToken() { return env.DISCOGS_TOKEN ?? ''; },
  get discogsUserAgent() { return env.DISCOGS_USER_AGENT ?? 'record-playtime-tracker'; },
  get discogsUsername() { return env.DISCOGS_USERNAME ?? ''; }
}
