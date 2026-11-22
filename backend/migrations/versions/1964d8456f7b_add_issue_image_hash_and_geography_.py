
"""add issue image hash and geography location

Revision ID: 1964d8456f7b
Revises: e69f4afc9f2e
Create Date: 2026-11-16 13:31:29.684276

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import geoalchemy2


# revision identifiers, used by Alembic.
revision: str = "1964d8456f7b"
down_revision: Union[str, Sequence[str], None] = "e69f4afc9f2e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add image hash and PostGIS geography location to civic issues."""

    op.add_column(
        "civic_issues",
        sa.Column(
            "image_hash",
            sa.String(length=16),
            nullable=True
        )
    )

    op.add_column(
        "civic_issues",
        sa.Column(
            "location",
            geoalchemy2.types.Geography(
                geometry_type="POINT",
                srid=4326,
                dimension=2,
                spatial_index=False,
                from_text="ST_GeogFromText",
                name="geography"
            ),
            nullable=True
        )
    )

    op.create_index(
        "idx_civic_issues_location",
        "civic_issues",
        ["location"],
        unique=False,
        postgresql_using="gist"
    )


def downgrade() -> None:
    """Remove image hash and PostGIS geography location."""

    op.drop_index(
        "idx_civic_issues_location",
        table_name="civic_issues",
        postgresql_using="gist"
    )

    op.drop_column("civic_issues", "location")
    op.drop_column("civic_issues", "image_hash")
