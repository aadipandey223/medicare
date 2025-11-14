from sqlalchemy import create_engine, text

engine = create_engine('sqlite:///medicare.db')
with engine.connect() as conn:
    try:
        conn.execute(text('ALTER TABLE doctors ADD COLUMN bio VARCHAR(500)'))
        conn.commit()
        print('✅ Bio column added successfully')
    except Exception as e:
        if 'duplicate column name' in str(e).lower():
            print('ℹ️  Bio column already exists')
        else:
            print(f'❌ Error: {e}')
