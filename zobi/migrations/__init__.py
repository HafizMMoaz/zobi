
import os
import sys

# hack to be able to import / reuse migration_utils.py in revisions
module_dir = os.path.dirname(os.path.realpath(__file__))
sys.path.append(module_dir)
