/* 共享测验组件。用法：
   <div class="quiz" data-answer="A"> <div class="q">…</div>
     <div class="opts"><button data-v="A">有判定</button><button data-v="B">无判定</button></div>
     <div class="fb" data-for="A">…</div><div class="fb" data-for="B">…</div></div>  */
document.addEventListener('DOMContentLoaded', function () {
  var quizzes = [].slice.call(document.querySelectorAll('.quiz'));
  var done = 0, right = 0;
  var score = document.querySelector('.score');
  function paint() {
    if (!score) return;
    score.textContent = done === 0
      ? '答完 ' + quizzes.length + ' 题看结果'
      : '已答 ' + done + '/' + quizzes.length + ' · 答对 ' + right +
        (done === quizzes.length ? (right === quizzes.length ? ' —— 全对，这个判据你已经握住了' : ' —— 看看错的那题，问题通常出在"谁来判定"') : '');
  }
  quizzes.forEach(function (q) {
    var ans = q.dataset.answer, locked = false;
    q.querySelectorAll('.opts button').forEach(function (b) {
      b.addEventListener('click', function () {
        if (locked) return;
        locked = true; done++;
        var ok = b.dataset.v === ans;
        if (ok) right++;
        b.classList.add(ok ? 'ok' : 'no');
        if (!ok) {
          var c = q.querySelector('.opts button[data-v="' + ans + '"]');
          if (c) c.classList.add('ok');
        }
        var fb = q.querySelector('.fb[data-for="' + ans + '"]');
        if (fb) fb.classList.add('show');
        paint();
      });
    });
  });
  paint();
});
