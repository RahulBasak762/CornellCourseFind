import sqlite3
from sentence_transformers import SentenceTransformer
import pickle
import os

model = SentenceTransformer("Alibaba-NLP/gte-Qwen2-1.5B-instruct",
                            trust_remote_code=True)
model.max_seq_length = 8192


#TODO: fws, subject area (array), course numbhers (min and max), distributions (array), credits (min and max)
def querier(seasonCode, description, minCourseNumber, maxCourseNumber, subjectCodes, distributions, minCredits, maxCredits, requireFWS):

    
    print(1)
    conn = sqlite3.connect("../CourseFind/Searcher/Data/" + seasonCode + ".db")
    print(2)
    cursor = conn.cursor()


    cursor.execute("""
        SELECT name 
        FROM sqlite_master 
        WHERE type='table';
    """)

    query = """
    SELECT description_vector, full_name, description, credits, distributions, subject, is_fws
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
        print(name)
        print(credits)
        courseDistributions = courseList[i][4]
        subjectCode = courseList[i][5]
        isFWS = courseList[i][6]
        similarityScore = model.similarity(vector, item).item()
        if (subjectCode in subjectCodes):
            if (creditRangeCheck(credits, float(minCredits), float(maxCredits))):
                if (isFWS >= requireFWS):
                    if(distributions != []):
                        for distribution in distributions:
                            if (distribution in courseDistributions):
                                    ratedCourses.append([name, similarityScore, desc, credits, courseDistributions, subjectCode,])
                    else:
                        ratedCourses.append([name, similarityScore, desc, credits, courseDistributions, subjectCode,])



    ratedCourses = sorted(ratedCourses, key=lambda x: x[1])
    ratedCourses.reverse()
    ratedCourses = ratedCourses[0:49]

    print("Classes most similar to: " + description)

    conn.close()

    return ratedCourses




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

print(creditRangeCheck("2-8", 6, 7))
