"""Create standalone AES investigations table.

Revision ID: 0001_aes
Revises:
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB, UUID


revision = "0001_aes"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "aes_investigations",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("external_case_id", sa.String(128), nullable=False),
        sa.Column("disease_code", sa.String(3), nullable=False),
        sa.Column("population_group", sa.String(16), nullable=False),
        sa.Column("meets_aes_screening_condition", sa.Boolean(), nullable=False),
        sa.Column("payload", JSONB(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("external_case_id", name="uq_aes_external_case_id"),
        sa.CheckConstraint("disease_code = 'AES'", name="ck_aes_disease_code"),
        sa.CheckConstraint(
            "population_group IN ('tribal', 'non_tribal')",
            name="ck_aes_population_group",
        ),
        sa.CheckConstraint("jsonb_typeof(payload) = 'object'", name="ck_aes_payload_object"),
    )
    op.create_index("ix_aes_payload_gin", "aes_investigations", ["payload"], postgresql_using="gin")


def downgrade() -> None:
    op.drop_index("ix_aes_payload_gin", table_name="aes_investigations")
    op.drop_table("aes_investigations")
