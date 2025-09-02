import sys
import importlib.util
import random

module_name = 'dont_care'
spec = importlib.util.spec_from_file_location(module_name, sys.argv[1])
module = importlib.util.module_from_spec(spec)
sys.modules[module_name] = module
spec.loader.exec_module(module)

def solve_three_sum(nums):
    if len(nums) < 3:
        return []
    
    nums.sort()
    res = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i-1]:
            continue
        
        l, r = i + 1, len(nums) - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s < 0:
                l += 1
            elif s > 0:
                r -= 1
            else:
                res.append([nums[i], nums[l], nums[r]])
                while l < r and nums[l] == nums[l+1]:
                    l += 1
                while l < r and nums[r] == nums[r-1]:
                    r -= 1
                l += 1
                r -= 1
    return res

def normalize_output(triplets):
    """Sorts each triplet and then the list of triplets for consistent comparison."""
    if not triplets:
        return []
    return sorted([sorted(triplet) for triplet in triplets])

def test(nums):
    try:
        expected = solve_three_sum(list(nums))
        result = module.three_sum(list(nums))
        
        # Normalize both outputs before comparing
        normalized_expected = normalize_output(expected)
        normalized_result = normalize_output(result)

        if normalized_result != normalized_expected:
            sys.exit(1)
    except Exception:
        sys.exit(1)

# Hardcoded Edge Cases
test([-1, 0, 1, 2, -1, -4])
test([])
test([0])
test([0, 0, 0])
test([0, 0, 0, 0])
test([-2, 0, 1, 1, 2])

# Randomized Stress Tests
for _ in range(100):
    list_len = random.randint(3, 50)
    random_list = [random.randint(-20, 20) for _ in range(list_len)]
    test(random_list)

sys.exit(0)