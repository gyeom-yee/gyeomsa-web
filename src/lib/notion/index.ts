// 사이트가 쓰는 강의 이력 함수. 페이지·컴포넌트는 이 파일의 함수만 쓴다.
// 밖으로 내보내는 이름은 공개과정명·공개기업명뿐이다. 강의명·기업명·교육기관은 읽지도 않는다.
import {
  dateStart,
  numberOrNull,
  numberValue,
  queryPublicLectureRows,
  selectName,
  statusName,
} from './client.ts';

/** 차수 한 행. 이 모듈 안에서만 쓴다(행별 수강인원을 밖으로 넘기지 않기 위해). */
interface Row {
  course: string;
  org: string;
  role: string | null;
  date: string | null; // YYYY-MM-DD
  hours: number;
  students: number;
  /** 강의평점(5점 만점). 비어 있으면 null */
  rating: number | null;
}

/** 강의 이력 표의 한 줄. 공개기업명과 공개과정명이 같은 차수를 묶는다. */
export interface LectureGroup {
  org: string;
  course: string;
  roles: string[];
  /** YYYY.MM */
  start: string | null;
  /** YYYY.MM */
  end: string | null;
  sessions: number;
  hours: number;
}

export interface LectureStats {
  /** 누적 교육 참여시간(역할 무관 합계) */
  totalHours: number;
  /** totalHours 중 역할이 `강사`인 시간. 화면 이름은 ROLE_LABEL.lead */
  leadHours: number;
  /** totalHours 중 역할이 `튜터&코치`인 시간. 화면 이름은 ROLE_LABEL.coach */
  coachHours: number;
  totalStudents: number;
  orgCount: number;
  courseCount: number;
}

/** Notion `역할` 값. 글자까지 같아야 한다. */
const LEAD_ROLE = '강사';
const COACH_ROLE = '튜터&코치';

/**
 * 역할의 화면 이름(2026-11-20 결정). 강의 이력 표, 수치 요약 기준 줄, llms.txt가 모두 이 이름을 쓴다.
 * Notion 값은 그대로 두고 화면에 내보낼 때만 바꾼다. 이름을 바꿀 때는 여기만 고친다.
 */
export const ROLE_LABEL = { lead: '주강사', coach: '실습 코치' } as const;
const roleLabels: Record<string, string> = { [LEAD_ROLE]: ROLE_LABEL.lead, [COACH_ROLE]: ROLE_LABEL.coach };
const roleLabel = (role: string) => roleLabels[role] ?? role;

let rowsPromise: Promise<Row[]> | undefined;

function loadRows(): Promise<Row[]> {
  rowsPromise ??= queryPublicLectureRows().then((list) => {
    const rows: Row[] = [];
    for (const props of list) {
      const course = selectName(props, '공개과정명');
      const org = selectName(props, '공개기업명');
      // 쿼리 필터와 별개로 한 번 더 확인한다. 하나라도 비면 빌드 결과에 남기지 않는다.
      if (!course || !org || statusName(props, '참여상태') !== '완료') continue;
      rows.push({
        course,
        org,
        role: selectName(props, '역할'),
        date: dateStart(props, '날짜'),
        hours: numberValue(props, '강의시간'),
        students: numberValue(props, '수강인원'),
        rating: numberOrNull(props, '강의평점'),
      });
    }
    return rows;
  });
  return rowsPromise;
}

const toMonth = (iso: string | null) => (iso ? iso.slice(0, 7).replace('-', '.') : null);

export async function getLectureGroups(): Promise<LectureGroup[]> {
  const rows = await loadRows();
  const map = new Map<string, { org: string; course: string; roles: Set<string>; dates: string[]; sessions: number; hours: number }>();
  for (const r of rows) {
    const key = `${r.org}\u0000${r.course}`;
    let g = map.get(key);
    if (!g) {
      g = { org: r.org, course: r.course, roles: new Set(), dates: [], sessions: 0, hours: 0 };
      map.set(key, g);
    }
    if (r.role) g.roles.add(r.role);
    if (r.date) g.dates.push(r.date);
    g.sessions += 1;
    g.hours += r.hours;
  }
  const groups = [...map.values()].map((g) => {
    g.dates.sort();
    return {
      org: g.org,
      course: g.course,
      roles: [...g.roles].map(roleLabel),
      start: toMonth(g.dates[0] ?? null),
      end: toMonth(g.dates.at(-1) ?? null),
      sessions: g.sessions,
      hours: Math.round(g.hours * 10) / 10,
      _last: g.dates.at(-1) ?? '',
      _first: g.dates[0] ?? '',
    };
  });
  // 최근에 끝난 과정이 먼저 온다.
  groups.sort((a, b) => b._last.localeCompare(a._last) || b._first.localeCompare(a._first));
  return groups.map(({ _last, _first, ...g }) => g);
}

let statsWarned = false;

export async function getLectureStats(): Promise<LectureStats> {
  const rows = await loadRows();
  const sumHours = (list: Row[]) => Math.round(list.reduce((s, r) => s + r.hours, 0));
  const totalHours = sumHours(rows);
  const leadHours = sumHours(rows.filter((r) => r.role === LEAD_ROLE));
  const coachHours = sumHours(rows.filter((r) => r.role === COACH_ROLE));
  if (leadHours + coachHours !== totalHours && !statsWarned) {
    statsWarned = true;
    console.warn(
      `[stats] 역할이 "${LEAD_ROLE}"·"${COACH_ROLE}"가 아니거나 비어 있는 차수가 있어 ${ROLE_LABEL.lead}·${ROLE_LABEL.coach} 시간의 합(${leadHours + coachHours})이 전체(${totalHours})와 다릅니다. Notion의 역할 값을 확인하세요.`,
    );
  }
  return {
    totalHours,
    leadHours,
    coachHours,
    totalStudents: Math.round(rows.reduce((s, r) => s + r.students, 0)),
    orgCount: new Set(rows.map((r) => r.org)).size,
    courseCount: new Set(rows.map((r) => r.course)).size,
  };
}

/** 주강사 강의 만족도. 기관별 평점은 밖으로 넘기지 않고 전체 평균만 돌려준다. */
export interface RatingSummary {
  /** 차수별 평점의 단순 평균, 소수 첫째 자리 */
  average: number;
  /** 평점이 있는 차수 수 */
  sessions: number;
  /** 평점이 있는 기업·기관 수 */
  orgCount: number;
}

/** 역할이 `강사`이고 강의평점이 있는 공개 차수의 평균. 하나도 없으면 null. */
export async function getRatingSummary(): Promise<RatingSummary | null> {
  const rated = (await loadRows()).filter(
    (r): r is Row & { rating: number } => r.role === LEAD_ROLE && r.rating !== null && r.rating > 0,
  );
  if (rated.length === 0) return null;
  const sum = rated.reduce((s, r) => s + r.rating, 0);
  return {
    average: Math.round((sum / rated.length) * 10) / 10,
    sessions: rated.length,
    orgCount: new Set(rated.map((r) => r.org)).size,
  };
}

const warned = new Set<string>();

/**
 * 제공 교육 카드의 진행 경험. courses(공개과정명 목록)와 일치하는 공개기업명을 최근 순으로 돌려준다.
 * 공개 강의 이력에 없는 과정명은 빌드 로그에 경고한다(PRD F5).
 */
export async function getOrgsForCourses(courses: readonly string[], source: string): Promise<string[]> {
  const groups = await getLectureGroups();
  const known = new Set(groups.map((g) => g.course));
  for (const c of courses) {
    const key = `${source}\u0000${c}`;
    if (!known.has(c) && !warned.has(key)) {
      warned.add(key);
      console.warn(`[services] ${source}: courses의 "${c}"가 공개 강의 이력에 없습니다. 공개과정명과 글자까지 같은지 확인하세요.`);
    }
  }
  const wanted = new Set(courses);
  const orgs: string[] = [];
  for (const g of groups) {
    if (wanted.has(g.course) && !orgs.includes(g.org)) orgs.push(g.org);
  }
  return orgs;
}
