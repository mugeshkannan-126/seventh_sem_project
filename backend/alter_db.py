from sqlalchemy import create_engine, text
engine = create_engine("postgresql://postgres.zirpfognpkmsnujygepi:passfordbis123@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres")
with engine.begin() as conn:
    conn.execute(text("ALTER TABLE complaints ADD COLUMN IF NOT EXISTS upvotes BIGINT DEFAULT 0"))
print("Done")
