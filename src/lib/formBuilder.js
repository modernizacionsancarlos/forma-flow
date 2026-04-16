const FIELD_TYPE_DEFAULTS = {
  section: {
    repeatable: false,
    add_button_text: "",
    description: "",
  },
  text: {
    placeholder: "",
    default_value: "",
  },
  textarea: {
    placeholder: "",
    default_value: "",
  },
  number: {
    placeholder: "",
    default_value: "",
  },
  date: {
    default_value: "",
  },
  datetime: {
    default_value: "",
  },
  time: {
    default_value: "",
  },
  selector: {
    options: ["Opcion 1", "Opcion 2"],
    default_value: "",
  },
  multiselect: {
    options: ["Opcion 1", "Opcion 2"],
    default_value: "",
  },
  radio: {
    options: ["Opcion 1", "Opcion 2"],
    default_value: "",
  },
  boolean: {
    default_value: false,
  },
  image: {
    default_value: "",
  },
  signature: {
    default_value: "",
  },
  gps: {
    default_value: "",
  },
  email: {
    placeholder: "",
    default_value: "",
  },
  phone: {
    placeholder: "",
    default_value: "",
  },
  rating: {
    default_value: 0,
  },
  slider: {
    default_value: 0,
  },
  file: {
    default_value: "",
  },
  barcode: {
    placeholder: "",
    default_value: "",
  },
  color: {
    default_value: "",
  },
  url: {
    placeholder: "",
    default_value: "",
  },
  readonly_text: {
    default_value: "",
    readonly: true,
  },
};

const FIELD_TYPE_LABELS = {
  section: "Seccion",
  text: "Texto corto",
  textarea: "Texto largo",
  number: "Numero",
  date: "Fecha",
  datetime: "Fecha y hora",
  time: "Hora",
  selector: "Selector",
  multiselect: "Seleccion multiple",
  radio: "Radio",
  boolean: "Si / No",
  image: "Imagen",
  signature: "Firma",
  gps: "GPS",
  email: "Email",
  phone: "Telefono",
  rating: "Calificacion",
  slider: "Slider",
  file: "Archivo adjunto",
  barcode: "Codigo QR / Barras",
  color: "Color",
  url: "URL / Enlace",
  readonly_text: "Campo readonly",
};

export function createFieldId(prefix = "field") {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

export function createFieldFromType(type, overrides = {}) {
  const defaults = FIELD_TYPE_DEFAULTS[type] || {};
  const baseLabel = FIELD_TYPE_LABELS[type] || "Campo";
  const id = overrides.id || createFieldId(type === "section" ? "section" : "field");

  return {
    id,
    type,
    label: overrides.label || `${baseLabel}`,
    placeholder: "",
    required: false,
    order: 0,
    options: undefined,
    section_id: null,
    conditional: null,
    default_value: "",
    hidden: false,
    readonly: false,
    visible: true,
    ...defaults,
    ...overrides,
  };
}

function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function normalizeFieldsSchema(fields) {
  return toArray(fields)
    .map((field, index) => ({
      ...createFieldFromType(field.type || "text", field),
      order: typeof field.order === "number" ? field.order : index,
      section_id: field.section_id || null,
      conditional: field.conditional || null,
      options: Array.isArray(field.options) ? field.options : field.options ? [field.options] : undefined,
    }))
    .sort((a, b) => a.order - b.order);
}

export function convertLegacySectionsToFieldsSchema(sections = []) {
  const normalizedSections = Array.isArray(sections) && sections.length
    ? sections
    : [{ id: createFieldId("section"), title: "Seccion 1", description: "", fields: [] }];

  let order = 0;
  const flatFields = [];

  normalizedSections.forEach((section, sectionIndex) => {
    const sectionId = section.id || createFieldId("section");
    flatFields.push(createFieldFromType("section", {
      id: sectionId,
      label: section.title || `Seccion ${sectionIndex + 1}`,
      description: section.description || "",
      order: order++,
      repeatable: !!section.repeatable,
      add_button_text: section.add_button_text || "",
    }));

    (section.fields || []).forEach((field, fieldIndex) => {
      flatFields.push(createFieldFromType(field.type || "text", {
        ...field,
        label: field.label || `Campo ${fieldIndex + 1}`,
        section_id: sectionId,
        order: order++,
      }));
    });
  });

  return flatFields;
}

export function normalizeFormDocument(form) {
  const fromSchema = normalizeFieldsSchema(form?.fields_schema);
  const fromLegacySections = convertLegacySectionsToFieldsSchema(form?.sections || []);
  const fromLegacyFields = normalizeFieldsSchema(form?.fields);
  const fields = fromSchema.length ? fromSchema : (fromLegacyFields.length ? fromLegacyFields : fromLegacySections);

  return {
    id: form?.id || null,
    name: form?.name || form?.title || "Nuevo Formulario",
    title: form?.title || form?.name || "Nuevo Formulario",
    description: form?.description || "",
    status: form?.status || "draft",
    visibility: form?.visibility || (form?.is_public ? "public" : "private"),
    accepts_responses: form?.accepts_responses ?? (form?.status === "active" || form?.status === "published"),
    is_public: !!form?.is_public,
    version: form?.version || 1,
    response_limit: form?.response_limit ?? null,
    fields,
  };
}

export function serializeFormDocument(formState) {
  const sortedFields = [...(formState.fields || [])]
    .sort((a, b) => a.order - b.order)
    .map((field, index) => ({
      ...field,
      order: index,
    }));

  return {
    id: formState.id || undefined,
    name: formState.name,
    title: formState.name,
    description: formState.description,
    status: formState.accepts_responses ? "active" : "draft",
    visibility: formState.is_public ? "public" : "private",
    accepts_responses: formState.accepts_responses,
    is_public: formState.is_public,
    response_limit: formState.response_limit,
    version: formState.version || 1,
    fields_schema: JSON.stringify(sortedFields),
  };
}

export function getRootFields(fields) {
  return [...fields]
    .filter((field) => !field.section_id)
    .sort((a, b) => a.order - b.order);
}

export function getSectionChildren(fields, sectionId) {
  return [...fields]
    .filter((field) => field.section_id === sectionId)
    .sort((a, b) => a.order - b.order);
}

export function reorderFields(fields) {
  return fields.map((field, index) => ({
    ...field,
    order: index,
  }));
}
