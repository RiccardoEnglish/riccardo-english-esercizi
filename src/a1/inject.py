import re,glob,io
p='/home/claude/build/prepositions-lab.html'
s=open(p,encoding='utf-8').read()
view=open('/home/claude/build/a1/view.html',encoding='utf-8').read()
eng=open('/home/claude/build/a1/engine.js',encoding='utf-8').read()
data=''.join(open(f,encoding='utf-8').read()+'\n' for f in sorted(glob.glob('/home/claude/build/a1/data*.js')))
js='/*A1-JS-START*/\n'+eng+'\n'+data+'/*A1-JS-END*/\n'
hv='<!--A1-HTML-START-->\n'+view+'<!--A1-HTML-END-->\n'
# html
if '<!--A1-HTML-START-->' in s:
    s=re.sub(r'<!--A1-HTML-START-->.*?<!--A1-HTML-END-->\n',lambda m:hv,s,flags=re.S)
else:
    m='  <div id="view-progress" class="view">'
    assert s.count(m)==1; s=s.replace(m,hv+m)
# js
if '/*A1-JS-START*/' in s:
    s=re.sub(r'/\*A1-JS-START\*/.*?/\*A1-JS-END\*/\n',lambda m:js,s,flags=re.S)
else:
    m='var ACTIVITIES = ['
    assert s.count(m)==1; s=s.replace(m,js+m)
def rep(a,b):
    global s
    if b in s: return
    assert s.count(a)==1,a
    s=s.replace(a,b)
rep('''var VIEW_IDS = ["preposizioni"''','''/*A1-REG*/\nA1_TOPICS.forEach(function(t){ ACTIVITIES.push({id:t.id, level:"A1", title:t.title, tag:t.tag||"Grammatica", desc:t.desc, status:"live"}); });\nvar VIEW_IDS = ["preposizioni"''')
rep('''progress: viewProgress};''','''progress: viewProgress};\nA1_TOPICS.forEach(function(t){ VIEW_IDS.push(t.id); VIEW_ELS[t.id] = viewA1; });''')
rep('''var LEVELS = [
''','''var LEVELS = [
  {id:"A1", title:"Livello A1", sub:"Si parte da qui: i verbi base, i pronomi, le preposizioni e le parole che usi ogni giorno.", 
   items:A1_TOPICS.map(function(t){ return [t.id]; })},
''')
rep('''modals: MD_BASE_QS.length + MD_ABIL_QS.length + MD_REQ_QS.length + MD_OBL_QS.length + MD_PROB_QS.length + MD_PAST_QS.length + MD_ALL_QS.length
};''','''modals: MD_BASE_QS.length + MD_ABIL_QS.length + MD_REQ_QS.length + MD_OBL_QS.length + MD_PROB_QS.length + MD_PAST_QS.length + MD_ALL_QS.length
};
A1_TOPICS.forEach(function(t){ ACTIVITY_COUNTS[t.id] = t.qs.length; });''')
rep('''    }).sort(function(x, y){ return byAlpha(x.a, y.a); }).map(''','''    }).sort(function(x, y){ return lv.keepOrder ? 0 : byAlpha(x.a, y.a); }).map(''')
rep('''VIEW_IDS.forEach(function(vid){ VIEW_ELS[vid].classList.toggle("active", vid === id); });''','''var tgtEl = VIEW_ELS[id];
  VIEW_IDS.forEach(function(vid){ VIEW_ELS[vid].classList.toggle("active", VIEW_ELS[vid] === tgtEl); });
  var isA1 = id.indexOf("a1-") === 0;
  if(isA1) a1Load(id);''')
rep('''var last = null; try{ last = localStorage.getItem(id+"-tab"); }catch(e){}''','''var last = null; if(!isA1){ try{ last = localStorage.getItem(id+"-tab"); }catch(e){} }''')
rep('''.au-overlay[hidden]{display:none}''','''.au-overlay[hidden]{display:none}\n.a1-tw{overflow-x:auto;margin-top:14px;background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:6px 10px;box-shadow:var(--shadow)}\n.a1-tw table{min-width:0}.a1-tw td,.a1-tw th{padding:8px 6px}\n.a1-go{margin-top:34px;display:flex;justify-content:center}''')
open(p,'w',encoding='utf-8').write(s)
print('ok',len(s))
