// 빌드 결과 검사(scripts/check-dist.ts) 전용. 사이트 페이지에서 쓰지 않는다.
// 내부 속성(강의명·기업명·교육기관)을 읽는 곳은 여기 하나다. 값은 메모리에서만 쓰고 파일로 남기지 않는다.
import { Client, isFullPage } from '@notionhq/client';

export interface AuditValues {
  /** dist에 나오면 안 되는 값 */
  internal: Set<string>;
  /** 공개기업명 값. 실제 이름을 그대로 쓴 기업·기관은 예외로 친다 */
  publicOrgs: Set<string>;
}

export async function loadAuditValues(): Promise<AuditValues> {
  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_LECTURES_DATABASE_ID;
  if (!token || !dbId) throw new Error('NOTION_TOKEN, NOTION_LECTURES_DATABASE_ID가 필요합니다. node --env-file=.env 로 실행하세요.');
  const notion = new Client({ auth: token });
  const db = await notion.databases.retrieve({ database_id: dbId });
  const dsId = 'data_sources' in db ? db.data_sources[0]?.id : undefined;
  if (!dsId) throw new Error('데이터 소스를 찾지 못했습니다.');

  const internal = new Set<string>();
  const publicOrgs = new Set<string>();
  let cursor: string | undefined;
  do {
    const res = await notion.dataSources.query({ data_source_id: dsId, start_cursor: cursor, page_size: 100 });
    for (const page of res.results) {
      if (!isFullPage(page)) continue;
      const p = page.properties;
      const title = p['강의명'];
      if (title?.type === 'title') {
        const text = title.title.map((t) => t.plain_text).join('').trim();
        if (text) internal.add(text);
      }
      for (const key of ['기업명', '교육기관']) {
        const v = p[key];
        if (v?.type === 'select' && v.select?.name) internal.add(v.select.name.trim());
      }
      const pub = p['공개기업명'];
      if (pub?.type === 'select' && pub.select?.name) publicOrgs.add(pub.select.name.trim());
    }
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return { internal, publicOrgs };
}
