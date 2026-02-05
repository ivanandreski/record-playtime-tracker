import { DISCOGS_TOKEN, DISCOGS_USER_AGENT, DISCOGS_USERNAME } from '$env/static/private'

export interface AppProperties {
  discogsToken: string;
  discogsUserAgent: string;
  discogsUsername: string;
}

export const appProperties: AppProperties = {
  discogsToken: DISCOGS_TOKEN,
  discogsUserAgent: DISCOGS_USER_AGENT,
  discogsUsername: DISCOGS_USERNAME
}