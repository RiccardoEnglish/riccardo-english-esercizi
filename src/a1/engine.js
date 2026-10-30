/* ==========================================================
   LIVELLO A1: 20 argomenti, un motore unico.
   Contenuto (A1_TOPICS) separato dal motore, prefisso "a1".
   Domande compatte: ["mc", prompt, [opzioni], indiceGiusta, spiegazione]
                     ["t", prompt, [risposte accettate], spiegazione]
   ========================================================== */
var A1_TOPICS = [];
var viewA1 = document.getElementById("view-a1");
function a1Topic(id){ return A1_TOPICS.filter(function(t){ return t.id === id; })[0]; }
var A1_CONTR = [[/\bdo not\b/g,"don't"],[/\bdoes not\b/g,"doesn't"],[/\bdid not\b/g,"didn't"],[/\bis not\b/g,"isn't"],[/\bare not\b/g,"aren't"],[/\bwas not\b/g,"wasn't"],[/\bwere not\b/g,"weren't"],[/\bhave not\b/g,"haven't"],[/\bhas not\b/g,"hasn't"],[/\bcannot\b/g,"can't"],[/\bcan not\b/g,"can't"],[/\bwill not\b/g,"won't"]];
function a1Norm(s){
  var x = String(s).replace(/[‘’ʼ`]/g,"'").trim().toLowerCase().replace(/\s+/g," ").replace(/[.!?]+$/,"");
  A1_CONTR.forEach(function(c){ x = x.replace(c[0], c[1]); });
  return x;
}
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
  var tv = document.getElementById("a1-table-view"); if(tv) tv.style.display = "none";
}
/* Completa la tabella: ti do il verbo base, scrivi le altre forme (solo argomenti con una tabella di verbi irregolari). */
var a1TRows = [], a1TOrder = [], a1TKind = "";
function a1TableRows(t){
  if(!t.fillTable) return [];
  var b = (t.blocks || []).filter(function(x){ return x.table; })[0];
  if(!b) return [];
  return b.table.rows.map(function(r){
    return t.fillTable === "pp" ? {base:r[0], past:r[1], part:r[2].split(" / "), tr:r[3]} : {base:r[0], past:r[1], part:null, tr:r[2]};
  });
}
function a1TableScore(n){
  document.getElementById("a1-table-score").textContent = n+" / "+a1TOrder.length;
  document.getElementById("a1-table-bar").style.width = Math.round(n/Math.max(1,a1TOrder.length)*100)+"%";
}
function a1TableRender(){
  var two = a1TKind === "pp";
  document.getElementById("a1-table-grid").innerHTML = a1TOrder.map(function(r, i){
    return '<div class="mt-row'+(two?' two':'')+'" data-i="'+i+'"><div class="mt-q"><b>'+esc(r.base)+'</b><span>'+esc(r.tr)+'</span></div>'+
      '<input class="mt-in" data-k="past" type="text" placeholder="Past Simple" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Past Simple di '+esc(r.base)+'">'+
      (two ? '<input class="mt-in" data-k="part" type="text" placeholder="Past Participle" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Past Participle di '+esc(r.base)+'">' : '')+
      '<span class="mt-ans">'+esc(r.past)+(two ? ' · '+esc(r.part.join(" / ")) : '')+'</span></div>';
  }).join("");
  a1TableScore(0);
  var ins = document.querySelectorAll("#a1-table-grid .mt-in");
  ins.forEach(function(inp, i){
    inp.addEventListener("keydown", function(ev){ if(ev.key === "Enter"){ ev.preventDefault(); if(ins[i+1]) ins[i+1].focus(); } });
  });
}
function a1TableCheck(){
  var ok = 0;
  document.querySelectorAll("#a1-table-grid .mt-row").forEach(function(row){
    var r = a1TOrder[parseInt(row.getAttribute("data-i"), 10)];
    var vp = norm(row.querySelector('[data-k="past"]').value);
    var vq = a1TKind === "pp" ? norm(row.querySelector('[data-k="part"]').value) : "";
    row.classList.remove("ok", "bad");
    if(!vp && !vq) return;
    var good = vp === r.past.toLowerCase() && (a1TKind !== "pp" || r.part.map(function(x){ return x.toLowerCase(); }).indexOf(vq) > -1);
    if(good){ row.classList.add("ok"); ok++; } else row.classList.add("bad");
  });
  a1TableScore(ok);
}
function a1TableOpen(){
  a1TRows = a1TableRows(a1Cur); a1TOrder = a1TRows.slice(); a1TKind = a1Cur.fillTable;
  a1El.setup.style.display = "none"; a1El.live.style.display = "none"; a1El.result.style.display = "none";
  document.getElementById("a1-table-view").style.display = "block";
  document.getElementById("a1-table-count").textContent = "Completa la tabella · "+a1TRows.length+" verbi";
  document.getElementById("a1-table-lead").innerHTML = a1TKind === "pp"
    ? 'Per ogni verbo hai solo la <b>forma base</b> e la traduzione: scrivi il <b>Past Simple</b> e il <b>Past Participle</b>. <b>Controlla</b> segna in verde le righe giuste e in rosso quelle con almeno un errore; <b>Mostra soluzioni</b> riempie quelle che mancano.'
    : 'Per ogni verbo hai solo la <b>forma base</b> e la traduzione: scrivi il <b>Past Simple</b>. <b>Controlla</b> segna in verde le righe giuste e in rosso quelle sbagliate; <b>Mostra soluzioni</b> riempie quelle che mancano.';
  a1TableRender(); window.scrollTo(0, 0);
}
document.getElementById("a1-table-back").addEventListener("click", a1Back);
document.getElementById("a1-table-check").addEventListener("click", a1TableCheck);
document.getElementById("a1-table-solve").addEventListener("click", function(){
  a1TableCheck();
  document.querySelectorAll("#a1-table-grid .mt-row").forEach(function(row){ if(!row.classList.contains("ok")){ row.classList.remove("bad"); row.classList.add("shown"); } });
});
document.getElementById("a1-table-reset").addEventListener("click", a1TableRender);
document.getElementById("a1-table-shuffle").addEventListener("click", function(){ a1TOrder = shuffle(a1TRows); a1TableRender(); });
function a1Pools(t){
  var all = a1Expand(t);
  var fill = all.filter(function(q){ return q.type === "text"; });
  var mc = all.filter(function(q){ return q.type === "mc"; });
  function clean(s){ return String(s).replace(/\s*\([^)]*\)\s*$/, "").replace(/\s+([.,!?;:])/g, "$1").replace(/\s+/g, " ").trim(); }
  function strip(w){ return w.replace(/^[^\w']+|[^\w']+$/g, ""); }
  // Una frase da correggere ha UNA sola parola sbagliata: evidenziata, e si scrive quella giusta.
  function fixItem(wrong, right, why, hint){
    var tw = clean(wrong).split(" "), tr = clean(right).split(" ");
    if(tw.length !== tr.length) return null;
    var d = [];
    tw.forEach(function(w, i){ if(strip(w).toLowerCase() !== strip(tr[i]).toLowerCase()) d.push(i); });
    if(d.length !== 1 || !strip(tr[d[0]])) return null;
    var i = d[0];
    return {type:"text", fix:true, kick:"Correggi la frase", toks:tw, idx:i, hint:hint || "", wrongFull:clean(wrong), rightFull:clean(right),
      answers:[strip(tr[i]), clean(right)], explain:"Frase corretta: "+clean(right)+(why ? " · "+why : ""), rv:"Correggi: "+clean(wrong)};
  }
  function valid(x){ return !!x; }
  var seen = {};
  function uniq(x){ if(seen[x.wrongFull]) return false; seen[x.wrongFull] = 1; return true; }
  var trapFix = (t.traps || []).map(function(x){ return fixItem(x[0], x[1], x[2]); }).filter(valid).filter(uniq);
  var mcFix = [];
  mc.filter(function(q){ return /^(Which|Quale)\b.*\b(correct|corretta)\b/i.test(q.prompt) && q.prompt.indexOf("___") < 0 && !/\bNOT\b/.test(q.prompt) && q.options.length > 1; }).forEach(function(q){
    q.options.forEach(function(o, i){ if(i === q.correct) return; var it = fixItem(o, q.options[q.correct], q.explain); if(it && uniq(it)) mcFix.push(it); });
  });
  var blanks = mc.filter(function(q){ return q.prompt.split("___").length === 2 && q.options.length > 1 && !/^(Which|Quale)\b/i.test(q.prompt); });
  var blankFix = [];
  blanks.forEach(function(q){
    var hm = q.prompt.match(/\(([^)]*)\)\s*$/), hint = hm ? hm[1] : "";
    q.options.forEach(function(o, i){
      if(i === q.correct) return;
      var it = fixItem(q.prompt.replace("___", o), q.prompt.replace("___", q.options[q.correct]), q.explain, hint);
      if(it && uniq(it)) blankFix.push(it);
    });
  });
  var fixAll = trapFix.concat(mcFix, blankFix);
  var MIN = 10;
  function pick(arr, n){ return arr.slice(0, Math.max(0, n)); }
  // Se un esercizio ha meno di 10 domande, lo completo con domande ricavate dalle altre dello stesso argomento.
  var fillAll = fill;
  if(fillAll.length < MIN){
    var extraFill = blanks.map(function(q){
      return {type:"text", kick:"Completa la frase", prompt:q.prompt + "  (" + q.options.join(" / ") + ")", answers:[q.options[q.correct]], explain:q.explain};
    });
    fillAll = fillAll.concat(pick(extraFill, MIN - fillAll.length));
  }
  var mcAll = mc;
  if(mcAll.length < MIN){
    var extraMc = trapFix.concat(mcFix).map(function(q){ return {type:"mc", kick:"Scelta multipla", prompt:"Quale frase è corretta?", options:[q.wrongFull, q.rightFull], correct:1, explain:q.explain, rv:q.rv}; });
    mcAll = mcAll.concat(pick(extraMc, MIN - mcAll.length));
  }
  return {fill:fillAll, mc:mcAll, fix:fixAll, all:all.concat(trapFix), table:(t.fillTable ? a1TableRows(t) : [])};
}
var A1_MODES = [
  {id:"fill", title:"Completa la frase", desc:"Scrivi tu la parola o la forma giusta."},
  {id:"mc", title:"Scelta multipla", desc:"Scegli la risposta giusta tra le opzioni."},
  {id:"fix", title:"Correggi la frase", desc:"Una parola è sbagliata: scrivi quella giusta."},
  {id:"table", title:"Completa la tabella", desc:"Hai solo il verbo base: scrivi tutte le altre forme."},
  {id:"all", title:"Tutto insieme", desc:"Tutte le domande dell'argomento, mescolate."}
];
function a1RenderSetup(t){
  document.getElementById("a1-setup-h").textContent = t.title;
  document.getElementById("a1-setup-p").textContent = "Scegli come esercitarti. Per completare l'argomento serve almeno l'80% di risposte giuste, in due giorni diversi.";
  var pools = a1Pools(t);
  document.getElementById("a1-type-grid").innerHTML = A1_MODES.filter(function(m){ return pools[m.id].length > 0; }).map(function(m){
    var n = m.id === "table" ? pools.table.length : Math.min(ROUND_LEN, pools[m.id].length);
    return '<button type="button" class="type-opt" data-a1mode="'+m.id+'"'+(m.id === "all" ? ' id="a1-start"' : '')+'><div class="t-head"><span class="t-title">'+m.title+'</span><span class="t-count">'+n+'</span></div><span class="t-desc">'+m.desc+'</span></button>';
  }).join("");
  document.querySelectorAll("#a1-type-grid [data-a1mode]").forEach(function(btn){
    btn.addEventListener("click", function(){ a1Start(btn.getAttribute("data-a1mode")); });
  });
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
var a1Mode = "all";
function a1Start(mode){
  if(typeof mode !== "string") mode = a1Mode || "all";
  a1Mode = mode;
  if(mode === "table"){ a1TableOpen(); return; }
  var pool = (a1Pools(a1Cur)[mode] || a1Pools(a1Cur).all).map(function(q){
    if(q.type === "mc"){
      var right = q.options[q.correct];
      var opts = shuffle(q.options);
      return {type:"mc", kick:q.kick, rv:q.rv, prompt:q.prompt, options:opts, correct:opts.indexOf(right), explain:q.explain};
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
  var kicker = q.kick || (q.type === "mc" ? "Scelta multipla" : "Completa la frase");
  var body = '<div class="qkicker">'+kicker+'</div>';
  if(q.fix) body += '<div class="qprompt">Una parola è sbagliata (è evidenziata). Scrivi quella giusta:</div><div class="wrong-sent">'+q.toks.map(function(w, i){ return i === q.idx ? '<mark class="wrong-w">'+esc(w)+'</mark>' : esc(w); }).join(" ")+'</div>'+(q.hint ? '<div class="fix-hint">Indizio: '+esc(q.hint)+'</div>' : '');
  else body += '<div class="qprompt">'+esc(q.prompt).replace("___", '<span class="blank">?</span>')+'</div>';
  if(q.type === "text"){
    body += '<form class="qform" id="a1-qform" autocomplete="off"><div class="text-row"><input id="a1-qinput" type="text" placeholder="'+(q.fix ? "scrivi la parola giusta" : "scrivi la risposta")+'" aria-label="Risposta" autocapitalize="off" autocorrect="off" spellcheck="false"><button type="submit" class="btn" id="a1-qsubmit">Controlla</button></div></form>';
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
    if(ok) a1Score++; else a1Mistakes.push({q:(q.rv || q.prompt.replace("___", correctText)), a:correctText, given:given});
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
  document.getElementById("a1-retry").addEventListener("click", function(){ a1Start(a1Mode); });
  document.getElementById("a1-guide-btn").addEventListener("click", function(){ showTab("guide"); });
  document.getElementById("a1-home-btn").addEventListener("click", function(){ showView("home"); });
  if(nx && pct >= 80) document.getElementById("a1-next").addEventListener("click", function(){ showView(nx.id); });
}
document.getElementById("a1-quiz-back").addEventListener("click", a1Back);
