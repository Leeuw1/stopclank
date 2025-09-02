import sys
import importlib.util

# --- ListNode Helper Code ---
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def list_to_ll(arr):
    if not arr:
        return None
    head = ListNode(arr[0])
    current = head
    for val in arr[1:]:
        current.next = ListNode(val)
        current = current.next
    return head

def ll_to_list(node):
    arr = []
    while node:
        arr.append(node.val)
        node = node.next
    return arr
# --- End Helper Code ---

module_name = 'dont_care'
spec = importlib.util.spec_from_file_location(module_name, sys.argv[1])
module = importlib.util.module_from_spec(spec)
# Inject the ListNode class into the user's module so they can use it
module.ListNode = ListNode
sys.modules[module_name] = module
spec.loader.exec_module(module)

def solve_add_two_numbers(l1_arr, l2_arr):
    num1 = int("".join(map(str, reversed(l1_arr))))
    num2 = int("".join(map(str, reversed(l2_arr))))
    total = num1 + num2
    if total == 0:
        return [0]
    return [int(digit) for digit in reversed(str(total))]

def test(l1_arr, l2_arr):
    try:
        l1 = list_to_ll(l1_arr)
        l2 = list_to_ll(l2_arr)
        
        expected = solve_add_two_numbers(l1_arr, l2_arr)
        result_ll = module.add_two_numbers(l1, l2)
        result = ll_to_list(result_ll)

        if result != expected:
            sys.exit(1)
    except Exception:
        sys.exit(1)

# Hardcoded Edge Cases
test([2,4,3], [5,6,4])
test([0], [0])
test([9,9,9,9,9,9,9], [9,9,9,9])
test([1], [9,9,9])

sys.exit(0)