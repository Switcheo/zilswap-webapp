import moment from "moment";

const SALUTATIONS = [{ label: "Mr.", value: "Mr." }, { label: "Ms.", value: "Ms." }, { label: "Mdm.", value: "Mdm." }, { label: "Dr.", value: "Dr." }, { label: "Mrs.", value: "Mrs." }];
const GENDERS = [{ label: "Male", value: "male" }, { label: "Female", value: "female" }];
const PAYMENT_TYPES = [{ label: "Bank Transfer", value: "bank_transfer" }, { label: "Cash", value: "cash" }];
const ORGANISATION_TYPES = [{ label: "Private Limited", value: "private_limited" }];
const ROLES = { superadmin: "superadmin", ai_admin: "ai-admin", ai_researcher: "ai-researcher", wrs_admin: "wrs-admin", wrs_analyst: "wrs-analyst", wrs_retail_partner: "wrs-retail-partner" };
const KEY_LOCAL_SAVE = "pisces-local-save";
const INIT_SURVEY_FILTER = {
  limit: 10,
  offset: 0,
  search: "",
  orderBy: "desc",
  sortBy: "complete_at",
  complete_at_from_check: false,
  complete_at_from: moment(),
  complete_at_to_check: false,
  complete_at_to: moment(),
  surveyor: "",
  version: "",
  count: 0
}
const SURVEY_FILTER_SORT_OPTIONS = [
  { value: "complete_at", label: "Complete at" },
];
export default { SALUTATIONS, GENDERS, PAYMENT_TYPES, KEY_LOCAL_SAVE, ROLES, ORGANISATION_TYPES, INIT_SURVEY_FILTER, SURVEY_FILTER_SORT_OPTIONS };