import { readFileSync } from 'node:fs';
import type { Loader } from 'astro/loaders';

interface AlbumLoaderOptions {
  file: string;
}

/**
 * Reads photo-video.json (keyed by filename) and emits one entry per media file.
 * Keeps the Zes4U-compatible field names; title/text arrays are [zh, en, ja].
 */
export function albumLoader({ file }: AlbumLoaderOptions): Loader {
  return {
    name: 'album-json',
    load: async ({ store, parseData, generateDigest, logger }) => {
      const raw = JSON.parse(readFileSync(file, 'utf8')) as Record<string, Record<string, unknown>>;
      let count = 0;

      for (const [filename, record] of Object.entries(raw)) {
        const id = filename.replace(/\.[^.]+$/, '');
        const data = await parseData({
          id,
          data: { ...record, src: record.src ?? filename },
          filePath: file,
        });
        store.set({ id, data, digest: generateDigest(data) });
        count += 1;
      }

      logger.info('Loaded ' + count + ' album entries');
    },
  };
}
