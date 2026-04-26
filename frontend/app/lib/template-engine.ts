const LINK_CLASSES = ["coverpage_link", "keyterms_link", "orderform_link", "businessterms_link", "sow_link"];

/**
 * Substitutes named span markers in legal document markdown templates.
 *
 * Spans like <span class="coverpage_link">Effective Date</span> are replaced with
 * <span class="field-value">value</span> when a matching value exists in `values`,
 * or <span class="field-placeholder">[MarkerText]</span> when no value is provided.
 *
 * Party data (partyA/partyB) does not appear in the standard terms body — it is
 * rendered separately in the cover page section. Only named field markers with a
 * templateMarker config property are substituted here.
 */
export function substituteTemplate(
  template: string,
  values: Record<string, string>
): string {
  let result = template;

  for (const cls of LINK_CLASSES) {
    result = result.replace(
      new RegExp(`<span class="${cls}">([^<]+)</span>`, "g"),
      (_, marker: string) => {
        const val = values[marker];
        if (val && val.trim()) {
          return `<span class="field-value">${val}</span>`;
        }
        return `<span class="field-placeholder">[${marker}]</span>`;
      }
    );
  }

  // Strip header_N span wrappers (section heading decorators in the templates)
  result = result.replace(/<span class="header_\d+"[^>]*>([^<]*)<\/span>/g, "$1");

  // Strip id-only anchor spans
  result = result.replace(/<span id="[^"]*"><\/span>/g, "");
  result = result.replace(/<span id="[^"]*">([^<]*)<\/span>/g, "$1");

  return result;
}

/**
 * Builds a template substitution map from DocumentState.
 * Named field markers (templateMarker) are resolved from state.fields.
 * Computed/derived values (e.g. "MNDA Term" from two fields) are supplied via computedFn.
 */
export function buildTemplateValues(
  fields: FieldDef[],
  state: import("./doc-configs/types").DocumentState,
  computedFn?: (state: import("./doc-configs/types").DocumentState) => Record<string, string>
): Record<string, string> {
  const values: Record<string, string> = {};

  for (const field of fields) {
    if (!field.templateMarker) continue;
    const val = state.fields[field.key];
    if (val && val.trim()) {
      values[field.templateMarker] = val;
    }
  }

  const computed = computedFn?.(state) ?? {};
  return { ...values, ...computed };
}

type FieldDef = import("./doc-configs/types").FieldDef;
