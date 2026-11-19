from datetime import date, datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    Index,
    Integer,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID as PgUUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class AesInvestigation(Base):
    __tablename__ = "aes_investigations"

    __table_args__ = (
        UniqueConstraint(
            "external_case_id",
            name="uq_aes_external_case_id",
        ),
        CheckConstraint(
            "disease_code = 'AES'",
            name="ck_aes_disease_code",
        ),
        CheckConstraint(
            "population_group IN ('tribal', 'non_tribal')",
            name="ck_aes_population_group",
        ),
        CheckConstraint(
            "jsonb_typeof(payload) = 'object'",
            name="ck_aes_payload_object",
        ),
        Index(
            "ix_aes_payload_gin",
            "payload",
            postgresql_using="gin",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PgUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )
    external_case_id: Mapped[str] = mapped_column(
        String(128),
        nullable=False,
    )
    disease_code: Mapped[str] = mapped_column(
        String(3),
        nullable=False,
        default="AES",
    )
    population_group: Mapped[str] = mapped_column(
        String(16),
        nullable=False,
    )
    meets_aes_screening_condition: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
    )
    payload: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
    )

    # AES case definition
    acute_onset_fever: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
    )
    altered_mental_status: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
    )
    new_onset_seizures: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
    )
    first_symptom_onset_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    # Signs and symptoms
    signs_fever: Mapped[bool | None] = mapped_column(
        Boolean,
        nullable=True,
    )
    signs_seizures: Mapped[bool | None] = mapped_column(
        Boolean,
        nullable=True,
    )
    signs_headaches: Mapped[bool | None] = mapped_column(
        Boolean,
        nullable=True,
    )
    mental_status: Mapped[str | None] = mapped_column(
        String(128),
        nullable=True,
    )
    neurologic_motor_details: Mapped[str | None] = mapped_column(
        String(128),
        nullable=True,
    )

    # JE vaccination history
    je_vaccine_available: Mapped[bool | None] = mapped_column(
        Boolean,
        nullable=True,
    )
    je_antigen: Mapped[str | None] = mapped_column(
        String(8),
        nullable=True,
    )
    dose_by_card: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )
    dose_by_history: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )
    sia_doses: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )
    date_of_last_dose: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    # Travel history
    traveled_outside_area_last14_days: Mapped[bool | None] = mapped_column(
        Boolean,
        nullable=True,
    )
    travel_period_start: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )
    travel_period_end: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )
    travel_place_details: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )
    travel_division: Mapped[str | None] = mapped_column(
        String(128),
        nullable=True,
    )
    travel_district: Mapped[str | None] = mapped_column(
        String(128),
        nullable=True,
    )
    travel_upazila: Mapped[str | None] = mapped_column(
        String(128),
        nullable=True,
    )
    travel_municipality: Mapped[str | None] = mapped_column(
        String(128),
        nullable=True,
    )
    travel_union_ward: Mapped[str | None] = mapped_column(
        String(128),
        nullable=True,
    )
    travel_new_ward: Mapped[str | None] = mapped_column(
        String(128),
        nullable=True,
    )
    travel_house_street: Mapped[str | None] = mapped_column(
        String(128),
        nullable=True,
    )
    travel_village_town: Mapped[str | None] = mapped_column(
        String(128),
        nullable=True,
    )
    travel_country_if_outside_bangladesh: Mapped[str | None] = mapped_column(
        String(128),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )