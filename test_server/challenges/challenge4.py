import sys
import importlib.util
import random

module_name = 'dont_care'
spec = importlib.util.spec_from_file_location(module_name, sys.argv[1])
module = importlib.util.module_from_spec(spec)
sys.modules[module_name] = module
spec.loader.exec_module(module)

def solve_integer_to_roman(num: int) -> str:
    val_map = [
        (1000, "M"), (900, "CM"), (500, "D"), (400, "CD"),
        (100, "C"), (90, "XC"), (50, "L"), (40, "XL"),
        (10, "X"), (9, "IX"), (5, "V"), (4, "IV"),
        (1, "I")
    ]
    roman_str = ""
    for val, sym in val_map:
        while num >= val:
            roman_str += sym
            num -= val
    return roman_str

def test(n):
    try:
        expected = solve_integer_to_roman(n)
        result = module.integer_to_roman(n)
        if result != expected:
            sys.exit(1)
    except Exception:
        sys.exit(1)

# Hardcoded Edge Cases
test(1)
test(3)
test(4)
test(9)
test(58)
test(1994)
test(3999)

# Randomized Stress Tests
for _ in range(200):
    random_n = random.randint(1, 3999)
    test(random_n)

sys.exit(0)