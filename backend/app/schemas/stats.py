from pydantic import BaseModel, ConfigDict
from app.schemas.complaint import ComplaintResponse


class DepartmentStat(BaseModel):
    name: str
    count: int


class DashboardStats(BaseModel):
    total_complaints: int = 0
    by_status: dict[str, int] = {}
    by_priority: dict[str, int] = {}
    by_department: list[DepartmentStat] = []
    total_users: int = 0
    users_by_role: dict[str, int] = {}
    total_departments: int = 0
    recent_complaints: list[ComplaintResponse] = []

    model_config = ConfigDict(from_attributes=True)
