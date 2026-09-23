window.onload = function () {
  const addQuestionBtn = document.getElementById("addQuestionBtn");
  const popoverBackdrop = document.getElementById("popoverBackdrop");
  const typePopover = document.getElementById("typePopover");
  const questionsContainer = document.getElementById("questionsContainer");
  const sidebarList = document.getElementById("sidebarList");

  let questionCounter = 1;

  // 플러스 버튼 클릭 시 오른쪽 옆에 팝오버 노출
  addQuestionBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const rect = addQuestionBtn.getBoundingClientRect();

    // 버튼의 바로 오른쪽 옆에 위치하도록 가로(left) 및 세로(top) 좌표 지정
    typePopover.style.top = `${rect.top + window.scrollY - 10}px`;
    typePopover.style.left = `${rect.right + window.scrollX + 15}px`;

    popoverBackdrop.style.display = "block";
  });

  // 배경 클릭 시 팝오버 레이어 닫기
  popoverBackdrop.addEventListener("click", () => {
    popoverBackdrop.style.display = "none";
  });

  // 팝오버 내부 질문 타입 선택 이벤트
  typePopover.addEventListener("click", (e) => {
    const btn = e.target.closest(".type-btn");
    if (!btn) return;

    const type = btn.dataset.type;
    addNewQuestionCard(type);

    popoverBackdrop.style.display = "none";
  });

  // 동적 질문 카드 추가 로직
  function addNewQuestionCard(type) {
    const card = document.createElement("div");
    card.className = "question-card";

    // 나중에 개별 카드를 찾아 삭제하기 위해 고유 ID 부여
    const currentCardId = `card_id_${questionCounter}`;
    card.setAttribute("data-id", currentCardId);

    let formattedNumber = String(questionCounter).padStart(2, "0");
    let cardTitle = `Q${formattedNumber}. New Question (${type})`;

    // [수정 포인트] 우측 버튼 레이아웃을 세로 정렬(flex-direction: column) 구조로 변경하여 Edit 아래에 Remove 배치
    let contentHtml = `
  <!-- [해결책] justify-content: space-between 속성이 있어야 제목은 왼쪽, Edit는 무조건 맨 오른쪽 끝으로 벌어집니다 -->
  <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 15px;">
    <h3 class="card-title" style="margin: 0; font-size: 16px; font-weight: 600;">${cardTitle}</h3>
    
    <!-- 원래 위치에 유지되는 맨 우측 Edit 버튼 -->
    <button class="btn-edit-title" style="background: #329ced; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500; width: 75px; text-align: center; flex-shrink: 0;">Edit</button>
  </div>
  <div class="options-group">
`;

    // --- 10가지 타입 분기 문항 세팅 ---
    switch (type) {
      case "subjective-short":
        contentHtml += `<input type="text" class="custom-input" placeholder="Please enter your short answer here..." style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px;">`;
        break;
      case "subjective-long":
        contentHtml += `<textarea placeholder="Please describe your long answer here..." style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; resize: none; min-height: 100px;"></textarea>`;
        break;
      case "single-selection":
        contentHtml += `
        <label class="option-item"><input type="radio" name="q_${questionCounter}"> Strongly Disagree</label>
        <label class="option-item"><input type="radio" name="q_${questionCounter}"> Disagree</label>
        <label class="option-item"><input type="radio" name="q_${questionCounter}"> Neutral</label>
        <label class="option-item"><input type="radio" name="q_${questionCounter}"> Agree</label>
        <label class="option-item"><input type="radio" name="q_${questionCounter}"> Strongly Agree</label>
      `;
        break;
      case "multiple-choice":
        contentHtml += `
        <label class="option-item"><input type="checkbox"> Option A</label>
        <label class="option-item"><input type="checkbox"> Option B</label>
        <label class="option-item"><input type="checkbox"> Option C</label>
        <label class="option-item"><input type="checkbox"> Option D</label>
      `;
        break;
      case "matrix":
      case "plural-matrix":
        const inputType = type === "matrix" ? "radio" : "checkbox";
        contentHtml += `
        <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 14px;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 1px solid var(--border-color);"><th style="padding: 8px; text-align: left;">Criteria</th><th>Bad</th><th>Normal</th><th>Good</th></tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px; text-align: left;">Row item 1</td><td><input type="${inputType}" name="mat_a_${questionCounter}"></td><td><input type="${inputType}" name="mat_a_${questionCounter}"></td><td><input type="${inputType}" name="mat_a_${questionCounter}"></td></tr>
            <tr><td style="padding: 10px; text-align: left;">Row item 2</td><td><input type="${inputType}" name="mat_b_${questionCounter}"></td><td><input type="${inputType}" name="mat_b_${questionCounter}"></td><td><input type="${inputType}" name="mat_b_${questionCounter}"></td></tr>
          </tbody>
        </table>
      `;
        break;
      case "scale":
        contentHtml += `
        <div style="display: flex; justify-content: space-between; max-width: 400px; margin: 10px auto; text-align: center;">
          <span style="font-size: 12px; color: #64748b; line-height: 35px;">Unsatisfied</span>
          <label style="display:flex; flex-direction:column; gap:4px;">1<input type="radio" name="scale_${questionCounter}"></label>
          <label style="display:flex; flex-direction:column; gap:4px;">2<input type="radio" name="scale_${questionCounter}"></label>
          <label style="display:flex; flex-direction:column; gap:4px;">3<input type="radio" name="scale_${questionCounter}"></label>
          <label style="display:flex; flex-direction:column; gap:4px;">4<input type="radio" name="scale_${questionCounter}"></label>
          <label style="display:flex; flex-direction:column; gap:4px;">5<input type="radio" name="scale_${questionCounter}"></label>
          <span style="font-size: 12px; color: #64748b; line-height: 35px;">Satisfied</span>
        </div>
      `;
        break;
      case "ranking":
        contentHtml += `
        <div style="display:flex; flex-direction:column; gap:8px;">
          <label class="option-item">1st Priority: <select style="padding: 4px; border-radius: 4px; border: 1px solid var(--border-color);"><option>Select Option...</option><option>Item 1</option><option>Item 2</option></select></label>
          <label class="option-item">2nd Priority: <select style="padding: 4px; border-radius: 4px; border: 1px solid var(--border-color);"><option>Select Option...</option><option>Item 1</option><option>Item 2</option></select></label>
        </div>
      `;
        break;
      case "notice":
        contentHtml += `<div style="background-color: #f8fafc; border-left: 4px solid var(--primary-color); padding: 12px; font-size: 14px; color: #475569; font-style: italic;">Please read the guide details before starting this section of the survey.</div>`;
        break;
      case "get-view":
        contentHtml += `
        <div style="border: 2px dashed var(--border-color); padding: 20px; text-align: center; border-radius: 8px; color: #64748b; font-size: 14px;">
          <input type="file" style="display: none;" id="file_${questionCounter}">
          <button type="button" onclick="document.getElementById('file_${questionCounter}').click()" style="background: #f1f5f9; border: 1px solid var(--border-color); padding: 6px 12px; border-radius: 4px; cursor: pointer; color: var(--text-color);">Upload Reference Document</button>
        </div>
      `;
        break;
      default:
        contentHtml += `<label class="option-item"><input type="radio" name="q_${questionCounter}"> Option 1</label>`;
    }

    contentHtml += `</div>`;
    contentHtml += `
<div class="btn-group" style="display: flex; justify-content: flex-end; gap: 6px; margin-top: 15px;">
  <button class="btn-remove-card" style="background: #ff4242; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500; width: 75px; text-align: center;">Remove</button>
</div>
`;

    card.innerHTML = contentHtml;

    // 💡 [추가] Remove 버튼을 찾아서 클릭 이벤트를 연결합니다.
    const removeBtn = card.querySelector(".btn-remove-card");
    removeBtn.addEventListener("click", () => {
      // 1. 현재 질문 카드 삭제
      card.remove();

      // 2. 왼쪽 사이드바에서 일치하는 목록 찾아서 같이 삭제
      const matchedLi = sidebarList.querySelector(`.sidebar-${currentCardId}`);
      if (matchedLi) {
        matchedLi.remove();
      }
    });

    questionsContainer.appendChild(card);

    // 사이드바 목록 동기화 추가 (삭제 연동을 위해 식별 ID 클래스 부여)
    if (sidebarList) {
      const li = document.createElement("li");
      li.className = `sidebar-${currentCardId}`; // 매칭용 클래스명
      li.innerText = `Q${formattedNumber}. [${type}]`;
      sidebarList.appendChild(li);
    }

    card.scrollIntoView({ behavior: "smooth", block: "end" });
    questionCounter++;
  }

  // [새로 추가] Remove 버튼 클릭 시 카드와 사이드바 항목을 동시에 지워주는 기능 함수
  function removeQuestionCard(cardId) {
    // 1. 우측 메인 영역에서 해당 카드 삭제
    const targetCard = document.querySelector(
      `.question-card[data-id="${cardId}"]`,
    );
    if (targetCard) {
      targetCard.remove();
    }

    // 2. 좌측 사이드바 리스트에서 연동된 항목 삭제
    const targetSidebarItem = document.querySelector(
      `.question-list-items .sidebar-${cardId}`,
    );
    if (targetSidebarItem) {
      targetSidebarItem.remove();
    }
  }
  console.log("프로토타입이 이제 완전히 로드된 후 실행됩니다.");
};
