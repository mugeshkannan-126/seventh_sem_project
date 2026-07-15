from sqlalchemy import create_engine, text
engine = create_engine("postgresql://postgres.rwoirtxpqihxsaykaqzy:ysE-gL4%26BaTUDsg@aws-1-ap-south-1.pooler.supabase.com:5432/postgres")
with engine.begin() as conn:
    conn.execute(text("ALTER TABLE complaints ADD COLUMN IF NOT EXISTS upvotes BIGINT DEFAULT 0"))
print("Done")
