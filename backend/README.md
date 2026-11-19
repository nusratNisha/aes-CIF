# AES-CIF standalone backend

An async FastAPI API for AES investigation data. Its PostgreSQL database is separate from NDSS. It does **not** implement NDSS login, case verification, facility authorization or EPID generation. Only run the unauthenticated mode locally, with fictional test data. Do not deploy this API to production as-is.

## Layout

```text
backend/
├── .env.example
├── .gitignore
├── requirements.txt
├── alembic.ini
├── alembic/
│   ├── env.py
│   └── versions/0001_create_aes_investigations.py
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── db.py
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   └── service.py
└── tests/
    ├── conftest.py
    ├── test_schema.py
    └── test_api.py
```

## 1. Create the PostgreSQL databases on macOS

Install/start PostgreSQL if necessary. For Homebrew PostgreSQL 17:

```bash
brew services start postgresql@17
psql postgres
```

Inside `psql`, create a **local development** role and databases. Substitute a unique password, and use the *same* password in your `.env` and test URL. Never commit that password.

```sql
CREATE ROLE aes_app WITH LOGIN PASSWORD 'replace-with-your-local-password';
CREATE DATABASE aes_cif OWNER aes_app;
CREATE DATABASE aes_cif_test OWNER aes_app;
\q
```

If `aes_app` already exists, do not re-create it; use its existing credentials. If `psql` cannot connect, confirm the installed PostgreSQL version and service with `brew services list`.

## 2. Install Python dependencies

From the `backend/` directory:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` to set your real **local** password in `AES_DATABASE_URL`. `.env` is ignored by Git. The `AES_ENVIRONMENT=local` and `AES_DEV_UNAUTHENTICATED=true` combination is for local development only.

## 3. Create the schema with Alembic

```bash
alembic -c alembic.ini upgrade head
alembic -c alembic.ini current
```

The migration creates `aes_investigations` with a unique `external_case_id`, queryable population and screening columns, a JSONB payload, timestamps, and a GIN index for JSONB queries. No NDSS database foreign key is possible here because NDSS data lives in another database.

## 4. Run the API

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Open `http://127.0.0.1:8000/docs`. The development-only endpoint accepts fictional external IDs such as `TEST-001`. Never send real patient data to this unauthenticated instance.

Endpoints:

| Method | Path | Result |
| --- | --- | --- |
| GET | `/health` | Simple process check; does not probe PostgreSQL |
| POST | `/api/v1/aes-investigations/{external_case_id}` | Create; `201` or `409` duplicate |
| GET | `/api/v1/aes-investigations/{external_case_id}` | Read; `200` or `404` |
| PUT | `/api/v1/aes-investigations/{external_case_id}` | Replace the complete payload; `200` or `404` |

`PUT` is a full replacement, **not** a partial update. Invalid bodies return `422` with `errors: [{"field": "vaccinationHistory.doseByCard", "message": "..."}]`.

## 5. Run tests

```bash
pytest -q
```

The schema tests run without PostgreSQL. To run API/database integration tests too, use a **separate, disposable** database named with a `_test` suffix. The tests drop and recreate only this backend's AES table in that test database:

```bash
export AES_TEST_DATABASE_URL='postgresql+asyncpg://aes_app:replace-with-your-local-password@127.0.0.1:5432/aes_cif_test'
pytest -q
```

Do not point `AES_TEST_DATABASE_URL` at an existing database with data you wish to retain. The test fixture refuses a URL that is identical to `AES_DATABASE_URL` or whose database name does not end in `_test`.

## Contract with the current React frontend

The request body is the exact nested JSON from `aesCreatePayload()` in `App.tsx`. The NDSS case ID is provided in the URL, not manufactured from the payload. For example, using fictional test dates:

```json
{
  "diseaseCode": "AES",
  "populationGroup": "tribal",
  "meetsAesScreeningCondition": true,
  "caseDefinition": {
    "acuteOnsetFever": true,
    "alteredMentalStatus": true,
    "newOnsetSeizures": false,
    "firstSymptomOnsetDate": "2026-01-01"
  },
  "signsAndSymptoms": {
    "fever": true,
    "seizures": false,
    "headaches": false,
    "mentalStatus": "Normal",
    "neurologicMotorDetails": "Normal"
  },
  "vaccinationHistory": {
    "available": true,
    "antigen": "JE",
    "doseByCard": "0",
    "doseByHistory": "1",
    "siaDoses": null,
    "dateOfLastDose": "2026-01-01"
  },
  "travelHistory": {
    "traveledOutsideAreaLast14Days": false
  }
}
```

Pydantic converts numeric dose strings to integers (`"0"` becomes `0`) and ISO date strings to dates. It rejects unknown JSON keys, incorrect screening flags and irrelevant values in hidden sections. When screening is negative, the three later sections must be `null`. When vaccination is unavailable, its antigen/dose/date fields must be `null`. When travel is No, the travel object contains only its boolean flag. The backend stores a canonical JSON payload with explicit `null` values for omitted optional travel fields.

### JSON-to-database mapping

| Frontend JSON | PostgreSQL column |
| --- | --- |
| External ID from NDSS registration | `external_case_id` (unique, no cross-DB FK) |
| `diseaseCode` | `disease_code` and `payload->'diseaseCode'` |
| `populationGroup` | `population_group` and `payload->'populationGroup'` |
| `meetsAesScreeningCondition` | `meets_aes_screening_condition` and `payload->'meetsAesScreeningCondition'` |
| `caseDefinition.*` | `payload->'caseDefinition'` |
| `signsAndSymptoms.*` | `payload->'signsAndSymptoms'` |
| `vaccinationHistory.*` | `payload->'vaccinationHistory'` |
| `travelHistory.*` | `payload->'travelHistory'` |
| Backend-generated UUID and timestamps | `id`, `created_at`, `updated_at` |

The `*` rows include every exact nested field defined in `app/schemas.py`; nested fields are not silently discarded. The JSONB GIN index supports future queries, while the separate population/screening columns support straightforward filtering. If NDSS reporting later requires stronger relational constraints or frequent field-level joins, plan an Alembic migration to typed columns or child tables.

## Integration and safety decisions to confirm

1. **NDSS case verification:** Before production, verify `external_case_id` against the existing NDSS case service. A standalone database cannot enforce a foreign key into NDSS.
2. **Authentication/authorization:** Replace `require_local_access()` with NDSS token validation and a facility-to-case permission check for **every** create/read/update request. Current local mode is deliberately unauthenticated and must not be deployed.
3. **EPID:** Receive it from the existing NDSS system if needed; this service does not generate one.
4. **Audit:** Confirm whether NDSS requires a trusted creator/updater identity and immutable change history. These cannot safely be inferred from an unauthenticated browser request.
5. **Clinical interpretation:** Confirm what “travel in the last 14 days” is relative to (notification, onset, or investigation date). The API records the dates and validates their order/future limit but does not enforce an invented anchor.
6. **Release:** Configure the correct allowed frontend origin and real NDSS integration before any deployment or use of actual patient records.
