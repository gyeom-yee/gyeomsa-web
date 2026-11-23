// 저장소 콘텐츠를 정렬해 돌려주는 함수. 페이지마다 정렬·검사를 따로 하지 않는다.
import { getCollection } from 'astro:content';

const byOrder = <T extends { data: { order: number } }>(a: T, b: T) => a.data.order - b.data.order;

export async function getServices() {
  return (await getCollection('services')).sort(byOrder);
}

/** "YYYY.MM ~ YYYY.MM", "YYYY.MM ~ 현재", "YYYY.MM"을 정렬용 [시작, 끝]으로 바꾼다. 진행 중이면 끝을 가장 늦은 값으로 본다. */
function periodKey(period: string): [string, string] {
  const [start, end = start] = period.split('~').map((s) => s.trim());
  return [start, end === '현재' ? '9999.99' : end];
}

/** 프로젝트는 최신순이다. 끝난 시기가 늦은 것이 먼저, 같으면 시작 시기가 늦은 것, 그래도 같으면 order가 작은 것. */
const byRecent = <T extends { data: { period: string; order: number } }>(a: T, b: T) => {
  const [aStart, aEnd] = periodKey(a.data.period);
  const [bStart, bEnd] = periodKey(b.data.period);
  return bEnd.localeCompare(aEnd) || bStart.localeCompare(aStart) || a.data.order - b.data.order;
};

export async function getProjects() {
  const list = (await getCollection('projects')).sort(byRecent);
  for (const p of list) {
    // 본문이 프로젝트 설명이다. 비어 있으면 필수 값이 빠진 것으로 본다(PRD F5-2).
    if (!p.body?.trim()) throw new Error(`[projects] ${p.id}.md: 본문(프로젝트 설명)이 비어 있습니다.`);
  }
  return list;
}

export async function getReviews() {
  const list = (await getCollection('reviews')).sort(byOrder);
  for (const r of list) {
    if (!r.body?.trim()) throw new Error(`[reviews] ${r.id}.md: 본문(후기 원문)이 비어 있습니다.`);
  }
  return list;
}

export async function getClients() {
  return (await getCollection('clients')).sort((a, b) => a.data.index - b.data.index).map((c) => c.data);
}

export const formatNumber = (n: number) => n.toLocaleString('ko-KR');

/**
 * 수치를 Notion에서 가져온 날(빌드 날짜, 한국 시간), YYYY.MM.DD.
 * 정적 사이트라 방문한 날이 아니라 이 날짜 기준이다. 홈 수치 요약과 llms.txt가 같은 값을 쓴다.
 */
export const asOfDate = () =>
  new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date())
    .filter((p) => p.type !== 'literal')
    .map((p) => p.value)
    .join('.');
