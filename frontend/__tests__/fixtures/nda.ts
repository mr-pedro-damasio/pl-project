import type { NDAFormData, PartyInfo } from "@/app/lib/types";

export const baseParty: PartyInfo = {
  name: "Alice Smith",
  title: "CEO",
  company: "Alpha Inc.",
  noticeAddress: "alice@alpha.com",
  date: "2025-06-15",
};

export const baseData: NDAFormData = {
  purpose: "Evaluating a partnership.",
  effectiveDate: "2025-06-15",
  mndaTermType: "expires",
  mndaTermYears: "2",
  confidentialityTermType: "fixed",
  confidentialityTermYears: "3",
  governingLaw: "California",
  jurisdiction: "San Francisco, California",
  party1: baseParty,
  party2: {
    ...baseParty,
    name: "Bob Jones",
    title: "CTO",
    company: "Beta LLC",
    noticeAddress: "bob@beta.com",
  },
};
