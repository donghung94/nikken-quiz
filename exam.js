(function () {
  const $ = (sel) => document.querySelector(sel);
  const params = new URLSearchParams(location.search);
  const setId = params.get("set");
  const practiceId = params.get("practice");

  // --- LẤY DỮ LIỆU KIỂU CŨ CỦA BẠN ---
  let DATA = [];
  let videoUrl = null;

  if (practiceId && window.PRACTICE_SETS && window.PRACTICE_SETS[practiceId]) {
    DATA = window.PRACTICE_SETS[practiceId];
  } else if (setId && window.QUESTION_SETS && window.QUESTION_SETS[setId]) {
    DATA = window.QUESTION_SETS[setId];
  }

  // --- ĐOẠN "CẤP CỨU": TỰ NHẬN DIỆN NẾU LÀ OBJECT MỚI ---
  let finalQuestions = [];
  if (Array.isArray(DATA)) {
    finalQuestions = DATA; // Nếu là mảng cũ, chạy bình thường
  } else if (DATA && DATA.questions) {
    finalQuestions = DATA.questions; // Nếu là object mới, bóc lấy questions
    videoUrl = DATA.videoUrl;      // Lấy link video
  }

  if (finalQuestions.length === 0) {
    console.warn("Không có dữ liệu câu hỏi");
    // Không return để tránh chết app, cứ để nó chạy tiếp
  }

  const sourceQuestions = finalQuestions;
  // ================== RENDER (SỬA ĐOẠN NÀY ĐỂ HIỆN VIDEO) ================
  function render() {
    if (!questions.length) {
      $("#quiz").innerHTML = "<p>Không có dữ liệu câu hỏi.</p>";
      return;
    }

    // --- XỬ LÝ VIDEO ---
    const vContainer = document.getElementById('videoContainer');
    const vIframe = document.getElementById('examVideo');

    if (vContainer && vIframe) {
      if (cur === 0 && videoUrl) { // Hiện ở câu 1 nếu có link video
        vContainer.style.display = 'block';
        if (vIframe.src !== videoUrl) vIframe.src = videoUrl;
      } else {
        vContainer.style.display = 'none';
        vIframe.src = ""; // Dừng video khi sang câu khác
      }
    }

    const q = questions[cur];
    const hasAnswered = user[cur] !== null;

    // (Phần tạo HTML bên dưới giữ nguyên như cũ của bạn...)
    const quizEl = $("#quiz");
    const html = `
      <div class="q-head"><div class="q-index">Câu ${cur+1}/${questions.length}</div></div>
      <div class="q-text">${q.q}</div>
      ${q.hira ? `<div class="hira">${q.hira}</div>` : ""}
      ${q.img ? `<div class="q-img"><img src="${q.img}" style="max-width:100%;border:1px solid #ccc;border-radius:8px;margin:8px 0;"></div>`: ""}
      <div class="options">
        ${q.options.map((op,i)=>{
          let cls="opt", mark="";
          if(hasAnswered){
            if(op.correct){ cls+=" correct"; mark="✅"; }
            else if(user[cur]===i){ cls+=" incorrect"; mark="❌"; }
          }
          return `<div class="${cls}" data-idx="${i}">${op.text} <span class="mark">${mark}</span></div>`;
        }).join("")}
      </div>
      <div class="nav">
        <button class="btn" id="backBtn" ${cur===0?"disabled":""}>⬅️ Quay lại</button>
        <button class="btn" id="explainBtn">📘 Giải thích</button>
        <button class="btn" id="nextBtn" ${cur===questions.length-1?"disabled":""}>➡️ Tiếp theo</button>
      </div>
      <div id="explainBox" class="explain-box" style="display:${hasAnswered?"block":"none"};">
        ${q.vi ? `<div><b>Dịch:</b> ${q.vi}</div>` : ""}
        ${q.explain ? `<div><b>📘 Giải thích:</b> ${q.explain}</div>` : ""}
        ${q.tip ? `<div class="tip">${q.tip}</div>` : ""}
      </div>
    `;

    quizEl.innerHTML = html;
    applyFuriganaToPage();

    // ... (Các phần xử lý click và submit bên dưới giữ nguyên)
    // Chỉ đảo đáp án nếu nút gạt đang BẬT
    if (isShuffleActive) shuffle(opts);

    return { ...q, options: opts };
  });

  // Chỉ đảo thứ tự câu hỏi nếu nút gạt đang BẬT
  if (isShuffleActive) shuffle(questions);


  let cur = 0;
  const user = new Array(questions.length).fill(null);

  // ================== FURIGANA ==================
  function convertFurigana(text) {
    if (!text) return text;
    return text.replace(
      /([一-龯々〆ヶ]+)\s*[（(]([^）)]+)[）)]/g,
      (m, kanji, kana) => `<ruby>${kanji}<rt>${kana}</rt></ruby>`
    );
  }

  function applyFuriganaToPage() {
    document.querySelectorAll(".q-text, .opt, .answer-line, .explain-box").forEach(el => {
      el.innerHTML = convertFurigana(el.innerHTML);
    });
  }

  // ================== RENDER ================
  function render() {
    if (!questions.length) {
      quizEl.innerHTML = "<p>Không có dữ liệu câu hỏi.</p>";
      return;
    }

    const q = questions[cur];
    const hasAnswered = user[cur] !== null;

    const html = `
      <div class="q-head"><div class="q-index">Câu ${cur+1}/${questions.length}</div></div>
      <div class="q-text">${q.q}</div>
      ${q.hira ? `<div class="hira">${q.hira}</div>` : ""}
      ${q.img ? `<div class="q-img"><img src="${q.img}" style="max-width:100%;border:1px solid #ccc;border-radius:8px;margin:8px 0;"></div>`: ""}
      <div class="options">
        ${q.options.map((op,i)=>{
          let cls="opt", mark="";
          if(hasAnswered){
            if(op.correct){ cls+=" correct"; mark="✅"; }
            else if(user[cur]===i){ cls+=" incorrect"; mark="❌"; }
          }
          return `<div class="${cls}" data-idx="${i}">${op.text} <span class="mark">${mark}</span></div>`;
        }).join("")}
      </div>
      <div class="nav">
        <button class="btn" id="backBtn" ${cur===0?"disabled":""}>⬅️ Quay lại</button>
        <button class="btn" id="explainBtn">📘 Giải thích</button>
        <button class="btn" id="nextBtn" ${cur===questions.length-1?"disabled":""}>➡️ Tiếp theo</button>
      </div>
      <div id="explainBox" class="explain-box" style="display:${hasAnswered?"block":"none"};">
        ${q.vi ? `<div><b>Dịch:</b> ${q.vi}</div>` : ""}
        ${q.explain ? `<div><b>📘 Giải thích:</b> ${q.explain}</div>` : ""}
        ${q.tip ? `<div class="tip">${q.tip}</div>` : ""}
      </div>
    `;

    quizEl.innerHTML = html;
    applyFuriganaToPage();

    quizEl.querySelectorAll(".opt").forEach(el => {
      el.addEventListener("click", () => {
        if (user[cur] !== null) return;
        const idx = parseInt(el.dataset.idx);
        user[cur] = idx;
        quizEl.querySelectorAll(".opt").forEach((optEl, j) => {
          const mark = optEl.querySelector(".mark");
          if (questions[cur].options[j].correct) {
            optEl.classList.add("correct");
            mark.textContent = "✅";
          } else if (j === idx) {
            optEl.classList.add("incorrect");
            mark.textContent = "❌";
          }
          optEl.style.pointerEvents = "none";
        });
        $("#explainBox").style.display = "block";
        applyFuriganaToPage();
      });
    });

    $("#backBtn").onclick = () => { if (cur > 0) { cur--; render(); } };
    $("#nextBtn").onclick = () => { if (user[cur] !== null && cur < questions.length - 1) { cur++; render(); } };
    $("#explainBtn").onclick = () => {
      const box = $("#explainBox");
      box.style.display = (box.style.display === "none") ? "block" : "none";
      applyFuriganaToPage();
    };
  }

  render();
  submitBtn.onclick = submitQuiz;

  function submitQuiz() {
    let correct = 0;
    const wrongs = [];
    const html = questions.map((q,i)=>{
      const picked = user[i];
      const right = q.options.find(o=>o.correct);
      const isRight = picked!==null && q.options[picked] && q.options[picked].correct;
      if(isRight){ correct++; return ""; }
      wrongs.push(q);
      return `
        <div class="result-item">
          <div class="q-text">${q.q}</div>
          ${q.hira?`<div class="hira">${q.hira}</div>`:""}
          ${q.img?`<div class="q-img"><img src="${q.img}" style="max-width:100%;border:1px solid #ccc;border-radius:8px;margin:8px 0;"></div>`:""}
          <div class="answer-line">❌ <b>Bạn chọn:</b> ${picked!==null?q.options[picked].text:"(chưa chọn)"}</div>
          <div class="answer-line">✅ <b>Đáp án đúng:</b> ${right.text}</div>
          ${q.vi?`<div><b>Dịch:</b> ${q.vi}</div>`:""}
          ${q.explain?`<div class="explain-box"><b>📘 Giải thích:</b> ${q.explain}</div>`:""}
          ${q.tip?`<div class="tip">${q.tip}</div>`:""}
        </div>
      `;
    }).join("");

    quizEl.style.display="none";
    resEl.style.display="block";
    resEl.innerHTML = `
      <div class="result-title">✅ Bạn làm đúng ${correct}/${questions.length}</div>
      ${wrongs.length?`<div><b>Bạn sai các câu sau:</b></div>${html}`:`<div>🎉 Bạn đúng hết!</div>`}
    `;
    applyFuriganaToPage();
    redoBtn.style.display = wrongs.length ? "block" : "none";
    redoBtn.onclick = () => {
      shuffle(wrongs);
      questions.length = 0;
      wrongs.forEach(q=>questions.push(q));
      cur = 0;
      user.length = questions.length;
      user.fill(null);
      quizEl.style.display="block";
      resEl.style.display="none";
      redoBtn.style.display="none";
      render();
    };
  }
})();
