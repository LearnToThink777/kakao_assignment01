# 변경 이력 — 1차 과제 코드 리뷰 반영

> 코드 리뷰 피드백을 반영해 `assignment/js/test.js`(및 깃 설정)를 정리한 기록.
> 각 항목을 **① 왜 이 부분을 변경했는가 / ② 변경으로 얻은 개선점**으로 정리했다.
> 자료구조(Map) 자체는 의도적으로 유지했다. (사유는 8번 참고)

---

## 1. 깃 로컬 설정 수정 (커밋 author 정상화)

- **변경 위치:** 레포 local git config (`user.name`, `user.email`)
- **① 왜:** 최근 3개 커밋이 `alstj <alstj@example.com>` 이라는 **placeholder 더미 계정**으로 기록되어 있었다. `example.com`은 실제 도메인이 아니라, 본인 GitHub 계정(`LearnToThink777 / alstjshqk@naver.com`)과 연결되지 않는 상태였다.
- **② 개선점:** 이 레포의 local 설정을 본인 계정으로 맞춰, **이후 커밋이 GitHub 계정·기여도(잔디)에 정상적으로 연결**된다. global 설정은 건드리지 않아 다른 레포에 영향이 없다.
- **참고:** 이미 만들어진 과거 커밋의 author는 history rewrite 위험이 있어 변경하지 않았다.

---

## 2. `var` → `const` / `let` 전환

- **변경 위치:** `test.js` 전역
- **① 왜:** `var`는 함수 스코프 + 호이스팅으로 의도치 않은 재할당·스코프 누수가 생기기 쉽다. 일부 변수(`d`, `yy`, `mm`, `dd`)는 선언 키워드 없이 **암묵적 전역**으로 만들어지고 있었다.
- **② 개선점:** 재할당이 없는 값은 `const`, 있는 값만 `let`으로 선언해 **변수의 변경 의도가 코드에 드러나고**, 블록 스코프로 버그 가능성이 줄었다.

---

## 3. 콜백을 화살표 함수로 전환

- **변경 위치:** `changeFilterColor`의 `forEach`, `createDomTodoListProgress` / `createDomTodoListCompleted`의 `filter`
- **① 왜:** 콜백을 `function () {}` 형태로 쓰고 있었다. 모던 JS에서 콜백은 화살표 함수가 관용적이고, `this` 바인딩 혼란이 없다.
- **② 개선점:** `filters.forEach((className) => ...)`, `arr.filter((c) => c[1] == "완료")` 처럼 **간결하고 일관된 콜백 스타일**이 되었다.
- **참고:** HTML `onclick`에서 직접 호출되는 최상위 함수(`addTodo` 등)와 `addEventListener`에 넘기는 named 함수 참조(`checkTodo` 등)는 화살표로 바꾸지 않았다. 호출 방식상 그대로 두는 것이 맞다.

---

## 4. Prettier 기준 포맷 통일 (들여쓰기 일관화)

- **변경 위치:** `test.js` 전역 (특히 들여쓰기가 4칸이던 `makeTodoDom`)
- **① 왜:** 대부분 3칸, `makeTodoDom`만 4칸으로 들여쓰기가 섞여 있었다. 레포에 `.prettierrc` / `package.json`이 없어 **자동 포맷이 실제로 걸리지 않는 상태**였다.
- **② 개선점:** Prettier 기본값(2칸 들여쓰기·쌍따옴표·세미콜론)으로 전체를 통일해 **파일 전체 포맷이 일관**되고, 이후 협업 시 diff 노이즈가 줄어든다.

---

## 5. DOM 비우기: `while` 루프 → `replaceChildren()`

- **변경 위치:** `flushTodoDom`
- **① 왜:** 기존 코드는 다음과 같았다.
  ```js
  while (todoContainer.firstChild) {
    todoContainer.removeChild(todoContainer.firstChild);
  }
  ```
  조건이 `firstChild` 존재 여부에 의존하는 수동 루프라, 잘못 건드리면 무한 루프 위험이 있고 의도가 한눈에 안 들어온다.
- **② 개선점:** `todoContainer.replaceChildren();` 한 줄로 대체. 인자 없이 호출하면 **모든 자식을 안전하게 제거**한다. 의도가 명확하고 루프 조건 실수 여지가 없다.

---

## 6. `addTodo`의 불필요한 `else` 제거 (early return 평탄화)

- **변경 위치:** `addTodo`
- **① 왜:** 각 분기가 `return alert(...)`로 빠져나가는데도 `else` / `else if`로 감싸여 있어 **중첩이 불필요**했다.
- **② 개선점:** early return으로 평탄화해 **들여쓰기 깊이가 줄고 분기 흐름이 선형적**으로 읽힌다.

---

## 7. `addTodo` 중복 검사 로직 버그 수정 (위험 버그)

- **변경 위치:** `addTodo`의 중복 할 일 검사
- **① 왜 (버그 내용):** 기존 조건이 다음과 같았다.
  ```js
  if (works.get(work) != undefined || works.get(work) != null) {
    return alert("이미 진행 중인 일입니다.");
  }
  if (works.get(work) == "완료") {
    return alert("이미 완료한 일입니다.");
  }
  ```
  첫 번째 조건은 **값이 존재하기만 하면(`"진행 중"`이든 `"완료"`든) 무조건 참**이 된다. 따라서 이미 `"완료"`한 일을 다시 추가해도 두 번째 분기(`== "완료"`)에 **절대 도달하지 못하고**, 항상 "이미 진행 중인 일입니다"라는 **잘못된 안내**가 떴다.
- **수정 후:**
  ```js
  const status = works.get(work);
  if (status === "진행 중") {
    return alert("이미 진행 중인 일입니다.");
  }
  if (status === "완료") {
    return alert("이미 완료한 일입니다.");
  }
  ```
- **② 개선점:** 값을 변수에 담아 **상태값으로 정확히 분기**하도록 고쳐, "진행 중" / "완료" 안내가 실제 상태와 일치하게 되었다. 존재하지 않는 일만 정상적으로 추가된다.

---

## 8. (의도적 미변경) Map → Array 전환

- **① 왜 남겼나:** 리뷰에서 "중간에 array로 변환하는 코드가 많다"는 지적이 있었으나, Map 사용 자체는 장점이 있어 유지하기로 했다. 자료구조 전면 교체는 동작 영향 범위가 크고, 어차피 **React 이관 시 `{ id, text, status }` 형태로 모델을 다시 설계**할 부분이라 1차 코드에서는 손대지 않았다.
