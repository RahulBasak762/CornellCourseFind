import sqlite3
from sentence_transformers import SentenceTransformer
import pickle
import os

model = SentenceTransformer("avsolatorio/GIST-all-MiniLM-L6-v2",
                            trust_remote_code=True)
model.max_seq_length = 8192


#TODO: fws, subject area (array), course numbhers (min and max), distributions (array), credits (min and max)
def querier(seasonCode, description, minCourseNumber, maxCourseNumber, subjectCodes, distributions, minCredits, maxCredits, requireFWS):

    if os.access("../DjangoReact/CourseFind/Searcher/Data/" + seasonCode + ".db", os.R_OK | os.W_OK):
        print("File is readable and writable")
    else:
        print("Permission issue with the database file")



    conn = sqlite3.connect("/app/Searcher/Data/" + seasonCode + ".db")
    # conn = sqlite3.connect("../DjangoReact/CourseFind/Searcher/Data/" + seasonCode + ".db")
    cursor = conn.cursor()


    cursor.execute("""
        SELECT name 
        FROM sqlite_master 
        WHERE type='table';
    """)

    query = """
    SELECT description_vector, full_name, description, credits, distributions, subject, is_fws, course_number, prerequisites
    FROM courses 
    WHERE course_number >= ? AND course_number <= ?
    """

    vector = model.encode(description, convert_to_numpy = True)

    cursor.execute(query, (minCourseNumber, maxCourseNumber))
    courseList = cursor.fetchall()
    ratedCourses = []
    

    requireFWS = int(requireFWS)

    for i in range(len(courseList)):
        name = courseList[i][1]
        item = pickle.loads(courseList[i][0])
        desc = courseList[i][2]
        credits = courseList[i][3]
        courseDistributions = courseList[i][4]
        subjectCode = courseList[i][5]
        isFWS = courseList[i][6]
        courseNumber = courseList[i][7]
        similarityScore = model.similarity(vector, item).item()
        prereqs = courseList[i][8]

        if (subjectCode in subjectCodes):
            if (creditRangeCheck(credits, float(minCredits), float(maxCredits))):
                if (isFWS >= requireFWS):
                    if(distributions != []):
                        for distribution in distributions:
                            if (distribution in courseDistributions):
                                    ratedCourses.append([name, similarityScore, desc, credits, courseDistributions, subjectCode, courseNumber])
                    else:
                        ratedCourses.append([name, similarityScore, desc, credits, courseDistributions, subjectCode, courseNumber, prereqs])



    ratedCourses = sorted(ratedCourses, key=lambda x: x[1])
    ratedCourses.reverse()


    returnable = []
    contained = {}
    index = 0
    while (len(returnable) < 30 and index < len(ratedCourses) - 1):
        if tuple([ratedCourses[index][2], ratedCourses[index][6]%1000]) in contained.keys():
            returnable[contained[tuple([ratedCourses[index][2], ratedCourses[index][6]%1000])]][0] = ratedCourses[index][5] + " " + str(ratedCourses[index][6]) + "/" + returnable[contained[tuple([ratedCourses[index][2], ratedCourses[index][6]%1000])]][0]
        else:
            returnable.append(ratedCourses[index])
            contained[tuple([ratedCourses[index][2], ratedCourses[index][6]%1000])] = len(returnable) - 1
        
        index += 1

    conn.close()

    return returnable


def creditRangeCheck(credits, minValue, maxValue):
    try:
        floatCredits = float(credits)
        if (floatCredits >= minValue and floatCredits <= maxValue):
            return True
        return False
    except:
        low = float(credits[0 : credits.index("-")])
        high = float(credits[credits.index("-") + 1 : len(credits)])
        return (low <= maxValue and high >= minValue)
    
# querier("SP25", "Machine learning", 0, 9999, "CS", [], 0, 10, False)

