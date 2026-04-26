export interface PartyInfo {
  name: string;
  title: string;
  company: string;
  noticeAddress: string;
  date: string;
}

export interface NDAFormData {
  purpose: string;
  effectiveDate: string;
  mndaTermType: "expires" | "until-terminated";
  mndaTermYears: string;
  confidentialityTermType: "fixed" | "perpetual";
  confidentialityTermYears: string;
  governingLaw: string;
  jurisdiction: string;
  party1: PartyInfo;
  party2: PartyInfo;
}

export type NDAFieldPatch = Partial<Omit<NDAFormData, "party1" | "party2">> & {
  party1?: Partial<PartyInfo>;
  party2?: Partial<PartyInfo>;
};
