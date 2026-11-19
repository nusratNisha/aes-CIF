"""add AES answer columns

Revision ID: bfa3a5f69737
Revises: 0001_aes
Create Date: 2026-11-19 14:23:42.277605
"""

from alembic import op
import sqlalchemy as sa


revision = 'bfa3a5f69737'
down_revision = '0001_aes'
branch_labels = None
depends_on = None


AES_COLUMNS = [
    # Column name, SQLAlchemy type, PostgreSQL cast, JSON path
    ("acute_onset_fever", sa.Boolean(), "BOOLEAN", "caseDefinition,acuteOnsetFever"),
    ("altered_mental_status", sa.Boolean(), "BOOLEAN", "caseDefinition,alteredMentalStatus"),
    ("new_onset_seizures", sa.Boolean(), "BOOLEAN", "caseDefinition,newOnsetSeizures"),
    ("first_symptom_onset_date", sa.Date(), "DATE", "caseDefinition,firstSymptomOnsetDate"),

    ("signs_fever", sa.Boolean(), "BOOLEAN", "signsAndSymptoms,fever"),
    ("signs_seizures", sa.Boolean(), "BOOLEAN", "signsAndSymptoms,seizures"),
    ("signs_headaches", sa.Boolean(), "BOOLEAN", "signsAndSymptoms,headaches"),
    ("mental_status", sa.String(128), "TEXT", "signsAndSymptoms,mentalStatus"),
    ("neurologic_motor_details", sa.String(128), "TEXT", "signsAndSymptoms,neurologicMotorDetails"),

    ("je_vaccine_available", sa.Boolean(), "BOOLEAN", "vaccinationHistory,available"),
    ("je_antigen", sa.String(8), "TEXT", "vaccinationHistory,antigen"),
    ("dose_by_card", sa.Integer(), "INTEGER", "vaccinationHistory,doseByCard"),
    ("dose_by_history", sa.Integer(), "INTEGER", "vaccinationHistory,doseByHistory"),
    ("sia_doses", sa.Integer(), "INTEGER", "vaccinationHistory,siaDoses"),
    ("date_of_last_dose", sa.Date(), "DATE", "vaccinationHistory,dateOfLastDose"),

    (
        "traveled_outside_area_last14_days",
        sa.Boolean(),
        "BOOLEAN",
        "travelHistory,traveledOutsideAreaLast14Days",
    ),
    ("travel_period_start", sa.Date(), "DATE", "travelHistory,periodStart"),
    ("travel_period_end", sa.Date(), "DATE", "travelHistory,periodEnd"),
    ("travel_place_details", sa.String(500), "TEXT", "travelHistory,placeDetails"),
    ("travel_division", sa.String(128), "TEXT", "travelHistory,division"),
    ("travel_district", sa.String(128), "TEXT", "travelHistory,district"),
    ("travel_upazila", sa.String(128), "TEXT", "travelHistory,upazila"),
    ("travel_municipality", sa.String(128), "TEXT", "travelHistory,municipality"),
    ("travel_union_ward", sa.String(128), "TEXT", "travelHistory,unionWard"),
    ("travel_new_ward", sa.String(128), "TEXT", "travelHistory,newWard"),
    ("travel_house_street", sa.String(128), "TEXT", "travelHistory,houseStreet"),
    ("travel_village_town", sa.String(128), "TEXT", "travelHistory,villageTown"),
    (
        "travel_country_if_outside_bangladesh",
        sa.String(128),
        "TEXT",
        "travelHistory,countryIfOutsideBangladesh",
    ),
]


def upgrade() -> None:
    for name, column_type, _, _ in AES_COLUMNS:
        op.add_column(
            "aes_investigations",
            sa.Column(name, column_type, nullable=True),
        )

    # Fill the new columns for records that were saved before this migration.
    assignments = []

    for name, _, sql_type, json_path in AES_COLUMNS:
        extracted = (
            f"NULLIF(payload #>> '{{{json_path}}}', '')"
        )
        value = (
            extracted
            if sql_type == "TEXT"
            else f"CAST({extracted} AS {sql_type})"
        )
        assignments.append(f"{name} = {value}")

    op.execute(
        sa.text(
            "UPDATE aes_investigations SET\n"
            + ",\n".join(assignments)
        )
    )

    # These three questions are required for every AES submission.
    for name in (
        "acute_onset_fever",
        "altered_mental_status",
        "new_onset_seizures",
    ):
        op.alter_column(
            "aes_investigations",
            name,
            nullable=False,
        )


def downgrade() -> None:
    # Do not run a downgrade casually: it removes these columns.
    for name, _, _, _ in reversed(AES_COLUMNS):
        op.drop_column("aes_investigations", name)