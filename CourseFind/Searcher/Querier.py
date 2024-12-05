import sqlite3
from sentence_transformers import SentenceTransformer
import pickle
import os

model = SentenceTransformer("Alibaba-NLP/gte-Qwen2-1.5B-instruct",
                            trust_remote_code=True)
model.max_seq_length = 8192


#TODO: fws, subject area (array), course numbhers (min and max), distributions (array), credits (min and max)
def querier(seasonCode, description):
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

    query = "SELECT description_vector, full_name, description, credits, distributions FROM courses"

    cursor.execute(query)
    courseList = cursor.fetchall()
    ratedCourses = []

    print(5)

    for i in range(len(courseList)):
        name = courseList[i][1]
        item = pickle.loads(courseList[i][0])
        desc = courseList[i][2]
        credits = courseList[i][3]
        distributions = courseList[i][4]
        similarityScore = model.similarity(vector, item).item()
        ratedCourses.append([name, similarityScore, desc, credits, distributions])

    print(6)


    ratedCourses = sorted(ratedCourses, key=lambda x: x[1])
    ratedCourses.reverse()
    ratedCourses = ratedCourses[0:49]

    print(7)

    print("Classes most similar to: " + description)

    # for i in range(30):
    #     print(str(ratedCourses[i][1]) + ": " + str(ratedCourses[i][0]))

    conn.close()

    return ratedCourses



