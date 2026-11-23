// 공통 OG 이미지(1200×630, SEO-GUIDE 3.2). 강의 현장 사진에서 인물 쪽을 잘라 쓴다. 글자는 넣지 않는다.
import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

/**
 * 잘라 낼 영역. 원본 사진의 가로·세로에 대한 비율(0~1)이다. 세로 길이는 1200×630 비율로 정해진다.
 * 미리보기에서 얼굴이 작게 보이지 않도록 인물과 마이크 쪽을 중심으로 잡았다.
 * profile-lecture.jpg를 다른 사진으로 바꾸면 이 값도 다시 정한다.
 */
const CROP = { left: 0.257, top: 0.15, width: 0.713 };

export const GET: APIRoute = async () => {
  const src = await readFile(join(process.cwd(), 'src/assets/profile-lecture.jpg'));
  // 사진의 회전 정보를 먼저 반영해야 비율이 실제 보이는 방향 기준이 된다.
  const { data, info } = await sharp(src).rotate().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const w = Math.min(width, Math.round(width * CROP.width));
  const h = Math.min(height, Math.round((w * 630) / 1200));
  const left = Math.min(width - w, Math.round(width * CROP.left));
  const top = Math.min(height - h, Math.round(height * CROP.top));
  const out = await sharp(data, { raw: { width, height, channels } })
    .extract({ left, top, width: w, height: h })
    .resize(1200, 630, { fit: 'cover' })
    .png({ compressionLevel: 9, palette: true, quality: 90 })
    .toBuffer();
  return new Response(new Uint8Array(out), { headers: { 'Content-Type': 'image/png' } });
};
