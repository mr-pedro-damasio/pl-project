import { DocTypeConfig } from "./types";
import { BAA_TEMPLATE } from "../templates/baa";

export const baaConfig: DocTypeConfig = {
  docTypeId: "baa",
  catalogFilename: "BAA.md",
  displayName: "Business Associate Agreement",
  description: "Common Paper standard HIPAA-compliant BAA for handling protected health information",
  isSupplementDoc: true,
  templateContent: BAA_TEMPLATE,
  coverPage: {
    partyALabel: "Provider",
    partyBLabel: "Company",
    showSignatures: true,
  },
  fields: [
    {
      key: "parentAgreementName",
      label: "Parent Agreement",
      type: "text",
      hint: "name of the agreement this BAA supplements",
      placeholder: "Cloud Service Agreement dated January 1, 2026",
      templateMarker: "Agreement",
      coverPageOrder: 1,
    },
    {
      key: "baaEffectiveDate",
      label: "BAA Effective Date",
      type: "date",
      templateMarker: "BAA Effective Date",
      coverPageOrder: 2,
    },
    {
      key: "breachNotificationPeriod",
      label: "Breach Notification Period",
      type: "text",
      hint: "how quickly Provider must report a breach",
      placeholder: "72 hours",
      templateMarker: "Breach Notification Period",
      coverPageOrder: 3,
    },
    {
      key: "limitations",
      label: "Limitations",
      type: "textarea",
      hint: "restrictions on offshoring, de-identification, aggregation — leave blank if none",
      placeholder: "None",
      templateMarker: "Limitations",
      coverPageOrder: 4,
    },
  ],
};
