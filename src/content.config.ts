// 저장소 콘텐츠 파일의 형식. 필수 값이 빠지면 빌드가 멈춘다(PRD F5, F5-2).
// 이름이 _로 시작하는 파일(양식)은 읽지 않는다.
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse } from 'yaml';

const required = (label: string) => z.string().trim().min(1, `${label}은(는) 비워 둘 수 없습니다`);
/** 빈 문자열은 값이 없는 것으로 본다 */
const optional = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined));

const services = defineCollection({
  loader: glob({ base: './src/content/services', pattern: '**/[^_]*.md' }),
  schema: z.object({
    title: required('title'),
    description: required('description'),
    order: z.number(),
    duration: required('duration'),
    audience: required('audience'),
    curriculum: z.array(required('curriculum 항목')).min(3).max(5),
    courses: z.array(required('courses 항목')).default([]),
  }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/[^_]*.md' }),
  schema: z.object({
    title: required('title'),
    // 최신순 정렬에 쓰므로 형식을 지킨다
    period: required('period').regex(
      /^\d{4}\.\d{2}( ~ (\d{4}\.\d{2}|현재))?$/,
      'period는 "YYYY.MM ~ YYYY.MM", "YYYY.MM ~ 현재", "YYYY.MM" 중 하나여야 합니다',
    ),
    /** 소속 또는 과제. 의뢰한 고객사가 아니라 일한 곳·참여한 과제를 적는다 */
    affiliation: required('affiliation'),
    /** 맡은 역할 */
    role: required('role'),
    tags: z.array(z.string().trim().min(1)).default([]),
    order: z.number(),
    /** 증빙 링크(저장소, 데모, 발표 영상 등). label은 링크 내용을 말하는 문구로 쓴다 */
    links: z
      .array(z.object({ label: required('links.label'), url: z.url({ protocol: /^https?$/, error: 'links.url은 http(s) 주소여야 합니다' }) }))
      .default([]),
  }),
});

const reviews = defineCollection({
  loader: glob({ base: './src/content/reviews', pattern: '**/[^_]*.md' }),
  schema: z.object({
    affiliation: required('affiliation'),
    role: required('role'),
    course: optional,
    date: optional.refine((v) => v === undefined || /^\d{4}\.\d{2}$/.test(v), 'date는 YYYY.MM 형식이어야 합니다'),
    order: z.number(),
  }),
});

const clients = defineCollection({
  loader: file('src/content/clients.yaml', {
    // 파일에 id가 없으므로 적힌 순서를 id와 index로 쓴다. 배치는 이 순서를 따른다.
    parser: (text) => ((parse(text) as unknown[] | null) ?? []).map((item, index) => ({ ...(item as object), id: String(index), index })),
  }),
  schema: z.object({
    name: required('name'),
    size: z.number().int().min(1).max(4),
    index: z.number(),
  }),
});

export const collections = { services, projects, reviews, clients };
