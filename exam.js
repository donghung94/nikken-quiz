const urlParams = new URLSearchParams(window.location.search);
const set = urlParams.get('set') || '1';
const script = document.createElement('script');
script.src = `questions${set}.js`;
document.head.appendChild(script);

script.onload = () => {
  startQuiz(window.questions);
};

let current = 0, score = 0, wrongAnswers = [];
let timeLeft = 3600;
let timer;

function startQuiz(questions) {
  const app = document.getElementById('app');
  timer = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) finishQuiz(questions);
    renderQuestion(questions);
  }, 1000);
  renderQuestion(questions);
}

function renderQuestion(questions) {
  const app = document.getElementById('app');
  if (current >= questions.length) return;
  const q = questions[current];
  app.innerHTML = `<div><h3>${q.question}</h3>
    ${q.options.map((opt,i)=>`<label><input type='radio' name='q${current}' onclick='next(${i},${q.answer},${JSON.stringify(questions)})'> ${opt}</label><br>`).join('')}
    <p>Thời gian còn lại: ${Math.floor(timeLeft/60)}:${timeLeft%60}</p>
    <button onclick='prev()'>Quay lại</button></div>`;
}

function next(choice,answer,questions){
  if(choice+1===answer) score++;
  else wrongAnswers.push(current);
  current++;
  if(current<questions.length) renderQuestion(questions);
  else finishQuiz(questions);
}

function prev(){
  if(current>0){ current--; renderQuestion(window.questions); }
}

function finishQuiz(questions){
  clearInterval(timer);
  const app = document.getElementById('app');
  app.innerHTML = `<h2>Bạn làm đúng ${score}/${questions.length}</h2>` +
    questions.map((q,i)=>`<div><p>${q.question}</p>
      ${q.options.map((opt,idx)=>`<span class='${idx+1===q.answer?'correct':(wrongAnswers.includes(i)&&idx+1===q.chosen?'incorrect':'')}'>${opt}</span><br>`).join('')}
      <p><b>Giải thích:</b> ${q.explanation}</p>
      <p><b>Dịch:</b> ${q.translation}</p>
    </div>`).join('') +
    `<button onclick="location.href='index.html'">Trang chủ</button>`;
}