"""
AI Context Usage Tracking Model
"""
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from backend.config.database import Base


class AIContextUsage(Base):
    """Track AI context usage"""
    __tablename__ = "ai_context_usage"

    id = Column(Integer, primary_key=True, autoincrement=True)
    generation_id = Column(Integer, nullable=False)
    context_type = Column(String, nullable=False)  # 'package_doc', 'example', 'best_practice'
    resource_name = Column(String, nullable=False)
    requested_at = Column(DateTime, default=func.now())

    def __repr__(self):
        return f"<AIContextUsage(id={self.id}, type='{self.context_type}', resource='{self.resource_name}')>"
