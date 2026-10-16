/* Domande aggiuntive: ogni esercizio deve avere almeno 10 domande */
(function(){
  function T(id){ return A1_TOPICS.filter(function(t){ return t.id === id; })[0]; }
  function add(id, qs, traps){ var t = T(id); if(!t) return; qs.forEach(function(q){ t.qs.push(q); }); (traps || []).forEach(function(x){ (t.traps = t.traps || []).push(x); }); }
  add("a2-gen", [
    ["t","My ___ room is very big. (la stanza di mio fratello)",["brother's"],"Persona singolare: nome + 's."],
    ["t","The ___ uniforms are blue. (le divise delle infermiere)",["nurses'"],"Plurale regolare in -s: solo apostrofo."]
  ]);
  add("a1-imp", [], [["Please to sit down.","Please sit down.","Niente to: l'imperativo è il verbo base."]]);
  add("b2-mpc", [
    ["t","I ___ have known. Nobody told me. (couldn't / can't)",["couldn't","could not"],"Impossibilità al passato: couldn't have."],
    ["t","You should ___ told me earlier. (have / of)",["have"],"Si scrive have: should have / should've."],
    ["t","They must ___ left already. (have / of)",["have"],"Deduzione al passato: must have + participio."],
    ["t","It ___ have been a mistake. (might / does)",["might"],"Possibilità al passato: might have + participio."]
  ]);
  add("b1-mdi", [
    ["t","You ___ park here. It's forbidden. (must / mustn't)",["mustn't","must not","can't","cannot"],"Divieto: mustn't."],
    ["t","___ I open the window? (May / Do)",["May","Can","Could"],"Richiesta educata: May I...?"]
  ]);
  add("a1-plural", [
    ["t","Il plurale di «leaf» è ___ .",["leaves"],"Le parole in -f cambiano in -ves."],
    ["t","Il plurale di «man» è ___ .",["men"],"Plurale irregolare."]
  ], [
    ["two mans","two men","Man è irregolare."],
    ["three knifes","three knives","Knife → knives."],
    ["two tomatos","two tomatoes","Dopo -o spesso -es."]
  ]);
  add("a2-supra", [
    ["t","It was the ___ film I have ever seen. (bad)",["worst"],"Bad è irregolare: worst."],
    ["t","She is the ___ student in the school. (good)",["best"],"Good è irregolare: best."]
  ], [
    ["He is the most tall in the class.","He is the tallest in the class.","Aggettivo corto: -est."],
    ["It is the goodest day.","It is the best day.","Good è irregolare: best."]
  ]);
})();
