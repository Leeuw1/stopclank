import sys
import importlib.util
import random

module_name = 'dont_care'
spec = importlib.util.spec_from_file_location(module_name, sys.argv[1])
module = importlib.util.module_from_spec(spec)
sys.modules[module_name] = module
spec.loader.exec_module(module)

def solve_fizzbuzz(n):
    if n <= 0:
        return []
    result = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            result.append("FizzBuzz")
        elif i % 3 == 0:
            result.append("Fizz")
        elif i % 5 == 0:
            result.append("Buzz")
        else:
            result.append(str(i))
    return result

def test(n):
    try:
        expected = solve_fizzbuzz(n)
        result = module.fizzbuzz(n)
        if result != expected:
            sys.exit(1)
    except Exception:
        sys.exit(1)

# edge
test(0)      
test(1)      
test(-10)    # Test for negative n
test(3)      # Test for "Fizz"
test(5)      # Test for "Buzz"
test(15)     # Test for "FizzBuzz"

# --- Randomized Stress Tests ---
for _ in range(100):
    random_n = random.randint(1, 500)
    test(random_n)

# If all tests pass, exit with success code
sys.exit(0)