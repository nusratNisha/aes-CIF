from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import AesInvestigation
from app.schemas import AesRecordResponse, AesSubmission


class AesDuplicateError(Exception):
    pass


class AesNotFoundError(Exception):
    pass


def aes_column_values(payload: AesSubmission) -> dict[str, object]:
    """Map validated form sections to the matching table columns."""
    case = payload.case_definition
    signs = payload.signs_and_symptoms
    vaccine = payload.vaccination_history
    travel = payload.travel_history

    return {
        # AES case definition
        "acute_onset_fever": case.acute_onset_fever,
        "altered_mental_status": case.altered_mental_status,
        "new_onset_seizures": case.new_onset_seizures,
        "first_symptom_onset_date": case.first_symptom_onset_date,

        # Signs and symptoms
        "signs_fever": signs.fever if signs else None,
        "signs_seizures": signs.seizures if signs else None,
        "signs_headaches": signs.headaches if signs else None,
        "mental_status": signs.mental_status if signs else None,
        "neurologic_motor_details": (
            signs.neurologic_motor_details if signs else None
        ),

        # JE vaccination history
        "je_vaccine_available": (
            vaccine.available if vaccine else None
        ),
        "je_antigen": vaccine.antigen if vaccine else None,
        "dose_by_card": vaccine.dose_by_card if vaccine else None,
        "dose_by_history": (
            vaccine.dose_by_history if vaccine else None
        ),
        "sia_doses": vaccine.sia_doses if vaccine else None,
        "date_of_last_dose": (
            vaccine.date_of_last_dose if vaccine else None
        ),

        # Travel history
        "traveled_outside_area_last14_days": (
            travel.traveled_outside_area_last14_days
            if travel
            else None
        ),
        "travel_period_start": (
            travel.period_start if travel else None
        ),
        "travel_period_end": (
            travel.period_end if travel else None
        ),
        "travel_place_details": (
            travel.place_details if travel else None
        ),
        "travel_division": (
            travel.division if travel else None
        ),
        "travel_district": (
            travel.district if travel else None
        ),
        "travel_upazila": (
            travel.upazila if travel else None
        ),
        "travel_municipality": (
            travel.municipality if travel else None
        ),
        "travel_union_ward": (
            travel.union_ward if travel else None
        ),
        "travel_new_ward": (
            travel.new_ward if travel else None
        ),
        "travel_house_street": (
            travel.house_street if travel else None
        ),
        "travel_village_town": (
            travel.village_town if travel else None
        ),
        "travel_country_if_outside_bangladesh": (
            travel.country_if_outside_bangladesh
            if travel
            else None
        ),
    }


def as_response(
    record: AesInvestigation,
) -> AesRecordResponse:
    return AesRecordResponse(
        id=record.id,
        external_case_id=record.external_case_id,
        created_at=record.created_at,
        updated_at=record.updated_at,
        payload=AesSubmission.model_validate(record.payload),
    )


async def get_investigation(
    session: AsyncSession,
    external_case_id: str,
) -> AesInvestigation:
    record = await session.scalar(
        select(AesInvestigation).where(
            AesInvestigation.external_case_id == external_case_id
        )
    )

    if record is None:
        raise AesNotFoundError

    return record


async def create_investigation(
    session: AsyncSession,
    external_case_id: str,
    payload: AesSubmission,
) -> AesInvestigation:
    record = AesInvestigation(
        external_case_id=external_case_id,
        disease_code=payload.disease_code,
        population_group=payload.population_group,
        meets_aes_screening_condition=(
            payload.meets_aes_screening_condition
        ),
        payload=payload.model_dump(mode="json", by_alias=True),
        **aes_column_values(payload),
    )

    try:
        async with session.begin():
            session.add(record)
            await session.flush()
            await session.refresh(record)
    except IntegrityError as exc:
        if getattr(exc.orig, "sqlstate", None) == "23505":
            raise AesDuplicateError from exc
        raise

    return record


async def replace_investigation(
    session: AsyncSession,
    external_case_id: str,
    payload: AesSubmission,
) -> AesInvestigation:
    async with session.begin():
        record = await session.scalar(
            select(AesInvestigation)
            .where(
                AesInvestigation.external_case_id == external_case_id
            )
            .with_for_update()
        )

        if record is None:
            raise AesNotFoundError

        record.disease_code = payload.disease_code
        record.population_group = payload.population_group
        record.meets_aes_screening_condition = (
            payload.meets_aes_screening_condition
        )
        record.payload = payload.model_dump(
            mode="json",
            by_alias=True,
        )

        for aes_name, aes_value in aes_column_values(payload).items():
            setattr(record, aes_name, aes_value)

        await session.flush()
        await session.refresh(record)

    return record