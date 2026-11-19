from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

import pytest
from pydantic import ValidationError

from app.schemas import AesSubmission


def has_error(payload: dict, field: tuple[str, ...]) -> bool:
    try:
        AesSubmission.model_validate(payload)
    except ValidationError as exc:
        return field in [tuple(error["loc"]) for error in exc.errors()]
    return False


def test_valid_payload_converts_dose_strings(valid_payload: dict) -> None:
    parsed = AesSubmission.model_validate(valid_payload)
    assert parsed.vaccination_history is not None
    assert parsed.vaccination_history.dose_by_card == 0
    assert parsed.vaccination_history.dose_by_history == 1


def test_all_case_answers_required(valid_payload: dict) -> None:
    del valid_payload["caseDefinition"]["newOnsetSeizures"]
    assert has_error(valid_payload, ("caseDefinition", "newOnsetSeizures"))


def test_boolean_strings_are_not_accepted(valid_payload: dict) -> None:
    valid_payload["caseDefinition"]["acuteOnsetFever"] = "yes"
    assert has_error(valid_payload, ("caseDefinition", "acuteOnsetFever"))


def test_screening_condition_must_match_answers(valid_payload: dict) -> None:
    valid_payload["caseDefinition"]["alteredMentalStatus"] = False
    assert has_error(valid_payload, ("meetsAesScreeningCondition",))


def test_negative_screening_has_no_later_sections(valid_payload: dict) -> None:
    valid_payload["caseDefinition"]["alteredMentalStatus"] = False
    valid_payload["meetsAesScreeningCondition"] = False
    valid_payload["signsAndSymptoms"] = None
    valid_payload["vaccinationHistory"] = None
    valid_payload["travelHistory"] = None
    assert AesSubmission.model_validate(valid_payload).signs_and_symptoms is None


def test_vaccine_doses_cannot_both_be_zero(valid_payload: dict) -> None:
    valid_payload["vaccinationHistory"]["doseByHistory"] = "0"
    assert has_error(valid_payload, ("vaccinationHistory", "doseByCard"))


@pytest.mark.parametrize("dose", ["-1", "10", "not-a-dose"])
def test_vaccine_dose_range(valid_payload: dict, dose: str) -> None:
    valid_payload["vaccinationHistory"]["doseByCard"] = dose
    assert has_error(valid_payload, ("vaccinationHistory", "doseByCard"))


def test_invalid_dropdown_option(valid_payload: dict) -> None:
    valid_payload["signsAndSymptoms"]["mentalStatus"] = "Unknown"
    assert has_error(valid_payload, ("signsAndSymptoms", "mentalStatus"))


def test_travel_required_fields(valid_payload: dict) -> None:
    valid_payload["travelHistory"] = {"traveledOutsideAreaLast14Days": True}
    assert has_error(valid_payload, ("travelHistory", "division"))


def test_travel_end_must_follow_start(valid_payload: dict) -> None:
    valid_payload["travelHistory"] = {
        "traveledOutsideAreaLast14Days": True,
        "periodStart": "2026-01-10",
        "periodEnd": "2026-01-09",
        "placeDetails": "Test residence",
        "division": "Dhaka",
        "district": "Test district",
        "upazila": "Test upazila",
    }
    assert has_error(valid_payload, ("travelHistory", "periodEnd"))


def test_future_date_rejected(valid_payload: dict) -> None:
    tomorrow = (datetime.now(ZoneInfo("Asia/Dhaka")).date() + timedelta(days=1)).isoformat()
    valid_payload["caseDefinition"]["firstSymptomOnsetDate"] = tomorrow
    assert has_error(valid_payload, ("caseDefinition", "firstSymptomOnsetDate"))


def test_hidden_vaccine_data_rejected(valid_payload: dict) -> None:
    valid_payload["vaccinationHistory"]["available"] = False
    assert has_error(valid_payload, ("vaccinationHistory", "antigen"))
