import os
from sqlalchemy import create_engine, inspect
from dotenv import load_dotenv

load_dotenv()

def check_schema():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not found in .env")
        return
        
    engine = create_engine(db_url)
    inspector = inspect(engine)
    columns = inspector.get_columns("users")
    print("Columns in 'users' table:")
    for col in columns:
        print(f"- {col['name']} ({col['type']})")

if __name__ == "__main__":
    check_schema()
