from app.database import SessionLocal
from app.models import (
    Department,
    User,
    Complaint,
    ComplaintImage,
    Assignment,
    StatusHistory,
    Notification,
    Feedback,
)
from app.models.complaint import ComplaintUpvote

db = SessionLocal()
print(f"Departments: {db.query(Department).count()}")
print(f"Users: {db.query(User).count()}")
for r in ["Citizen", "Official", "Engineer", "Admin"]:
    print(f"  - {r}: {db.query(User).filter(User.role == r).count()}")
print(f"Complaints: {db.query(Complaint).count()}")
print(f"Complaint Images: {db.query(ComplaintImage).count()}")
print(f"Assignments: {db.query(Assignment).count()}")
print(f"Status Histories: {db.query(StatusHistory).count()}")
print(f"Notifications: {db.query(Notification).count()}")
print(f"Feedbacks: {db.query(Feedback).count()}")
print(f"Upvotes: {db.query(ComplaintUpvote).count()}")

print("\n--- Current Users ---")
for u in db.query(User).all():
    print(f"ID={u.user_id}, Name={u.name}, Role={u.role}, DeptID={u.department_id}, Email={u.email}")

print("\n--- Current Departments ---")
for d in db.query(Department).all():
    print(f"ID={d.department_id}, Name={d.department_name}")

db.close()
