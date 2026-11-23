// JSON-LD 조립. 사람 정보는 personNode 하나에서만 만든다(SEO-GUIDE 4.1).
import { absUrl, site } from '../site.config.ts';
import { getProfile } from './profile.ts';

export const PERSON_ID = absUrl('/#person');
export const WEBSITE_ID = absUrl('/#website');

export function personNode() {
  const { education, certifications } = getProfile();
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: site.name,
    alternateName: site.nameEn,
    jobTitle: site.jobTitle,
    description: site.intro,
    url: absUrl('/'),
    image: absUrl('/profile.jpg'),
    email: `mailto:${site.email}`,
    knowsAbout: [...site.knowsAbout],
    alumniOf: education.map((e) => ({ '@type': 'CollegeOrUniversity', name: e.school })),
    // 자격(profile.yaml의 certifications). 만료된 자격은 getProfile()에서 이미 빠져 있다.
    ...(certifications.length > 0 && {
      hasCredential: certifications.map((c) => ({
        '@type': 'EducationalOccupationalCredential',
        name: c.name,
        credentialCategory: 'certification',
        recognizedBy: { '@type': 'Organization', name: c.org },
        dateCreated: c.issued.replace('.', '-'),
        ...(c.url && { url: c.url }),
      })),
    }),
    sameAs: [site.links.linkedin, site.links.github],
  };
}

export function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: absUrl('/'),
    name: site.name,
    inLanguage: 'ko-KR',
    publisher: { '@id': PERSON_ID },
  };
}

export function profilePageNode() {
  return {
    '@type': 'ProfilePage',
    url: absUrl('/about/'),
    // Google ProfilePage는 DateTime을 요구한다. 설정에는 날짜만 적고 여기서 한국 시간 자정을 붙인다.
    dateModified: `${site.profileModified}T00:00:00+09:00`,
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: personNode(),
  };
}

export function breadcrumbNode(name: string) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: absUrl('/') },
      { '@type': 'ListItem', position: 2, name },
    ],
  };
}

export function toGraph(nodes: object[]) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}
