import { SPDL } from '.';

export function getArtistNamesArray(artists: SPDL.Artist[]): string[] {
  return artists.map((artist) => artist.name);
}

export function joinArtistNames(
  artists: SPDL.Artist[],
  separator: string
): string {
  return artists.map((artist) => artist.name).join(separator);
}
