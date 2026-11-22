
from sqlalchemy import Column, Integer, String, Text, Boolean
from database.db_connection import Base


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    contact_email = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
