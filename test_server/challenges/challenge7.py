import sys
import importlib.util
import random

module_name = 'dont_care'
spec = importlib.util.spec_from_file_location(module_name, sys.argv[1])
module = importlib.util.module_from_spec(spec)
sys.modules[module_name] = module
spec.loader.exec_module(module)

def solve_number_to_words(num: int) -> str:
    if num == 0:
        return "Zero"

    to_19 = 'One Two Three Four Five Six Seven Eight Nine Ten Eleven Twelve ' \
            'Thirteen Fourteen Fifteen Sixteen Seventeen Eighteen Nineteen'.split()
    tens = 'Twenty Thirty Forty Fifty Sixty Seventy Eighty Ninety'.split()
    
    def words(n):
        if n < 20:
            return to_19[n-1:n]
        if n < 100:
            return [tens[n//10-2]] + words(n%10)
        if n < 1000:
            return [to_19[n//100-1]] + ['Hundred'] + words(n%100)
        for p, w in enumerate(('Thousand', 'Million', 'Billion'), 1):
            if n < 1000**(p+1):
                return words(n//1000**p) + [w] + words(n%1000**p)

    return ' '.join(words(num)) or 'Zero'

def test(n):
    try:
        expected = solve_number_to_words(n)
        result = module.number_to_words(n)
        if result != expected:
            sys.exit(1)
    except Exception:
        sys.exit(1)

# Hardcoded Edge Cases
test(0)
test(1)
test(19)
test(20)
test(100)
test(101)
test(123)
test(1000)
test(10000)
test(12345)
test(1234567)
test(1000000000)
test(2147483647) # Max 32-bit signed integer

# Randomized Stress Tests
for _ in range(100):
    random_n = random.randint(0, 2147483647)
    test(random_n)

sys.exit(0)