import { DocTypeConfig } from "./types";
import { PILOT_TEMPLATE } from "../templates/pilot";

export const pilotConfig: DocTypeConfig = {
  docTypeId: "pilot",
  catalogFilename: "Pilot-Agreement.md",
  displayName: "Pilot Agreement",
  description: "Common Paper standard agreement for time-limited product pilots and trials",
  isSupplementDoc: false,
  templateContent: PILOT_TEMPLATE,
  coverPage: {
    partyALabel: "Provider",
    partyBLabel: "Customer",
    showSignatures: true,
  },
  fields: [
    {
      key: "effectiveDate",
      label: "Effective Date",
      type: "date",
      templateMarker: "Effective Date",
      coverPageOrder: 1,
    },
    {
      key: "pilotPeriod",
      label: "Pilot Period",
      type: "text",
      hint: "duration of the pilot",
      placeholder: "90 days from the Effective Date",
      templateMarker: "Pilot Period",
      coverPageOrder: 2,
    },
    {
      key: "generalCapAmount",
      label: "General Cap Amount",
      type: "text",
      placeholder: "$10,000",
      templateMarker: "General Cap Amount",
      coverPageOrder: 3,
    },
    {
      key: "governingLaw",
      label: "Governing Law",
      type: "text",
      hint: "US state name",
      placeholder: "Delaware",
      templateMarker: "Governing Law",
      coverPageOrder: 4,
    },
    {
      key: "chosenCourts",
      label: "Chosen Courts",
      type: "text",
      hint: "city/county and state",
      placeholder: "New Castle, Delaware",
      templateMarker: "Chosen Courts",
      coverPageOrder: 5,
    },
    {
      key: "noticeAddress",
      label: "Notice Address",
      type: "text",
      hint: "email or postal address for notices",
      templateMarker: "Notice Address",
    },
  ],
};
