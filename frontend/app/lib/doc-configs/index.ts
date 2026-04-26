import { DocTypeConfig } from "./types";
import { mutualNdaConfig } from "./mutual-nda";
import { csaConfig } from "./csa";
import { designPartnerConfig } from "./design-partner";
import { slaConfig } from "./sla";
import { psaConfig } from "./psa";
import { dpaConfig } from "./dpa";
import { softwareLicenseConfig } from "./software-license";
import { partnershipConfig } from "./partnership";
import { pilotConfig } from "./pilot";
import { baaConfig } from "./baa";
import { aiAddendumConfig } from "./ai-addendum";

export const DOC_REGISTRY: Record<string, DocTypeConfig> = {
  "mutual-nda": mutualNdaConfig,
  "csa": csaConfig,
  "design-partner": designPartnerConfig,
  "sla": slaConfig,
  "psa": psaConfig,
  "dpa": dpaConfig,
  "software-license": softwareLicenseConfig,
  "partnership": partnershipConfig,
  "pilot": pilotConfig,
  "baa": baaConfig,
  "ai-addendum": aiAddendumConfig,
};

export function getDocConfig(docTypeId: string): DocTypeConfig | undefined {
  return DOC_REGISTRY[docTypeId];
}

export const DASHBOARD_DOCS: DocTypeConfig[] = Object.values(DOC_REGISTRY);

export type { DocTypeConfig, FieldDef, PartyData, DocumentState, GenericFieldPatch, GenericFormData } from "./types";
