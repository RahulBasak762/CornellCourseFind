import sqlite3
from sentence_transformers import SentenceTransformer
import pickle
import os

model = SentenceTransformer("Alibaba-NLP/gte-Qwen2-1.5B-instruct",
                            trust_remote_code=True)
model.max_seq_length = 8192


#TODO: fws, subject area (array), course numbhers (min and max), distributions (array), credits (min and max)
def querier(seasonCode, description):
    conn = sqlite3.connect("../CourseFind/Searcher/Data/" + seasonCode + ".db")

    # Create a cursor object
    cursor = conn.cursor()

    #TESTING
    cursor.execute("""
        SELECT name 
        FROM sqlite_master 
        WHERE type='table';
    """)


    # Fetch all table names
    tables = cursor.fetchall()
    print(tables)


    vector = model.encode(description, convert_to_numpy = True)

    query = "SELECT description_vector, full_name, description FROM courses"

    cursor.execute(query)
    courseList = cursor.fetchall()
    ratedCourses = []

    for i in range(len(courseList)):
        name = courseList[i][1]
        item = pickle.loads(courseList[i][0])
        desc = courseList[i][2]
        similarityScore = model.similarity(vector, item).item()
        ratedCourses.append([name, similarityScore, desc])


    ratedCourses = sorted(ratedCourses, key=lambda x: x[1])
    ratedCourses.reverse()
    ratedCourses = ratedCourses[0:49]

    print("Classes most similar to: " + description)

    for i in range(30):
        print(str(ratedCourses[i][1]) + ": " + str(ratedCourses[i][0]))

    conn.close()

    return ratedCourses


#querier("SU24", "Machine Learning")
# db_path = os.path.abspath("../Searcher/Data/SU24.db")
# print(db_path)  # Debug the constructed path

