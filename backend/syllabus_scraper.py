import requests
from bs4 import BeautifulSoup
import re
import time
from urllib.parse import urljoin

class CISESyllabusScaper:
    def __init__(self):
        self.syllabus_url = "https://cise.ufl.edu/academics/course-syllabi/"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        # Cache the syllabus page since it doesn't change often
        self._syllabus_cache = None
    
    def get_syllabus_info(self, course_code):
        """Get syllabus link and instructor for a course code"""
        try:
            # Load the syllabus page if not cached
            if self._syllabus_cache is None:
                print(f"Loading syllabus page for {course_code}")
                response = self.session.get(self.syllabus_url, timeout=15)
                response.raise_for_status()
                self._syllabus_cache = BeautifulSoup(response.content, 'html.parser')
                print(f"Syllabus page loaded successfully")
            
            soup = self._syllabus_cache
            
            # Find all tables on the page
            tables = soup.find_all('table')
            print(f"Found {len(tables)} tables on syllabus page")
            
            for table_idx, table in enumerate(tables):
                rows = table.find_all('tr')
                print(f"Table {table_idx} has {len(rows)} rows")
                
                for row_idx, row in enumerate(rows):
                    cells = row.find_all(['td', 'th'])
                    
                    if len(cells) >= 4:  # Need at least Title, Course Number, Section, Instructor
                        # Get the course number cell (column 1)
                        course_number_cell = cells[1] if len(cells) > 1 else None
                        
                        if course_number_cell:
                            course_number_text = course_number_cell.get_text(strip=True)
                            
                            # Check if this row contains our course code
                            # Remove spaces from both for comparison
                            clean_course_number = re.sub(r'\s+', '', course_number_text.upper())
                            clean_search_code = re.sub(r'\s+', '', course_code.upper())
                            
                            if clean_search_code in clean_course_number or clean_course_number == clean_search_code:
                                print(f"Found {course_code} in row {row_idx}")
                                
                                try:
                                    # Extract data based on table structure:
                                    # Column 0: Title (with link embedded)
                                    # Column 1: Course Number  
                                    # Column 2: Section(s)
                                    # Column 3: Instructor
                                    # Column 4: Semester
                                    # Column 5: Year
                                    
                                    title_cell = cells[0]
                                    instructor_cell = cells[3] if len(cells) > 3 else None
                                    
                                    # Get course title - the text is the clickable link
                                    # Look for <a> tag first
                                    link_tag = title_cell.find('a')
                                    course_title = None
                                    syllabus_link = None
                                    
                                    if link_tag:
                                        # Course title is the link text
                                        course_title = link_tag.get_text(strip=True)
                                        href = link_tag.get('href')
                                        
                                        if href:
                                            # Make absolute URL
                                            if href.startswith('http'):
                                                syllabus_link = href
                                            else:
                                                syllabus_link = urljoin(self.syllabus_url, href)
                                            print(f"Found syllabus link: {syllabus_link}")
                                    else:
                                        # No link found, just get the text
                                        course_title = title_cell.get_text(strip=True)
                                    
                                    # Clean up the course title (remove "(click to open)" if present)
                                    if course_title:
                                        course_title = re.sub(r'\s*\(click to open\)\s*', '', course_title, flags=re.IGNORECASE)
                                        course_title = course_title.strip()
                                    
                                    # Get instructor name
                                    instructor_name = "TBD"
                                    if instructor_cell:
                                        instructor_raw = instructor_cell.get_text(strip=True)
                                        if instructor_raw and instructor_raw.lower() != 'tbd':
                                            # Handle "Last, First" format
                                            if ',' in instructor_raw:
                                                parts = instructor_raw.split(',', 1)
                                                if len(parts) == 2:
                                                    first_name = parts[1].strip()
                                                    last_name = parts[0].strip()
                                                    instructor_name = f"{first_name} {last_name}"
                                                else:
                                                    instructor_name = instructor_raw
                                            else:
                                                instructor_name = instructor_raw
                                    
                                    print(f"Extracted - Title: {course_title}, Instructor: {instructor_name}, Link: {syllabus_link}")
                                    
                                    return {
                                        'course_title': course_title,
                                        'instructor': instructor_name,
                                        'syllabus_url': syllabus_link
                                    }
                                    
                                except Exception as e:
                                    print(f"Error parsing row for {course_code}: {str(e)}")
                                    import traceback
                                    traceback.print_exc()
                                    continue
            
            print(f"Course {course_code} not found in any table")
            return None
            
        except Exception as e:
            print(f"Error getting syllabus info for {course_code}: {str(e)}")
            import traceback
            traceback.print_exc()
            return None

# Cache for syllabus data
syllabus_cache = {}

def get_syllabus_info(course_code):
    """Get syllabus information with caching"""
    if course_code in syllabus_cache:
        print(f"Using cached syllabus info for {course_code}")
        return syllabus_cache[course_code]
    
    scraper = CISESyllabusScaper()
    syllabus_info = scraper.get_syllabus_info(course_code)
    
    if syllabus_info:
        syllabus_cache[course_code] = syllabus_info
        # Small delay to be respectful
        time.sleep(0.3)
    
    return syllabus_info

def get_ratemyprofessor_search_url(professor_name):
    """Generate Rate My Professor search URL for a professor"""
    if not professor_name or professor_name == 'TBD':
        return None
    
    # Clean the professor name (remove titles like Dr., Prof., etc.)
    import re
    clean_name = re.sub(r'\b(Dr\.|Prof\.|Professor)\b', '', professor_name, flags=re.IGNORECASE).strip()
    
    # URL encode the name for search
    from urllib.parse import quote
    encoded_name = quote(clean_name)
    
    # Rate My Professor search URL for University of Florida
    # schoolID for UF is 1100
    return f"https://www.ratemyprofessors.com/search/professors/1100?q={encoded_name}"

