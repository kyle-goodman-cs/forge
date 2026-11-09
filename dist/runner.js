/* Execute Python in a disposable worker; the UI can terminate a stuck program. */
/* Run a whole program once per test case. Hidden inputs and outputs never leave this worker's result. */
const PROGRAM_PY = String.raw`
import contextlib, io, json, sys, time, traceback

_FORGE_LIMIT = 3.0
_FORGE_MAX_SLOW = 2


class _ForgeTooSlow(BaseException):
    pass


def _forge_clean(text):
    return '\n'.join(line.rstrip() for line in text.replace('\r\n', '\n').rstrip().split('\n'))


def _forge_run(code, stdin):
    out, err = io.StringIO(), io.StringIO()
    deadline = time.monotonic() + _FORGE_LIMIT
    count = [0]

    def tracer(frame, event, arg):
        if frame.f_code.co_filename != 'solution.py':
            return None
        count[0] += 1
        if count[0] % 256 == 0 and time.monotonic() > deadline:
            raise _ForgeTooSlow()
        return tracer

    saved = sys.stdin
    sys.stdin = io.StringIO(stdin)
    status, detail = 'ok', ''
    try:
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            sys.settrace(tracer)
            try:
                exec(code, {'__name__': '__main__'})
            finally:
                sys.settrace(None)
    except SystemExit:
        pass
    except _ForgeTooSlow:
        status = 'slow'
    except BaseException:
        status, detail = 'error', traceback.format_exc(limit=-2)
    finally:
        sys.stdin = saved
    if status == 'ok' and time.monotonic() > deadline:
        status = 'slow'
    return status, out.getvalue(), detail


_forge_results = []
_forge_first = ''
_forge_error = None
_forge_slow = 0
try:
    _forge_code = compile(_forge_source, 'solution.py', 'exec')
except SyntaxError:
    _forge_error = traceback.format_exc(limit=0)
else:
    for _forge_i, _forge_case in enumerate(json.loads(_forge_cases)):
        _forge_sample = bool(_forge_case.get('sample'))
        if _forge_slow >= _FORGE_MAX_SLOW:
            _forge_results.append({'ok': False, 'sample': _forge_sample, 'status': 'skipped'})
            continue
        _forge_status, _forge_out, _forge_detail = _forge_run(_forge_code, _forge_case['stdin'])
        _forge_ok = _forge_status == 'ok' and _forge_clean(_forge_out) == _forge_clean(_forge_case['expected'])
        _forge_slow += _forge_status == 'slow'
        _forge_row = {'ok': _forge_ok, 'sample': _forge_sample, 'status': 'passed' if _forge_ok else {'ok': 'wrong answer', 'slow': 'too slow', 'error': 'runtime error'}[_forge_status]}
        if _forge_sample:
            _forge_row.update(expected=_forge_case['expected'], actual=_forge_clean(_forge_out)[:2000], error=_forge_detail[-1500:])
        _forge_results.append(_forge_row)
        if _forge_i == 0:
            _forge_first = _forge_out
json.dumps({'results': _forge_results, 'stdout': _forge_first[:12000], 'error': _forge_error})
`;
let runtime;
self.onmessage = async ({data}) => {
  try {
    if (!runtime) {
      importScripts('python/pyodide.js');
      runtime = await loadPyodide({indexURL: new URL('python/', self.location.href).href});
    }
    if(data.packages?.length) await runtime.loadPackage(data.packages);
    self.postMessage({type:'ready'});
    if (data.program) {
      runtime.globals.set('_forge_source', data.code);
      runtime.globals.set('_forge_cases', JSON.stringify(data.cases));
      self.postMessage({type:'result',data:JSON.parse(runtime.runPython(PROGRAM_PY))});
      return;
    }
    runtime.globals.set('_forge_source', data.code);
    runtime.globals.set('_forge_cases', JSON.stringify(data.cases));
    runtime.globals.set('_forge_name', data.name);
    runtime.globals.set('_forge_check_mutation', !!data.checkMutation);
    runtime.globals.set('_forge_requirements', JSON.stringify(data.requirements || []));
    const value = runtime.runPython(`
import json, io, contextlib, traceback, copy, ast
_forge_results = []
_forge_stdout = io.StringIO()
_forge_namespace = {'__name__': '__main__'}
_forge_error = None
with contextlib.redirect_stdout(_forge_stdout), contextlib.redirect_stderr(_forge_stdout):
    try:
        _forge_tree = ast.parse(_forge_source)
        _forge_nodes = list(ast.walk(_forge_tree))
        _forge_imports = set()
        _forge_bound_modules = set()
        for _forge_node in _forge_nodes:
            if isinstance(_forge_node, ast.Import):
                for _forge_alias in _forge_node.names:
                    _forge_top = _forge_alias.name.split('.')[0]
                    _forge_imports.add(_forge_top)
                    _forge_bound_modules.add(_forge_alias.asname or _forge_top)
            elif isinstance(_forge_node, ast.ImportFrom) and _forge_node.module and not _forge_node.level:
                _forge_imports.add(_forge_node.module.split('.')[0])
                _forge_imports.update(_forge_alias.name for _forge_alias in _forge_node.names)
        # A requirement can name something inside a module (deque), so count module.name uses too.
        _forge_imports.update(node.attr for node in _forge_nodes if isinstance(node, ast.Attribute) and isinstance(node.value, ast.Name) and node.value.id in _forge_bound_modules)
        for _forge_requirement in json.loads(_forge_requirements):
            _forge_satisfied = True
            if _forge_requirement == 'loop':
                _forge_satisfied = any(isinstance(node, (ast.For, ast.While)) for node in _forge_nodes)
            elif _forge_requirement in ('while', 'class', 'yield', 'raise', 'try', 'with'):
                _forge_kind = {'while': ast.While, 'class': ast.ClassDef, 'yield': ast.Yield, 'raise': ast.Raise, 'try': ast.Try, 'with': ast.With}[_forge_requirement]
                _forge_satisfied = any(isinstance(node, _forge_kind) for node in _forge_nodes)
            elif _forge_requirement == 'function':
                _forge_satisfied = sum(isinstance(node, ast.FunctionDef) for node in _forge_nodes) >= 2
            else:
                _forge_satisfied = _forge_requirement in _forge_imports
            if not _forge_satisfied:
                raise ValueError('Practice requirement: use ' + _forge_requirement + ' as requested in the challenge, then rerun the checks.')
        exec(compile(_forge_source, 'solution.py', 'exec'), _forge_namespace)
        _forge_fn = _forge_namespace.get(_forge_name)
        if _forge_name and not callable(_forge_fn):
            raise NameError('Define the function ' + _forge_name + ' with the exact name in the task.')
        for _forge_case in json.loads(_forge_cases):
            try:
                _forge_args = copy.deepcopy(_forge_case['args'])
                _forge_actual = _forge_fn(*_forge_args)
                _forge_expected = _forge_case['expected']
                _forge_unchanged = _forge_args == _forge_case['args']
                _forge_ok = _forge_actual == _forge_expected and (not _forge_check_mutation or _forge_unchanged)
                if isinstance(_forge_expected, bool):
                    _forge_ok = type(_forge_actual) is bool and _forge_ok
                _forge_results.append({'ok': bool(_forge_ok), 'actual': repr(_forge_actual), 'expected': repr(_forge_expected), 'args': repr(_forge_case['args']), 'mutated': not _forge_unchanged})
            except BaseException:
                _forge_results.append({'ok': False, 'error': traceback.format_exc(limit=3)})
    except BaseException:
        _forge_error = traceback.format_exc(limit=4)
json.dumps({'results': _forge_results, 'stdout': _forge_stdout.getvalue()[:12000], 'error': _forge_error})
`);
    self.postMessage({type:'result',data:JSON.parse(value)});
  } catch (error) {self.postMessage({type:'error',message:String(error)});}
};
