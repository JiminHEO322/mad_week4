import pymongo

#접속된 객체를 conn으로 받는다
conn = pymongo.MongoClient("localhost", 27017)

#test 데이터베이스가 없으면 자동으로 생성됩니다.
database = conn.mad_week4
user_collection = database.users
diary_collection = database.diaries