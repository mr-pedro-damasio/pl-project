import { DocTypeConfig } from "./types";
import { AI_ADDENDUM_TEMPLATE } from "../templates/ai-addendum";

export const aiAddendumConfig: DocTypeConfig = {
  docTypeId: "ai-addendum",
  catalogFilename: "AI-Addendum.md",
  displayName: "AI Addendum",
  description: "Common Paper standard addendum governing AI features and data use within existing agreements",
  isSupplementDoc: true,
  templateContent: AI_ADDENDUM_TEMPLATE,
  coverPage: {
    partyALabel: "Provider",
    partyBLabel: "Customer",
    showSignatures: true,
  },
  fields: [
    {
      key: "parentAgreementName",
      label: "Parent Agreement",
      type: "text",
      hint: "name of the agreement this addendum supplements",
      placeholder: "Cloud Service Agreement dated January 1, 2026",
      coverPageOrder: 1,
    },
    {
      key: "trainingData",
      label: "Training Data",
      type: "text",
      hint: 'specify what data may be used for training, or "None"',
      placeholder: "None",
      templateMarker: "Training Data",
      coverPageOrder: 2,
    },
    {
      key: "trainingPurposes",
      label: "Training Purposes",
      type: "textarea",
      hint: "describe permitted training purposes, if any",
      placeholder: "None",
      templateMarker: "Training Purposes",
      coverPageOrder: 3,
    },
    {
      key: "trainingRestrictions",
      label: "Training Restrictions",
      type: "textarea",
      hint: "restrictions on how Training Data may be used",
      placeholder: "None",
      templateMarker: "Training Restrictions",
      coverPageOrder: 4,
    },
    {
      key: "improvementRestrictions",
      label: "Improvement Restrictions",
      type: "textarea",
      hint: "restrictions on using data for non-training improvements",
      placeholder: "None",
      templateMarker: "Improvement Restrictions",
      coverPageOrder: 5,
    },
  ],
};
