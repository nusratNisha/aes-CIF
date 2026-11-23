import { useState, type FormEvent, type ReactNode } from "react";

import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import FlightTakeoffOutlinedIcon from "@mui/icons-material/FlightTakeoffOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import VaccinesOutlinedIcon from "@mui/icons-material/VaccinesOutlined";

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

type AesYesNo = "yes" | "no" | "";
type AesPopulationGroup = "tribal" | "non_tribal" | "";

type AesForm = {
  aesPopulationGroup: AesPopulationGroup;

  aesAcuteOnsetFever: AesYesNo;
  aesAlteredMentalStatus: AesYesNo;
  aesNewOnsetSeizures: AesYesNo;
  aesFirstSymptomOnsetDate: string;

  aesFever: AesYesNo;
  aesSeizures: AesYesNo;
  aesHeadaches: AesYesNo;
  aesMentalStatus: string;
  aesNeurologicMotorDetails: string;

  aesJeVaccineHistoryAvailable: boolean;
  aesDoseByCard: string;
  aesDoseByHistory: string;
  aesSiaDoses: string;
  aesDateOfLastDose: string;

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

const aesDoseOptions = Array.from(
  { length: 10 },
  (_, aesIndex) => String(aesIndex),
);

const aesSiaDoseOptions = Array.from(
  { length: 10 },
  (_, aesIndex) => String(aesIndex + 1),
);

const aesNavy = "#18355f";
const aesBorder = "#cbd7e8";
const aesRed = "#d32f2f";

const aesLabelSx = {
  display: "block",
  color: aesNavy,
  fontFamily: "inherit",
  fontSize: "12px",
  fontWeight: 600,
  lineHeight: 1.4,
  marginBottom: "7px",
};

const aesFieldSx = {
  width: "100%",

  "& .MuiOutlinedInput-root": {
    height: 40,
    borderRadius: "2px",
    backgroundColor: "#fff",
    fontFamily: "inherit",
    fontSize: "13px",
  },

  "& .MuiInputBase-input": {
    padding: "9px 12px",
    fontFamily: "inherit",
    fontSize: "13px",
  },

  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    minHeight: "0 !important",
    padding: "9px 32px 9px 12px !important",
    fontFamily: "inherit",
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
      sx={aesLabelSx}
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
  const aesButtonSx = (aesAnswer: "yes" | "no") => {
    const aesSelected = aesValue === aesAnswer;
    const aesOppositeSelected =
      aesValue !== "" && !aesSelected;

    return {
      minWidth: 46,
      height: 28,
      padding: "2px 9px",
      borderRadius: "3px",
      border: `1px solid ${
        aesSelected ? "#1769ee" : "#bbcbe1"
      }`,
      backgroundColor: aesSelected
        ? "#eef4ff"
        : aesOppositeSelected
          ? "#f6f8fb"
          : "#fff",
      color: aesSelected
        ? "#1769ee"
        : aesOppositeSelected
          ? "#a4afbf"
          : aesNavy,
      fontSize: "11px",
      fontWeight: aesSelected ? 700 : 500,
      textTransform: "none",
      cursor: "pointer",

      "&:hover": {
        backgroundColor: aesSelected
          ? "#e4eeff"
          : "#eef4ff",
        borderColor: "#1769ee",
        color: "#1769ee",
      },
    };
  };

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 0.75 }}>
        <Button
          type="button"
          aria-pressed={aesValue === "yes"}
          sx={aesButtonSx("yes")}
          onClick={() => aesOnChange("yes")}
        >
          Yes
        </Button>

        <Button
          type="button"
          aria-pressed={aesValue === "no"}
          sx={aesButtonSx("no")}
          onClick={() => aesOnChange("no")}
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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
        }}
      >
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
        slotProps={{
          input: { "aria-label": aesLabel },
        }}
              />
    </Box>
  );
}

function AesSelectField({
  aesId,
  aesLabel,
  aesValue,
  aesOptions,
  aesPlaceholder,
  aesError,
  aesRequired = false,
  aesOnChange,
}: {
  aesId: string;
  aesLabel: string;
  aesValue: string;
  aesOptions: string[];
  aesPlaceholder: string;
  aesError?: string;
  aesRequired?: boolean;
  aesOnChange: (aesValue: string) => void;
}) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <AesLabel
        aesText={aesLabel}
        aesRequired={aesRequired}
        aesHtmlFor={aesId}
      />

      <TextField
        id={aesId}
        select
        fullWidth
        value={aesValue}
        error={Boolean(aesError)}
        helperText={aesError}
        onChange={(aesEvent) =>
          aesOnChange(aesEvent.target.value)
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
          {aesPlaceholder}
        </MenuItem>

        {aesOptions.map((aesOption) => (
          <MenuItem key={aesOption} value={aesOption}>
            {aesOption}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
}

function AesTextField({
  aesId,
  aesLabel,
  aesValue,
  aesOnChange,
  aesPlaceholder,
  aesError,
  aesRequired = false,
  aesType = "text",
  aesMin,
  aesMax,
}: {
  aesId: string;
  aesLabel: string;
  aesValue: string;
  aesOnChange: (aesValue: string) => void;
  aesPlaceholder?: string;
  aesError?: string;
  aesRequired?: boolean;
  aesType?: "text" | "date";
  aesMin?: string;
  aesMax?: string;
}) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <AesLabel
        aesText={aesLabel}
        aesRequired={aesRequired}
        aesHtmlFor={aesId}
      />

      <TextField
        id={aesId}
        type={aesType}
        fullWidth
        value={aesValue}
        placeholder={aesPlaceholder}
        error={Boolean(aesError)}
        helperText={aesError}
        onChange={(aesEvent) =>
          aesOnChange(aesEvent.target.value)
        }
      slotProps={{
        htmlInput: {
          min: aesMin,
          max: aesMax,
        },
      }}
        sx={aesFieldSx}
      />
    </Box>
  );
}

function App() {
  const [aesEpidCode, setAesEpidCode] = useState("");
  const [aesForm, setAesForm] =
    useState<AesForm>(aesInitialForm);
  const [aesErrors, setAesErrors] =
    useState<AesErrors>({});
  const [aesPayload, setAesPayload] =
    useState<object | null>(null);
  const [aesIsSaving, setAesIsSaving] = useState(false);
  const [aesSaveError, setAesSaveError] = useState("");
  const [aesSavedCaseId, setAesSavedCaseId] = useState("");

  const aesMaxDate = aesToday();

  const aesDefinitionComplete = [
    aesForm.aesAcuteOnsetFever,
    aesForm.aesAlteredMentalStatus,
    aesForm.aesNewOnsetSeizures,
  ].every((aesAnswer) => aesAnswer !== "");

  const aesMeetsCaseDefinition =
    aesDefinitionComplete &&
    aesForm.aesAcuteOnsetFever === "yes" &&
    (aesForm.aesAlteredMentalStatus === "yes" ||
      aesForm.aesNewOnsetSeizures === "yes");

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
      aesNext.aesPopulationGroup =
        "Select Tribal or Non-Tribal.";
    }

    if (!aesForm.aesAcuteOnsetFever) {
      aesNext.aesAcuteOnsetFever =
        "Select Yes or No.";
    }

    if (!aesForm.aesAlteredMentalStatus) {
      aesNext.aesAlteredMentalStatus =
        "Select Yes or No.";
    }

    if (!aesForm.aesNewOnsetSeizures) {
      aesNext.aesNewOnsetSeizures =
        "Select Yes or No.";
    }

    if (aesForm.aesAcuteOnsetFever === "yes") {
      if (!aesForm.aesFirstSymptomOnsetDate) {
        aesNext.aesFirstSymptomOnsetDate =
          "Date of first symptom onset is required.";
      } else if (
        aesForm.aesFirstSymptomOnsetDate > aesMaxDate
      ) {
        aesNext.aesFirstSymptomOnsetDate =
          "Date cannot be in the future.";
      }
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
        aesNext.aesMentalStatus =
          "Select mental status.";
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
        } else if (
          aesForm.aesDateOfLastDose > aesMaxDate
        ) {
          aesNext.aesDateOfLastDose =
            "Date cannot be in the future.";
        }
      }

      if (aesForm.aesTravelOutsideAreaLast14Days) {
        if (!aesForm.aesTravelPeriodStart) {
          aesNext.aesTravelPeriodStart =
            "Period start is required.";
        } else if (
          aesForm.aesTravelPeriodStart > aesMaxDate
        ) {
          aesNext.aesTravelPeriodStart =
            "Date cannot be in the future.";
        }

        if (!aesForm.aesTravelPeriodEnd) {
          aesNext.aesTravelPeriodEnd =
            "Period end is required.";
        } else if (
          aesForm.aesTravelPeriodEnd > aesMaxDate
        ) {
          aesNext.aesTravelPeriodEnd =
            "Date cannot be in the future.";
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
      meetsAesScreeningCondition:
        aesMeetsCaseDefinition,

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
            seizures: aesToBoolean(
              aesForm.aesSeizures,
            ),
            headaches: aesToBoolean(
              aesForm.aesHeadaches,
            ),
            mentalStatus:
              aesForm.aesMentalStatus,
            neurologicMotorDetails:
              aesForm.aesNeurologicMotorDetails,
          }
        : null,

      vaccinationHistory: aesMeetsCaseDefinition
        ? {
            available:
              aesForm.aesJeVaccineHistoryAvailable,
            antigen:
              aesForm.aesJeVaccineHistoryAvailable
                ? "JE"
                : null,
            doseByCard:
              aesForm.aesJeVaccineHistoryAvailable
                ? aesForm.aesDoseByCard
                : null,
            doseByHistory:
              aesForm.aesJeVaccineHistoryAvailable
                ? aesForm.aesDoseByHistory
                : null,
            siaDoses:
              aesForm.aesJeVaccineHistoryAvailable
                ? aesForm.aesSiaDoses || null
                : null,
            dateOfLastDose:
              aesForm.aesJeVaccineHistoryAvailable
                ? aesForm.aesDateOfLastDose
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
                    aesForm.aesTravelCountry ||
                    null,
                }
              : {}),
          }
        : null,
    };
  }

 async function aesSubmit(
  aesEvent: FormEvent<HTMLFormElement>,
) {
  aesEvent.preventDefault();

  const aesNextErrors = aesValidate();
  setAesErrors(aesNextErrors);
  setAesSaveError("");
  setAesSavedCaseId("");

  if (Object.keys(aesNextErrors).length > 0) {
    setAesPayload(null);
    return;
  }

  // Local testing only. Use a different ID for each new test record.
  // Later, replace this with the actual NDSS case/notification ID.
const aesExternalCaseId = aesEpidCode.trim();

if (!/^[A-Za-z0-9_-]{1,128}$/.test(aesExternalCaseId)) {
  setAesSaveError(
    "Enter an EPID code using letters, numbers, hyphens, or underscores.",
  );
  return;
}

  const aesNextPayload = aesCreatePayload();
  setAesIsSaving(true);

  try {
    const aesResponse = await fetch(
      `http://127.0.0.1:8000/api/v1/aes-investigations/${encodeURIComponent(aesExternalCaseId)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(aesNextPayload),
      },
    );

    if (!aesResponse.ok) {
      if (aesResponse.status === 409) {
        throw new Error(
          "This case ID already has an AES record. Use a new test ID.",
        );
      }

      const aesErrorBody = (await aesResponse
        .json()
        .catch(() => null)) as {
        detail?: string;
        errors?: Array<{
          field: string;
          message: string;
        }>;
      } | null;

      const aesFieldErrors = aesErrorBody?.errors
        ?.map(
          (aesError) =>
            `${aesError.field}: ${aesError.message}`,
        )
        .join("; ");

      throw new Error(
        aesFieldErrors ||
          aesErrorBody?.detail ||
          `Save failed (HTTP ${aesResponse.status}).`,
      );
    }

    setAesPayload(aesNextPayload);
    setAesSavedCaseId(aesExternalCaseId);
  } catch (aesError) {
    setAesPayload(null);
    setAesSaveError(
      aesError instanceof Error
        ? aesError.message
        : "Could not save the AES form.",
    );
  } finally {
    setAesIsSaving(false);
  }
}
  function aesReset() {
    setAesForm({ ...aesInitialForm });
    setAesErrors({});
    setAesPayload(null);
    setAesEpidCode("");
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f2f5f9",
        padding: {
          xs: "12px 0 40px",
          md: "20px 0 60px",
        },
        fontFamily: "Arial, sans-serif",
      }}
    >
      <Container maxWidth="xl">
        <Box
          component="form"
          noValidate
          onSubmit={aesSubmit}
        >
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
                  sx={{
                    color: "#fff",
                    fontSize: "12px",
                  }}
                >
                  Select the specific surveillance target
                  for clinical branching.
                </Typography>
              </Box>

              <TextField
                select
                fullWidth
                value="AES"
                slotProps={{
                  select: {
                    "aria-label": "Selected disease",
                    },
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
  <AesLabel
    aesText="EPID CODE (manual entry for local testing)"
    aesRequired
  />

  <TextField
    fullWidth
    value={aesEpidCode}
    onChange={(aesEvent) => {
      setAesEpidCode(aesEvent.target.value);
      setAesSaveError("");
    }}
    placeholder="For example: AES-2026-001"
    slotProps={{
      htmlInput: {
        "aria-label": "EPID code",
        maxLength: 128,
      },
    }}
    sx={aesFieldSx}
  />
</Box>

            <AesLabel
              aesText="Population Group"
              aesRequired
            />

            <Box
              role="group"
              aria-label="Population Group"
              sx={{ display: "flex", flexWrap: "wrap" }}
            >
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
                        "tribal",
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
                        "non_tribal",
                      )
                    }
                  />
                }
              />
            </Box>

            {aesErrors.aesPopulationGroup && (
              <Typography
                role="alert"
                sx={{
                  color: aesRed,
                  fontSize: "11px",
                }}
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
                  aesValue={
                    aesForm.aesAcuteOnsetFever
                  }
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
                  aesValue={
                    aesForm.aesNewOnsetSeizures
                  }
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
                  slotProps={{
                  htmlInput: { max: aesMaxDate },
                  }}
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
                Answer all three questions. The remaining
                sections open when acute onset of fever is
                Yes and at least one of questions 2 or 3
                is Yes.
              </Typography>
            )}

            {aesDefinitionComplete &&
              !aesMeetsCaseDefinition && (
                <Alert
                  severity="info"
                  sx={{ mt: 1.5 }}
                >
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
                      aesUpdate(
                        "aesFever",
                        aesAnswer,
                      )
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
                  <AesSelectField
                    aesId="aes-mental-status"
                    aesLabel="Mental Status"
                    aesRequired
                    aesValue={
                      aesForm.aesMentalStatus
                    }
                    aesOptions={
                      aesMentalStatusOptions
                    }
                    aesPlaceholder="Pick MOST appropriate one"
                    aesError={
                      aesErrors.aesMentalStatus
                    }
                    aesOnChange={(aesValue) =>
                      aesUpdate(
                        "aesMentalStatus",
                        aesValue,
                      )
                    }
                  />
                </Box>

                <Box sx={aesCardSx}>
                  <AesSelectField
                    aesId="aes-motor-details"
                    aesLabel="Neurologic Details (Motor)"
                    aesRequired
                    aesValue={
                      aesForm.aesNeurologicMotorDetails
                    }
                    aesOptions={aesMotorOptions}
                    aesPlaceholder="Pick MOST appropriate one"
                    aesError={
                      aesErrors
                        .aesNeurologicMotorDetails
                    }
                    aesOnChange={(aesValue) =>
                      aesUpdate(
                        "aesNeurologicMotorDetails",
                        aesValue,
                      )
                    }
                  />
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
                    aesOnChange={
                      aesSetVaccination
                    }
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
                        alignItems: "start",
                        gap: 1.5,
                        padding: "8px 10px 4px",
                        borderTop:
                          `1px solid ${aesBorder}`,
                      }}
                    >
                      <Box>
                        <AesLabel
                          aesText="ANTIGEN"
                        />

                        <Box
                          role="textbox"
                          aria-label="Antigen"
                          aria-readonly="true"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            height: 40,
                            padding: "0 12px",
                            border:
                              `1px solid ${aesBorder}`,
                            borderRadius: "2px",
                            color: aesNavy,
                            backgroundColor: "#fff",
                            fontSize: "13px",
                            fontWeight: 700,
                          }}
                        >
                          JE
                        </Box>
                      </Box>

                      <AesSelectField
                        aesId="aes-dose-card"
                        aesLabel="DOSE BY CARD"
                        aesValue={
                          aesForm.aesDoseByCard
                        }
                        aesOptions={aesDoseOptions}
                        aesPlaceholder="Select dose"
                        aesError={
                          aesErrors.aesDoseByCard
                        }
                        aesOnChange={(aesValue) =>
                          aesUpdate(
                            "aesDoseByCard",
                            aesValue,
                          )
                        }
                      />

                      <AesSelectField
                        aesId="aes-dose-history"
                        aesLabel="DOSE BY HISTORY"
                        aesValue={
                          aesForm.aesDoseByHistory
                        }
                        aesOptions={aesDoseOptions}
                        aesPlaceholder="Select dose"
                        aesError={
                          aesErrors.aesDoseByHistory
                        }
                        aesOnChange={(aesValue) =>
                          aesUpdate(
                            "aesDoseByHistory",
                            aesValue,
                          )
                        }
                      />

                      <AesSelectField
                        aesId="aes-sia-doses"
                        aesLabel="SIA DOSES"
                        aesValue={aesForm.aesSiaDoses}
                        aesOptions={
                          aesSiaDoseOptions
                        }
                        aesPlaceholder="Select dose"
                        aesOnChange={(aesValue) =>
                          aesUpdate(
                            "aesSiaDoses",
                            aesValue,
                          )
                        }
                      />

                      <AesTextField
                        aesId="aes-last-dose-date"
                        aesLabel="DATE OF LAST DOSE"
                        aesRequired
                        aesType="date"
                        aesValue={
                          aesForm.aesDateOfLastDose
                        }
                        aesMax={aesMaxDate}
                        aesError={
                          aesErrors.aesDateOfLastDose
                        }
                        aesOnChange={(aesValue) =>
                          aesUpdate(
                            "aesDateOfLastDose",
                            aesValue,
                          )
                        }
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
                  <AesTextField
                    aesId="aes-travel-start"
                    aesLabel="PERIOD START"
                    aesRequired
                    aesType="date"
                    aesValue={
                      aesForm.aesTravelPeriodStart
                    }
                    aesMax={aesMaxDate}
                    aesError={
                      aesErrors.aesTravelPeriodStart
                    }
                    aesOnChange={(aesValue) =>
                      aesUpdate(
                        "aesTravelPeriodStart",
                        aesValue,
                      )
                    }
                  />

                  <AesTextField
                    aesId="aes-travel-end"
                    aesLabel="PERIOD END"
                    aesRequired
                    aesType="date"
                    aesValue={
                      aesForm.aesTravelPeriodEnd
                    }
                    aesMin={
                      aesForm.aesTravelPeriodStart ||
                      undefined
                    }
                    aesMax={aesMaxDate}
                    aesError={
                      aesErrors.aesTravelPeriodEnd
                    }
                    aesOnChange={(aesValue) =>
                      aesUpdate(
                        "aesTravelPeriodEnd",
                        aesValue,
                      )
                    }
                  />

                  <AesTextField
                    aesId="aes-travel-place"
                    aesLabel="PLACE DETAILS"
                    aesRequired
                    aesPlaceholder="Specific hotel or residence"
                    aesValue={
                      aesForm.aesTravelPlaceDetails
                    }
                    aesError={
                      aesErrors.aesTravelPlaceDetails
                    }
                    aesOnChange={(aesValue) =>
                      aesUpdate(
                        "aesTravelPlaceDetails",
                        aesValue,
                      )
                    }
                  />
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
                  <AesSelectField
                    aesId="aes-division"
                    aesLabel="DIVISION"
                    aesRequired
                    aesValue={
                      aesForm.aesTravelDivision
                    }
                    aesOptions={aesDivisions}
                    aesPlaceholder="Select Division"
                    aesError={
                      aesErrors.aesTravelDivision
                    }
                    aesOnChange={(aesValue) =>
                      aesUpdate(
                        "aesTravelDivision",
                        aesValue,
                      )
                    }
                  />

                  <AesTextField
                    aesId="aes-district"
                    aesLabel="DISTRICT / CITY CORPORATION"
                    aesRequired
                    aesPlaceholder="District / City Corporation"
                    aesValue={
                      aesForm.aesTravelDistrict
                    }
                    aesError={
                      aesErrors.aesTravelDistrict
                    }
                    aesOnChange={(aesValue) =>
                      aesUpdate(
                        "aesTravelDistrict",
                        aesValue,
                      )
                    }
                  />

                  <AesTextField
                    aesId="aes-upazila"
                    aesLabel="UPAZILA / THANA"
                    aesRequired
                    aesPlaceholder="Upazila / Thana"
                    aesValue={
                      aesForm.aesTravelUpazila
                    }
                    aesError={
                      aesErrors.aesTravelUpazila
                    }
                    aesOnChange={(aesValue) =>
                      aesUpdate(
                        "aesTravelUpazila",
                        aesValue,
                      )
                    }
                  />

                  <AesTextField
                    aesId="aes-municipality"
                    aesLabel="MUNICIPALITY / ZONE / UNION GROUP"
                    aesPlaceholder="Municipality / Zone / Union Group"
                    aesValue={
                      aesForm.aesTravelMunicipality
                    }
                    aesOnChange={(aesValue) =>
                      aesUpdate(
                        "aesTravelMunicipality",
                        aesValue,
                      )
                    }
                  />

                  <AesTextField
                    aesId="aes-union"
                    aesLabel="UNION / URBAN WARD"
                    aesPlaceholder="Union / Urban Ward"
                    aesValue={
                      aesForm.aesTravelUnionWard
                    }
                    aesOnChange={(aesValue) =>
                      aesUpdate(
                        "aesTravelUnionWard",
                        aesValue,
                      )
                    }
                  />

                  <AesTextField
                    aesId="aes-new-ward"
                    aesLabel="NEW WARD / OLD WARD"
                    aesPlaceholder="New Ward / Old Ward"
                    aesValue={
                      aesForm.aesTravelNewWard
                    }
                    aesOnChange={(aesValue) =>
                      aesUpdate(
                        "aesTravelNewWard",
                        aesValue,
                      )
                    }
                  />

                  <AesTextField
                    aesId="aes-house-street"
                    aesLabel="HOUSE / STREET"
                    aesPlaceholder="House / Street"
                    aesValue={
                      aesForm.aesTravelHouseStreet
                    }
                    aesOnChange={(aesValue) =>
                      aesUpdate(
                        "aesTravelHouseStreet",
                        aesValue,
                      )
                    }
                  />

                  <AesTextField
                    aesId="aes-village"
                    aesLabel="VILLAGE / TOWN"
                    aesPlaceholder="Village / Town"
                    aesValue={
                      aesForm.aesTravelVillageTown
                    }
                    aesOnChange={(aesValue) =>
                      aesUpdate(
                        "aesTravelVillageTown",
                        aesValue,
                      )
                    }
                  />

                  <AesTextField
                    aesId="aes-country"
                    aesLabel="COUNTRY (IF OTHER THAN BANGLADESH)"
                    aesPlaceholder="Country (if other than Bangladesh)"
                    aesValue={
                      aesForm.aesTravelCountry
                    }
                    aesOnChange={(aesValue) =>
                      aesUpdate(
                        "aesTravelCountry",
                        aesValue,
                      )
                    }
                  />
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
              disabled={aesIsSaving}
              sx={{
                minWidth: 140,
                height: 38,
                borderRadius: "3px",
                backgroundColor: "#2467d6",
                textTransform: "none",
              }}
            >
              {aesIsSaving ? "Saving..." : "Save AES Form"}
            </Button>
          </Box>
        </Box>

        {aesSaveError && (
  <Alert severity="error" sx={{ mt: 2 }}>
    {aesSaveError}
  </Alert>
)}

        {aesPayload && (
          <Paper
            elevation={0}
            sx={{ ...aesPanelSx, mt: 2 }}
          >
            <Alert severity="success" sx={{ mb: 2 }}>
             AES investigation saved for case
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