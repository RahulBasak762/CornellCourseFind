from bs4 import BeautifulSoup
import requests
from sentence_transformers import SentenceTransformer
from playwright.sync_api import sync_playwright
import sqlite3
import os
import pickle

seasonCode = "SP25"  # Set the season for which semester to get information for

def makeDB(seasonCode):
    os.environ["TOKENIZERS_PARALLELISM"] = "false"
    model = SentenceTransformer("avsolatorio/GIST-all-MiniLM-L6-v2",
                                trust_remote_code=True)
    model.max_seq_length = 8192

    # Request the main page for the specified season code and parse the HTML
    mainPage = requests.get("https://classes.cornell.edu/browse/roster/" + seasonCode)
    soup = BeautifulSoup(mainPage.text, "html.parser")

    # Extract subject codes and names from the main page
    subjectCodeTags = soup.findAll("li", attrs={"class": "browse-subjectcode"})
    subjectNameSet = soup.findAll('li', attrs={"class": "browse-subjectdescr"})

    # Initialize dictionaries for subject codes and names
    subjectCodeLines = {}
    subjectNames = {}
    iterator = 0  # Iterator for tracking subject names

    # Populate subjectCodeLines and subjectNames dictionaries
    for line in subjectCodeTags:
        subjectTag = line.find("a")
        subjectName = subjectNameSet[iterator].find("a")
        if subjectTag:
            # Create URL for each subject and map to its name
            subjectCodeLines[subjectTag.text] = (
                        "https://classes.cornell.edu/browse/roster/" + seasonCode + "/subject/" + subjectTag.text)
            subjectNames[subjectTag.text] = subjectName.text
        iterator += 1  # Increment the iterator for the next subject name

    # Organize courses by subject codes into a dictionary
    courses = {}
    for subjectCode in subjectCodeLines.keys():
        tempCourses = []  # Temporary list for storing course codes
        subPage = requests.get(subjectCodeLines[subjectCode])  # Get the subject's webpage
        soup = BeautifulSoup(subPage.text, "html.parser")
        tempCourseNumbers = soup.findAll("div",
                                        attrs={"class": "title-subjectcode"})  # Extract course codes

        # Add course codes to the temporary list for specific subjects
        for classCode in tempCourseNumbers:
            name = str(classCode.getText())
            tempCourses.append(name)
        courses[subjectCode] = tempCourses  # Map subject code to its list of courses

    # Create database connection and schema
    conn = sqlite3.connect(seasonCode + ".db")
    cursor = conn.cursor()

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY,
        full_name TEXT NOT NULL,
        subject TEXT NOT NULL,
        course_number INTEGER NOT NULL,
        description TEXT,
        prerequisites TEXT,
        description_vector BLOB,
        distributions TEXT,
        credits TEXT,
        overall_rating REAL NOT NULL,
        difficulty_rating REAL NOT NULL,
        workload_rating REAL NOT NULL,
        is_fws BOOLEAN NOT NULL,
        is_lad BOOLEAN NOT NULL
    )
    ''')
    conn.commit()

    courseRoster = {}
    courseCreditHours = {}
    courseDistributions = {}
    courseVectors = {}
    courseRatings = {}
    coursePrereqs = {}

    for subjectCode in courses.keys():
        subjectRoster = {}
        subjectCredits = {}
        subjectDistributions = {}
        subjectVectors = {}
        subjectRatings = {}
        subjectPrereqs = {}
        
        for course in courses[subjectCode]:
            # Construct the URL for the specific course's details page
            websiteDomain = (subjectCodeLines[subjectCode][0:47] + "class/" + subjectCode + "/" +
                            course[len(course) - 4: len(course)])
            coursePage = requests.get(websiteDomain)
            soup = BeautifulSoup(coursePage.text, "html.parser")

            # Extract course name
            courseName = soup.find("a", id="dtitle-" + course.replace(" ", ""))
            if courseName:
                courseName = courseName.text.strip()
            else:
                continue  # Skip this course if we can't find its name

            # Extract prerequisites
            prerequisites = ""
            prereq_element = soup.find('span', class_='catalog-prereq')
            if prereq_element:
                prereq_texts = [] 
                for span in prereq_element.find_all('span', class_='catalog-prompt'):
                    if span.next_sibling:
                        prereq_texts.append(span.next_sibling.strip())
                prerequisites = ' '.join(prereq_texts)

            # Extract the course description
            courseDescription = soup.find('p', class_='catalog-descr')
            if courseDescription:
                courseDescription = courseDescription.text.strip()

            # Extract the amount of credit hours
            creditHours = soup.find('span', class_='credit-val')
            if creditHours:
                creditHours = creditHours.text.strip()

            # Extract the distribution categories
            courseDistribution = soup.find('span', class_='catalog-distr')
            if courseDistribution:
                courseDistribution = courseDistribution.text.strip()[22:]
            else:
                courseDistribution = ""

            # Get course ratings
            overallRating = [-1.0, -1.0, -1.0]
            with sync_playwright() as p:
                try:
                    browser = p.chromium.launch(headless=True)
                    page = browser.new_page()
                    page.goto("https://www.cureviews.org/course/" + subjectCode + "/" +
                            course[len(course) - 4: len(course)])
                    page.wait_for_selector("._rating_zvrrc_22", timeout=1000)
                    overallRating = page.query_selector_all("._rating_zvrrc_22")
                    for i in range(3):
                        overallRating[i] = float(overallRating[i].text_content().strip())
                except Exception as e:
                    overallRating = [-1.0, -1.0, -1.0]
                finally:
                    browser.close()

            # Vector creation
            vector = model.encode(course + " | " + courseName + ": " + courseDescription,
                                convert_to_numpy=True)

            # Store all the course information
            course_key = course + " | " + courseName
            subjectRoster[course_key] = courseDescription
            subjectCredits[course_key] = creditHours
            subjectDistributions[course_key] = courseDistribution
            subjectVectors[course_key] = vector
            subjectRatings[course_key] = overallRating
            subjectPrereqs[course_key] = prerequisites
            print(course_key)

        # Store subject information in main dictionaries
        courseRoster[subjectCode] = subjectRoster
        courseCreditHours[subjectCode] = subjectCredits
        courseDistributions[subjectCode] = subjectDistributions
        courseVectors[subjectCode] = subjectVectors
        courseRatings[subjectCode] = subjectRatings
        coursePrereqs[subjectCode] = subjectPrereqs

    # Insert all data into database
    count = 0
    for key in courseRoster.keys():
        for sub_key in courseRoster[key].keys():
            print(sub_key)
            id = count
            full_name = sub_key
            subject = key
            courseNumber = sub_key[sub_key.index(" | ") - 4 : sub_key.index(" | ")]
            description = courseRoster[key][sub_key]
            prerequisites = coursePrereqs[key][sub_key]
            vector_blob = pickle.dumps(courseVectors[key][sub_key])
            distributions = courseDistributions[key][sub_key]
            credits = courseCreditHours[key][sub_key]
            overallRating = courseRatings[key][sub_key][0]
            difficultyRating = courseRatings[key][sub_key][1]
            workloadRating = courseRatings[key][sub_key][2]
            fws = ("FWS" in sub_key)
            lad = ("CA" in distributions or "LA" in distributions or "LAD" in distributions
                or "ALC" in distributions or "SCD" in distributions or "HA" in distributions
                or "HST" in distributions or "KCM" in distributions or "ETM" in distributions
                or "SBA" in distributions or "SSC" in distributions or "GLC" in distributions
                or "FL" in distributions or "CE" in distributions)
            count += 1

            cursor.execute('''
                INSERT INTO courses (id, full_name, subject, course_number, description, 
                prerequisites, description_vector, distributions, credits, overall_rating, 
                difficulty_rating, workload_rating, is_fws, is_lad) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                (id, full_name, subject, courseNumber, description, prerequisites,
                vector_blob, distributions, credits, overallRating, difficultyRating,
                workloadRating, fws, lad))
            conn.commit()
    conn.close()

makeDB(seasonCode)