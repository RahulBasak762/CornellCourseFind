import sqlite3
from sentence_transformers import SentenceTransformer
import pickle
import os

model = SentenceTransformer("Alibaba-NLP/gte-Qwen2-1.5B-instruct",
                            trust_remote_code=True)
model.max_seq_length = 8192


#TODO: fws, subject area (array), course numbhers (min and max), distributions (array), credits (min and max)
def querier(seasonCode, description, minCourseNumber, maxCourseNumber, subjectCodes, distributions):
    print()
    print("subjectCodes: " + str(subjectCodes[0]))
    print("distributions: " + str(distributions[0]))
    
    print(1)
    conn = sqlite3.connect("../CourseFind/Searcher/Data/" + seasonCode + ".db")
    print(2)
    # Create a cursor object
    cursor = conn.cursor()


    #TESTING
    cursor.execute("""
        SELECT name 
        FROM sqlite_master 
        WHERE type='table';
    """)
    print(3)

    vector = model.encode(description, convert_to_numpy = True)

    print(4)

    query = """
    SELECT description_vector, full_name, description, credits, distributions, subject 
    FROM courses 
    WHERE course_number >= ? AND course_number <= ?
    """


    cursor.execute(query, (minCourseNumber, maxCourseNumber))
    courseList = cursor.fetchall()
    ratedCourses = []

    print(5)

    

    for i in range(len(courseList)):
        name = courseList[i][1]
        item = pickle.loads(courseList[i][0])
        desc = courseList[i][2]
        credits = courseList[i][3]
        courseDistributions = courseList[i][4]
        subjectCode = courseList[i][5]
        similarityScore = model.similarity(vector, item).item()
        if (subjectCode in subjectCodes):
            print(name)
            for distribution in distributions:
                print(distribution)
                print(courseDistributions)
                print()
                if (distribution in courseDistributions):
                    ratedCourses.append([name, similarityScore, desc, credits, courseDistributions, subjectCode])

    print(6)


    ratedCourses = sorted(ratedCourses, key=lambda x: x[1])
    ratedCourses.reverse()
    ratedCourses = ratedCourses[0:49]
    # print(ratedCourses)

    # finalRatedCourses = []

    # for i in range(len(ratedCourses)):
    #     for j in range(len(distributions)):
    #         if (ratedCourses[i][5] in subjectCodes):
    #             print(ratedCourses[i][0])
    #             print("Distributions: " + distributions[j])
    #             print("Course distributions: " + ratedCourses[i][4])
    #             print()
    #             if (distributions[j] in ratedCourses[i][4]):
    #                 finalRatedCourses.append(ratedCourses[i])

    print("Classes most similar to: " + description)

    conn.close()

    return ratedCourses



