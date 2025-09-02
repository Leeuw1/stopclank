import sys
import importlib.util
import random

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
module.ListNode = ListNode
sys.modules[module_name] = module
spec.loader.exec_module(module)

def solve_merge_k_lists(lists):
    all_nodes = []
    for l in lists:
        all_nodes.extend(l)
    return sorted(all_nodes)

def test(lists_of_lists):
    try:
        # Convert list of lists to list of ListNode heads
        ll_heads = [list_to_ll(l) for l in lists_of_lists]
        
        expected = solve_merge_k_lists(lists_of_lists)
        result_ll = module.merge_k_lists(ll_heads)
        result = ll_to_list(result_ll)

        if result != expected:
            sys.exit(1)
    except Exception:
        sys.exit(1)

# Hardcoded Edge Cases
test([[1,4,5],[1,3,4],[2,6]])
test([])
test([[]])
test([[], [1]])
test([[1,2,3], [], [4,5]])

# Randomized Stress Tests
for _ in range(50):
    num_lists = random.randint(1, 10)
    random_lists = []
    for i in range(num_lists):
        list_len = random.randint(0, 20)
        random_lists.append(sorted([random.randint(0, 100) for _ in range(list_len)]))
    test(random_lists)

sys.exit(0)