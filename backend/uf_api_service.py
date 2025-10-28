"""
UF API Service for fetching real course schedules and information.

This service integrates with:
1. UF Schedule of Courses API for real meeting times
2. UF Course Catalog for descriptions
3. CISE syllabus repository
"""
import requests
import re
from typing import Dict, List, Optional

UF_API_BASE = "https://one.ufl.edu/apix/soc/schedule"

def get_course_sections(course_code: str, term: str = "2251") -> List[Dict]:
    """
    Fetch course sections from UF API for a given course code.
    
    Args:
        course_code: Course code like "COP3502C" or "COP 3502C"
        term: Term code (default: 2251 for Spring 2025)
              Format: YYS where YY=year, S=semester (1=Spring, 5=Summer, 8=Fall)
    
    Returns:
        List of section dictionaries with meeting times
    """
    # Normalize course code (remove spaces, uppercase)
    normalized_code = re.sub(r'\s+', '', course_code).upper()
    
    # Extract department and number (e.g., COP3502C -> COP and 3502C)
    match = re.match(r'^([A-Z]{3})(\d{4}[A-Z]?)$', normalized_code)
    if not match:
        return []
    
    dept_code = match.group(1)
    course_num = match.group(2)
    
    try:
        # Query UF API
        params = {
            'category': 'CWSP',  # Course Work Service Provider
            'term': term,
            'dept': dept_code,
            'course-code': course_num
        }
        
        response = requests.get(UF_API_BASE, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        # Extract sections with meeting times
        sections = []
        if isinstance(data, list):
            for course_data in data:
                if 'sections' in course_data:
                    for section in course_data['sections']:
                        section_info = parse_section(section, course_code)
                        if section_info:
                            sections.append(section_info)
        
        return sections
    
    except Exception as e:
        print(f"Error fetching course {course_code}: {str(e)}")
        return []


def parse_section(section: Dict, course_code: str) -> Optional[Dict]:
    """
    Parse a section from UF API response.
    
    Returns:
        Dictionary with section info or None if no meeting times
    """
    if not section.get('meetTimes'):
        return None
    
    meet_times = section['meetTimes'][0]  # Use first meeting time pattern
    
    # Parse meeting days
    days_map = {
        'M': 'Monday',
        'T': 'Tuesday',
        'W': 'Wednesday',
        'R': 'Thursday',
        'F': 'Friday'
    }
    
    meet_days_str = meet_times.get('meetDays', '')
    days = [days_map[d] for d in meet_days_str if d in days_map]
    
    if not days:
        return None
    
    # Parse times
    time_begin = meet_times.get('meetTimeBegin')
    time_end = meet_times.get('meetTimeEnd')
    
    if not time_begin:
        return None
    
    # Format time (e.g., "0935" -> "9:35 AM")
    start_time = format_time(time_begin)
    end_time = format_time(time_end) if time_end else None
    
    return {
        'course_code': course_code,
        'section': section.get('classNumber', ''),
        'instructor': ', '.join(section.get('instructors', [])) or 'TBD',
        'days': days,
        'start_time': start_time,
        'end_time': end_time,
        'building': meet_times.get('meetBuilding', 'TBD'),
        'room': meet_times.get('meetRoom', ''),
        'credits': section.get('credits', 3)
    }


def format_time(time_str: str) -> str:
    """
    Convert UF API time format (HHMM) to readable format.
    Example: "0935" -> "9:35 AM", "1430" -> "2:30 PM"
    """
    if not time_str or len(time_str) < 4:
        return ""
    
    hour = int(time_str[:2])
    minute = time_str[2:4]
    
    period = "AM" if hour < 12 else "PM"
    if hour > 12:
        hour -= 12
    elif hour == 0:
        hour = 12
    
    return f"{hour}:{minute} {period}"


def get_course_description(course_code: str) -> str:
    """
    Generate course catalog URL for description.
    
    Args:
        course_code: Course code like "COP3502C"
    
    Returns:
        URL to course catalog page
    """
    # Normalize course code
    normalized = re.sub(r'\s+', '', course_code).upper()
    match = re.match(r'^([A-Z]{3})(\d{4}[A-Z]?)$', normalized)
    
    if not match:
        return ""
    
    dept = match.group(1)
    number = match.group(2)
    
    # Map department codes to catalog paths
    dept_map = {
        'COP': 'computer_and_information_science_and_engineering',
        'CDA': 'computer_and_information_science_and_engineering',
        'CIS': 'computer_and_information_science_and_engineering',
        'COT': 'computer_and_information_science_and_engineering',
        'CAP': 'computer_and_information_science_and_engineering',
        'CEN': 'computer_and_information_science_and_engineering',
        'CNT': 'computer_and_information_science_and_engineering',
        'CGS': 'computer_and_information_science_and_engineering',
        'MAC': 'mathematics',
        'MAS': 'mathematics',
        'MAP': 'mathematics',
        'STA': 'statistics',
        'PHY': 'physics',
        'ENC': 'english',
        'EGN': 'engineering',
        'EEL': 'electrical_and_computer_engineering',
        'PHI': 'philosophy'
    }
    
    dept_path = dept_map.get(dept, dept.lower())
    
    return f"https://catalog.ufl.edu/UGRD/courses/{dept_path}/"


def get_syllabus_url(course_code: str) -> str:
    """
    Generate CISE syllabus URL.
    
    Args:
        course_code: Course code like "COP3502C"
    
    Returns:
        URL to CISE syllabus page
    """
    # Check if it's a CISE course
    cise_depts = ['COP', 'CDA', 'CIS', 'COT', 'CAP', 'CEN', 'CNT', 'CGS']
    normalized = re.sub(r'\s+', '', course_code).upper()
    
    if any(normalized.startswith(dept) for dept in cise_depts):
        return "https://cise.ufl.edu/academics/course-syllabi/"
    
    return ""