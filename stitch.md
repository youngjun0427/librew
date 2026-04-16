Stitch의 결과 퀄리티는
프롬프트 퀄리티에 거의 100% 비례한다.

그리고 더 중요한 한 줄:

Stitch는 “디자인 감각”보다
“업무 맥락 설명”에 훨씬 강하다.

1. 사람들이 가장 많이 하는 착각
   ❌ 착각 1
   “프롬프트는 짧을수록 AI가 잘 알아듣겠지?”

→ Stitch에서는 정반대다.

Stitch는:

시인성 좋은 이미지 ❌
감성 키워드 ❌
보다

역할
데이터 구조
사용 목적
을 더 중요하게 본다.

❌ 착각 2
"Make a modern dashboard UI"
이런 프롬프트는:

결과가 나쁘진 않지만
어디서 본 듯한 화면이 나온다.
👉 실무에서 바로 쓰기 어렵다.

2. Stitch 프롬프트의 본질
   Stitch 프롬프트는 이렇게 생각하면 된다.

“시니어 UX 디자이너에게
기획서를 말로 설명한다”

그래서:

누가 쓰는지
왜 쓰는지
어떤 데이터를 보는지
어떤 판단을 내려야 하는지
를 설명해야 한다.

3. Stitch 프롬프트의 기본 공식 (이거만 기억해도 반은 성공)
   [User] + [Purpose] + [Data] + [Actions] + [Constraints]

이 다섯 가지만 들어가면
결과가 눈에 띄게 달라진다.

4. 나쁜 예 → 왜 안 좋은지
   ❌ 예시 1
   Create a PCF dashboard UI.
   왜 안 좋을까?
   누가 쓰는지 모름
   PCF 범위 모름
   테이블인지 차트인지 모름
   행동(Action)이 없음
   👉 Stitch 입장에서는 추측할 수밖에 없음.

5. 같은 요청을 “Stitch용”으로 바꾸면
   ✅ 개선된 예시
   Design a PCF dashboard UI.

Users:

- Sustainability managers
- Data reviewers

Purpose:

- Monitor product-level PCF results
- Identify high-emission products

Data:

- Scope 1, 2, 3 emissions
- Monthly trends
- BOM-based material emissions

Actions:

- Filter by product and period
- Drill down to material level

Constraints:

- Enterprise B2B SaaS
- Dense data, high readability
  👉 결과 차이가 확연하다.

6. Stitch가 특히 잘 반응하는 정보 유형
   6.1 사용자 역할 (중요도 ⭐⭐⭐⭐⭐)
   Users:

- Admin
- Manager
- Reviewer
  👉 Stitch는 역할에 따라:

정보 밀도
액션 위치
승인 UI
를 다르게 설계한다.

6.2 데이터 구조 (⭐⭐⭐⭐)
Data:

- Summary KPIs
- Tables with 10+ columns
- Hierarchical BOM data
  👉 테이블/트리/카드 구조가 자동으로 바뀐다.

  6.3 행동(Action) (⭐⭐⭐⭐)
  Actions:

- Approve / Reject
- Download report
- Compare periods
  👉 버튼 위치, 강조 영역이 달라진다.

7. B2B UI에서 특히 중요한 제약 조건
   Stitch는 제약 조건을 주면 훨씬 좋아진다.

예시
Constraints:

- No playful illustrations
- Enterprise tone
- Optimized for desktop
- Used daily for long sessions
  👉 “예쁜데 쓰기 힘든 화면”을 피할 수 있다.

8. 실전 예제 ①: PCF 제품 상세 화면
   @stitch generate_screen_from_text
   project_id=projects/XXXX
   model_id=GEMINI_3_PRO
   prompt="
   Design a PCF product detail page.

Users:

- Sustainability manager

Purpose:

- Review product-level PCF
- Validate calculation results

Data:

- Product info
- BOM hierarchy
- Material-level emissions
- Allocation logic

Actions:

- Expand/collapse BOM
- Download ISO 14067 report

Constraints:

- Enterprise B2B SaaS
- High data density
  "
  👉 실제 설계 문서로 써도 될 수준이 나온다.

9. 실전 예제 ②: 관리자 승인 화면
   Design an approval workflow UI.

Users:

- Reviewer
- Approver

Purpose:

- Review submitted PCF data
- Approve or reject with comments

Data:

- Submission list
- Status history
- Reviewer comments

Actions:

- Approve
- Reject
- Request changes

Constraints:

- Clear status visibility
- Audit-friendly layout
  "

10. Stitch 결과를 더 좋게 만드는 팁
    ✔ 한 화면에 하나의 목적만
    대시보드 + 설정 + 관리 ❌
    “이 화면에서 무엇을 결정하는가?” 하나만
    ✔ 레퍼런스는 “이름”으로만
    Similar to SAP Sustainability Control Tower
    👉 이미지 첨부보다 효과 좋음

✔ “예쁘게” 대신 “왜”
❌ “Make it beautiful”
⭕ “Optimized for fast decision-making”

11. 자주 묻는 질문
    Q. 이미지 여러 개 주고 리디자인해달라면?
    ❌ Stitch에 안 맞음
    👉 이미지 생성 AI / Figma가 적합
    Q. 결과를 그대로 개발에 써도 되나?
    ❌ 그대로 쓰진 않음
    ⭕ 구조/흐름 설계용
12. 정리
    Stitch 프롬프트는
    “디자인 요청서”가 아니라
    “업무 설명서”다.

감성 ↓
맥락 ↑
역할 ↑
데이터 ↑
profile
