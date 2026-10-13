A1_TOPICS.push({
id:"a1-subj", title:"Pronomi soggetto", tag:"Pronomi",
desc:"I, you, he, she, it, we, they: chi fa l'azione.",
lead:"I **pronomi soggetto** dicono chi fa l'azione. In inglese sono **obbligatori**: non si può togliere il soggetto come in italiano («Vado a casa» = *I* go home).",
tip:"Anche per il tempo e le situazioni serve un soggetto: **it** is raining, **it** is late.",
blocks:[
 {h:"I sette pronomi", table:{head:["Pronome","Significato","Esempio"], rows:[["I","io","I am a teacher."],["you","tu / voi / Lei","You are late."],["he","lui","He works in Rome."],["she","lei","She is my sister."],["it","esso (cosa, animale, tempo)","It is a big city."],["we","noi","We live here."],["they","loro","They are friends."]]}},
 {h:"I si scrive sempre maiuscolo", ex:["Yesterday **I** went to the cinema.","My sister and **I** are from Milan."]},
 {h:"It: il soggetto «vuoto»", p:"In inglese anche le frasi sul tempo, sull'ora e sulla distanza hanno un soggetto: **it**.", ex:["**It** is raining.","**It** is 5 o'clock.","**It** is far from here.","**It** is important to sleep."]},
 {h:"You: tu e voi", p:"Non esiste una forma separata per «tu» e «voi»: **you** va bene per tutti.", ex:["**You** are my friend. (tu)","**You** are my friends. (voi)"]}
],
traps:[
 ["Is raining.","It is raining.","Il soggetto è obbligatorio."],
 ["Am Marco.","I am Marco.","Serve il soggetto I."],
 ["Anna and me are friends.","Anna and I are friends.","Soggetto = I, non me."],
 ["Is a nice day.","It is a nice day.","Serve it."]
],
qs:[
 ["mc","___ am a student. (io)",["I","He","They"],0,"Io = I."],
 ["mc","___ is my brother. (lui)",["He","She","It"],0,"Lui = he."],
 ["t","___ is my sister. (lei)",["she"],"Lei = she."],
 ["t","___ are friends. (loro)",["they"],"Loro = they."],
 ["mc","___ is raining.",["It","He","They"],0,"Per il tempo si usa it."],
 ["mc","The table is big. ___ is old.",["He","It","They"],1,"Per le cose singolari si usa it."],
 ["t","My parents and I live here. ___ live here. (noi)",["we"],"My parents and I = we."],
 ["t","Anna and Luca are teachers. ___ are teachers.",["they"],"Anna and Luca = they."],
 ["mc","Quale frase è corretta?",["Is late.","It is late.","He is late. (è tardi)"],1,"Per l'ora si usa it."],
 ["mc","___ are my friends. (voi)",["You","We","He"],0,"You vale anche per voi."],
 ["t","Marco is tall. ___ is tall.",["he"],"Marco = he."],
 ["t","My mother works at a bank. ___ works at a bank.",["she"],"My mother = she."],
 ["mc","Which is correct?",["Anna and I are friends.","Anna and me are friends.","Me and Anna are friends."],0,"Come soggetto: I."],
 ["mc","Quale pronome si scrive sempre maiuscolo?",["I","he","she"],0,"I è sempre maiuscolo."],
 ["t","The weather is nice. ___ is sunny.",["it"],"Per il tempo: it."],
 ["t","Tom and I are tired. ___ are tired.",["we"],"Tom and I = we."],
 ["mc","Posso togliere il soggetto?",["No, mai in inglese","Sì, come in italiano","Solo con you"],0,"In inglese il soggetto è obbligatorio."],
 ["mc","The book is on the table. ___ is new.",["He","It","They"],1,"Cosa singolare: it."]
]});

A1_TOPICS.push({
id:"a1-obj", title:"Pronomi complemento", tag:"Pronomi",
desc:"Me, you, him, her, it, us, them: chi riceve l'azione.",
lead:"I **pronomi complemento** si usano **dopo il verbo** o **dopo una preposizione**, al posto del soggetto. Rispondono a «chi?» o «che cosa?».",
tip:"Cambia la forma: I → me, he → him, she → her, we → us, they → them.",
blocks:[
 {h:"Da soggetto a complemento", table:{head:["Soggetto","Complemento","Esempio"], rows:[["I","me","She helps me."],["you","you","I love you."],["he","him","I know him."],["she","her","I call her."],["it","it","I like it."],["we","us","They invite us."],["they","them","I see them."]]}},
 {h:"Dopo un verbo", ex:["Can you help **me**?","I don't know **him**.","She loves **them**."]},
 {h:"Dopo una preposizione", ex:["Come with **me**.","This gift is for **you**.","I'm talking to **her**.","Look at **us**!"]},
 {h:"Attenzione a her", p:"**Her** è sia complemento (lei) sia possessivo (suo). Si capisce dalla frase.", ex:["I see **her**. (complemento)","I see **her** sister. (possessivo)"]}
],
traps:[
 ["Help I, please.","Help me, please.","Dopo il verbo: me."],
 ["I love he.","I love him.","Complemento: him."],
 ["She gives to I a book.","She gives me a book.","Il complemento va senza to."],
 ["Give it to she.","Give it to her.","Dopo to: her."]
],
qs:[
 ["mc","Can you help ___ ? (me)",["I","me","my"],1,"Dopo il verbo: me."],
 ["mc","I know ___ . (lui)",["he","him","his"],1,"Complemento di he: him."],
 ["t","I love ___ . (lei)",["her"],"Complemento di she: her."],
 ["t","She calls ___ every day. (noi)",["us"],"Complemento di we: us."],
 ["mc","I see ___ . (loro)",["they","them","their"],1,"Complemento di they: them."],
 ["mc","This present is for ___ . (te)",["you","your","yours"],0,"You resta you."],
 ["t","Come with ___ . (me)",["me"],"Dopo una preposizione: me."],
 ["t","I'm talking to ___ . (lui)",["him"],"To him."],
 ["mc","Which is correct?",["Give me the book.","Give I the book.","Give my the book."],0,"Give me."],
 ["mc","Which is correct?",["Look at them.","Look at they.","Look at their."],0,"Dopo at: them."],
 ["t","The dog is hungry. Give ___ some food. (a lui, il cane)",["it"],"Il cane = it."],
 ["t","We love our parents. We call ___ every day.",["them"],"Our parents = them."],
 ["mc","I like Anna. I invite ___ to my party.",["she","her","hers"],1,"Complemento: her."],
 ["mc","Anna and Luca are my friends. I see ___ often.",["them","they","their"],0,"Complemento: them."],
 ["t","My sister is coming. Wait for ___ . (lei)",["her"],"Dopo for: her."],
 ["mc","Which word is an object pronoun?",["him","he","his"],0,"Him è un complemento."],
 ["t","Please tell ___ the truth. (a noi)",["us"],"Tell us."],
 ["mc","Her is a possessive in:",["I see her sister.","I see her.","Look at her."],0,"Her sister = sua sorella."]
]});

A1_TOPICS.push({
id:"a1-pospron", title:"Pronomi possessivi", tag:"Pronomi",
desc:"Mine, yours, his, hers, ours, theirs: di chi è?",
lead:"I **pronomi possessivi** sostituiscono «aggettivo possessivo + nome». Stanno da soli, senza un nome dopo di sé.",
tip:"My book → **mine**. Non si mette mai un nome dopo mine, yours, ours...",
blocks:[
 {h:"Dalla forma aggettivo al pronome", table:{head:["Aggettivo","Pronome","Esempio"], rows:[["my","mine","This pen is mine."],["your","yours","Is that bag yours?"],["his","his","The car is his."],["her","hers","The book is hers."],["our","ours","The house is ours."],["their","theirs","The dog is theirs."]]}},
 {h:"Quando si usano", ex:["Whose is this phone? It's **mine**.","My car is red. **Yours** is blue.","A friend of **mine** (un mio amico)","Is this coat **yours** or **hers**?"]},
 {h:"Nessun apostrofo", p:"Yours, hers, ours, theirs si scrivono **senza apostrofo**.", ex:["The idea is **hers**. (non: her's)","Is that **yours**? (non: your's)"]},
 {h:"Whose?", p:"Per chiedere di chi è una cosa si usa **whose**.", ex:["**Whose** is this bag? It's mine.","**Whose** keys are these? They're his."]}
],
traps:[
 ["This is mine book.","This is my book. / This book is mine.","Con un nome: my. Senza nome: mine."],
 ["It's her's.","It's hers.","Niente apostrofo."],
 ["The red car is the mine.","The red car is mine.","Niente articolo."],
 ["This is yours bag.","This is your bag.","Prima di un nome: your."]
],
qs:[
 ["mc","This pen is ___ . (mio)",["my","mine","me"],1,"Senza nome: mine."],
 ["mc","Is that bag ___ ? (tua)",["your","yours","you"],1,"Senza nome: yours."],
 ["t","The book is ___ . (di lei)",["hers"],"Her → hers."],
 ["t","The car is ___ . (di lui)",["his"],"His resta his."],
 ["mc","The house is ___ . (nostra)",["our","ours","us"],1,"Our → ours."],
 ["mc","The dog is ___ . (loro)",["their","theirs","them"],1,"Their → theirs."],
 ["t","Whose is this phone? It's ___ . (mio)",["mine"],"Mine = mio."],
 ["t","My car is red. ___ is blue. (la tua)",["yours"],"Yours."],
 ["mc","Which is correct?",["This is my book.","This is mine book.","This is me book."],0,"Con il nome: my."],
 ["mc","Which is correct?",["The idea is hers.","The idea is her's.","The idea is hers'."],0,"Niente apostrofo."],
 ["mc","Which is correct?",["The bag is mine.","The bag is the mine.","The bag is my."],0,"Niente articolo, e mine senza nome."],
 ["t","___ keys are these? (di chi)",["whose"],"Whose = di chi."],
 ["t","Those are Anna's keys. They're ___ . (suoi)",["hers"],"Anna → hers."],
 ["mc","Tom's coat is black. The coat is ___ .",["his","he","him"],0,"His senza nome."],
 ["mc","We have a flat. The flat is ___ .",["ours","our","us"],0,"Ours."],
 ["t","A friend of ___ is coming. (mio)",["mine"],"A friend of mine."],
 ["mc","Quale frase è corretta?",["Is this yours?","Is this your's?","Is this yourse?"],0,"Yours, senza apostrofo."],
 ["t","The cat isn't ours. It's ___ . (loro)",["theirs"],"Theirs."]
]});

A1_TOPICS.push({
id:"a1-plural", title:"Plurale dei nomi", tag:"Grammatica",
desc:"Plurali regolari e irregolari: -s, -es, -ies, man → men.",
lead:"Per fare il **plurale** in inglese di solito basta aggiungere **-s**. Ci sono poche regole di ortografia e un gruppo di plurali irregolari da imparare.",
tip:"Gli irregolari più importanti: man → men, woman → women, child → children, person → people.",
blocks:[
 {h:"Plurali regolari", table:{head:["Regola","Singolare","Plurale"], rows:[["Di solito + **-s**","book, car, dog","books, cars, dogs"],["-s, -ss, -sh, -ch, -x, -z: + **-es**","bus, class, watch, box","buses, classes, watches, boxes"],["Consonante + y: **-ies**","city, baby, country","cities, babies, countries"],["Vocale + y: + **-s**","day, boy, key","days, boys, keys"],["Molti nomi in -o: + **-es**","tomato, potato, hero","tomatoes, potatoes, heroes"],["-f / -fe: **-ves**","knife, wife, leaf","knives, wives, leaves"]]}},
 {h:"Plurali irregolari", table:{head:["Singolare","Plurale","Esempio"], rows:[["man","men","two men"],["woman","women","three women"],["child","children","four children"],["person","people","many people"],["foot","feet","my feet"],["tooth","teeth","brush your teeth"],["mouse","mice","two mice"]]}},
 {h:"Uguale al singolare", ex:["one **sheep**, two **sheep**","one **fish**, two **fish**","one **deer**, two **deer**"]},
 {h:"Solo plurale", p:"Alcuni nomi che in italiano sono plurali lo sono anche in inglese: trousers, jeans, glasses, scissors, clothes. Si usano con **are**.", ex:["My **jeans are** new.","Where **are** my **glasses**?"]}
],
traps:[
 ["two childs","two children","Child è irregolare."],
 ["three womans","three women","Woman → women."],
 ["two citys","two cities","Consonante + y: -ies."],
 ["The people is nice.","The people are nice.","People è plurale."],
 ["My trousers is new.","My trousers are new.","Trousers è plurale."]
],
qs:[
 ["mc","Il plurale di «book» è:",["books","bookes","bookies"],0,"Di solito + s."],
 ["mc","Il plurale di «bus» è:",["buss","buses","busies"],1,"Dopo -s: -es."],
 ["t","Il plurale di «city» è ___ .",["cities"],"Consonante + y: -ies."],
 ["t","Il plurale di «day» è ___ .",["days"],"Vocale + y: solo -s."],
 ["mc","Il plurale di «watch» è:",["watchs","watches","watchies"],1,"Dopo -ch: -es."],
 ["mc","Il plurale di «knife» è:",["knifes","knives","knifs"],1,"-fe → -ves."],
 ["t","Il plurale di «child» è ___ .",["children"],"Plurale irregolare."],
 ["t","Il plurale di «woman» è ___ .",["women"],"Woman → women."],
 ["mc","Il plurale di «person» (nell'uso comune) è:",["persons","people","peoples"],1,"Person → people."],
 ["t","Il plurale di «tooth» è ___ .",["teeth"],"Tooth → teeth."],
 ["t","Il plurale di «foot» è ___ .",["feet"],"Foot → feet."],
 ["mc","Il plurale di «sheep» è:",["sheeps","sheep","sheepes"],1,"Sheep resta uguale."],
 ["mc","Il plurale di «tomato» è:",["tomatos","tomatoes","tomatoies"],1,"Molti nomi in -o: -es."],
 ["t","Il plurale di «box» è ___ .",["boxes"],"Dopo -x: -es."],
 ["mc","Which is correct?",["The people are nice.","The people is nice.","The peoples are nice."],0,"People è plurale."],
 ["mc","Which is correct?",["My jeans are new.","My jeans is new.","My jean are new."],0,"Jeans è plurale."],
 ["t","Il plurale di «baby» è ___ .",["babies"],"Consonante + y: -ies."],
 ["mc","Il plurale di «mouse» (animale) è:",["mouses","mice","mices"],1,"Mouse → mice."]
]});
