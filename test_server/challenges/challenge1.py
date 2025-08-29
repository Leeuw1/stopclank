import sys
import importlib.util
import string
import random

module_name = 'dont_care'
spec = importlib.util.spec_from_file_location(module_name, sys.argv[1])
module = importlib.util.module_from_spec(spec)
sys.modules[module_name] = module
spec.loader.exec_module(module)

def test(a, b, expected):
    if module.merge(a, b) != expected:
        sys.exit(1)

test([], [], [])
test([1], [], [1])
test([], [1], [1])
test([2], [1], [1, 2])
test([1, 3], [2], [1, 2, 3])

for _ in range(100):
    length1 = random.choice(range(0, 100))
    length2 = random.choice(range(0, 100))
    a = [random.choice(range(0, 10000)) for _ in range(length1)]
    b = [random.choice(range(0, 10000)) for _ in range(length2)]
    expected = a + b
    expected.sort()
    test(a, b, expected)

sys.exit(0)
