# 🧠 LLMemo (Local LLM Memory)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Dexie](https://img.shields.io/badge/Dexie.js-local--first-blue)](https://dexie.org/)
[![PWA](https://img.shields.io/badge/PWA-Installable-hotpink)](https://web.dev/progressive-web-apps/)

**LLMemo**는 LLM(대규모 언어 모델)과의 대화 결과나 지식들을 로컬 환경에 체계적으로 기록하고 관리하기 위한 **Local-first PWA**입니다. 모든 데이터 보관은 브라우저 내부에 이루어지며, 강력한 스레드 기능과 장치 간 동기화를 제공합니다.

---

## ✨ Key Features (주요 기능)

### 📂 Smart Organization
- **스레드(Threads)**: 로그를 드래그 앤 드롭으로 겹쳐서 하나의 주제(스레드)로 묶을 수 있습니다. 복잡한 대화 흐름을 한눈에 관리하세요.
- **스마트 삭제**: 스레드 헤더 삭제 시, 전체 스레드를 삭제할지 현재 로그만 삭제할지 선택할 수 있습니다. (로그 삭제 시 순환 번호 자동 재조정)
- **태그 및 검색**: `#tag` 또는 `tag:모델명` 형태의 강력한 검색 기능을 지원합니다.

### 🔄 Seamless Sync & Privacy
- **장치 간 동기화**: P2P 방식을 통해 서버를 거치지 않고 내 장치들 사이에서 직접 데이터를 주고받을 수 있습니다.
- **Local-first**: 모든 데이터는 IndexedDB(Dexie.js)를 통해 당신의 브라우저에만 저장됩니다. 개인정보 유출 걱정 없이 안전하게 기록하세요.
- **PWA 지원**: 오프라인에서도 완벽하게 작동하며, 데스크톱과 모바일 앱처럼 설치하여 사용할 수 있습니다.

### 🎨 Premium UX/UI
- **HOLD to DRAG**: 안드로이드/iOS 모바일 환경에서 스스크롤 도중 의도치 않은 드래그가 발생하는 것을 방지하기 위해 **엄격한 800ms 롱프레스** 메커니즘을 적용했습니다.
- **다크/라이트 모드**: 사용자의 선호에 맞는 테마와 전역 폰트 크기 조절 기능을 제공합니다.
- **다국어 지원**: 한국어와 영어 설정을 완벽하게 지원합니다.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn

### Installation
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/sweon/LLMemo.git
    cd LLMemo
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start development server:**
    ```bash
    npm run dev
    ```

4.  **Build for production:**
    ```bash
    npm run build
    ```

---

## 🛠 Tech Stack
- **Frontend**: React (TypeScript), Vite
- **Styling**: Styled-components
- **Database**: Dexie.js (IndexedDB)
- **Drag & Drop**: @hello-pangea/dnd
- **Icons**: React-icons (Feather)
- **Date Handling**: date-fns

---

## 📜 Deployment
본 프로젝트는 GitHub Actions을 통해 GitHub Pages로 자동 배포되도록 설정되어 있습니다. 소스코드를 Push하면 자동으로 빌드되어 PWA 문서로 배포됩니다.

---

## ⚖️ License
Distributed under the **MIT License**.

---
*Developed with ❤️ regarding Privacy & Productivity.*
