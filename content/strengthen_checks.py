import json
from pathlib import Path
from build_io import write_text_atomic
p=Path(__file__).resolve().parents[1]/'dist/curriculum.json';data=json.loads(p.read_text(encoding='utf-8'))
E={
1:[([5,-2],3),([-3,3],0)],2:[([0,1],False),([50,0],True)],3:[([1],'low'),([100],'ready')],4:[([0,False],0),([3,True],56)],
5:[([[-1,2,-3]],-2),([[8]],8)],6:[([[11,12],10],[]),([[1,0,-1],0],[0,-1])],7:[([''],'')],8:[([[1,2],3],0)],
9:[([{'a':1},'b'],{'a':1,'b':1}),([{'a':0},'a'],{'a':1})],10:[([[{'name':'C','score':-1},{'name':'D','score':-2}]],['C','D'])],11:[([['A','a','A']],['A','a'])],12:[([['a','a','a']],{'a':3})],
13:[([0,5,0],0),([7,0,0],7)],14:[([0,0,'S'],[0,-1]),([0,0,'E'],[1,0])],15:[([1,2],1)],16:[([['N','N','W']],[-1,2]),([['E','W']],[0,0])],17:[(['1'],1),(['100'],100),(['-1'],None)],18:[([2],3)],19:[([[3,6,9]],6.0)],20:[([' true '],True),(['NO'],False)],
21:[(['[-2, 1]'],-1),(['[0]'],0)],22:[(['item,price\nzero,0\n'],0.0)],23:[([['save.tar.gz','NOEXT','a.JSON']],{'.gz':1,'.json':1}),([['a.txt','.hidden']],{'.txt':1})],24:[([[{'game':'A','minutes':0}]],{'A':0}),([[{'game':'a','minutes':2},{'game':'A','minutes':3}]],{'a':2,'A':3})],
25:[([['A B','A B']],[['A B','a_b'],['A B','a_b']])],26:[([[['a','x'],['b','y']]],[])],27:[([[' ','  ']],[]),([['B',' a ','b']],['a','b'])],28:[([[['a','x'],['b','y']]],{'changes':2,'conflicts':0})],29:[([[1],1],0)],30:[([[0,0]],True)],31:[([[0,0],0],[0,1])],32:[(['a!','!A'],True)],
33:[(['a'],True)],34:[(['()()'],True)],35:[([[3,1],1],3)],36:[([[1,3,5],1],0)],37:[([1,[0,0]],1)],38:[([['Halo','HALO','A'],'halo'],['HALO','Halo'])],39:[([5,[-5]],0)],40:[([[{'name':'A','score':2},{'name':'A','score':8},{'name':'B','score':4}]],['A','B'])],
41:[([{'title':' A ','minutes':0,'tags':[]}],{'title':'A','minutes':0,'tags':[]}),([{'title':'B','minutes':'10','tags':[' X ','Y','x']}],{'title':'B','minutes':10,'tags':['x','y']})],42:[([[{'title':'A','minutes':0}]],{'a':0})],43:[([{'Z':0}],'title,minutes\nZ,0\n')],44:[([[{'title':'A','minutes':1},{'title':'B','minutes':2}]],{'games':2,'minutes':3})],45:[([[['A','B'],['A','C']]],[['A',6],['B',0],['C',0]])],46:[([['WARN|a','warn|b','|bad']],{'WARN':2})],47:[(['a b a'],'b')],48:[([[{'title':'B','price':1,'rating':9},{'title':'A','price':1,'rating':9}],1],['A','B'])],
49:[([['--limit','0']],{'limit':0,'dry_run':False})],50:[([['A  new.py',' D gone.py']],{'staged':1,'unstaged':1,'untracked':0})],51:[([{'APP_PORT':'65535'}],65535),([{'APP_PORT':'65536'}],None)],52:[([2,0,False],{'exit_code':0,'message':'apply 2 changes'})],53:[([[[1,2],[0,0]]],[0])],54:[([2,-1],{'value':-2.0})],55:[([{'x':False},'x',True],False)],56:[([[]],None)],57:[(['GAME-0000'],True)],58:[(['2026-01-01','2027-01-01'],365)],59:[([['1.01','2.02','0']],303)],60:[([[{'name':'A','minutes':1},{'name':5,'minutes':1}]],{'accepted':1,'rejected':[1]})],
61:[([[['Z',0],['A',0]],0],['A','Z'])],62:[([[['A',0]]],[['A',0]])],63:[([[[1,'Z']],[]],[['Z',0]])],64:[([[],'missing'],0)],65:[([201,'not json'],{'ok':False,'status':201})],66:[(['a/b?',0],'https://example.com/games?q=a%2Fb%3F&page=0')],67:[([[[],[{'id':0,'title':'Z'}]]],[{'id':0,'title':'Z'}])],68:[([[200,500]],[])],69:[([[0]],[[0]])],70:[([['Z']],[{'name':'Z','score':0}])],71:[([[1,2],3],[[1,2]])],72:[([{},{'a':False},{'b':None}],{'a':False,'b':None})],73:[([[-3,[2]]],-1)],74:[([{'A':['B'],'B':['C'],'C':['A']},'A','C'],2)],75:[([[None,0]],[None,0])],76:[([[['Z',0],['A',0]]],['Z','A'])],77:[([{'title':'  ','price_cents':0}],{'status':422,'error':'invalid game'})],78:[([['A'],5,1],[])],79:[(['a','b','ADMIN'],False)],80:[([{'title':'A'},{'title':'B','secret':'x'}],{'title':'B'})],81:[([3,0],{'event':'import_finished','level':'INFO','accepted':3,'rejected':0})],82:[([[],[{'id':2},{'id':1},{'id':2,'x':1}]],[{'id':1},{'id':2,'x':1}])],83:[(['A-1.json'],True)],84:[([[{'id':1,'title':' '},{'id':1,'title':'A'}]],{'accepted':1,'rejected':1,'duplicates':0})],85:[([{'a':None},{'a':None}],[])],86:[([{'title':'B','hours':0}],{'title':'B','minutes':0})],87:[([['a','b'],['a','b','c']],{'met':['a','b'],'missing':[]})],88:[([['a'],[]],{'new':[],'resolved':['a'],'still_failing':[]})],89:[(['titles',[]],[])],90:[([[{'id':1,'title':'A','token':'no'}]],[{'id':1,'title':'A'}])],91:[([[{'name':'z','exit_code':2},{'name':'a','exit_code':1}]],{'passed':False,'failed':['a','z']})],92:[([{'tests':True,'docs':True,'clean_install':True,'demo':False}],False)],93:[([{'A':-2,'B':-1},10],['B','A'])],94:[(['dvdf'],3)],95:[([[{'game':' X ','minutes':-1},{'game':' x ','minutes':2}]],{'totals':{'x':2},'rejected':1})],96:[([[{'user':'A','timestamp':0},{'user':'a','timestamp':3},{'user':'B','timestamp':3}],5],['a','b'])]
}
# Boundary cases added after mutation testing (edition 3): each kills a realistic off-by-one or comparison bug.
E2={93: [([{'A': 1, 'B': 2}, 1], ['B']), ([{'A': 1}, -1], [])], 96: [([[{'user': 'z', 'timestamp': 0}], 1], ['z']), ([[{'user': '  ', 'timestamp': 4}, {'user': 'q', 'timestamp': -1}, {'user': 'k', 'timestamp': 2}], 3], ['k']), ([[{'user': 'a', 'timestamp': 1}, {'user': 'b', 'timestamp': 2}], 1], ['b'])], 51: [([{'APP_PORT': '1'}], 1)], 81: [([5, 1], {'event': 'import_finished', 'level': 'WARNING', 'accepted': 5, 'rejected': 1})], 68: [([[429, 200]], [1]), ([[600, 200]], []), ([[599, 503]], [1])], 71: [([[1, 2], 1], [[1], [2]])]}
for k,v in E2.items(): E.setdefault(k,[]).extend(v)
# Added by the content audit: real gaps a mutation search found (the other survivors were equivalent programs).
E3={15:[([10,1],10)],35:[([[-2,-3],2],-5)],50:[([[' M a.py','MM b.py','?? c.py','A  d.py']],{'staged':2,'unstaged':2,'untracked':1})],78:[([['B','A'],0,0],[]),([['B','A'],-1,1],['A'])]}
for k,v in E3.items(): E.setdefault(k,[]).extend(v)
for lesson in data['lessons']:
 for args,expected in E.get(lesson['id'],[]):
  case={'args':args,'expected':expected}
  if case not in lesson['cases']:lesson['cases'].append(case)
# Source structure is checked only where an exercise explicitly requests it.
requirements={5:['loop'],6:['loop'],8:['loop'],29:['loop'],37:['class'],49:['argparse'],54:['raise','try'],57:['re'],61:['sqlite3'],62:['sqlite3'],63:['sqlite3'],64:['sqlite3'],69:['function'],70:['class'],71:['yield'],74:['deque'],76:['heapq'],83:['re']}
for l in data['lessons']:
 if l['id'] in (57,83) and 'Use re.fullmatch' not in l['task']:
  l['task'] += ' Use re.fullmatch for this pattern-validation exercise.'
 if l['id']==74 and 'Use collections.deque' not in l['task']:
  l['task'] += ' Use collections.deque for the BFS queue.'
 l['requirements']=requirements.get(l['id'],[])
 l['noMutation']=any(phrase in l['task'].lower() for phrase in ['do not mutate','do not modify','do not change','leave the original unchanged'])
write_text_atomic(p,json.dumps(data,indent=2))
print('Total checks:',sum(len(l['cases']) for l in data['lessons']))
