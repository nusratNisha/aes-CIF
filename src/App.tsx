import { useState, type FormEvent, type ReactNode } from "react";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Collapse,
  Container,
  FormControlLabel,
  MenuItem,
  Paper,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import VaccinesOutlinedIcon from "@mui/icons-material/VaccinesOutlined";
import FlightTakeoffOutlinedIcon from "@mui/icons-material/FlightTakeoffOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";

type AesYesNo = "yes" | "no" | "";
type AesPopulationGroup = "tribal" | "non_tribal" | "";

type AesForm = {
  aesPopulationGroup: AesPopulationGroup;

  // Case definition
  aesAcuteOnsetFever: AesYesNo;
  aesAlteredMentalStatus: AesYesNo;
  aesNewOnsetSeizures: AesYesNo;
  aesFirstSymptomOnsetDate: string;

  // Signs and symptoms
  aesFever: AesYesNo;
  aesSeizures: AesYesNo;
  aesHeadaches: AesYesNo;
  aesMentalStatus: string;
  aesNeurologicMotorDetails: string;

  // Vaccination
  aesJeVaccineHistoryAvailable: boolean;
  aesDoseByCard: string;
  aesDoseByHistory: string;
  aesSiaDoses: string;
  aesDateOfLastDose: string;

  // Travel
  aesTravelOutsideAreaLast14Days: boolean;
  aesTravelPeriodStart: string;
  aesTravelPeriodEnd: string;
  aesTravelPlaceDetails: string;
  aesTravelDivision: string;
  aesTravelDistrict: string;
  aesTravelUpazila: string;
  aesTravelMunicipality: string;
  aesTravelUnionWard: string;
  aesTravelNewWard: string;
  aesTravelHouseStreet: string;
  aesTravelVillageTown: string;
  aesTravelCountry: string;
};

type AesField = keyof AesForm;
type AesErrors = Partial<Record<AesField, string>>;

const aesInitialForm: AesForm = {
  aesPopulationGroup: "",

  aesAcuteOnsetFever: "",
  aesAlteredMentalStatus: "",
  aesNewOnsetSeizures: "",
  aesFirstSymptomOnsetDate: "",

  aesFever: "",
  aesSeizures: "",
  aesHeadaches: "",
  aesMentalStatus: "",
  aesNeurologicMotorDetails: "",

  aesJeVaccineHistoryAvailable: false,
  aesDoseByCard: "",
  aesDoseByHistory: "",
  aesSiaDoses: "",
  aesDateOfLastDose: "",

  aesTravelOutsideAreaLast14Days: false,
  aesTravelPeriodStart: "",
  aesTravelPeriodEnd: "",
  aesTravelPlaceDetails: "",
  aesTravelDivision: "",
  aesTravelDistrict: "",
  aesTravelUpazila: "",
  aesTravelMunicipality: "",
  aesTravelUnionWard: "",
  aesTravelNewWard: "",
  aesTravelHouseStreet: "",
  aesTravelVillageTown: "",
  aesTravelCountry: "",
};

const aesMentalStatusOptions = [
  "Normal",
  "Mild / Confused or disoriented / Agitated",
  "Moderate / Lethargic / Decreased response",
  "Severe / Coma / Unconscious",
];

const aesMotorOptions = [
  "Normal",
  "Mild / Abnormal tone",
  "Moderate / Abnormal gait / Movements",
  "Severe / Paralysis / Limb weakness",
];

const aesDivisions = [
  "Barishal",
  "Chattogram",
  "Dhaka",
  "Khulna",
  "Mymensingh",
  "Rajshahi",
  "Rangpur",
  "Sylhet",
];

// Preview choices. Confirm the permitted values with your senior developer.
const aesRegularDoses = ["0", "1", "2", "3"];
const aesSiaDoses = Array.from(
  { length: 10 },
  (_, aesIndex) => String(aesIndex + 1),
);

const aesNavy = "#18355f";
const aesBorder = "#cbd7e8";
const aesRed = "#d32f2f";

/*
 * ONE common style for ALL text fields and dropdowns.
 * Change fontSize or height here to update the entire form.
 */
const aesFieldSx = {
  "& .MuiOutlinedInput-root": {
    height: 40,
    borderRadius: "2px",
    backgroundColor: "#fff",
    fontSize: "13px",
  },

  "& .MuiInputBase-input": {
    padding: "9px 12px",
    fontSize: "13px",
  },

  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    minHeight: "0 !important",
    padding: "9px 32px 9px 12px !important",
    fontSize: "13px",
  },

  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: aesBorder,
  },

  "& .MuiFormHelperText-root": {
    marginLeft: 0,
    marginTop: "4px",
    fontSize: "11px",
    lineHeight: 1.3,
  },
};

const aesPanelSx = {
  border: `1px solid ${aesBorder}`,
  borderRadius: "4px",
  backgroundColor: "#fff",
  padding: { xs: 2, md: 2.5 },
  marginBottom: 1.5,
};

const aesCardSx = {
  border: `1px solid ${aesBorder}`,
  padding: { xs: 1.5, md: 2 },
  minWidth: 0,
};

const aesThreeColumnsSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    md: "repeat(3, minmax(0, 1fr))",
  },
  gap: 2,
};

function aesToday(): string {
  const aesDate = new Date();
  const aesYear = aesDate.getFullYear();
  const aesMonth = String(aesDate.getMonth() + 1).padStart(2, "0");
  const aesDay = String(aesDate.getDate()).padStart(2, "0");

  return `${aesYear}-${aesMonth}-${aesDay}`;
}

function aesToBoolean(aesAnswer: AesYesNo): boolean | null {
  if (aesAnswer === "yes") return true;
  if (aesAnswer === "no") return false;
  return null;
}

function AesSectionHeading({
  aesTitle,
  aesIcon,
  aesRight,
}: {
  aesTitle: string;
  aesIcon: ReactNode;
  aesRight?: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        gap: 1.5,
        marginBottom: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: aesNavy,
          minHeight: 30,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {aesIcon}
        </Box>

        <Typography
          component="h2"
          sx={{
            color: aesNavy,
            fontSize: "19px",
            fontWeight: 700,
            lineHeight: 1.3,
          }}
        >
          {aesTitle}
        </Typography>
      </Box>

      {aesRight}
    </Box>
  );
}

function AesLabel({
  aesText,
  aesRequired = false,
  aesHtmlFor,
}: {
  aesText: string;
  aesRequired?: boolean;
  aesHtmlFor?: string;
}) {
  return (
    <Typography
      component={aesHtmlFor ? "label" : "div"}
      htmlFor={aesHtmlFor}
      sx={{
        display: "block",
        color: aesNavy,
        fontSize: "12px",
        fontWeight: 700,
        lineHeight: 1.3,
        marginBottom: "7px",
      }}
    >
      {aesText}
      {aesRequired && (
        <Box component="span" sx={{ color: aesRed, ml: 0.35 }}>
          *
        </Box>
      )}
    </Typography>
  );
}

function AesYesNo({
  aesValue,
  aesError,
  aesOnChange,
}: {
  aesValue: AesYesNo;
  aesError?: string;
  aesOnChange: (aesAnswer: AesYesNo) => void;
}) {
  const aesButtonSx = (aesAnswer: "yes" | "no") => ({
    minWidth: 46,
    height: 28,
    padding: "2px 9px",
    borderRadius: "3px",
    border: `1px solid ${
      aesValue === aesAnswer ? "#1769ee" : "#bbcbe1"
    }`,
    backgroundColor:
      aesValue === aesAnswer ? "#eef4ff" : "#fff",
    color: aesValue === aesAnswer ? "#1769ee" : aesNavy,
    fontSize: "11px",
    fontWeight: aesValue === aesAnswer ? 700 : 500,
    textTransform: "none",

    "&.Mui-disabled": {
      borderColor: "#d7deea",
      color: "#a4afbf",
      backgroundColor: "#f6f8fb",
    },
  });

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 0.75 }}>
        <Button
          type="button"
          disabled={aesValue === "no"}
          sx={aesButtonSx("yes")}
          onClick={() =>
            aesOnChange(aesValue === "yes" ? "" : "yes")
          }
        >
          Yes
        </Button>

        <Button
          type="button"
          disabled={aesValue === "yes"}
          sx={aesButtonSx("no")}
          onClick={() =>
            aesOnChange(aesValue === "no" ? "" : "no")
          }
        >
          No
        </Button>
      </Box>

      {aesError && (
        <Typography
          role="alert"
          sx={{ color: aesRed, fontSize: "11px", mt: 0.5 }}
        >
          {aesError}
        </Typography>
      )}
    </Box>
  );
}

function AesQuestionRow({
  aesText,
  aesValue,
  aesError,
  aesOnChange,
  aesHint,
  aesLast = false,
}: {
  aesText: string;
  aesValue: AesYesNo;
  aesError?: string;
  aesOnChange: (aesAnswer: AesYesNo) => void;
  aesHint?: string;
  aesLast?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) auto",
        alignItems: "center",
        gap: 1.5,
        minHeight: 48,
        padding: "8px 0",
        borderBottom: aesLast
          ? "none"
          : `1px solid ${aesBorder}`,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography sx={{ color: aesNavy, fontSize: "13px" }}>
          {aesText}
        </Typography>

        {aesHint && (
          <Tooltip title={aesHint} arrow>
            <Box
              component="span"
              tabIndex={0}
              aria-label={`Help: ${aesText}`}
              sx={{
                display: "inline-flex",
                color: aesNavy,
                cursor: "help",
              }}
            >
              <HelpOutlineOutlinedIcon sx={{ fontSize: 16 }} />
            </Box>
          </Tooltip>
        )}
      </Box>

      <AesYesNo
        aesValue={aesValue}
        aesError={aesError}
        aesOnChange={aesOnChange}
      />
    </Box>
  );
}

function AesToggle({
  aesLabel,
  aesChecked,
  aesOnChange,
  aesColor = "primary",
}: {
  aesLabel: string;
  aesChecked: boolean;
  aesOnChange: (aesChecked: boolean) => void;
  aesColor?: "primary" | "error";
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        maxWidth: "100%",
        borderRadius: 4,
        padding: "2px 7px 2px 13px",
        backgroundColor: "#dce9ff",
      }}
    >
      <Typography
        sx={{
          color: aesNavy,
          fontSize: "11px",
          fontWeight: 700,
        }}
      >
        {aesLabel}
      </Typography>

      <Switch
        size="small"
        color={aesColor}
        checked={aesChecked}
        onChange={(aesEvent) =>
          aesOnChange(aesEvent.target.checked)
        }
        inputProps={{ "aria-label": aesLabel }}
      />
    </Box>
  );
}

function App() {
  const [aesForm, setAesForm] = useState<AesForm>(aesInitialForm);
  const [aesErrors, setAesErrors] = useState<AesErrors>({});
  const [aesPayload, setAesPayload] = useState<object | null>(null);

  const aesMaxDate = aesToday();

  const aesMeetsCaseDefinition =
  aesForm.aesAcuteOnsetFever === "yes" &&
  (aesForm.aesAlteredMentalStatus === "yes" ||
    aesForm.aesNewOnsetSeizures === "yes");
  const aesDefinitionComplete = [
    aesForm.aesAcuteOnsetFever,
    aesForm.aesAlteredMentalStatus,
    aesForm.aesNewOnsetSeizures,
  ].every((aesAnswer) => aesAnswer !== "");

  function aesUpdate<AesKey extends AesField>(
    aesField: AesKey,
    aesValue: AesForm[AesKey],
  ) {
    setAesForm((aesPrevious) => ({
      ...aesPrevious,
      [aesField]: aesValue,
    }));

    setAesErrors((aesPrevious) => {
      if (!aesPrevious[aesField]) return aesPrevious;

      const aesNext = { ...aesPrevious };
      delete aesNext[aesField];
      return aesNext;
    });

    setAesPayload(null);
  }

  function aesSetVaccination(aesChecked: boolean) {
    setAesForm((aesPrevious) => ({
      ...aesPrevious,
      aesJeVaccineHistoryAvailable: aesChecked,
      ...(aesChecked
        ? {}
        : {
            aesDoseByCard: "",
            aesDoseByHistory: "",
            aesSiaDoses: "",
            aesDateOfLastDose: "",
          }),
    }));

setAesErrors((aesPrevious) => {
  const aesNext = { ...aesPrevious };

  delete aesNext.aesDoseByCard;
  delete aesNext.aesDoseByHistory;
  delete aesNext.aesSiaDoses;
  delete aesNext.aesDateOfLastDose;

  return aesNext;
});

    setAesPayload(null);
  }

  function aesSetTravel(aesChecked: boolean) {
    setAesForm((aesPrevious) => ({
      ...aesPrevious,
      aesTravelOutsideAreaLast14Days: aesChecked,
      ...(aesChecked
        ? {}
        : {
            aesTravelPeriodStart: "",
            aesTravelPeriodEnd: "",
            aesTravelPlaceDetails: "",
            aesTravelDivision: "",
            aesTravelDistrict: "",
            aesTravelUpazila: "",
            aesTravelMunicipality: "",
            aesTravelUnionWard: "",
            aesTravelNewWard: "",
            aesTravelHouseStreet: "",
            aesTravelVillageTown: "",
            aesTravelCountry: "",
          }),
    }));

    setAesErrors((aesPrevious) => {
      const aesNext = { ...aesPrevious };
      delete aesNext.aesTravelPeriodStart;
      delete aesNext.aesTravelPeriodEnd;
      delete aesNext.aesTravelPlaceDetails;
      delete aesNext.aesTravelDivision;
      delete aesNext.aesTravelDistrict;
      delete aesNext.aesTravelUpazila;
      return aesNext;
    });

    setAesPayload(null);
  }

  function aesValidate(): AesErrors {
    const aesNext: AesErrors = {};

    if (!aesForm.aesPopulationGroup) {
      aesNext.aesPopulationGroup = "Select one option.";
    }

    if (!aesForm.aesAcuteOnsetFever) {
      aesNext.aesAcuteOnsetFever = "Select Yes or No.";
    }

    if (!aesForm.aesAlteredMentalStatus) {
      aesNext.aesAlteredMentalStatus = "Select Yes or No.";
    }

    if (!aesForm.aesNewOnsetSeizures) {
      aesNext.aesNewOnsetSeizures = "Select Yes or No.";
    }

    // Date belongs to the acute-onset-of-fever question.
    if (
      aesForm.aesAcuteOnsetFever === "yes" &&
      !aesForm.aesFirstSymptomOnsetDate
    ) {
      aesNext.aesFirstSymptomOnsetDate =
        "Date of first symptom onset is required.";
    }

    if (aesMeetsCaseDefinition) {
      if (!aesForm.aesFever) {
        aesNext.aesFever = "Select Yes or No.";
      }

      if (!aesForm.aesSeizures) {
        aesNext.aesSeizures = "Select Yes or No.";
      }

      if (!aesForm.aesHeadaches) {
        aesNext.aesHeadaches = "Select Yes or No.";
      }

      if (!aesForm.aesMentalStatus) {
        aesNext.aesMentalStatus = "Select mental status.";
      }

      if (!aesForm.aesNeurologicMotorDetails) {
        aesNext.aesNeurologicMotorDetails =
          "Select neurologic details.";
      }

      if (aesForm.aesJeVaccineHistoryAvailable) {
      if (aesForm.aesDoseByCard === "") {
        aesNext.aesDoseByCard =
          "Dose by Card is required.";
      }

      if (aesForm.aesDoseByHistory === "") {
        aesNext.aesDoseByHistory =
          "Dose by History is required.";
      }

      if (
        aesForm.aesDoseByCard === "0" &&
        aesForm.aesDoseByHistory === "0"
      ) {
        aesNext.aesDoseByCard =
          "Both dose fields cannot be 0.";
        aesNext.aesDoseByHistory =
          "Both dose fields cannot be 0.";
      }

      if (!aesForm.aesDateOfLastDose) {
        aesNext.aesDateOfLastDose =
          "Date of last dose is required.";
      }
    }
      if (aesForm.aesTravelOutsideAreaLast14Days) {
        if (!aesForm.aesTravelPeriodStart) {
          aesNext.aesTravelPeriodStart =
            "Period start is required.";
        }

        if (!aesForm.aesTravelPeriodEnd) {
          aesNext.aesTravelPeriodEnd =
            "Period end is required.";
        }

        if (
          aesForm.aesTravelPeriodStart &&
          aesForm.aesTravelPeriodEnd &&
          aesForm.aesTravelPeriodEnd <
            aesForm.aesTravelPeriodStart
        ) {
          aesNext.aesTravelPeriodEnd =
            "End must be on or after start.";
        }

        if (!aesForm.aesTravelPlaceDetails.trim()) {
          aesNext.aesTravelPlaceDetails =
            "Place details are required.";
        }

        if (!aesForm.aesTravelDivision) {
          aesNext.aesTravelDivision =
            "Division is required.";
        }

        if (!aesForm.aesTravelDistrict.trim()) {
          aesNext.aesTravelDistrict =
            "District is required.";
        }

        if (!aesForm.aesTravelUpazila.trim()) {
          aesNext.aesTravelUpazila =
            "Upazila or thana is required.";
        }
      }
    }

    return aesNext;
  }

  function aesCreatePayload() {
    return {
      diseaseCode: "AES",
      populationGroup: aesForm.aesPopulationGroup,
      meetsAesScreeningCondition: aesMeetsCaseDefinition,

      caseDefinition: {
        acuteOnsetFever: aesToBoolean(
          aesForm.aesAcuteOnsetFever,
        ),
        alteredMentalStatus: aesToBoolean(
          aesForm.aesAlteredMentalStatus,
        ),
        newOnsetSeizures: aesToBoolean(
          aesForm.aesNewOnsetSeizures,
        ),
        firstSymptomOnsetDate:
          aesForm.aesAcuteOnsetFever === "yes"
            ? aesForm.aesFirstSymptomOnsetDate
            : null,
      },

      signsAndSymptoms: aesMeetsCaseDefinition
        ? {
            fever: aesToBoolean(aesForm.aesFever),
            seizures: aesToBoolean(aesForm.aesSeizures),
            headaches: aesToBoolean(aesForm.aesHeadaches),
            mentalStatus: aesForm.aesMentalStatus,
            neurologicMotorDetails:
              aesForm.aesNeurologicMotorDetails,
          }
        : null,

      vaccinationHistory: aesMeetsCaseDefinition
        ? {
            available:
              aesForm.aesJeVaccineHistoryAvailable,
            antigen: aesForm.aesJeVaccineHistoryAvailable
              ? "JE"
              : null,
            doseByCard:
              aesForm.aesJeVaccineHistoryAvailable
                ? aesForm.aesDoseByCard || null
                : null,
            doseByHistory:
              aesForm.aesJeVaccineHistoryAvailable
                ? aesForm.aesDoseByHistory || null
                : null,
            siaDoses:
              aesForm.aesJeVaccineHistoryAvailable
                ? aesForm.aesSiaDoses || null
                : null,
            dateOfLastDose:
              aesForm.aesJeVaccineHistoryAvailable
                ? aesForm.aesDateOfLastDose || null
                : null,
          }
        : null,

      travelHistory: aesMeetsCaseDefinition
        ? {
            traveledOutsideAreaLast14Days:
              aesForm.aesTravelOutsideAreaLast14Days,

            ...(aesForm.aesTravelOutsideAreaLast14Days
              ? {
                  periodStart:
                    aesForm.aesTravelPeriodStart,
                  periodEnd:
                    aesForm.aesTravelPeriodEnd,
                  placeDetails:
                    aesForm.aesTravelPlaceDetails,
                  division:
                    aesForm.aesTravelDivision,
                  district:
                    aesForm.aesTravelDistrict,
                  upazila:
                    aesForm.aesTravelUpazila,
                  municipality:
                    aesForm.aesTravelMunicipality ||
                    null,
                  unionWard:
                    aesForm.aesTravelUnionWard ||
                    null,
                  newWard:
                    aesForm.aesTravelNewWard || null,
                  houseStreet:
                    aesForm.aesTravelHouseStreet ||
                    null,
                  villageTown:
                    aesForm.aesTravelVillageTown ||
                    null,
                  countryIfOutsideBangladesh:
                    aesForm.aesTravelCountry || null,
                }
              : {}),
          }
        : null,
    };
  }

  function aesSubmit(aesEvent: FormEvent<HTMLFormElement>) {
    aesEvent.preventDefault();

    const aesNextErrors = aesValidate();
    setAesErrors(aesNextErrors);

    if (Object.keys(aesNextErrors).length > 0) {
      setAesPayload(null);
      return;
    }

    // Frontend preview only. No API request is made.
    setAesPayload(aesCreatePayload());
  }

  function aesReset() {
    setAesForm({ ...aesInitialForm });
    setAesErrors({});
    setAesPayload(null);
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f2f5f9",
        padding: { xs: "12px 0 40px", md: "20px 0 60px" },
      }}
    >
      <Container maxWidth="xl">
        <Box component="form" noValidate onSubmit={aesSubmit}>
          {/* Disease Selection */}
          <Paper elevation={0} sx={aesPanelSx}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "1fr minmax(280px, 400px)",
                },
                alignItems: "center",
                gap: 2,
                margin: {
                  xs: "-16px -16px 18px",
                  md: "-20px -20px 18px",
                },
                padding: "18px 20px",
                backgroundColor: "#1e3967",
              }}
            >
              <Box>
                <Typography
                  component="h1"
                  sx={{
                    color: "#fff",
                    fontSize: "20px",
                    fontWeight: 700,
                  }}
                >
                  Disease Selection
                </Typography>

                <Typography
                  sx={{ color: "#fff", fontSize: "12px" }}
                >
                  Select the specific surveillance target for
                  clinical branching.
                </Typography>
              </Box>

              <TextField
                select
                fullWidth
                value="AES"
                inputProps={{
                  "aria-label": "Selected disease",
                }}
                sx={{
                  ...aesFieldSx,
                  "& .MuiOutlinedInput-root": {
                    height: 40,
                    borderRadius: "2px",
                    backgroundColor: "#fff",
                    fontSize: "13px",
                    fontWeight: 700,
                  },
                }}
              >
                <MenuItem value="AES">
                  Acute Encephalitis Syndrome (AES)
                </MenuItem>
              </TextField>
            </Box>

            <Box sx={{ mb: 2 }}>
              <AesLabel aesText="EPID CODE (auto-generated)" />

              <TextField
                fullWidth
                disabled
                value="Generated by the existing system"
                inputProps={{ "aria-label": "EPID code" }}
                sx={aesFieldSx}
              />
            </Box>

            <AesLabel
              aesText="Population Group"
              aesRequired
            />

            <Box sx={{ display: "flex", flexWrap: "wrap" }}>
              <FormControlLabel
                label="Tribal"
                control={
                  <Checkbox
                    checked={
                      aesForm.aesPopulationGroup ===
                      "tribal"
                    }
                    onChange={() =>
                      aesUpdate(
                        "aesPopulationGroup",
                        aesForm.aesPopulationGroup ===
                          "tribal"
                          ? ""
                          : "tribal",
                      )
                    }
                  />
                }
              />

              <FormControlLabel
                label="Non-Tribal"
                control={
                  <Checkbox
                    checked={
                      aesForm.aesPopulationGroup ===
                      "non_tribal"
                    }
                    onChange={() =>
                      aesUpdate(
                        "aesPopulationGroup",
                        aesForm.aesPopulationGroup ===
                          "non_tribal"
                          ? ""
                          : "non_tribal",
                      )
                    }
                  />
                }
              />
            </Box>

            {aesErrors.aesPopulationGroup && (
              <Typography
                role="alert"
                sx={{ color: aesRed, fontSize: "11px" }}
              >
                {aesErrors.aesPopulationGroup}
              </Typography>
            )}
          </Paper>

          {/* AES Case Definition */}
          <Paper elevation={0} sx={aesPanelSx}>
            <AesSectionHeading
              aesTitle="AES Case Definition"
              aesIcon={<AssignmentOutlinedIcon />}
              aesRight={
                <Typography
                  sx={{
                    color: aesRed,
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  * Mandatory fields
                </Typography>
              }
            />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  lg: "2fr 1fr",
                },
                gap: 1.5,
              }}
            >
              <Box sx={aesCardSx}>
                <AesQuestionRow
                  aesText="1. Acute onset of fever"
                  aesValue={aesForm.aesAcuteOnsetFever}
                  aesError={
                    aesErrors.aesAcuteOnsetFever
                  }
                  aesOnChange={(aesAnswer) =>
                    aesUpdate(
                      "aesAcuteOnsetFever",
                      aesAnswer,
                    )
                  }
                />

                <AesQuestionRow
                  aesText="2. Altered mental status (coma, lethargy, confusion, agitation)"
                  aesValue={
                    aesForm.aesAlteredMentalStatus
                  }
                  aesError={
                    aesErrors.aesAlteredMentalStatus
                  }
                  aesOnChange={(aesAnswer) =>
                    aesUpdate(
                      "aesAlteredMentalStatus",
                      aesAnswer,
                    )
                  }
                />

                <AesQuestionRow
                  aesText="3. New onset seizures (excluding simple febrile seizures)"
                  aesValue={aesForm.aesNewOnsetSeizures}
                  aesError={
                    aesErrors.aesNewOnsetSeizures
                  }
                  aesHint="Child 6 months to < 6 years old whose only finding is fever and single generalised seizure lasting < 15 minutes with recovery of consciousness within 60 minutes."
                  aesOnChange={(aesAnswer) =>
                    aesUpdate(
                      "aesNewOnsetSeizures",
                      aesAnswer,
                    )
                  }
                  aesLast
                />
              </Box>

              <Box sx={aesCardSx}>
                <AesLabel
                  aesText="Date of 1st symptom onset"
                  aesRequired={
                    aesForm.aesAcuteOnsetFever ===
                    "yes"
                  }
                  aesHtmlFor="aes-first-symptom-date"
                />

                <TextField
                  id="aes-first-symptom-date"
                  type="date"
                  fullWidth
                  disabled={
                    aesForm.aesAcuteOnsetFever !==
                    "yes"
                  }
                  value={
                    aesForm.aesFirstSymptomOnsetDate
                  }
                  error={Boolean(
                    aesErrors.aesFirstSymptomOnsetDate,
                  )}
                  helperText={
                    aesErrors.aesFirstSymptomOnsetDate
                  }
                  onChange={(aesEvent) =>
                    aesUpdate(
                      "aesFirstSymptomOnsetDate",
                      aesEvent.target.value,
                    )
                  }
                  inputProps={{ max: aesMaxDate }}
                  sx={aesFieldSx}
                />
              </Box>
            </Box>

            {!aesDefinitionComplete && (
              <Typography
                sx={{
                  color: "#62748e",
                  fontSize: "12px",
                  mt: 1.5,
                }}
              >
                The remaining sections open when acute onset of fever
                is Yes and at least one of altered mental status or
                new onset seizures is Yes. Answer all three questions.
              </Typography>
            )}

            {aesDefinitionComplete && !aesMeetsCaseDefinition && (
              <Alert severity="info" sx={{ mt: 1.5 }}>
                The AES screening condition is not met.
              </Alert>
            )}
          </Paper>

          <Collapse
            in={aesMeetsCaseDefinition}
            timeout={250}
            unmountOnExit
          >
            {/* Signs and Symptoms */}
            <Paper elevation={0} sx={aesPanelSx}>
              <AesSectionHeading
                aesTitle="Signs and Symptoms"
                aesIcon={
                  <MedicalServicesOutlinedIcon />
                }
                aesRight={
                  <Typography
                    sx={{
                      color: aesRed,
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    * Mandatory fields
                  </Typography>
                }
              />

              <Box sx={aesThreeColumnsSx}>
                <Box sx={aesCardSx}>
                  <AesQuestionRow
                    aesText="Fever"
                    aesValue={aesForm.aesFever}
                    aesError={aesErrors.aesFever}
                    aesOnChange={(aesAnswer) =>
                      aesUpdate("aesFever", aesAnswer)
                    }
                  />

                  <AesQuestionRow
                    aesText="Seizures"
                    aesValue={aesForm.aesSeizures}
                    aesError={aesErrors.aesSeizures}
                    aesOnChange={(aesAnswer) =>
                      aesUpdate(
                        "aesSeizures",
                        aesAnswer,
                      )
                    }
                  />

                  <AesQuestionRow
                    aesText="Headaches"
                    aesValue={aesForm.aesHeadaches}
                    aesError={aesErrors.aesHeadaches}
                    aesOnChange={(aesAnswer) =>
                      aesUpdate(
                        "aesHeadaches",
                        aesAnswer,
                      )
                    }
                    aesLast
                  />
                </Box>

                <Box sx={aesCardSx}>
                  <AesLabel
                    aesText="Mental Status"
                    aesRequired
                    aesHtmlFor="aes-mental-status"
                  />

                  <TextField
                    id="aes-mental-status"
                    select
                    fullWidth
                    value={aesForm.aesMentalStatus}
                    error={Boolean(
                      aesErrors.aesMentalStatus,
                    )}
                    helperText={
                      aesErrors.aesMentalStatus
                    }
                    onChange={(aesEvent) =>
                      aesUpdate(
                        "aesMentalStatus",
                        aesEvent.target.value,
                      )
                    }
                    SelectProps={{
                      displayEmpty: true,
                      MenuProps: {
                        PaperProps: {
                          sx: {
                            "& .MuiMenuItem-root": {
                              fontSize: "13px",
                              minHeight: 36,
                            },
                          },
                        },
                      },
                    }}
                    sx={aesFieldSx}
                  >
                    <MenuItem value="" disabled>
                      Pick MOST appropriate one
                    </MenuItem>

                    {aesMentalStatusOptions.map(
                      (aesOption) => (
                        <MenuItem
                          key={aesOption}
                          value={aesOption}
                        >
                          {aesOption}
                        </MenuItem>
                      ),
                    )}
                  </TextField>
                </Box>

                <Box sx={aesCardSx}>
                  <AesLabel
                    aesText="Neurologic Details (Motor)"
                    aesRequired
                    aesHtmlFor="aes-motor-details"
                  />

                  <TextField
                    id="aes-motor-details"
                    select
                    fullWidth
                    value={
                      aesForm.aesNeurologicMotorDetails
                    }
                    error={Boolean(
                      aesErrors
                        .aesNeurologicMotorDetails,
                    )}
                    helperText={
                      aesErrors
                        .aesNeurologicMotorDetails
                    }
                    onChange={(aesEvent) =>
                      aesUpdate(
                        "aesNeurologicMotorDetails",
                        aesEvent.target.value,
                      )
                    }
                    SelectProps={{
                      displayEmpty: true,
                      MenuProps: {
                        PaperProps: {
                          sx: {
                            "& .MuiMenuItem-root": {
                              fontSize: "13px",
                              minHeight: 36,
                            },
                          },
                        },
                      },
                    }}
                    sx={aesFieldSx}
                  >
                    <MenuItem value="" disabled>
                      Pick MOST appropriate one
                    </MenuItem>

                    {aesMotorOptions.map(
                      (aesOption) => (
                        <MenuItem
                          key={aesOption}
                          value={aesOption}
                        >
                          {aesOption}
                        </MenuItem>
                      ),
                    )}
                  </TextField>
                </Box>
              </Box>
            </Paper>

            {/* Vaccination History */}
            <Paper elevation={0} sx={aesPanelSx}>
              <AesSectionHeading
                aesTitle="Vaccination History"
                aesIcon={<VaccinesOutlinedIcon />}
                aesRight={
                  <AesToggle
                    aesLabel="Japanese encephalitis (JE) vaccine history available?"
                    aesChecked={
                      aesForm
                        .aesJeVaccineHistoryAvailable
                    }
                    aesOnChange={aesSetVaccination}
                  />
                }
              />

              <Collapse
                in={
                  aesForm
                    .aesJeVaccineHistoryAvailable
                }
                timeout={250}
                unmountOnExit
              >
                <Box sx={{ overflowX: "auto" }}>
                  <Box
                    sx={{
                      minWidth: {
                        xs: 730,
                        lg: "unset",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns:
                          "0.7fr 1fr 1fr 1fr 1.2fr",
                        gap: 1.5,
                        padding: "8px 10px",
                        borderTop:
                          `1px solid ${aesBorder}`,
                        borderBottom:
                          `1px solid ${aesBorder}`,
                      }}
                    >
                      {[
                        "ANTIGEN",
                        "DOSE BY CARD",
                        "DOSE BY HISTORY",
                        "SIA DOSES",
                        "DATE OF LAST DOSE *",
                      ].map((aesHeading) => (
                        <Typography
                          key={aesHeading}
                          sx={{
                            color: aesNavy,
                            fontSize: "11px",
                            fontWeight: 600,
                          }}
                        >
                          {aesHeading}
                        </Typography>
                      ))}
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns:
                          "0.7fr 1fr 1fr 1fr 1.2fr",
                        alignItems: "start",
                        gap: 1.5,
                        padding: "12px 10px 4px",
                      }}
                    >
                      <TextField
                        fullWidth
                        disabled
                        value="JE"
                        inputProps={{
                          "aria-label": "Antigen",
                        }}
                        sx={aesFieldSx}
                      />

                      <TextField
                        select
                        fullWidth
                        value={
                          aesForm.aesDoseByCard
                        }
                        error={Boolean(
                          aesErrors.aesDoseByCard,
                        )}
                        helperText={
                          aesErrors.aesDoseByCard
                        }
                        onChange={(aesEvent) =>
                          aesUpdate(
                            "aesDoseByCard",
                            aesEvent.target.value,
                          )
                        }
                        SelectProps={{
                          displayEmpty: true,
                        }}
                        inputProps={{
                          "aria-label":
                            "Dose by card",
                        }}
                        sx={aesFieldSx}
                      >
                        <MenuItem value="">
                          Select dose
                        </MenuItem>

                        {aesRegularDoses.map(
                          (aesDose) => (
                            <MenuItem
                              key={aesDose}
                              value={aesDose}
                            >
                              {aesDose}
                            </MenuItem>
                          ),
                        )}
                      </TextField>

<TextField
  select
  fullWidth
  value={aesForm.aesDoseByHistory}
  error={Boolean(aesErrors.aesDoseByHistory)}
  helperText={aesErrors.aesDoseByHistory}
  onChange={(aesEvent) =>
    aesUpdate(
      "aesDoseByHistory",
      aesEvent.target.value,
    )
  }
  SelectProps={{
    displayEmpty: true,
  }}
  inputProps={{
    "aria-label": "Dose by history",
  }}
  sx={aesFieldSx}
>
  <MenuItem value="">Select dose</MenuItem>

  {aesRegularDoses.map((aesDose) => (
    <MenuItem key={aesDose} value={aesDose}>
      {aesDose}
    </MenuItem>
  ))}
</TextField>

                      <TextField
                        select
                        fullWidth
                        value={
                          aesForm.aesSiaDoses
                        }
                        onChange={(aesEvent) =>
                          aesUpdate(
                            "aesSiaDoses",
                            aesEvent.target.value,
                          )
                        }
                        SelectProps={{
                          displayEmpty: true,
                        }}
                        inputProps={{
                          "aria-label": "SIA doses",
                        }}
                        sx={aesFieldSx}
                      >
                        <MenuItem value="">
                          Select dose
                        </MenuItem>

                        {aesSiaDoses.map(
                          (aesDose) => (
                            <MenuItem
                              key={aesDose}
                              value={aesDose}
                            >
                              {aesDose}
                            </MenuItem>
                          ),
                        )}
                      </TextField>

                      <TextField
                        fullWidth
                        type="date"
                        value={
                          aesForm.aesDateOfLastDose
                        }
                        error={Boolean(
                          aesErrors
                            .aesDateOfLastDose,
                        )}
                        helperText={
                          aesErrors
                            .aesDateOfLastDose
                        }
                        onChange={(aesEvent) =>
                          aesUpdate(
                            "aesDateOfLastDose",
                            aesEvent.target.value,
                          )
                        }
                        inputProps={{
                          max: aesMaxDate,
                          "aria-label":
                            "Date of last dose",
                        }}
                        sx={aesFieldSx}
                      />
                    </Box>
                  </Box>
                </Box>
              </Collapse>
            </Paper>

            {/* Travel History */}
            <Paper elevation={0} sx={aesPanelSx}>
              <AesSectionHeading
                aesTitle="Travel History"
                aesIcon={
                  <FlightTakeoffOutlinedIcon />
                }
                aesRight={
                  <AesToggle
                    aesLabel="Travel outside area in last 14 days?"
                    aesChecked={
                      aesForm
                        .aesTravelOutsideAreaLast14Days
                    }
                    aesOnChange={aesSetTravel}
                    aesColor="error"
                  />
                }
              />

              <Collapse
                in={
                  aesForm
                    .aesTravelOutsideAreaLast14Days
                }
                timeout={250}
                unmountOnExit
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "200px 200px minmax(0, 1fr)",
                    },
                    gap: 1.5,
                  }}
                >
                  <Box>
                    <AesLabel
                      aesText="PERIOD START"
                      aesRequired
                      aesHtmlFor="aes-travel-start"
                    />

                    <TextField
                      id="aes-travel-start"
                      fullWidth
                      type="date"
                      value={
                        aesForm.aesTravelPeriodStart
                      }
                      error={Boolean(
                        aesErrors
                          .aesTravelPeriodStart,
                      )}
                      helperText={
                        aesErrors
                          .aesTravelPeriodStart
                      }
                      onChange={(aesEvent) =>
                        aesUpdate(
                          "aesTravelPeriodStart",
                          aesEvent.target.value,
                        )
                      }
                      inputProps={{
                        max: aesMaxDate,
                      }}
                      sx={aesFieldSx}
                    />
                  </Box>

                  <Box>
                    <AesLabel
                      aesText="PERIOD END"
                      aesRequired
                      aesHtmlFor="aes-travel-end"
                    />

                    <TextField
                      id="aes-travel-end"
                      fullWidth
                      type="date"
                      value={
                        aesForm.aesTravelPeriodEnd
                      }
                      error={Boolean(
                        aesErrors
                          .aesTravelPeriodEnd,
                      )}
                      helperText={
                        aesErrors
                          .aesTravelPeriodEnd
                      }
                      onChange={(aesEvent) =>
                        aesUpdate(
                          "aesTravelPeriodEnd",
                          aesEvent.target.value,
                        )
                      }
                      inputProps={{
                        min:
                          aesForm
                            .aesTravelPeriodStart ||
                          undefined,
                        max: aesMaxDate,
                      }}
                      sx={aesFieldSx}
                    />
                  </Box>

                  <Box>
                    <AesLabel
                      aesText="PLACE DETAILS"
                      aesRequired
                      aesHtmlFor="aes-travel-place"
                    />

                    <TextField
                      id="aes-travel-place"
                      fullWidth
                      placeholder="Specific hotel or residence"
                      value={
                        aesForm
                          .aesTravelPlaceDetails
                      }
                      error={Boolean(
                        aesErrors
                          .aesTravelPlaceDetails,
                      )}
                      helperText={
                        aesErrors
                          .aesTravelPlaceDetails
                      }
                      onChange={(aesEvent) =>
                        aesUpdate(
                          "aesTravelPlaceDetails",
                          aesEvent.target.value,
                        )
                      }
                      sx={aesFieldSx}
                    />
                  </Box>
                </Box>

                <Typography
                  sx={{
                    color: aesNavy,
                    fontSize: "13px",
                    fontWeight: 700,
                    marginTop: 3,
                    marginBottom: 1.5,
                  }}
                >
                  ADDRESS INFORMATION
                </Typography>

                <Box sx={aesThreeColumnsSx}>
                  <Box>
                    <AesLabel
                      aesText="DIVISION"
                      aesRequired
                      aesHtmlFor="aes-division"
                    />

                    <TextField
                      id="aes-division"
                      select
                      fullWidth
                      value={
                        aesForm.aesTravelDivision
                      }
                      error={Boolean(
                        aesErrors
                          .aesTravelDivision,
                      )}
                      helperText={
                        aesErrors
                          .aesTravelDivision
                      }
                      onChange={(aesEvent) =>
                        aesUpdate(
                          "aesTravelDivision",
                          aesEvent.target.value,
                        )
                      }
                      SelectProps={{
                        displayEmpty: true,
                      }}
                      sx={aesFieldSx}
                    >
                      <MenuItem value="">
                        Select Division
                      </MenuItem>

                      {aesDivisions.map(
                        (aesDivision) => (
                          <MenuItem
                            key={aesDivision}
                            value={aesDivision}
                          >
                            {aesDivision}
                          </MenuItem>
                        ),
                      )}
                    </TextField>
                  </Box>

                  <Box>
                    <AesLabel
                      aesText="DISTRICT / CITY CORPORATION"
                      aesRequired
                      aesHtmlFor="aes-district"
                    />

                    <TextField
                      id="aes-district"
                      fullWidth
                      placeholder="District / City Corporation"
                      value={
                        aesForm.aesTravelDistrict
                      }
                      error={Boolean(
                        aesErrors
                          .aesTravelDistrict,
                      )}
                      helperText={
                        aesErrors
                          .aesTravelDistrict
                      }
                      onChange={(aesEvent) =>
                        aesUpdate(
                          "aesTravelDistrict",
                          aesEvent.target.value,
                        )
                      }
                      sx={aesFieldSx}
                    />
                  </Box>

                  <Box>
                    <AesLabel
                      aesText="UPAZILA / THANA"
                      aesRequired
                      aesHtmlFor="aes-upazila"
                    />

                    <TextField
                      id="aes-upazila"
                      fullWidth
                      placeholder="Upazila / Thana"
                      value={
                        aesForm.aesTravelUpazila
                      }
                      error={Boolean(
                        aesErrors
                          .aesTravelUpazila,
                      )}
                      helperText={
                        aesErrors
                          .aesTravelUpazila
                      }
                      onChange={(aesEvent) =>
                        aesUpdate(
                          "aesTravelUpazila",
                          aesEvent.target.value,
                        )
                      }
                      sx={aesFieldSx}
                    />
                  </Box>

                  <Box>
                    <AesLabel
                      aesText="MUNICIPALITY / ZONE / UNION GROUP"
                      aesHtmlFor="aes-municipality"
                    />

                    <TextField
                      id="aes-municipality"
                      fullWidth
                      placeholder="Optional"
                      value={
                        aesForm
                          .aesTravelMunicipality
                      }
                      onChange={(aesEvent) =>
                        aesUpdate(
                          "aesTravelMunicipality",
                          aesEvent.target.value,
                        )
                      }
                      sx={aesFieldSx}
                    />
                  </Box>

                  <Box>
                    <AesLabel
                      aesText="UNION / URBAN WARD"
                      aesHtmlFor="aes-union"
                    />

                    <TextField
                      id="aes-union"
                      fullWidth
                      placeholder="Optional"
                      value={
                        aesForm.aesTravelUnionWard
                      }
                      onChange={(aesEvent) =>
                        aesUpdate(
                          "aesTravelUnionWard",
                          aesEvent.target.value,
                        )
                      }
                      sx={aesFieldSx}
                    />
                  </Box>

                  <Box>
                    <AesLabel
                      aesText="NEW WARD / OLD WARD"
                      aesHtmlFor="aes-new-ward"
                    />

                    <TextField
                      id="aes-new-ward"
                      fullWidth
                      placeholder="Optional"
                      value={
                        aesForm.aesTravelNewWard
                      }
                      onChange={(aesEvent) =>
                        aesUpdate(
                          "aesTravelNewWard",
                          aesEvent.target.value,
                        )
                      }
                      sx={aesFieldSx}
                    />
                  </Box>

                  <Box>
                    <AesLabel
                      aesText="HOUSE / STREET"
                      aesHtmlFor="aes-house-street"
                    />

                    <TextField
                      id="aes-house-street"
                      fullWidth
                      placeholder="House / Street"
                      value={
                        aesForm
                          .aesTravelHouseStreet
                      }
                      onChange={(aesEvent) =>
                        aesUpdate(
                          "aesTravelHouseStreet",
                          aesEvent.target.value,
                        )
                      }
                      sx={aesFieldSx}
                    />
                  </Box>

                  <Box>
                    <AesLabel
                      aesText="VILLAGE / TOWN"
                      aesHtmlFor="aes-village"
                    />

                    <TextField
                      id="aes-village"
                      fullWidth
                      placeholder="Village / Town"
                      value={
                        aesForm.aesTravelVillageTown
                      }
                      onChange={(aesEvent) =>
                        aesUpdate(
                          "aesTravelVillageTown",
                          aesEvent.target.value,
                        )
                      }
                      sx={aesFieldSx}
                    />
                  </Box>

                  <Box>
                    <AesLabel
                      aesText="COUNTRY (IF OTHER THAN BANGLADESH)"
                      aesHtmlFor="aes-country"
                    />

                    <TextField
                      id="aes-country"
                      fullWidth
                      placeholder="Country"
                      value={
                        aesForm.aesTravelCountry
                      }
                      onChange={(aesEvent) =>
                        aesUpdate(
                          "aesTravelCountry",
                          aesEvent.target.value,
                        )
                      }
                      sx={aesFieldSx}
                    />
                  </Box>
                </Box>
              </Collapse>
            </Paper>
          </Collapse>

          <Box
            sx={{
              display: "flex",
              flexDirection: {
                xs: "column-reverse",
                sm: "row",
              },
              justifyContent: "flex-end",
              gap: 1.5,
              marginTop: 2,
            }}
          >
            <Button
              type="button"
              variant="outlined"
              onClick={aesReset}
              sx={{
                minWidth: 120,
                height: 38,
                borderRadius: "3px",
                textTransform: "none",
              }}
            >
              Reset
            </Button>

            <Button
              type="submit"
              variant="contained"
              sx={{
                minWidth: 140,
                height: 38,
                borderRadius: "3px",
                backgroundColor: "#2467d6",
                textTransform: "none",
              }}
            >
              Validate AES Form
            </Button>
          </Box>
        </Box>

        {aesPayload && (
          <Paper elevation={0} sx={{ ...aesPanelSx, mt: 2 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              Frontend validation passed. No data was sent
              to a backend.
            </Alert>

            <Typography
              component="h2"
              sx={{
                color: aesNavy,
                fontSize: "18px",
                fontWeight: 700,
                mb: 1,
              }}
            >
              AES-CIF payload preview
            </Typography>

            <Box
              component="pre"
              sx={{
                margin: 0,
                padding: 2,
                overflowX: "auto",
                borderRadius: 1,
                backgroundColor: "#111827",
                color: "#fff",
                fontSize: "12px",
              }}
            >
              {JSON.stringify(aesPayload, null, 2)}
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
}

export default App;