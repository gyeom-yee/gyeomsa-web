---
title: "Aero-Chat: 기업용 Private LLM 챗봇 연구개발"
period: "2024.03 ~ 2024.12"
affiliation: "파수 산학 R&D"
role: "팀장·PM·AI 기술자문"
tags: ["RAG", "LLM", "SSE", "Spring Boot", "React", "ChromaDB", "AWS"]
order: 1
links:
  - label: "GitHub 저장소"
    url: "https://github.com/Fasoo-LLM-Chat-UI-UX"
---
한국항공대학교 산학 R&D 과제로 파수와 함께 기업 내부망용 LLM 챗봇을 만들었습니다. 8명으로 꾸린 팀에서 팀장·PM·AI 기술자문을 맡아, 보안등급에 따라 답변 범위를 제한하는 문서 검색(RAG)과 최신 정보를 보완하는 외부 검색(RIG)을 설계했습니다. SSE 스트리밍으로 첫 글자가 보이기까지의 시간을 3.6초에서 0.5초로 줄였고, 검색 소스를 Jina Reader에서 SerpAPI, Naver News API로 바꿔 검색 응답 시간을 30초에서 2초로 단축했습니다.
