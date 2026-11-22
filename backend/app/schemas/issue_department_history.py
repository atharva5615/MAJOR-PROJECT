
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DepartmentHistoryResponse(BaseModel):
    id: int
    issue_id: int

    old_department_id: int | None
    old_department_name: str | None

    new_department_id: int
    new_department_name: str

    assigned_by: int
    officer_name: str

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
