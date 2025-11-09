from models import Base
from sqlalchemy import create_engine
import os

# Use the same DATABASE_URL as your app
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///medicare.db")
engine = create_engine(DATABASE_URL, future=True)

if __name__ == "__main__":
    print("Creating all tables...")
    Base.metadata.create_all(engine)
    print("✅ Database initialized!")
