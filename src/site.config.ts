// 사이트 전체에서 쓰는 이름·소개·주소. 값은 PRD 6장 "확정된 항목"을 따른다.
// 같은 값을 페이지마다 따로 적지 않고 여기서만 가져다 쓴다(SEO-GUIDE 1장 원칙 2).

export const site = {
  name: '김윤겸',
  nameEn: 'Yun-gyeom Kim',
  domain: 'gyeomsa.com',
  url: 'https://gyeomsa.com',
  jobTitle: '기업 AX 교육 강사',
  /** 직함 줄. LinkedIn 머리말과 같다 */
  headline: '기업 AX 교육 강사 | AI 리터러시 · Claude 업무 자동화',
  /** 한 줄 소개. title·h1·JSON-LD·llms.txt에 같은 문장을 쓴다 */
  intro:
    '김윤겸은 삼성전자·KB국민은행·포스코 등 다양한 기업 임직원에게 AI 리터러시와 Claude 업무 자동화를 가르치는 기업 AX 교육 강사입니다.',
  /** 한 줄 소개에서 이름 주어를 뺀 문장. 화면 본문에는 이름 주어를 쓰지 않으므로 홈·소개 첫 문단에 이 문장을 쓴다 */
  introBody: '삼성전자·KB국민은행·포스코 등 다양한 기업 임직원에게 AI 리터러시와 Claude 업무 자동화를 가르칩니다.',
  /** 홈 첫 화면 구호. 두 줄로 나눠 보여 주고 highlight 부분만 강조한다. h1이 아니다 */
  tagline: ['우리 회사 업무로 배우는 AI,', "'아하!' 모먼트까지"],
  taglineHighlight: "'아하!' 모먼트",
  /** 소개 페이지의 개인 구호 */
  motto: '과소평가는 증명하고, 과대평가는 현실로 만듭니다.',
  /** 한 줄 소개 다음 문장. 커리어 출발점과 강의 방식 */
  story:
    'AI·빅데이터 컨설팅 기업에서 커리어를 시작해, 꾸준한 기술 팔로우업으로 현업의 한계를 넘는 새로운 방법을 전합니다.',
  email: 'dbsrua110525@gmail.com',
  links: {
    linkedin: 'https://www.linkedin.com/in/gyeomsa/',
    github: 'https://github.com/gyeom-yee',
  },
  /** 검색엔진 소유 확인 값(SEO-GUIDE 3장). 공통 레이아웃이 모든 페이지 head에 넣는다. 빈 값이면 태그를 넣지 않는다 */
  verification: {
    google: '',
    naver: '3b8255be4fadc08ceff90e359f46e6d749bcba45',
    bing: '',
  },
  /** 홈의 교육 프로그램 카드 주제와 맞춘다(SEO-GUIDE 4.2) */
  knowsAbout: [
    'AI 리터러시',
    'Claude',
    'Claude Code',
    '업무 자동화',
    'AI 에이전트',
    'LLM 애플리케이션 개발',
    'RAG',
  ],
  /** 소개 페이지 JSON-LD dateModified. 빌드 날짜가 아니라 소개 내용이 바뀐 날짜를 적는다 */
  profileModified: '2026-11-20',
  /** 이력서 PDF. public/ 아래 경로. 파일이 없으면 버튼이 비활성으로 나온다 */
  resumePath: '/kim-yungyeom-resume.pdf',
} as const;

export const nav = [
  { href: '/', label: '홈' },
  { href: '/about/', label: '소개' },
  { href: '/lectures/', label: '강의 이력' },
  { href: '/contact/', label: '문의' },
] as const;

export const absUrl = (path: string) => new URL(path, site.url).href;
