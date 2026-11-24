
from pydantic import BaseModel, ConfigDict, Field


class StatusStat(BaseModel):
    status: str
    count: int = Field(ge=0)


class CategoryStat(BaseModel):
    category: str
    count: int = Field(ge=0)


class DepartmentStat(BaseModel):
    department: str
    count: int = Field(ge=0)


class MonthlyStat(BaseModel):
    month: str = Field(pattern=r"^\d{4}-(0[1-9]|1[0-2])$")
    count: int = Field(ge=0)


class DashboardOverview(BaseModel):
    total_issues: int = Field(ge=0)
    status_breakdown: list[StatusStat]
    category_breakdown: list[CategoryStat]
    department_breakdown: list[DepartmentStat]
    monthly_trend: list[MonthlyStat]

    model_config = ConfigDict(from_attributes=True)

class DashboardMapPoint(BaseModel):
    id: int
    title: str
    category: str
    priority: str
    status: str
    latitude: float
    longitude: float
    address: str | None = None
    image_url: str | None = None

    model_config = ConfigDict(from_attributes=True)


class DashboardGeospatialResponse(BaseModel):
    total_issues: int = Field(ge=0)
    mapped_issues: int = Field(ge=0)
    unmapped_issues: int = Field(ge=0)
    points: list[DashboardMapPoint]
