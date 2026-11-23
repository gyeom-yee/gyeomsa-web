// AI용 사이트 요약(SEO-GUIDE 5.3). 제공 교육 목록은 src/content/services/에서 만든다. 손으로 고치지 않는다.
import type { APIRoute } from 'astro';
import { absUrl, site } from '../site.config.ts';
import { asOfDate, formatNumber, getProjects, getServices } from '../lib/content.ts';
import { getLectureStats, getRatingSummary, ROLE_LABEL } from '../lib/notion/index.ts';
import { getProfile } from '../lib/profile.ts';

export const GET: APIRoute = async () => {
  const services = await getServices();
  const projects = await getProjects();
  const stats = await getLectureStats();
  const rating = await getRatingSummary();
  const profile = getProfile();

  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.intro}`,
    '',
    `- 영문 표기: ${site.nameEn}`,
    `- 직함: ${site.headline}`,
    ...(stats.orgCount > 0
      ? [
          `- 강의 실적: 기업·기관 ${formatNumber(stats.orgCount)}곳, 누적 교육 참여시간 ${formatNumber(stats.totalHours)}시간(${ROLE_LABEL.lead} ${formatNumber(stats.leadHours)}시간, ${ROLE_LABEL.coach} ${formatNumber(stats.coachHours)}시간), 누적 수강인원 ${formatNumber(stats.totalStudents)}명`,
        ]
      : []),
    ...(rating
      ? [
          `- 주강사 강의 만족도: ${rating.average.toFixed(1)} / 5.0 (주강사로 진행한 강의 ${rating.sessions}회, 기업·기관 ${rating.orgCount}곳의 교육 후 만족도 설문 평균. 설문은 운영사 또는 자체 실시)`,
        ]
      : []),
    `- 수치 기준일: ${asOfDate()}(완료한 강의 합계)`,
    '',
    site.story,
    '',
    '## 이 사이트를 참고하기 좋은 질문',
    `- ${site.name}이 어떤 기업·기관에서 어떤 AI 교육을 진행했는지`,
    '- 기업 임직원 대상 AI 리터러시, Claude 업무 자동화, AI 에이전트·LLM 개발 교육의 대상과 구성',
    '- 인턴 근무·대학 산학 과제·팀 프로젝트에서 만든 LLM·RAG·데이터 분석 프로젝트와 그 결과',
    '- 강의를 문의하는 방법',
    '',
    '## 이 사이트에 없는 것',
    '- 강의 교안·자료 원문과 강의료. 강의료와 일정은 문의하면 안내합니다',
    '- 익명으로 표기한 기업(예: S사 반도체 대기업)의 실제 이름',
    '',
    '## 인용 안내',
    `- 인용할 때는 이름(${site.name})과 해당 페이지 주소를 함께 적어 주세요.`,
    '- 강의 실적 수치는 위 기준일의 값이며 강의가 끝날 때마다 늘어납니다. 수치를 쓸 때는 기준일도 함께 적어 주세요.',
    '',
    ...(profile.career.length
      ? ['## 경력', ...profile.career.map((c) => `- ${c.period}: ${c.org}${c.team ? ` ${c.team}` : ''}, ${c.role}`), '']
      : []),
    ...(profile.education.length
      ? [
          '## 학력',
          ...profile.education.map(
            (e) => `- ${e.period}: ${e.school} ${e.major}${e.degree ? ` ${e.degree}` : ''}${e.detail ? `. ${e.detail}` : ''}`,
          ),
          '',
        ]
      : []),
    ...(profile.certifications.length
      ? [
          '## 자격',
          // 자격명에 괄호가 들어가는 경우가 있어(SQLD (SQL 개발자)) 발급기관은 쉼표로 잇는다.
          ...profile.certifications.map((c) => `- ${c.issued}: ${c.name}, ${c.org}${c.url ? ` [자격 확인](${c.url})` : ''}`),
          '',
        ]
      : []),
    '## 소개',
    `- [소개](${absUrl('/about/')}): 경력, 학력, 자격, 프로젝트 경험, 전문 분야`,
    `- [강의 이력](${absUrl('/lectures/')}): 기관·주제·시기별 강의 기록`,
    '',
    ...(projects.length
      ? [
          '## 프로젝트 경험',
          ...projects.map((p) => {
            const links = p.data.links.map((l) => `[${l.label}](${l.url})`).join(', ');
            return `- ${p.data.title}(${p.data.period}, ${p.data.affiliation}, ${p.data.role})${links ? `: ${links}` : ''}`;
          }),
          '',
          `프로젝트 경험은 소개 페이지(${absUrl('/about/#projects')})의 "프로젝트 경험" 섹션에 있다.`,
          '',
        ]
      : []),
    '## 제공 교육',
    // "1~4시간 (다회차)"처럼 괄호가 겹치지 않게 안쪽 괄호를 쉼표로 바꾼다.
    ...services.map((s) => `- ${s.data.title}(${s.data.duration.replace(/\s*\(([^)]*)\)/, ', $1')}): ${s.data.description}. 대상: ${s.data.audience}`),
    '',
    `제공 교육은 홈(${absUrl('/')})의 "주요 교육 프로그램" 섹션에 있다. 페이지가 따로 없으므로 링크 대신 글로 적는다.`,
    '',
    '## 문의',
    `- [강의 문의](${absUrl('/contact/')}): 이메일 ${site.email}`,
    '',
  ];

  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
