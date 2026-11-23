import sharp from 'sharp';
import { stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { base } from './paths';

const colors = new Map<string, Promise<string | undefined>>();

/** Sample the same central 3:2 crop shown by the Chroma cards, at build time. */
export async function coverAccent(source: string): Promise<string | undefined> {
  try {
    let key = source;
    let input: string | Buffer;
    const remote = /^(?:https?:)?\/\//i.test(source);
    if (source.startsWith('data:image/')) {
      const comma = source.indexOf(',');
      const header = source.slice(0, comma);
      const data = source.slice(comma + 1);
      input = /;base64/i.test(header) ? Buffer.from(data, 'base64') : Buffer.from(decodeURIComponent(data));
    } else if (remote) {
      input = source;
    } else {
      let path = source.split(/[?#]/, 1)[0];
      if (base && path.startsWith(base + '/')) path = path.slice(base.length);
      input = path.startsWith(process.cwd() + '/') ? path
        : path.startsWith('/src/') ? resolve(process.cwd(), path.slice(1))
          : resolve(process.cwd(), 'public', path.replace(/^\/+/, ''));
      const metadata = await stat(input);
      key = input + ':' + metadata.mtimeMs + ':' + metadata.size;
    }

    let pending = colors.get(key);
    if (!pending) {
      pending = (async () => {
        try {
          let image = input;
          if (remote) {
            const response = await fetch(source.startsWith('//') ? 'https:' + source : source, { signal: AbortSignal.timeout(5000) });
            if (!response.ok) return undefined;
            image = Buffer.from(await response.arrayBuffer());
          }
          const crop = await sharp(image).rotate().resize(96, 64, { fit: 'cover' }).png().toBuffer();
          const { dominant } = await sharp(crop).stats();
          return '#' + [dominant.r, dominant.g, dominant.b].map((channel) => channel.toString(16).padStart(2, '0')).join('');
        } catch {
          return undefined;
        }
      })();
      colors.set(key, pending);
    }
    return pending;
  } catch {
    return undefined;
  }
}
