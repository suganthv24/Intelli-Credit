import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

def migrate():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not found")
        return
        
    engine = create_engine(db_url)
    with engine.begin() as conn:
        print("Adding 'organization' column...")
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN organization VARCHAR;"))
        except Exception as e:
            print(f"Already exists or error: {e}")
            
        print("Adding 'role' column...")
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'Credit Analyst';"))
        except Exception as e:
            print(f"Already exists or error: {e}")
            
        print("Adding 'hashed_password' column...")
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN hashed_password VARCHAR;"))
        except Exception as e:
            print(f"Already exists or error: {e}")
            
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
