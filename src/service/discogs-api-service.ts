import { setTimeout } from "node:timers/promises";
import { appProperties } from "../config/app-properties";

interface DiscogsResponse {
  requestsRemaining: number;
  // TODO: define as generic so can be overriden, or extend from this interface in other responses
  data: object;
}

const doGet = async (url: string): Promise<DiscogsResponse> => {
  const response = await fetch(`https://api.discogs.com${url}`, {
    method: "GET",
    headers: {
      'User-Agent': appProperties.discogsUserAgent,
      'Authorization': `Discogs token=${appProperties.discogsToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }

  return {
    requestsRemaining: parseInt(response.headers.get('X-Discogs-Ratelimit-Remaining') ?? '999'),
    data: await response.json()
  }
}

const fetchRelease = async (releaseId: string) => {
  try {
    console.log(`Fetching release with id: ${releaseId}`)
    const { requestsRemaining, data } = await doGet(`/releases/${releaseId}`);
    // Set timeout if rate limited
    await timeoutIfRateLimited(requestsRemaining)

    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

const timeoutIfRateLimited = async (requestsRemaining: number) => {
  console.log(`Remaining requests: ${requestsRemaining}`);
  if (requestsRemaining === 1) {
    console.log("Setting 60sec timeout");
    await setTimeout(60 * 1000);
  }
}

export const fetchCollection = async () => {
  const releases = [];

  let page = 1;
  while (true) {
    try {
      // Fetch collection page
      console.log(`Fetching page: ${page}`)
      const { requestsRemaining, data } = await doGet(`/users/${appProperties.discogsUsername}/collection/folders/0/releases?page=${page}&per_page=100`);
      // Set timeout if rate limited
      await timeoutIfRateLimited(requestsRemaining)
      // For each release, fetch details
      for(const release of data.releases) {
        const releaseDetails = await fetchRelease(release.id);
        if (releaseDetails) {
          releases.push(releaseDetails);
        }
      }

      // If last page quit
      console.log(data.pagination.pages, page);
      if(data.pagination.pages == page) {
        break;
      }

      page++;

    } catch (error) {
      console.error(error);
    } finally {
      console.log(releases);
    }
  }
}

// TODO: get image bytes or whatever is saved in db
export const fetchImage = async (imageUrl: string) => {
  return null;
}