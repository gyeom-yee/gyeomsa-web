// 소개 페이지의 경력·학력·교육 이수·자격·기술. src/content/profile.yaml에서만 읽는다.
// 필수 값이 빠지면 빌드가 멈춘다.
// ?raw로 가져와야 개발 서버가 profile.yaml을 의존성으로 알고, 파일을 고치면 이 모듈(과 캐시)을 다시 읽는다.
// fs로 읽으면 개발 서버를 다시 켜기 전까지 처음 읽은 내용이 남는다.
import profileYaml from '../content/profile.yaml?raw';
import { z } from 'astro/zod';
import { parse } from 'yaml';

const text = z.string().trim().min(1);
const period = z.string().regex(/^\d{4}\.\d{2} ~ (\d{4}\.\d{2}|현재)$/, '기간은 "YYYY.MM ~ YYYY.MM" 또는 "YYYY.MM ~ 현재" 형식이어야 합니다');
const month = z.string().regex(/^\d{4}\.(0[1-9]|1[0-2])$/, '연월은 "YYYY.MM" 형식이어야 합니다');

/** 자격. 자격번호는 받지 않는다(사이트에 싣지 않으므로 저장소에도 두지 않는다) */
const certification = z.strictObject({
  issued: month,
  name: text,
  org: text,
  /** 유효기간이 있는 자격의 만료 연월. 빌드한 달이 이 달에 이르면 목록에서 뺀다 */
  expires: month.optional(),
  /** 발급기관의 배지·인증서 확인 페이지 */
  url: z.url({ protocol: /^https$/, error: 'certifications.url은 https 주소여야 합니다' }).optional(),
});

/** 경력 항목. 문자열이거나, 같은 페이지의 프로젝트 경험으로 연결할 때는 { text, project } */
const careerItem = z
  .union([text, z.object({ text, project: text })])
  .transform((v) => (typeof v === 'string' ? { text: v, project: undefined } : v));

const schema = z.object({
  career: z
    .array(z.object({ period, org: text, team: text.optional(), role: text, items: z.array(careerItem).default([]) }))
    .default([]),
  /** 학력. degree는 학위(학사 등), detail은 재학 중 성과(수상·학회 등) 한 줄 */
  education: z.array(z.object({ period, school: text, major: text, degree: text.optional(), detail: text.optional() })).default([]),
  /** 교육 이수. status는 수료 여부(수료 등) */
  training: z.array(z.object({ period, title: text, org: text, status: text.optional(), detail: text.optional() })).default([]),
  certifications: z.array(certification).default([]),
  /** 다루는 기술. 묶음 이름과 항목 목록 */
  skills: z.array(z.object({ group: text, items: z.array(text).min(1) })).default([]),
});

export type Profile = z.infer<typeof schema>;

let cached: Profile | undefined;

export function getProfile(): Profile {
  if (cached) return cached;
  const result = schema.safeParse(parse(profileYaml) ?? {});
  if (!result.success) {
    throw new Error(`[profile] src/content/profile.yaml 형식 오류:\n${result.error.issues.map((i) => `- ${i.path.join('.')}: ${i.message}`).join('\n')}`);
  }
  // 만료된 자격은 싣지 않는다. 날짜를 연월까지만 적으므로 만료 달의 첫날부터 뺀다(만료일보다 늦게 남지 않게).
  const now = new Date();
  const thisMonth = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`;
  const certifications = result.data.certifications.filter((c) => {
    const expired = c.expires !== undefined && c.expires <= thisMonth;
    if (expired) console.warn(`[profile] 자격 "${c.name}"은(는) ${c.expires}에 만료되어 사이트에서 뺐습니다. profile.yaml을 정리하세요.`);
    return !expired;
  });
  cached = { ...result.data, certifications };
  return cached;
}
