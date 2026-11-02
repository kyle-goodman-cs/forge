/* Execute Python in a disposable worker; the UI can terminate a stuck program. */
let runtime;
self.onmessage = async ({data}) => {
  try {
    if (!runtime) {
      importScripts('python/pyodide.js');
      runtime = await loadPyodide({indexURL: new URL('python/', self.location.href).href});
    }
    if(data.packages?.length) await runtime.loadPackage(data.packages);
    self.postMessage({type:'ready'});
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
            elif _forge_requirement in ('while', 'class', 'yield', 'raise', 'try'):
                _forge_kind = {'while': ast.While, 'class': ast.ClassDef, 'yield': ast.Yield, 'raise': ast.Raise, 'try': ast.Try}[_forge_requirement]
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
