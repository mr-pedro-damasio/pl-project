export type FieldType = "text" | "date" | "select" | "radio" | "textarea" | "number";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  hint?: string;
  options?: FieldOption[];
  defaultValue?: string;
  /** Show this field only when another field equals a specific value */
  dependsOn?: { field: string; value: string };
  /** Position in the cover page table (omit to exclude from cover page) */
  coverPageOrder?: number;
  /** Override label shown in cover page (defaults to label) */
  coverPageLabel?: string;
  /**
   * The exact text inside a coverpage_link/keyterms_link/orderform_link span in the
   * template markdown. When set, the template engine substitutes this marker with the
   * field's value. Case-sensitive.
   */
  templateMarker?: string;
}

export interface PartyData {
  name: string;
  title: string;
  company: string;
  noticeAddress: string;
  date: string;
}

export type GenericFormData = Record<string, string>;

export interface DocumentState {
  fields: GenericFormData;
  partyA?: PartyData;
  partyB?: PartyData;
}

export type GenericFieldPatch = {
  fields?: Partial<GenericFormData>;
  partyA?: Partial<PartyData>;
  partyB?: Partial<PartyData>;
};

export interface CoverPageConfig {
  partyALabel: string;
  partyBLabel: string;
  showSignatures: boolean;
  intro?: string;
}

export interface DocTypeConfig {
  docTypeId: string;
  catalogFilename: string;
  displayName: string;
  description: string;
  isSupplementDoc: boolean;
  fields: FieldDef[];
  coverPage: CoverPageConfig;
  templateContent: string;
  /**
   * Optional function to compute derived cover page / template values from state.
   * Returns a map of templateMarker → display string that overrides the raw field value.
   */
  computedTemplateValues?: (state: DocumentState) => Record<string, string>;
}
