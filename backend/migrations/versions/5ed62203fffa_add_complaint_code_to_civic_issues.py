
"""add complaint code to civic issues

Revision ID: 5ed62203fffa
Revises: 1964d8456f7b
Create Date: 2026-11-16 19:34:05.630965

"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "5ed62203fffa"
down_revision: Union[str, Sequence[str], None] = "1964d8456f7b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add complaint_code if it does not already exist."""

    op.execute("""
        ALTER TABLE public.civic_issues
        ADD COLUMN IF NOT EXISTS complaint_code VARCHAR(50)
    """)


def downgrade() -> None:
    """Remove complaint_code if it exists."""

    op.execute("""
        ALTER TABLE public.civic_issues
        DROP COLUMN IF EXISTS complaint_code
    """)
