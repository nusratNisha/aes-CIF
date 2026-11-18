# AES-CIF Frontend

A React and TypeScript frontend for the Acute Encephalitis Syndrome (AES) Case Investigation Form. It is designed for the Disease Selection portion of the NDSS Facility Portal’s Register Case workflow.

This repository contains **frontend functionality only**. Backend integration, database storage, and generation of the EPID code are not implemented here.

## Tech stack

- React and TypeScript
- Vite
- Material UI (MUI)

## Getting started

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL shown in the terminal.

To check the production build:

```bash
npm run build
```

## Form sections

- **Disease Selection:** Displays AES and a placeholder for the EPID code. The facility user selects Tribal or Non-Tribal as the population group.
- **AES Case Definition:** Records acute onset of fever, altered mental status, and new onset seizures. A help tooltip explains the simple febrile seizure exclusion.
- **Signs and Symptoms:** Records fever, seizures, headaches, mental status, and neurologic motor details.
- **Vaccination History:** Records Japanese encephalitis (JE) vaccination details when the vaccine-history toggle is on.
- **Travel History:** Records travel within the last 14 days when the travel toggle is on.

## Form behaviour and validation

All three AES case-definition questions must be answered. The remaining sections open only when **acute onset of fever is Yes** and **at least one of altered mental status or new onset seizures is Yes**.

Yes/No answers can be changed directly in one click. The unselected answer appears visually inactive but remains clickable.

When JE vaccine history is available, Dose by Card and Dose by History are both required. Each accepts `0–9`, but they cannot both be `0`. SIA Doses accepts `1–10` and is optional. Date of Last Dose is required.

When travel outside the area is selected, the travel period, place details, division, district/city corporation, and upazila/thana are required. The remaining address fields are optional.

## Frontend-only submission

The **Validate AES Form** button validates the entries and displays a JSON payload preview. It does **not** send data to a server or save a case. The EPID code shown on the page is a placeholder; the existing system will provide the generated value during integration.

The payload structure and field names should be reviewed with the backend developer before connecting an API.

## Project structure

```text
aes-CIF/
├── public/             # Static assets
├── src/
│   ├── App.tsx          # AES form, state, validation, and payload preview
│   └── main.tsx         # React entry point
├── index.html
├── package.json
└── vite.config.ts
```

## Data handling

This repository is a frontend prototype. Do not commit real patient information, credentials, or environment files containing secrets. Use test data when reviewing the JSON preview.