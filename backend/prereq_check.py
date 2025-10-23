from typing import List, Set, Dict
from requirements import PREREQ_MAP

# fnction to format codes incase they have a space in between so its just all together
def format_codes(codes: List[str]) -> List[str]:
    if not codes:
        return []
    empty = []
    for i in codes:
        if not i:
            continue
        empty.append(i.replace(" ", "").upper())
    reviewed = set()
    unique_codes = []
    for i in empty:
        if i not in unique_codes:
            unique_codes.append(i)
    return unique_codes

# helper to format uploaded list
def has_taken(user_codes: List[str]) -> List[str]:
    return format_codes(user_codes)

# returns true only if user has taken all prereqs for given course code
# course_code is the course code checking
# first want to format then look up prereqs then check prereqs have been met
def verify_prereq_code(user_codes_set: Set[str], course_code: str) -> bool:
    if not course_code:
        return False
    
    target = course_code.replace(" ", "").upper()
    needs_prereq = [i.upper() for i in PREREQ_MAP.get(target, [])]
    if not needs_prereq:
        return True
    for requirement in needs_prereq:
        if requirement not in user_codes_set:
            return False
    return True
