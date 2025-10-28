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
                        # Get text from each cell
                        cell_texts = [cell.get_text(strip=True) for cell in cells]
                        
                        # Check if this row contains our course code
                        row_text = ' '.join(cell_texts).upper()
                        
                        if course_code.upper() in row_text:
                            print(f"Found {course_code} in row {row_idx}: {cell_texts}")
                            
                            try:
                                # Extract data based on table structure:
                                # Column 0: Title (with link)
                                # Column 1: Course Number  
                                # Column 2: Section(s)
                                # Column 3: Instructor
                                # Column 4: Semester
                                # Column 5: Year
                                
                                title_cell = cells[0]
                                course_number_cell = cells[1] if len(cells) > 1 else None
                                instructor_cell = cells[3] if len(cells) > 3 else None
                                
                                # Get course title and syllabus link
                                course_title = title_cell.get_text(strip=True)
                                syllabus_link = None
                                
                                # Look for link in title cell
                                link_tag = title_cell.find('a', href=True)
                                if link_tag:
                                    href = link_tag.get('href')
                                    if href:
                                        # Make absolute URL
                                        if href.startswith('http'):
                                            syllabus_link = href
                                        else:
                                            syllabus_link = urljoin(self.syllabus_url, href)
                                        print(f"Found syllabus link: {syllabus_link}")
                                
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
                                continue
            
            print(f"Course {course_code} not found in any table")
            return None
            
        except Exception as e:
            print(f"Error getting syllabus info for {course_code}: {str(e)}")
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