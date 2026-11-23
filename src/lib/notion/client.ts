// Notion 클라이언트와 강의 이력 DB 조회. 이 폴더 밖에서는 이 파일을 직접 쓰지 않는다.
// Notion 응답은 파일로 저장하지 않는다(CLAUDE.md 공개 저장소 규칙).
import { Client, isFullPage } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client';

type Env = Record<string, string | undefined>;

function readEnv(key: string): string {
  // Astro 빌드에서는 import.meta.env, 노드 스크립트에서는 process.env로 들어온다.
  const fromVite = (import.meta as { env?: Env }).env?.[key];
  const value = fromVite || process.env[key];
  if (!value) {
    throw new Error(
      `[notion] 환경변수 ${key}가 없습니다. .env.example을 복사해 .env를 만들고 값을 채우세요.`,
    );
  }
  return value;
}

export type NotionProps = PageObjectResponse['properties'];

/** 강의 이력 DB에서 공개 조건을 만족하는 행만 가져온다. 필터는 이 함수 안에서 건다. */
export async function queryPublicLectureRows(): Promise<NotionProps[]> {
  const notion = new Client({ auth: readEnv('NOTION_TOKEN') });
  const database = await notion.databases.retrieve({
    database_id: readEnv('NOTION_LECTURES_DATABASE_ID'),
  });
  const dataSources = 'data_sources' in database ? database.data_sources : [];
  if (dataSources.length === 0) throw new Error('[notion] 강의 이력 DB에서 데이터 소스를 찾지 못했습니다.');

  const rows: NotionProps[] = [];
  let cursor: string | undefined;
  do {
    const res = await notion.dataSources.query({
      data_source_id: dataSources[0]!.id,
      start_cursor: cursor,
      page_size: 100,
      filter: {
        and: [
          { property: '공개과정명', select: { is_not_empty: true } },
          { property: '공개기업명', select: { is_not_empty: true } },
          { property: '참여상태', status: { equals: '완료' } },
        ],
      },
    });
    for (const page of res.results) {
      if (isFullPage(page)) rows.push(page.properties);
    }
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return rows;
}

export function selectName(props: NotionProps, key: string): string | null {
  const p = props[key];
  return p?.type === 'select' ? (p.select?.name?.trim() || null) : null;
}

export function statusName(props: NotionProps, key: string): string | null {
  const p = props[key];
  return p?.type === 'status' ? (p.status?.name ?? null) : null;
}

export function numberValue(props: NotionProps, key: string): number {
  const p = props[key];
  return p?.type === 'number' && typeof p.number === 'number' ? p.number : 0;
}

/** 숫자 속성. 비어 있으면 0이 아니라 null을 돌려준다(평점처럼 빈 값과 0을 구분해야 할 때). */
export function numberOrNull(props: NotionProps, key: string): number | null {
  const p = props[key];
  return p?.type === 'number' && typeof p.number === 'number' ? p.number : null;
}

export function dateStart(props: NotionProps, key: string): string | null {
  const p = props[key];
  return p?.type === 'date' ? (p.date?.start ?? null) : null;
}
