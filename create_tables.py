#!/usr/bin/env python3
"""
Database table creation script
Run this to create all tables in the database
"""

from database import engine, Base
from models import User, NewsHistory, GeneratedNews
import sys

def create_tables():
    """Create all tables in the database"""
    try:
        print("Creating database tables...")
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        print("✅ All tables created successfully!")
        print("\nCreated tables:")
        print("- users")
        print("- news_history") 
        print("- generated_news")
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        sys.exit(1)

def drop_tables():
    """Drop all tables (use with caution!)"""
    try:
        print("⚠️  Dropping all database tables...")
        
        # Drop all tables
        Base.metadata.drop_all(bind=engine)
        
        print("✅ All tables dropped successfully!")
        
    except Exception as e:
        print(f"❌ Error dropping tables: {e}")
        sys.exit(1)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--drop":
        drop_tables()
    else:
        create_tables() 