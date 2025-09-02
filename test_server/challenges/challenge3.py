import sys
import importlib.util
import random

module_name = 'dont_care'
spec = importlib.util.spec_from_file_location(module_name, sys.argv[1])
module = importlib.util.module_from_spec(spec)
sys.modules[module_name] = module
spec.loader.exec_module(module)

def solve_roman_to_integer(s: str) -> int:
    roman_map = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}
    n = len(s)
    num = roman_map[s[n-1]]
    for i in range(n-2, -1, -1):
        if roman_map[s[i]] >= roman_map[s[i+1]]:
            num += roman_map[s[i]]
        else:
            num -= roman_map[s[i]]
    return num

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

def test(s):
    try:
        expected = solve_roman_to_integer(s)
        result = module.roman_to_integer(s)
        if result != expected:
            sys.exit(1)
    except Exception:
        sys.exit(1)

# Hardcoded Edge Cases
test("I")
test("III")
test("IV")
test("IX")
test("LVIII")
test("MCMXCIV")
test("MMMCMXCIX")

# Randomized Stress Tests
for _ in range(200):
    random_num = random.randint(1, 3999)
    roman_string = solve_integer_to_roman(random_num)
    test(roman_string)

sys.exit(0)