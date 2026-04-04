import { setTimeout } from "node:timers/promises";
import { appProperties } from "../config/app-properties";
import { prisma } from "$lib/prisma";

// --- Discogs API types ---

interface DiscogsArtist {
  id: number;
  name: string;
}

interface DiscogsImage {
  type: string;
  uri: string;
}

interface DiscogsTrack {
  position: string;
  title: string;
  duration: string;
}

interface DiscogsRelease {
  id: number;
  title: string;
  year: number;
  master_id: number;
  artists: DiscogsArtist[];
  images: DiscogsImage[];
  tracklist: DiscogsTrack[];
}

interface DiscogsCollectionItem {
  id: number;           // release id (same as basic_information.id)
  instance_id: number;
  folder_id: number;
  rating: number;
  date_added: string;
  basic_information: {
    id: number;
    title: string;
    year: number;
    resource_url: string;
    artists: DiscogsArtist[];
  };
}

interface DiscogsCollectionResponse {
  releases: DiscogsCollectionItem[];
  pagination: {
    pages: number;
    page: number;
  };
}

interface DiscogsApiResponse<T> {
  requestsRemaining: number;
  data: T;
}

// --- Helpers ---

const parseDuration = (duration: string): number => {
  if (!duration) return 0;
  const parts = duration.split(":");
  if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    if (!isNaN(minutes) && !isNaN(seconds)) {
      return minutes * 60 + seconds;
    }
  }
  return 0;
};

const doGet = async <T>(url: string): Promise<DiscogsApiResponse<T>> => {
  console.log(`[API] GET ${url}`);
  const response = await fetch(`https://api.discogs.com${url}`, {
    method: "GET",
    headers: {
      "User-Agent": appProperties.discogsUserAgent,
      Authorization: `Discogs token=${appProperties.discogsToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`[API] ${response.status} ${response.statusText} — ${url}`);
  }

  console.log(`[API] ${response.status} OK — ${url}`);
  return {
    requestsRemaining: parseInt(
      response.headers.get("X-Discogs-Ratelimit-Remaining") ?? "999"
    ),
    data: (await response.json()) as T,
  };
};

const timeoutIfRateLimited = async (requestsRemaining: number) => {
  console.log(`[Rate limit] Requests remaining: ${requestsRemaining}`);
  if (requestsRemaining <= 5) {
    console.warn(`[Rate limit] Running low! Only ${requestsRemaining} requests left.`);
  }
  if (requestsRemaining === 1) {
    console.warn("[Rate limit] Limit reached — waiting 60 seconds...");
    await setTimeout(60 * 1000);
    console.log("[Rate limit] Resuming after timeout.");
  }
};

// --- DB persistence ---

const saveRelease = async (
  releaseDetails: DiscogsRelease,
  collectionItem: DiscogsCollectionItem
) => {
  const albumDiscogsId = String(
    releaseDetails.master_id > 0 ? releaseDetails.master_id : releaseDetails.id
  );
  const releaseDiscogsId = String(releaseDetails.id);

  const primaryImage =
    releaseDetails.images?.find((img) => img.type === "primary") ??
    releaseDetails.images?.[0];

  const artistName = releaseDetails.artists?.[0]?.name ?? null;
  const trackCount = releaseDetails.tracklist?.length ?? 0;

  console.log(`[Save] "${releaseDetails.title}" by ${artistName ?? "Unknown"} (releaseId: ${releaseDiscogsId}, masterId: ${albumDiscogsId}, ${trackCount} tracks)`);

  // Upsert Album
  const albumData = {
    name: releaseDetails.title,
    artist: artistName,
    imageUrl: primaryImage?.uri ?? null,
    releaseYear: releaseDetails.year ?? 0,
  };
  let album = await prisma.album.findFirst({ where: { discogsId: albumDiscogsId } });
  if (album) {
    console.log(`[Album] Updating existing album id=${album.id} "${album.name}"`);
    album = await prisma.album.update({ where: { id: album.id }, data: albumData });
  } else {
    console.log(`[Album] Creating new album discogsId=${albumDiscogsId} "${releaseDetails.title}"`);
    album = await prisma.album.create({ data: { discogsId: albumDiscogsId, ...albumData } });
    console.log(`[Album] Created with id=${album.id}`);
  }

  // Upsert AlbumRelease
  const releaseData = {
    isActive: true,
    addedOn: new Date(collectionItem.date_added),
    albumId: album.id,
  };
  let albumRelease = await prisma.albumRelease.findFirst({
    where: { discogsId: releaseDiscogsId },
  });
  if (albumRelease) {
    console.log(`[AlbumRelease] Updating existing release id=${albumRelease.id} discogsId=${releaseDiscogsId}`);
    albumRelease = await prisma.albumRelease.update({
      where: { id: albumRelease.id },
      data: releaseData,
    });
  } else {
    console.log(`[AlbumRelease] Creating new release discogsId=${releaseDiscogsId}`);
    albumRelease = await prisma.albumRelease.create({
      data: { discogsId: releaseDiscogsId, ...releaseData },
    });
    console.log(`[AlbumRelease] Created with id=${albumRelease.id}`);
  }

  // Upsert Tracks
  console.log(`[Tracks] Saving ${trackCount} tracks for release id=${albumRelease.id}...`);
  let tracksCreated = 0;
  let tracksUpdated = 0;
  for (const track of releaseDetails.tracklist ?? []) {
    const existing = await prisma.track.findFirst({
      where: { albumReleaseId: albumRelease.id, position: track.position },
    });

    const trackData = {
      name: track.title,
      position: track.position,
      duration: parseDuration(track.duration),
    };

    if (existing) {
      await prisma.track.update({ where: { id: existing.id }, data: trackData });
      tracksUpdated++;
    } else {
      await prisma.track.create({
        data: { ...trackData, albumReleaseId: albumRelease.id },
      });
      tracksCreated++;
    }
  }
  console.log(`[Tracks] Done — ${tracksCreated} created, ${tracksUpdated} updated.`);

  console.log(`[Save] ✓ "${releaseDetails.title}" saved (albumId=${album.id}, releaseId=${albumRelease.id})`);
};

// --- Public API ---

const fetchRelease = async (
  releaseId: number,
  collectionItem: DiscogsCollectionItem
): Promise<DiscogsRelease | null> => {
  try {
    console.log(`[Fetch] Fetching release details for id=${releaseId} ("${collectionItem.basic_information.title}")`);
    const { requestsRemaining, data } = await doGet<DiscogsRelease>(
      `/releases/${releaseId}`
    );
    await timeoutIfRateLimited(requestsRemaining);

    await saveRelease(data, collectionItem);

    return data;
  } catch (error) {
    console.error(`[Fetch] Failed for release id=${releaseId}:`, error);
    return null;
  }
};

export const fetchCollection = async () => {
  console.log(`[Collection] Starting import for user: ${appProperties.discogsUsername}`);
  let page = 1;
  let totalProcessed = 0;
  let totalFailed = 0;

  while (true) {
    try {
      console.log(`[Collection] Fetching page ${page}...`);
      const { requestsRemaining, data } =
        await doGet<DiscogsCollectionResponse>(
          `/users/${appProperties.discogsUsername}/collection/folders/0/releases?page=${page}&per_page=100`
        );
      await timeoutIfRateLimited(requestsRemaining);

      const pageTotal = data.releases.length;
      console.log(`[Collection] Page ${page}/${data.pagination.pages} — ${pageTotal} releases to process`);

      for (let i = 0; i < data.releases.length; i++) {
        const item = data.releases[i];
        console.log(`[Collection] Processing ${totalProcessed + i + 1} — release id=${item.id} "${item.basic_information.title}"`);
        const result = await fetchRelease(item.id, item);
        if (result) {
          totalProcessed++;
        } else {
          totalFailed++;
          console.warn(`[Collection] Skipped release id=${item.id} due to error.`);
        }
      }

      console.log(`[Collection] Page ${page}/${data.pagination.pages} complete. Running total: ${totalProcessed} saved, ${totalFailed} failed.`);

      if (data.pagination.pages === page) {
        break;
      }
      page++;
    } catch (error) {
      console.error(`[Collection] Fatal error on page ${page}:`, error);
      break;
    }
  }

  console.log(`[Collection] Import complete. Total saved: ${totalProcessed}, failed: ${totalFailed}.`);
};

// TODO: get image bytes or whatever is saved in db
export const fetchImage = async (imageUrl: string) => {
  return null;
};