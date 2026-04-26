from dataclasses import dataclass, field


@dataclass
class DocFieldSpec:
    key: str
    label: str
    ai_description: str
    is_enum: bool = False
    enum_values: list[str] = field(default_factory=list)


@dataclass
class DocTypeSpec:
    doc_type_id: str
    display_name: str
    system_prompt_preamble: str
    fields: list[DocFieldSpec]
    is_supplement: bool = False
    has_signatures: bool = True
    supplement_hint: str = "the parent agreement this document supplements"


_PARTY_FIELDS = [
    DocFieldSpec("partyA_name", "Party A Name", "Legal name of the first signatory"),
    DocFieldSpec("partyA_title", "Party A Title", "Job title of the first signatory"),
    DocFieldSpec("partyA_company", "Party A Company", "Company name of the first party"),
    DocFieldSpec("partyA_noticeAddress", "Party A Notice Address", "Email or postal address for the first party"),
    DocFieldSpec("partyA_date", "Party A Date", "Signature date for the first party (YYYY-MM-DD)"),
    DocFieldSpec("partyB_name", "Party B Name", "Legal name of the second signatory"),
    DocFieldSpec("partyB_title", "Party B Title", "Job title of the second signatory"),
    DocFieldSpec("partyB_company", "Party B Company", "Company name of the second party"),
    DocFieldSpec("partyB_noticeAddress", "Party B Notice Address", "Email or postal address for the second party"),
    DocFieldSpec("partyB_date", "Party B Date", "Signature date for the second party (YYYY-MM-DD)"),
]


DOC_SPECS: dict[str, DocTypeSpec] = {
    "mutual-nda": DocTypeSpec(
        doc_type_id="mutual-nda",
        display_name="Mutual Non-Disclosure Agreement",
        system_prompt_preamble="You are a legal document assistant helping a user fill in a Mutual Non-Disclosure Agreement (MNDA). This agreement allows two parties to share confidential information for a specific business purpose.",
        fields=[
            DocFieldSpec("purpose", "Purpose", "The business purpose for sharing confidential information (e.g. 'Evaluating a potential business relationship')"),
            DocFieldSpec("effectiveDate", "Effective Date", "Agreement start date in YYYY-MM-DD format"),
            DocFieldSpec("mndaTermType", "MNDA Term Type", 'Either "expires" (fixed years) or "until-terminated"', is_enum=True, enum_values=["expires", "until-terminated"]),
            DocFieldSpec("mndaTermYears", "MNDA Term Years", "Number of years if expires (as a string, e.g. '2'). Only needed when mndaTermType is 'expires'."),
            DocFieldSpec("confidentialityTermType", "Confidentiality Term Type", 'Either "fixed" (years from effective date) or "perpetual"', is_enum=True, enum_values=["fixed", "perpetual"]),
            DocFieldSpec("confidentialityTermYears", "Confidentiality Term Years", "Number of years if fixed (as a string, e.g. '3'). Only needed when confidentialityTermType is 'fixed'."),
            DocFieldSpec("governingLaw", "Governing Law", "The US state governing the agreement (e.g. 'Delaware')"),
            DocFieldSpec("jurisdiction", "Jurisdiction", "City/county and state for dispute resolution (e.g. 'New Castle, Delaware')"),
            *_PARTY_FIELDS,
        ],
    ),
    "csa": DocTypeSpec(
        doc_type_id="csa",
        display_name="Cloud Service Agreement",
        system_prompt_preamble="You are a legal document assistant helping a user fill in a Cloud Service Agreement (CSA). This is a standard commercial agreement between a Provider of cloud-hosted software and a Customer.",
        fields=[
            DocFieldSpec("effectiveDate", "Effective Date", "Agreement start date in YYYY-MM-DD format"),
            DocFieldSpec("governingLaw", "Governing Law", "The US state governing the agreement (e.g. 'Delaware')"),
            DocFieldSpec("chosenCourts", "Chosen Courts", "City/county and state for legal proceedings (e.g. 'New Castle, Delaware')"),
            DocFieldSpec("generalCapAmount", "General Cap Amount", "Liability cap (e.g. 'fees paid in the prior 12 months')"),
            DocFieldSpec("increasedCapAmount", "Increased Cap Amount", "Higher liability cap for specified claims"),
            DocFieldSpec("increasedClaims", "Increased Claims", "Types of claims subject to the increased cap"),
            DocFieldSpec("unlimitedClaims", "Unlimited Claims", "Types of claims with no liability cap"),
            DocFieldSpec("providerCoveredClaims", "Provider Covered Claims", "Types of third-party claims Provider must indemnify"),
            DocFieldSpec("customerCoveredClaims", "Customer Covered Claims", "Types of third-party claims Customer must indemnify"),
            DocFieldSpec("additionalWarranties", "Additional Warranties", "Any additional warranties beyond the standard ones (enter 'None' if none)"),
            *_PARTY_FIELDS,
        ],
    ),
    "design-partner": DocTypeSpec(
        doc_type_id="design-partner",
        display_name="Design Partner Agreement",
        system_prompt_preamble="You are a legal document assistant helping a user fill in a Design Partner Agreement. This gives a Partner early access to a Provider's product in exchange for feedback.",
        fields=[
            DocFieldSpec("effectiveDate", "Effective Date", "Agreement start date in YYYY-MM-DD format"),
            DocFieldSpec("term", "Term", "Duration of the design partner program (e.g. '6 months')"),
            DocFieldSpec("program", "Program Description", "Description of the design partner program"),
            DocFieldSpec("fees", "Fees", "Any fees to be paid (enter 'None' if no fees)"),
            DocFieldSpec("governingLaw", "Governing Law", "The US state governing the agreement"),
            DocFieldSpec("chosenCourts", "Chosen Courts", "City/county and state for legal proceedings"),
            DocFieldSpec("noticeAddress", "Notice Address", "Email or postal address for notices"),
            *_PARTY_FIELDS,
        ],
    ),
    "sla": DocTypeSpec(
        doc_type_id="sla",
        display_name="Service Level Agreement",
        system_prompt_preamble="You are a legal document assistant helping a user fill in a Service Level Agreement (SLA). This is a supplement to a Cloud Service Agreement that defines uptime and response time commitments.",
        is_supplement=True,
        supplement_hint="the Cloud Service Agreement this SLA supplements (ask for its name and date if not mentioned)",
        fields=[
            DocFieldSpec("parentAgreementName", "Parent Agreement", "Name and date of the Cloud Service Agreement this SLA supplements"),
            DocFieldSpec("targetUptime", "Target Uptime", "Uptime percentage commitment (e.g. '99.9%')"),
            DocFieldSpec("targetResponseTime", "Target Response Time", "Support response time commitment (e.g. '4 business hours')"),
            DocFieldSpec("supportChannel", "Support Channel", "How customers submit support requests (e.g. 'support@provider.com')"),
            DocFieldSpec("uptimeCredit", "Uptime Credit", "Credit formula for uptime failures"),
            DocFieldSpec("responseTimeCredit", "Response Time Credit", "Credit formula for response time failures"),
            DocFieldSpec("scheduledDowntime", "Scheduled Downtime", "Definition of acceptable maintenance windows"),
            *_PARTY_FIELDS,
        ],
    ),
    "psa": DocTypeSpec(
        doc_type_id="psa",
        display_name="Professional Services Agreement",
        system_prompt_preamble="You are a legal document assistant helping a user fill in a Professional Services Agreement (PSA). This governs consulting and professional services engagements.",
        fields=[
            DocFieldSpec("effectiveDate", "Effective Date", "Agreement start date in YYYY-MM-DD format"),
            DocFieldSpec("governingLaw", "Governing Law", "The US state governing the agreement"),
            DocFieldSpec("chosenCourts", "Chosen Courts", "City/county and state for legal proceedings"),
            DocFieldSpec("generalCapAmount", "General Cap Amount", "Liability cap (e.g. 'fees paid in the prior 12 months')"),
            DocFieldSpec("increasedCapAmount", "Increased Cap Amount", "Higher liability cap for specified claims"),
            DocFieldSpec("increasedClaims", "Increased Claims", "Types of claims subject to the increased cap"),
            DocFieldSpec("unlimitedClaims", "Unlimited Claims", "Types of claims with no liability cap"),
            DocFieldSpec("providerCoveredClaims", "Provider Covered Claims", "Types of third-party claims Provider must indemnify"),
            DocFieldSpec("customerCoveredClaims", "Customer Covered Claims", "Types of third-party claims Customer must indemnify"),
            DocFieldSpec("additionalWarranties", "Additional Warranties", "Any additional warranties (enter 'None' if none)"),
            DocFieldSpec("securityPolicy", "Security Policy", "URL or description of Provider's security policy"),
            DocFieldSpec("customerPolicies", "Customer Policies", "Any customer policies Provider must follow (enter 'None' if none)"),
            DocFieldSpec("insuranceMinimums", "Insurance Minimums", "Minimum insurance requirements"),
            *_PARTY_FIELDS,
        ],
    ),
    "dpa": DocTypeSpec(
        doc_type_id="dpa",
        display_name="Data Processing Agreement",
        system_prompt_preamble="You are a legal document assistant helping a user fill in a Data Processing Agreement (DPA). This is a GDPR-compliant supplement to a primary agreement governing how personal data is processed.",
        is_supplement=True,
        supplement_hint="the primary agreement (e.g. Cloud Service Agreement) this DPA supplements",
        fields=[
            DocFieldSpec("parentAgreementName", "Parent Agreement", "Name and date of the primary agreement this DPA supplements"),
            DocFieldSpec("categoriesOfPersonalData", "Categories of Personal Data", "Types of personal data being processed (e.g. 'names, email addresses')"),
            DocFieldSpec("categoriesOfDataSubjects", "Categories of Data Subjects", "Who the data belongs to (e.g. 'employees, customers')"),
            DocFieldSpec("specialCategoryData", "Special Category Data", "GDPR Article 9 sensitive data, if any (enter 'None' if none)"),
            DocFieldSpec("approvedSubprocessors", "Approved Subprocessors", "List of approved sub-processors with their countries and purposes"),
            DocFieldSpec("governingMemberState", "Governing Member State", "EU member state governing the Standard Contractual Clauses (e.g. 'Ireland')"),
            DocFieldSpec("securityPolicy", "Security Policy", "URL to Provider's security policy"),
            DocFieldSpec("providerSecurityContact", "Provider Security Contact", "Email for security audit requests"),
            *_PARTY_FIELDS,
        ],
    ),
    "software-license": DocTypeSpec(
        doc_type_id="software-license",
        display_name="Software License Agreement",
        system_prompt_preamble="You are a legal document assistant helping a user fill in a Software License Agreement. This governs the licensing of software to a customer for installation and use.",
        fields=[
            DocFieldSpec("effectiveDate", "Effective Date", "Agreement start date in YYYY-MM-DD format"),
            DocFieldSpec("governingLaw", "Governing Law", "The US state governing the agreement"),
            DocFieldSpec("chosenCourts", "Chosen Courts", "City/county and state for legal proceedings"),
            DocFieldSpec("generalCapAmount", "General Cap Amount", "Liability cap"),
            DocFieldSpec("increasedCapAmount", "Increased Cap Amount", "Higher liability cap for specified claims"),
            DocFieldSpec("increasedClaims", "Increased Claims", "Types of claims subject to the increased cap"),
            DocFieldSpec("unlimitedClaims", "Unlimited Claims", "Types of claims with no liability cap"),
            DocFieldSpec("providerCoveredClaims", "Provider Covered Claims", "Types of third-party claims Provider must indemnify"),
            DocFieldSpec("customerCoveredClaims", "Customer Covered Claims", "Types of third-party claims Customer must indemnify"),
            DocFieldSpec("additionalWarranties", "Additional Warranties", "Any additional warranties (enter 'None' if none)"),
            *_PARTY_FIELDS,
        ],
    ),
    "partnership": DocTypeSpec(
        doc_type_id="partnership",
        display_name="Partnership Agreement",
        system_prompt_preamble="You are a legal document assistant helping a user fill in a Partnership Agreement. This governs reseller and referral partnerships between a Company and a Partner.",
        fields=[
            DocFieldSpec("effectiveDate", "Effective Date", "Agreement start date in YYYY-MM-DD format"),
            DocFieldSpec("endDate", "End Date", "Agreement end date in YYYY-MM-DD format"),
            DocFieldSpec("territory", "Territory", "Geographic territory for the partnership (e.g. 'Worldwide')"),
            DocFieldSpec("obligations", "Obligations", "Description of each party's obligations"),
            DocFieldSpec("paymentProcess", "Payment Process", "How fees are calculated and paid between parties"),
            DocFieldSpec("governingLaw", "Governing Law", "The US state governing the agreement"),
            DocFieldSpec("chosenCourts", "Chosen Courts", "City/county and state for legal proceedings"),
            DocFieldSpec("generalCapAmount", "General Cap Amount", "Liability cap"),
            DocFieldSpec("brandGuidelines", "Brand Guidelines", "URL to brand usage guidelines (enter 'None' if none)"),
            DocFieldSpec("additionalWarranties", "Additional Warranties", "Any additional warranties (enter 'None' if none)"),
            *_PARTY_FIELDS,
        ],
    ),
    "pilot": DocTypeSpec(
        doc_type_id="pilot",
        display_name="Pilot Agreement",
        system_prompt_preamble="You are a legal document assistant helping a user fill in a Pilot Agreement. This gives a Customer time-limited access to a Provider's product for evaluation purposes.",
        fields=[
            DocFieldSpec("effectiveDate", "Effective Date", "Pilot start date in YYYY-MM-DD format"),
            DocFieldSpec("pilotPeriod", "Pilot Period", "Duration of the pilot (e.g. '90 days from the Effective Date')"),
            DocFieldSpec("generalCapAmount", "General Cap Amount", "Liability cap (e.g. '$10,000')"),
            DocFieldSpec("governingLaw", "Governing Law", "The US state governing the agreement"),
            DocFieldSpec("chosenCourts", "Chosen Courts", "City/county and state for legal proceedings"),
            DocFieldSpec("noticeAddress", "Notice Address", "Email or postal address for notices"),
            *_PARTY_FIELDS,
        ],
    ),
    "baa": DocTypeSpec(
        doc_type_id="baa",
        display_name="Business Associate Agreement",
        system_prompt_preamble="You are a legal document assistant helping a user fill in a Business Associate Agreement (BAA). This is a HIPAA-compliant supplement governing how a Provider handles Protected Health Information (PHI) on behalf of a Company.",
        is_supplement=True,
        supplement_hint="the primary agreement (e.g. Cloud Service Agreement) this BAA supplements",
        fields=[
            DocFieldSpec("parentAgreementName", "Parent Agreement", "Name and date of the primary agreement this BAA supplements"),
            DocFieldSpec("baaEffectiveDate", "BAA Effective Date", "Date the BAA takes effect in YYYY-MM-DD format"),
            DocFieldSpec("breachNotificationPeriod", "Breach Notification Period", "How quickly Provider must report a PHI breach (e.g. '72 hours')"),
            DocFieldSpec("limitations", "Limitations", "Any restrictions on offshoring, de-identification, or aggregation of PHI (enter 'None' if no restrictions)"),
            *_PARTY_FIELDS,
        ],
    ),
    "ai-addendum": DocTypeSpec(
        doc_type_id="ai-addendum",
        display_name="AI Addendum",
        system_prompt_preamble="You are a legal document assistant helping a user fill in an AI Addendum. This supplements an existing agreement to govern AI features and data use, including model training permissions.",
        is_supplement=True,
        supplement_hint="the primary agreement (e.g. Cloud Service Agreement) this AI Addendum supplements",
        fields=[
            DocFieldSpec("parentAgreementName", "Parent Agreement", "Name and date of the primary agreement this addendum supplements"),
            DocFieldSpec("trainingData", "Training Data", "What data may be used for AI training (enter 'None' if training is not permitted)"),
            DocFieldSpec("trainingPurposes", "Training Purposes", "What training is permitted for (enter 'None' if not permitted)"),
            DocFieldSpec("trainingRestrictions", "Training Restrictions", "Restrictions on training data use (enter 'None' if no restrictions)"),
            DocFieldSpec("improvementRestrictions", "Improvement Restrictions", "Restrictions on using data for non-training improvements (enter 'None' if none)"),
            *_PARTY_FIELDS,
        ],
    ),
}


def get_doc_spec(doc_type_id: str) -> DocTypeSpec | None:
    return DOC_SPECS.get(doc_type_id)
