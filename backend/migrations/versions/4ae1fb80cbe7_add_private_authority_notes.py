
"""add private authority notes

Revision ID: 4ae1fb80cbe7
Revises: d5f1527864d9
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision = "4ae1fb80cbe7"
down_revision = "d5f1527864d9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)

    if "authority_notes" not in inspector.get_table_names():
        op.create_table(
            "authority_notes",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("issue_id", sa.Integer(), nullable=False),
            sa.Column("officer_id", sa.Integer(), nullable=False),
            sa.Column("message", sa.Text(), nullable=False),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=False,
            ),
            sa.ForeignKeyConstraint(
                ["issue_id"], ["civic_issues.id"]
            ),
            sa.ForeignKeyConstraint(
                ["officer_id"], ["users.id"]
            ),
            sa.PrimaryKeyConstraint("id"),
        )

        op.create_index(
            "ix_authority_notes_id",
            "authority_notes",
            ["id"],
            unique=False,
        )

        op.create_index(
            "ix_authority_notes_issue_id",
            "authority_notes",
            ["issue_id"],
            unique=False,
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)

    if "authority_notes" in inspector.get_table_names():
        op.drop_index(
            "ix_authority_notes_issue_id",
            table_name="authority_notes",
        )
        op.drop_index(
            "ix_authority_notes_id",
            table_name="authority_notes",
        )
        op.drop_table("authority_notes")
