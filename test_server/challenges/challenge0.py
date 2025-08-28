import sys
import importlib.util
import string
import random

module_name = 'dont_care'
spec = importlib.util.spec_from_file_location(module_name, sys.argv[1])
module = importlib.util.module_from_spec(spec)
sys.modules[module_name] = module
spec.loader.exec_module(module)

for _ in range(100):
    length = random.choice(range(2, 20))
    s = ''.join(random.choice(string.printable) for _ in range(length))
    r = module.reverse_string(s)
    for i in range(length):
        if s[i] != r[length - 1 - i]:
            sys.exit(1)

sys.exit(0)
