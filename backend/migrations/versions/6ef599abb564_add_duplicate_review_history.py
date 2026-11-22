
"""add duplicate review history

Revision ID: 6ef599abb564
Revises: 4ae1fb80cbe7
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "6ef599abb564"
down_revision: Union[str, Sequence[str], None] = "4ae1fb80cbe7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "duplicate_reviews",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("original_issue_id", sa.Integer(), nullable=False),
        sa.Column("duplicate_issue_id", sa.Integer(), nullable=False),
        sa.Column("reviewed_by", sa.Integer(), nullable=False),
        sa.Column("decision", sa.String(length=20), nullable=False),
        sa.Column("authority_note", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["original_issue_id"],
            ["civic_issues.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["duplicate_issue_id"],
            ["civic_issues.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["reviewed_by"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_duplicate_reviews_id",
        "duplicate_reviews",
        ["id"],
        unique=False,
    )
    op.create_index(
        "ix_duplicate_reviews_original_issue_id",
        "duplicate_reviews",
        ["original_issue_id"],
        unique=False,
    )
    op.create_index(
        "ix_duplicate_reviews_duplicate_issue_id",
        "duplicate_reviews",
        ["duplicate_issue_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_duplicate_reviews_duplicate_issue_id",
        table_name="duplicate_reviews",
    )
    op.drop_index(
        "ix_duplicate_reviews_original_issue_id",
        table_name="duplicate_reviews",
    )
    op.drop_index(
        "ix_duplicate_reviews_id",
        table_name="duplicate_reviews",
    )
    op.drop_table("duplicate_reviews")
