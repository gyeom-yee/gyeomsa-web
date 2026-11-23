---
title: "BERT 기반 맥주 리뷰 감성 분석·핵심 문구 추출"
period: "2023.07 ~ 2023.09"
affiliation: "모두의연구소 · K-디지털플랫폼"
role: "핵심 문구 추출·MVP 데모 개발 담당"
tags: ["BERT", "KeyBERT", "PyTorch", "Transformers", "Hugging Face", "Gradio"]
order: 6
links:
  - label: "GitHub 저장소"
    url: "https://github.com/sgr1118/Bert_beer_sentiment_anlysis"
  - label: "Hugging Face 모델"
    url: "https://huggingface.co/GiRak/beer-sentiment-bert"
  - label: "모두의연구소 발표 영상"
    url: "https://www.youtube.com/watch?v=P0G2KD6GKsU"
---
맥주 리뷰가 긍정인지 부정인지 분류하는 BERT 모델을 만들고, KeyBERT로 리뷰마다 핵심 문구를 뽑아 주는 기능을 더했습니다. 데이터 수집, 라벨링, 증강을 거쳐 학습한 모델을 Hugging Face에 공개하고, Gradio로 데모도 만들었습니다. 이 과정을 정리해 모두의연구소에서 "밑바닥부터 시작하는 AI 감정 분석"이라는 제목으로 발표했습니다.
