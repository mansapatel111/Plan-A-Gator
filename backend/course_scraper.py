import requests
from bs4 import BeautifulSoup
import re
import time
import json
from urllib.parse import urljoin, urlparse
from syllabus_scraper import get_syllabus_info

class UFCourseScraper:
    def __init__(self):
        # Multiple department URLs to search
        self.catalog_urls = {
            'CISE': "https://catalog.ufl.edu/UGRD/courses/computer_and_information_science_and_engineering/",
            'MATH': "https://catalog.ufl.edu/UGRD/courses/mathematics/",
            'EGN': "https://catalog.ufl.edu/UGRD/courses/engineering/",
            'STA': "https://catalog.ufl.edu/UGRD/courses/statistics/",
            'CAP': "https://catalog.ufl.edu/UGRD/courses/computer_and_information_science_and_engineering/",
            'COP': "https://catalog.ufl.edu/UGRD/courses/computer_and_information_science_and_engineering/",
            'CIS': "https://catalog.ufl.edu/UGRD/courses/computer_and_information_science_and_engineering/",
            'MAC': "https://catalog.ufl.edu/UGRD/courses/mathematics/",
            'CAI': "https://catalog.ufl.edu/UGRD/courses/computer_and_information_science_and_engineering/",
        }
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
    
    def get_department_from_course(self, course_code):
        """Extract department prefix from course code"""
        match = re.match(r'^([A-Z]{2,4})', course_code.upper())
        return match.group(1) if match else 'CISE'
    
    def scrape_course_catalog(self, course_code):
        """Scrape course information from UF catalog"""
        department = self.get_department_from_course(course_code)
        
        # Try the specific department first, then fall back to CISE
        urls_to_try = []
        if department in self.catalog_urls:
            urls_to_try.append(self.catalog_urls[department])
        
        # Add CISE as fallback if not already tried
        if department != 'CISE':
            urls_to_try.append(self.catalog_urls['CISE'])
        
        # Try all catalog URLs if specific department not found
        for dept_url in self.catalog_urls.values():
            if dept_url not in urls_to_try:
                urls_to_try.append(dept_url)
        
        course_info = None
        for url in urls_to_try:
            try:
                print(f"Searching for {course_code} in {url}")
                response = self.session.get(url, timeout=10)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                course_info = self._find_course_in_page(soup, course_code)
                
                if course_info:
                    print(f"Found {course_code} in {url}")
                    break
                    
            except Exception as e:
                print(f"Error searching {url} for {course_code}: {str(e)}")
                continue
        
        # Get syllabus info separately
        syllabus_info = get_syllabus_info(course_code)
        
        # Merge the information - prioritize catalog name over syllabus
        if course_info:
            # Add syllabus info but keep catalog name
            if syllabus_info:
                if syllabus_info.get('instructor'):
                    course_info['instructor'] = syllabus_info['instructor']
                if syllabus_info.get('syllabus_url'):
                    course_info['syllabus_url'] = syllabus_info['syllabus_url']
            return course_info
        elif syllabus_info:
            # Only syllabus info available
            return {
                'code': course_code,
                'name': syllabus_info.get('course_title', f"Course {course_code}"),
                'credits': 3,  # Default to 3 credits
                'description': "Course description available through UF catalog.",
                'prerequisites': "",
                'grading_scheme': "Letter Grade",
                'instructor': syllabus_info.get('instructor', 'TBD'),
                'syllabus_url': syllabus_info.get('syllabus_url')
            }
        
        print(f"Course {course_code} not found in any catalog")
        return None
    
    def _find_course_in_page(self, soup, course_code):
        """Find course in the parsed page"""
        # Look for course blocks
        course_blocks = soup.find_all('div', class_='courseblock')
        
        for block in course_blocks:
            course_title = block.find('p', class_='courseblocktitle')
            if not course_title:
                continue
                
            title_text = course_title.get_text(strip=True)
            
            # More flexible matching - remove spaces and compare
            clean_title = re.sub(r'\s+', '', title_text.upper())
            clean_course_code = re.sub(r'\s+', '', course_code.upper())
            
            if clean_course_code in clean_title:
                course_info = self._parse_course_block(block, title_text)
                if course_info:
                    return course_info
        
        return None
    
    def _parse_course_block(self, block, title_text):
        """Parse individual course block"""
        try:
            print(f"Parsing course block with title: {title_text}")
            
            # Extract course code, name, and credits from title
            # Format: "CAI 4104 Machine Learning Engineering (3 Credits)"
            # or: "CAI4104 Machine Learning Engineering3 Credits"
            
            # Try different patterns for course code and name extraction
            patterns = [
                # Pattern 1: "CAI 4104 Machine Learning Engineering (3 Credits)"
                r'([A-Z]{2,4})\s*(\d{4}[A-Z]*)\s+(.+?)\s*\((\d+)\s*Credits?\)',
                # Pattern 2: "CAI4104 Machine Learning Engineering3 Credits"
                r'([A-Z]{2,4})(\d{4}[A-Z]*)\s+(.+?)(\d+)\s*Credits?',
                # Pattern 3: More flexible
                r'([A-Z]{2,4})\s*(\d{4}[A-Z]*)\s*(.+?)\s*(\d+)\s*Credits?'
            ]
            
            course_code = None
            course_name = None
            credits = 3  # Default to 3 credits
            
            for pattern in patterns:
                match = re.search(pattern, title_text, re.IGNORECASE)
                if match:
                    dept = match.group(1)
                    number = match.group(2)
                    course_code = f"{dept}{number}"
                    course_name = match.group(3).strip()
                    # Try to extract credits, but default to 3 if not found or invalid
                    try:
                        extracted_credits = int(match.group(4)) if match.group(4).isdigit() else 3
                        credits = extracted_credits if extracted_credits > 0 else 3
                    except (ValueError, IndexError):
                        credits = 3
                    print(f"Matched pattern: {course_code}, {course_name}, {credits}")
                    break
            
            if not course_code:
                print(f"Could not extract course code from: {title_text}")
                return None
            
            # Extract description and other info
            desc_elem = block.find('div', class_='courseblockdesc') or block.find('p', class_='courseblockdesc')
            description = desc_elem.get_text(strip=True) if desc_elem else ""
            
            # Extract grading scheme
            grading_scheme = "Letter Grade"  # Default
            grading_match = re.search(r'Grading\s+Scheme:\s*([^\n\r]+)', description, re.IGNORECASE)
            if grading_match:
                grading_scheme = grading_match.group(1).strip()
                print(f"Found grading scheme: {grading_scheme}")
            
            # Extract prerequisites
            prereq_text = ""
            prereq_patterns = [
                r'Prerequisite[s]?:\s*([^\n\r\.]+)',
                r'Prereq[s]?:\s*([^\n\r\.]+)',
                r'Prerequisites?[:\s]+([^\n\r\.]+)'
            ]
            
            for pattern in prereq_patterns:
                prereq_match = re.search(pattern, description, re.IGNORECASE)
                if prereq_match:
                    prereq_text = prereq_match.group(1).strip()
                    # Clean up common endings
                    prereq_text = re.sub(r'\.\s*$', '', prereq_text)
                    print(f"Found prerequisites: {prereq_text}")
                    break
            
            # Clean description - remove grading scheme and prerequisites that we extracted separately
            clean_description = description
            if grading_scheme != "Letter Grade":
                clean_description = re.sub(r'Grading\s+Scheme:\s*[^\n\r]+', '', clean_description, flags=re.IGNORECASE)
            if prereq_text:
                clean_description = re.sub(r'Prerequisite[s]?[:\s]*[^\n\r\.]+\.?', '', clean_description, flags=re.IGNORECASE)
            
            # Clean up extra whitespace
            clean_description = re.sub(r'\s+', ' ', clean_description).strip()
            
            result = {
                'code': course_code,
                'name': course_name or f"Course {course_code}",
                'credits': credits,  # Will be 3 by default
                'description': clean_description,
                'prerequisites': prereq_text,
                'grading_scheme': grading_scheme,
                'instructor': "TBD"
            }
            
            print(f"Successfully parsed: {result}")
            return result
            
        except Exception as e:
            print(f"Error parsing course block: {str(e)}")
            import traceback
            traceback.print_exc()
            return None

# Cache to store scraped data
course_cache = {}

def get_course_info(course_code):
    """Get course information with caching"""
    if course_code in course_cache:
        return course_cache[course_code]
    
    scraper = UFCourseScraper()
    course_info = scraper.scrape_course_catalog(course_code)
    
    if course_info:
        course_cache[course_code] = course_info
        # Add delay to be respectful to the server
        time.sleep(0.5)
    else:
        # Cache a basic response for courses we can't find - default to 3 credits
        course_cache[course_code] = {
            'code': course_code,
            'name': f"Course {course_code}",
            'credits': 3,  # Default to 3 credits
            'description': "Course information not available in the catalog.",
            'prerequisites': "Check with academic advisor",
            'grading_scheme': "Letter Grade",
            'instructor': "TBD",
            'syllabus_url': None
        }
    
    return course_cache[course_code]



