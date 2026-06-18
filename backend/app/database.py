from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client: AsyncIOMotorClient = None
db = None


async def connect_to_mongo():
    global client, db
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.database_name]
    # Create indexes
    await create_indexes()
    print(f"Connected to MongoDB: {settings.database_name}")


async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("MongoDB connection closed")


async def create_indexes():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("roll_number", sparse=True)
    await db.users.create_index("employee_id", sparse=True)
    await db.attendance.create_index([("student_id", 1), ("date", 1)])
    await db.attendance.create_index("date")
    await db.assignments.create_index("teacher_id")
    await db.assignments.create_index("class_id")
    await db.notifications.create_index("user_id")
    await db.notifications.create_index("created_at")
    await db.fees.create_index("student_id")
    await db.leaves.create_index("student_id")
    await db.notices.create_index("created_at")
    await db.audit_logs.create_index("timestamp")
    await db.audit_logs.create_index("user_id")


def get_db():
    return db
