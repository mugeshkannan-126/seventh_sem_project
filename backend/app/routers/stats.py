from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.complaint import Complaint, ComplaintStatusEnum, ComplaintPriorityEnum
from app.models.user import User, UserRoleEnum
from app.models.department import Department
from app.schemas.stats import DashboardStats, DepartmentStat
from app.schemas.response import StandardResponse

router = APIRouter(prefix="/stats", tags=["Stats"])


@router.get("/dashboard", response_model=StandardResponse[DashboardStats])
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Retrieve aggregated dashboard statistics for the admin portal.
    Returns complaint counts by status/priority/department, user counts by role,
    and the 5 most recent complaints.
    """
    # Total complaints
    total_complaints = db.query(func.count(Complaint.complaint_id)).scalar() or 0

    # Complaints by status
    status_rows = (
        db.query(Complaint.status, func.count(Complaint.complaint_id))
        .group_by(Complaint.status)
        .all()
    )
    by_status = {row[0].value if row[0] else "Unknown": row[1] for row in status_rows}

    # Complaints by priority
    priority_rows = (
        db.query(Complaint.priority, func.count(Complaint.complaint_id))
        .group_by(Complaint.priority)
        .all()
    )
    by_priority = {row[0].value if row[0] else "Unknown": row[1] for row in priority_rows}

    # Complaints by department
    dept_rows = (
        db.query(Department.department_name, func.count(Complaint.complaint_id))
        .join(Complaint, Complaint.department_id == Department.department_id, isouter=True)
        .group_by(Department.department_name)
        .all()
    )
    by_department = [DepartmentStat(name=row[0], count=row[1]) for row in dept_rows]

    # Total users
    total_users = db.query(func.count(User.user_id)).scalar() or 0

    # Users by role
    role_rows = (
        db.query(User.role, func.count(User.user_id))
        .group_by(User.role)
        .all()
    )
    users_by_role = {row[0].value if row[0] else "Unknown": row[1] for row in role_rows}

    # Total departments
    total_departments = db.query(func.count(Department.department_id)).scalar() or 0

    # Recent 5 complaints
    recent = (
        db.query(Complaint)
        .order_by(Complaint.created_at.desc())
        .limit(5)
        .all()
    )

    stats = DashboardStats(
        total_complaints=total_complaints,
        by_status=by_status,
        by_priority=by_priority,
        by_department=by_department,
        total_users=total_users,
        users_by_role=users_by_role,
        total_departments=total_departments,
        recent_complaints=recent,
    )

    return StandardResponse(
        success=True,
        message="Dashboard stats retrieved successfully.",
        data=stats,
    )
