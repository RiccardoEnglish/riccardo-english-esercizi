/* ==========================================================
   LIVELLO A1: 20 argomenti, un motore unico.
   Contenuto (A1_TOPICS) separato dal motore, prefisso "a1".
   Domande compatte: ["mc", prompt, [opzioni], indiceGiusta, spiegazione]
                     ["t", prompt, [risposte accettate], spiegazione]
   ========================================================== */
var A1_TOPICS = [];
var viewA1 = document.getElementById("view-a1");
function a1Topic(id){ return A1_TOPICS.filter(function(t){ return t.id === id; })[0]; }
function a1Norm(s){ return String(s).replace(/[‘’ʼ`]/g,"'").trim().toLowerCase().replace(/\s+/g," ").replace(/[.!?]+$/,""); }
function a1Expand(t){
  return t.qs.map(function(q){
    if(q[0] === "mc") return {type:"mc", prompt:q[1], options:q[2], correct:q[3], explain:q[4]};
    return {type:"text", prompt:q[1], answers:q[2], explain:q[3]};
  });
}
var a1Cur = null, a1Order = [], a1I = 0, a1Score = 0, a1Answered = false, a1Mistakes = [];
var a1El = {
  guide: document.getElementById("a1-guide"),
  setup: document.getElementById("a1-quiz-setup"),
  live: document.getElementById("a1-quiz-live"),
  result: document.getElementById("a1-quiz-result"),
  qcard: document.getElementById("a1-qcard"),
  qcount: document.getElementById("a1-qcount"),
  bar: document.getElementById("a1-progress-bar"),
  pill: document.getElementById("a1-score-pill")
};
function a1Fmt(s){ return esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\*(.+?)\*/g, "<i>$1</i>"); }

function a1RenderGuide(t){
  var h = '';
  if(t.tip) h += '<div class="callout">'+a1Fmt(t.tip)+'</div>';
  t.blocks.forEach(function(b, i){
    h += '<h2 class="section-title" style="margin-top:'+(i?34:30)+'px">'+esc(b.h)+'</h2>';
    if(b.p) h += '<p class="lead-s">'+a1Fmt(b.p)+'</p>';
    if(b.table){
      h += '<div class="a1-tw"><table class="free"><thead><tr>'+b.table.head.map(function(c){ return '<th>'+esc(c)+'</th>'; }).join("")+'</tr></thead><tbody>'+
        b.table.rows.map(function(r){ return '<tr>'+r.map(function(c, ci){ return '<td'+(ci===0?' class="a"':(ci===r.length-1&&r.length>2?' class="e"':''))+'>'+a1Fmt(c)+'</td>'; }).join("")+'</tr>'; }).join("")+
        '</tbody></table></div>';
    }
    if(b.ex) h += '<div class="work">'+b.ex.map(function(x){ return '<div class="w1">'+a1Fmt(x)+'</div>'; }).join("")+'</div>';
  });
  if(t.traps && t.traps.length){
    h += '<h2 class="section-title" style="margin-top:34px">Errori da italiano, versione corretta</h2>'+
      '<p class="lead-s">Le trappole più comuni per chi traduce dall\'italiano.</p>'+
      '<div class="traps">'+t.traps.map(function(x){
        return '<div class="trap"><div><span class="lab">✗</span><span class="x">'+esc(x[0])+'</span></div>'+
          '<div><span class="lab">✓</span><span class="ok">'+esc(x[1])+'</span></div>'+
          (x[2] ? '<div style="margin-top:6px;color:var(--text-muted);font-size:12px">'+a1Fmt(x[2])+'</div>' : '')+'</div>';
      }).join("")+'</div>';
  }
  h += '<div class="a1-go"><button type="button" class="btn" id="a1-go-quiz">Vai agli esercizi →</button></div>';
  a1El.guide.innerHTML = h;
  document.getElementById("a1-go-quiz").addEventListener("click", function(){ showTab("quiz"); window.scrollTo(0,0); });
}

function a1Back(){
  a1El.live.style.display = "none"; a1El.result.style.display = "none"; a1El.setup.style.display = "block";
}
function a1RenderSetup(t){
  document.getElementById("a1-setup-h").textContent = t.title;
  document.getElementById("a1-setup-p").textContent = "Un round con tutte le domande dell'argomento, in ordine casuale. Per completare la tappa serve almeno l'80% di risposte giuste, in due giorni diversi.";
  var n = t.qs.length;
  document.getElementById("a1-type-grid").innerHTML =
    '<button type="button" class="type-opt" id="a1-start"><div class="t-head"><span class="t-title">Inizia l\'esercizio</span><span class="t-count">'+n+'</span></div><span class="t-desc">Scelta multipla e completamento, con la spiegazione dopo ogni risposta.</span></button>';
  document.getElementById("a1-start").addEventListener("click", function(){ a1Start(); });
  a1Back();
}
function a1Load(id){
  var t = a1Topic(id); if(!t) return;
  a1Cur = t;
  document.getElementById("a1-eyebrow").textContent = "Livello "+(t.level || "A1")+" · "+(t.tag || "Grammatica");
  document.getElementById("a1-h1").innerHTML = '<em>'+esc(t.title)+'</em>';
  document.getElementById("a1-lead").innerHTML = a1Fmt(t.lead);
  a1RenderGuide(t);
  a1RenderSetup(t);
}
function a1Start(){
  var pool = a1Expand(a1Cur).map(function(q){
    if(q.type === "mc"){
      var right = q.options[q.correct];
      var opts = shuffle(q.options);
      return {type:"mc", prompt:q.prompt, options:opts, correct:opts.indexOf(right), explain:q.explain};
    }
    return q;
  });
  a1Order = sample(pool, ROUND_LEN);
  a1I = 0; a1Score = 0; a1Mistakes = [];
  a1El.setup.style.display = "none"; a1El.result.style.display = "none"; a1El.live.style.display = "block";
  a1Question();
}
function a1Top(){
  a1El.qcount.textContent = "Domanda "+(a1I+1)+" / "+a1Order.length;
  a1El.bar.style.width = Math.round((a1I/a1Order.length)*100)+"%";
  a1El.pill.textContent = a1Score+" corrette";
}
function a1Question(){
  a1Answered = false;
  var q = a1Order[a1I]; a1Top();
  var kicker = q.type === "mc" ? "Scelta multipla" : "Completa la frase";
  var body = '<div class="qkicker">'+kicker+'</div><div class="qprompt">'+esc(q.prompt).replace("___", '<span class="blank">?</span>')+'</div>';
  if(q.type === "text"){
    body += '<form class="qform" id="a1-qform" autocomplete="off"><div class="text-row"><input id="a1-qinput" type="text" placeholder="scrivi la risposta" aria-label="Risposta" autocapitalize="off" autocorrect="off" spellcheck="false"><button type="submit" class="btn" id="a1-qsubmit">Controlla</button></div></form>';
  } else {
    body += '<div class="qform mc-grid">'+q.options.map(function(o, i){ return '<button type="button" class="opt" data-i="'+i+'">'+esc(o)+'</button>'; }).join("")+'</div>';
  }
  body += '<div class="feedback" id="a1-feedback"><b></b><div class="exp"></div></div>';
  body += '<div class="qfoot"><button class="btn ghost" id="a1-qnext" disabled>'+(a1I === a1Order.length-1 ? "Vedi risultato" : "Prossima →")+'</button></div>';
  a1El.qcard.innerHTML = body;
  var fb = document.getElementById("a1-feedback"), nextBtn = document.getElementById("a1-qnext");
  function settle(ok, correctText, given){
    a1Answered = true;
    fb.className = "feedback show "+(ok ? "good" : "bad");
    fb.querySelector("b").textContent = ok ? "Esatto" : "Quasi — la risposta è “"+correctText+"”";
    fb.querySelector(".exp").textContent = q.explain;
    nextBtn.disabled = false;
    if(ok) cheer(fb, nextBtn);
    if(ok) a1Score++; else a1Mistakes.push({q:q.prompt.replace("___", correctText), a:correctText, given:given});
    a1El.pill.textContent = a1Score+" corrette";
  }
  if(q.type === "text"){
    var input = document.getElementById("a1-qinput"); input.focus();
    document.getElementById("a1-qform").addEventListener("submit", function(ev){
      ev.preventDefault(); if(a1Answered) return;
      var v = a1Norm(input.value);
      var ok = q.answers.some(function(a){ return a1Norm(a) === v; });
      input.disabled = true; document.getElementById("a1-qsubmit").disabled = true;
      settle(ok, q.answers[0], input.value.trim());
    });
  } else {
    var bs = a1El.qcard.querySelectorAll(".opt");
    bs.forEach(function(btn){
      btn.addEventListener("click", function(){
        if(a1Answered) return;
        var i = parseInt(btn.getAttribute("data-i"), 10), ok = i === q.correct;
        bs.forEach(function(b, bi){ b.disabled = true; if(bi === q.correct) b.classList.add("correct"); else if(bi === i) b.classList.add("wrong"); });
        settle(ok, q.options[q.correct], q.options[i]);
      });
    });
  }
  nextBtn.addEventListener("click", function(){
    if(!a1Answered) return;
    if(a1I < a1Order.length-1){ a1I++; a1Question(); } else a1Finish();
  });
}
function a1Finish(){
  var t = a1Cur;
  PF.record(t.id, t.title, a1Score, a1Order.length, a1Mistakes, a1El.result);
  a1El.live.style.display = "none"; a1El.result.style.display = "block";
  var pct = Math.round((a1Score/a1Order.length)*100);
  var msg = pct >= 90 ? "Ottimo lavoro, argomento chiuso." : pct >= 70 ? "Buon risultato: ripassa gli errori qui sotto." : pct >= 40 ? "Ci sei quasi. Rileggi la guida e riprova." : "Torna alla guida e ricomincia con calma.";
  var rev = a1Mistakes.length ? ('<div class="review">'+a1Mistakes.map(function(m){
    return '<div class="rev-item"><div class="q">'+esc(m.q)+'</div><div class="g">✗ '+(m.given ? esc(m.given) : '(nessuna risposta)')+'</div><div class="a">✓ '+esc(m.a)+'</div></div>';
  }).join("")+'</div>') : '<p style="color:var(--good);font-weight:700;margin-top:18px">Nessun errore. Perfetto.</p>';
  var idx = A1_TOPICS.indexOf(t), nx = A1_TOPICS.slice(idx+1).filter(function(x){ return (x.level || "A1") === (t.level || "A1"); })[0];
  a1El.result.innerHTML = '<div class="result"><div class="qkicker">Risultato · '+esc(t.title)+'</div><div class="big">'+a1Score+' / '+a1Order.length+'</div><p>'+msg+'</p>'+rev+
    '<div class="result-actions"><button class="btn" id="a1-retry">Riprova</button>'+
    (nx && pct >= 80 ? '<button class="btn" id="a1-next">Prossimo argomento →</button>' : '')+
    '<button class="btn ghost" id="a1-guide-btn">Torna alla guida</button><button class="btn ghost" id="a1-home-btn">Tutti gli argomenti</button></div></div>';
  document.getElementById("a1-retry").addEventListener("click", a1Start);
  document.getElementById("a1-guide-btn").addEventListener("click", function(){ showTab("guide"); });
  document.getElementById("a1-home-btn").addEventListener("click", function(){ showView("home"); });
  if(nx && pct >= 80) document.getElementById("a1-next").addEventListener("click", function(){ showView(nx.id); });
}
document.getElementById("a1-quiz-back").addEventListener("click", a1Back);
