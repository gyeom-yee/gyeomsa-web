// JSON-LD Person.image용 고정 주소(https://gyeomsa.com/profile.jpg). 대표 사진을 긴 변 1200px로 줄여 내보낸다.
import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

export const GET: APIRoute = async () => {
  const src = await readFile(join(process.cwd(), 'src/assets/profile.jpg'));
  const out = await sharp(src).rotate().resize({ height: 1200, withoutEnlargement: true }).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(out), { headers: { 'Content-Type': 'image/jpeg' } });
};
