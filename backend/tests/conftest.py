from copy import deepcopy
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

import pytest


@pytest.fixture
def valid_payload() -> dict:
    yesterday = (datetime.now(ZoneInfo("Asia/Dhaka")).date() - timedelta(days=1)).isoformat()
    payload = {
        "diseaseCode": "AES",
        "populationGroup": "tribal",
        "meetsAesScreeningCondition": True,
        "caseDefinition": {
            "acuteOnsetFever": True,
            "alteredMentalStatus": True,
            "newOnsetSeizures": False,
            "firstSymptomOnsetDate": yesterday,
        },
        "signsAndSymptoms": {
            "fever": True,
            "seizures": False,
            "headaches": False,
            "mentalStatus": "Normal",
            "neurologicMotorDetails": "Normal",
        },
        "vaccinationHistory": {
            "available": True,
            "antigen": "JE",
            "doseByCard": "0",
            "doseByHistory": "1",
            "siaDoses": None,
            "dateOfLastDose": yesterday,
        },
        "travelHistory": {"traveledOutsideAreaLast14Days": False},
    }
    return deepcopy(payload)
