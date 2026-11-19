from datetime import date, datetime
from typing import Annotated, Literal
from uuid import UUID
from zoneinfo import ZoneInfo

from pydantic import BaseModel, ConfigDict, Field, StrictBool, StringConstraints, ValidationError, model_validator
from pydantic.alias_generators import to_camel


class AesSchema(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="forbid")


ShortText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=128)]
PlaceText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=500)]
Dose = Annotated[int, Field(ge=0, le=9)]
SiaDose = Annotated[int, Field(ge=1, le=10)]

MentalStatus = Literal[
    "Normal",
    "Mild / Confused or disoriented / Agitated",
    "Moderate / Lethargic / Decreased response",
    "Severe / Coma / Unconscious",
]
MotorDetails = Literal[
    "Normal",
    "Mild / Abnormal tone",
    "Moderate / Abnormal gait / Movements",
    "Severe / Paralysis / Limb weakness",
]
Division = Literal[
    "Barishal", "Chattogram", "Dhaka", "Khulna",
    "Mymensingh", "Rajshahi", "Rangpur", "Sylhet",
]


class AesCaseDefinition(AesSchema):
    acute_onset_fever: StrictBool
    altered_mental_status: StrictBool
    new_onset_seizures: StrictBool
    first_symptom_onset_date: date | None


class AesSignsAndSymptoms(AesSchema):
    fever: StrictBool
    seizures: StrictBool
    headaches: StrictBool
    mental_status: MentalStatus
    neurologic_motor_details: MotorDetails


class AesVaccinationHistory(AesSchema):
    available: StrictBool
    antigen: Literal["JE"] | None
    dose_by_card: Dose | None
    dose_by_history: Dose | None
    sia_doses: SiaDose | None
    date_of_last_dose: date | None


class AesTravelHistory(AesSchema):
    traveled_outside_area_last14_days: StrictBool
    period_start: date | None = None
    period_end: date | None = None
    place_details: PlaceText | None = None
    division: Division | None = None
    district: ShortText | None = None
    upazila: ShortText | None = None
    municipality: ShortText | None = None
    union_ward: ShortText | None = None
    new_ward: ShortText | None = None
    house_street: ShortText | None = None
    village_town: ShortText | None = None
    country_if_outside_bangladesh: ShortText | None = None


def _error(errors: list[dict], loc: tuple[str, ...], value: object, message: str) -> None:
    errors.append({
        "type": "value_error",
        "loc": loc,
        "input": value,
        "ctx": {"error": ValueError(message)},
    })


class AesSubmission(AesSchema):
    disease_code: Literal["AES"]
    population_group: Literal["tribal", "non_tribal"]
    meets_aes_screening_condition: StrictBool
    case_definition: AesCaseDefinition
    signs_and_symptoms: AesSignsAndSymptoms | None
    vaccination_history: AesVaccinationHistory | None
    travel_history: AesTravelHistory | None

    @model_validator(mode="after")
    def validate_conditional_fields(self) -> "AesSubmission":
        errors: list[dict] = []
        today = datetime.now(ZoneInfo("Asia/Dhaka")).date()
        case = self.case_definition
        meets = case.acute_onset_fever and (
            case.altered_mental_status or case.new_onset_seizures
        )

        if self.meets_aes_screening_condition != meets:
            _error(errors, ("meetsAesScreeningCondition",), self.meets_aes_screening_condition,
                   "Must match the three case-definition answers")
        if case.acute_onset_fever and case.first_symptom_onset_date is None:
            _error(errors, ("caseDefinition", "firstSymptomOnsetDate"), None,
                   "Required when acute onset of fever is Yes")
        if not case.acute_onset_fever and case.first_symptom_onset_date is not None:
            _error(errors, ("caseDefinition", "firstSymptomOnsetDate"), case.first_symptom_onset_date,
                   "Must be null when acute onset of fever is No")
        if case.first_symptom_onset_date and case.first_symptom_onset_date > today:
            _error(errors, ("caseDefinition", "firstSymptomOnsetDate"), case.first_symptom_onset_date,
                   "Cannot be in the future")

        if not meets:
            for name, value in (
                ("signsAndSymptoms", self.signs_and_symptoms),
                ("vaccinationHistory", self.vaccination_history),
                ("travelHistory", self.travel_history),
            ):
                if value is not None:
                    _error(errors, (name,), value, "Must be null when AES screening is not met")
        else:
            for name, value in (
                ("signsAndSymptoms", self.signs_and_symptoms),
                ("vaccinationHistory", self.vaccination_history),
                ("travelHistory", self.travel_history),
            ):
                if value is None:
                    _error(errors, (name,), value, "Required when AES screening is met")

            vaccine = self.vaccination_history
            if vaccine is not None:
                if vaccine.available:
                    if vaccine.antigen != "JE":
                        _error(errors, ("vaccinationHistory", "antigen"), vaccine.antigen,
                               "Must be JE when vaccination history is available")
                    for field, value in (
                        ("doseByCard", vaccine.dose_by_card),
                        ("doseByHistory", vaccine.dose_by_history),
                    ):
                        if value is None:
                            _error(errors, ("vaccinationHistory", field), value, "Required")
                    if vaccine.dose_by_card == 0 and vaccine.dose_by_history == 0:
                        _error(errors, ("vaccinationHistory", "doseByCard"), 0,
                               "Dose by Card and Dose by History cannot both be 0")
                        _error(errors, ("vaccinationHistory", "doseByHistory"), 0,
                               "Dose by Card and Dose by History cannot both be 0")
                    if vaccine.date_of_last_dose is None:
                        _error(errors, ("vaccinationHistory", "dateOfLastDose"), None, "Required")
                    elif vaccine.date_of_last_dose > today:
                        _error(errors, ("vaccinationHistory", "dateOfLastDose"),
                               vaccine.date_of_last_dose, "Cannot be in the future")
                else:
                    for field, value in (
                        ("antigen", vaccine.antigen),
                        ("doseByCard", vaccine.dose_by_card),
                        ("doseByHistory", vaccine.dose_by_history),
                        ("siaDoses", vaccine.sia_doses),
                        ("dateOfLastDose", vaccine.date_of_last_dose),
                    ):
                        if value is not None:
                            _error(errors, ("vaccinationHistory", field), value,
                                   "Must be null when vaccine history is unavailable")

            travel = self.travel_history
            if travel is not None:
                fields = (
                    "period_start", "period_end", "place_details", "division", "district",
                    "upazila", "municipality", "union_ward", "new_ward", "house_street",
                    "village_town", "country_if_outside_bangladesh",
                )
                if travel.traveled_outside_area_last14_days:
                    for name in fields[:6]:
                        if getattr(travel, name) is None:
                            _error(errors, ("travelHistory", to_camel(name)), None, "Required")
                    if travel.period_start and travel.period_end and travel.period_end < travel.period_start:
                        _error(errors, ("travelHistory", "periodEnd"), travel.period_end,
                               "Must be on or after period start")
                    for name in ("period_start", "period_end"):
                        value = getattr(travel, name)
                        if value and value > today:
                            _error(errors, ("travelHistory", to_camel(name)), value,
                                   "Cannot be in the future")
                else:
                    for name in fields:
                        value = getattr(travel, name)
                        if value is not None:
                            _error(errors, ("travelHistory", to_camel(name)), value,
                                   "Must be null when travel is No")

        if errors:
            raise ValidationError.from_exception_data(type(self).__name__, errors)
        return self


class AesRecordResponse(AesSchema):
    id: UUID
    external_case_id: str
    created_at: datetime
    updated_at: datetime
    payload: AesSubmission
