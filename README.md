## 🏆 LoL Custom Champion Build Manager
나만의 리그 오브 레전드 챔피언 공략 및 빌드 관리 서비스

Riot Games의 Data Dragon API를 활용하여, 사용자가 직접 챔피언의 아이템, 룬, 스킬, 스킨 등의 빌드를 생성하고 관리(CRUD)할 수 있는 웹 애플리케이션입니다.

## 📖 프로젝트 소개 (About)
이 프로젝트는 오픈소스소프트웨어 팀 프로젝트의 일환으로 개발되었습니다. 플레이어들은 수많은 챔피언과 아이템 조합 중에서 자신만의 최적화된 빌드를 연구합니다. 이 서비스는 그러한 빌드를 기록하고, 시각적으로 확인하며, 수정/삭제할 수 있는 직관적인 인터페이스를 제공합니다.

## ✨ 주요 기능 (Key Features)
1. 데이터 관리 (CRUD)
사용자는 다음 7가지 핵심 데이터에 대해 **생성(Create), 조회(Read), 수정(Update), 삭제(Delete)**를 수행할 수 있습니다.

챔피언 (Champion): Data Dragon 데이터를 기반으로 챔피언 선택

아이템 (Items): 주요 빌드 아이템 구성

스킬 (Skills): 스킬 마스터 순서 또는 정보

룬 (Runes): 주 룬 및 보조 룬 설정

포지션 (Position): 탑, 정글, 미드, 원딜, 서폿

스킨 (Skin): 챔피언별 스킨 이미지 선택

스펠 (Spells): 소환사 주문 선택

숙련도 (Mastery): 해당 챔피언의 숙련도 점수 기록

2. UI / UX
메인 리스트: 저장된 빌드 목록을 카드 형태로 확인 (Rammus 'OK' 아이콘 활용)

모달(Modal) 상세 뷰: 클릭 시 팝업 형태로 상세 정보 제공 (ChampionInfo.js)

반응형 사이드바: 모바일 환경을 고려한 사이드바 메뉴 구조

Data Dragon API 연동: 항상 최신 버전(예: 13.24.1)의 롤 데이터를 실시간으로 불러와 표시

## 🛠 기술 스택 (Tech Stack)
Frontend Library: React.js

Styling: CSS3 (Custom Layout)

Data Source: Riot Data Dragon API (Champion, Item, Rune, Spell json)

Environment: Visual Studio Code, Git

## 📂 폴더 구조 (Directory Structure)

```bash
oss-team-project/
├── public/              # 정적 파일 (index.html, manifest 등)
├── src/
│   ├── components/
│   │   ├── CRUD/        # 데이터 생성/수정 관련 컴포넌트
│   │   │   ├── Create.js
│   │   │   ├── Update.js
│   │   │   ├── ChampDex.js
│   │   │   └── SearchChamp.js
│   │   └── ChampInfo.js # 챔피언 상세 정보 모달
│   ├── App.js           # 메인 라우팅 및 레이아웃
│   ├── App.css          # 메인 스타일 시트
│   └── index.js         # Entry Point
└── README.md

```

## 🚀 설치 및 실행 방법 (Getting Started)
이 프로젝트를 로컬 환경에서 실행하려면 다음 단계를 따르세요.

레포지토리 클론 (Clone)

git clone https://github.com/[팀-레포지토리-주소].git
cd oss-team-project
패키지 설치 (Install Dependencies)

npm install
(필요 시 axios 등 추가 라이브러리 설치)

npm install axios react-router-dom
프로젝트 실행 (Run)

npm start
브라우저에서 http://localhost:3000으로 접속하여 확인합니다.

## 📅 개발 일정 및 계획 (Roadmap)
[x] 프로젝트 초기 세팅 및 구조 설계

[x] Data Dragon API 연동 (챔피언, 아이템 데이터 호출)

[ ] Create.js: 빌드 생성 기능 구현 (진행 중)

[ ] Read: 메인 리스트 및 상세 모달 구현

[ ] Update/Delete: 데이터 수정 및 삭제 로직 구현

[ ] (Optional) FAQ 페이지 추가
