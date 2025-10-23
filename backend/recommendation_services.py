from typing import List, Dict, Union
from requirements import REQUIREMENTS
from prereq_check import has_taken, verify_prereq_code

'''
returns all courses in a given category that user hasnt taken yet
handles single courses and choice like if u can take either ENC 2256 or ENC 3246
'''

# get all courses for college and category
def courses_eligible(user_codes_set, college: str, category: str) -> List[str]:
    records = REQUIREMENTS.get(college, {}).get(category, [])
    remaining = []

    for i in records:
        if isinstance(i, list):
            has_any = False
            for check in i:
                if check.upper() in user_codes_set:
                    has_any = True
                    break
            if not has_any:
                for check in i:
                    code = check.upper()
                    if code not in user_codes_set:
                        remaining.append(code)
        else:
            code = i.upper()
            if code not in user_codes_set:
                remaining.append(code)
    
    # removing duplicates
    reviewed = set()
    unique_codes = []
    for i in remaining:
        if i not in reviewed:
            reviewed.add(i)
            unique_codes.append(i)
    return unique_codes

'''
recommendation service, first checks if category is provided
if category is provided then returns up to 4 recs in that category
if category not specified then returns a dict w 2 recs from each category
'''
def recommend_courses(
        college: str, transcipt_codes: List[str], category: str | None = None, per_category_limit: int = 2, category_limit: int = 4) -> Union[List[str], Dict[str, List[str]]]:
        user_codes = set(has_taken(transcipt_codes))

        # if one category specified
        if category:
            choices = courses_eligible(user_codes, college, category)
            selection = []
            for code in choices:
                if verify_prereq_code(user_codes, code):
                    selection.append(code)
                if len(selection) >= category_limit:
                    break
            return selection
        
        result: Dict[str, List[str]] = {}
        for cat in ["Core", "GenEd", "Elective/eligible"]:
            choices = courses_eligible(user_codes, college, cat)
            selection = []
            for code in choices:
                if verify_prereq_code(user_codes, code):
                    selection.append(code)
                if len(selection) >= per_category_limit:
                    break
            result[cat] = selection
        return result
