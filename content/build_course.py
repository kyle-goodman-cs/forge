from pathlib import Path
import runpy
import sys
root=Path(__file__).resolve().parent
sys.path.insert(0,str(root))
for script in ('expand_course.py','handbook.py','strengthen_checks.py','handbook.py','extras.py','beginner.py','traces.py'):
    runpy.run_path(str(root/script), run_name='__main__')
