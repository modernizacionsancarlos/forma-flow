import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { useForms } from "../api/useForms";
import BuilderHeader from "../components/forms/builder/BuilderHeader";
import CustomFieldModal from "../components/forms/builder/CustomFieldModal";
import FieldItem from "../components/forms/builder/FieldItem";
import FieldPalette from "../components/forms/builder/FieldPalette";
import PropertyPanel from "../components/forms/builder/PropertyPanel";
import SectionItem from "../components/forms/builder/SectionItem";
import {
  createFieldFromType,
  createFieldId,
  getRootFields,
  getSectionChildren,
  normalizeFormDocument,
  reorderFields,
  serializeFormDocument,
} from "../lib/formBuilder";

const EMPTY_FORM = {
  id: null,
  name: "Nuevo Formulario",
  description: "",
  accepts_responses: true,
  is_public: false,
  response_limit: null,
  version: 1,
  fields: [],
};

const moveItem = (items, sourceIndex, destinationIndex) => {
  const nextItems = [...items];
  const [removed] = nextItems.splice(sourceIndex, 1);
  nextItems.splice(destinationIndex, 0, removed);
  return nextItems;
};

const rebuildFieldOrders = (allFields, orderedRoots, sectionChildrenMap) => {
  const rebuilt = [];

  orderedRoots.forEach((rootField) => {
    rebuilt.push({ ...rootField, section_id: null });

    if (rootField.type === "section") {
      (sectionChildrenMap[rootField.id] || []).forEach((child) => {
        rebuilt.push({ ...child, section_id: rootField.id });
      });
    }
  });

  const orphanFields = allFields.filter(
    (field) =>
      field.section_id &&
      !orderedRoots.some((rootField) => rootField.id === field.section_id)
  );
  rebuilt.push(...orphanFields);

  return reorderFields(rebuilt);
};

const ResponseLimitModal = ({ isOpen, value, onClose, onSave }) => {
  const [draft, setDraft] = useState(value || { type: "none" });

  useEffect(() => {
    setDraft(value || { type: "none" });
  }, [value]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="border-b border-slate-800 px-5 py-4">
          <h3 className="text-sm font-semibold text-white">Límite de respuestas</h3>
        </div>
        <div className="space-y-4 px-5 py-4">
          <label className="space-y-2">
            <span className="text-xs text-slate-300">Tipo</span>
            <select
              value={draft?.type || "none"}
              onChange={(e) => setDraft({ type: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
            >
              <option value="none">Sin límite</option>
              <option value="count">Por cantidad</option>
            </select>
          </label>

          {draft?.type === "count" && (
            <label className="space-y-2">
              <span className="text-xs text-slate-300">Cantidad máxima</span>
              <input
                type="number"
                min="1"
                value={draft.count || ""}
                onChange={(e) =>
                  setDraft((current) => ({
                    ...current,
                    count: Number(e.target.value || 0),
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
              />
            </label>
          )}
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-800 px-5 py-4">
          <button onClick={onClose} className="text-sm text-slate-400 hover:text-white">
            Cancelar
          </button>
          <button
            onClick={() => onSave(draft?.type === "none" ? null : draft)}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

const cloneFieldTree = (fields, sourceField) => {
  const cloneRecursive = (field, nextSectionId = null) => {
    const newId = createFieldId(field.type === "section" ? "section" : "field");
    const clonedField = {
      ...field,
      id: newId,
      section_id: nextSectionId,
      label: `${field.label || "Campo"} copia`,
    };

    const children = fields
      .filter((item) => item.section_id === field.id)
      .flatMap((item) => cloneRecursive(item, newId));

    return [clonedField, ...children];
  };

  return cloneRecursive(sourceField, sourceField.section_id || null);
};

const FormBuilder = () => {
  const navigate = useNavigate();
  const { saveForm, getFormById } = useForms();
  const [searchParams] = useSearchParams();
  const formId = searchParams.get("id");

  const [formState, setFormState] = useState(EMPTY_FORM);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [isLoading, setIsLoading] = useState(!!formId);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isResponseLimitOpen, setIsResponseLimitOpen] = useState(false);

  useEffect(() => {
    const loadForm = async () => {
      if (!formId) {
        setFormState(EMPTY_FORM);
        setIsLoading(false);
        return;
      }

      const currentForm = await getFormById(formId);
      if (currentForm) {
        const normalized = normalizeFormDocument(currentForm);
        setFormState({
          id: normalized.id,
          name: normalized.name,
          description: normalized.description,
          accepts_responses: normalized.accepts_responses,
          is_public: normalized.is_public,
          response_limit: normalized.response_limit,
          version: normalized.version,
          fields: normalized.fields,
        });
      }
      setIsLoading(false);
    };

    loadForm();
  }, [formId, getFormById]);

  const rootFields = useMemo(() => getRootFields(formState.fields), [formState.fields]);
  const selectedField = useMemo(
    () => formState.fields.find((field) => field.id === selectedFieldId) || null,
    [formState.fields, selectedFieldId]
  );

  const syncFields = (nextFields) => {
    setFormState((current) => ({ ...current, fields: reorderFields(nextFields) }));
  };

  const updateField = (fieldId, updates) => {
    setFormState((current) => ({
      ...current,
      fields: current.fields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    }));
  };

  const removeFieldTree = (fieldId) => {
    const idsToDelete = new Set([fieldId]);
    let hasChanges = true;

    while (hasChanges) {
      hasChanges = false;
      formState.fields.forEach((field) => {
        if (field.section_id && idsToDelete.has(field.section_id) && !idsToDelete.has(field.id)) {
          idsToDelete.add(field.id);
          hasChanges = true;
        }
      });
    }

    syncFields(formState.fields.filter((field) => !idsToDelete.has(field.id)));
    if (idsToDelete.has(selectedFieldId)) setSelectedFieldId(null);
  };

  const insertField = (field, destinationDroppableId, destinationIndex) => {
    const roots = getRootFields(formState.fields);
    const sectionChildrenMap = Object.fromEntries(
      roots
        .filter((root) => root.type === "section")
        .map((root) => [root.id, getSectionChildren(formState.fields, root.id)])
    );

    if (destinationDroppableId === "root") {
      const nextRoots = [...roots];
      nextRoots.splice(destinationIndex ?? nextRoots.length, 0, {
        ...field,
        section_id: null,
      });
      syncFields(rebuildFieldOrders(formState.fields, nextRoots, sectionChildrenMap));
      setSelectedFieldId(field.id);
      return;
    }

    if (destinationDroppableId.startsWith("section:")) {
      const sectionId = destinationDroppableId.split(":")[1];
      if (field.type === "section") return;

      const nextChildren = [...(sectionChildrenMap[sectionId] || [])];
      nextChildren.splice(destinationIndex ?? nextChildren.length, 0, {
        ...field,
        section_id: sectionId,
      });
      sectionChildrenMap[sectionId] = nextChildren;

      syncFields(rebuildFieldOrders(formState.fields, roots, sectionChildrenMap));
      setSelectedFieldId(field.id);
    }
  };

  const addField = (
    typeId,
    destinationDroppableId = "root",
    destinationIndex = null,
    prebuiltField = null
  ) => {
    const nextField =
      prebuiltField ||
      createFieldFromType(typeId, {
        label: typeId === "section" ? "Sección" : `Campo ${formState.fields.length + 1}`,
      });

    insertField(nextField, destinationDroppableId, destinationIndex);
  };

  const duplicateField = (field) => {
    const clonedTree = cloneFieldTree(formState.fields, field);
    const firstClone = clonedTree[0];

    if (field.section_id) {
      const siblings = getSectionChildren(formState.fields, field.section_id);
      const insertIndex = siblings.findIndex((item) => item.id === field.id) + 1;
      addField(firstClone.type, `section:${field.section_id}`, insertIndex, firstClone);

      if (clonedTree.length > 1) {
        setFormState((current) => ({
          ...current,
          fields: reorderFields([...current.fields, ...clonedTree.slice(1)]),
        }));
      }
      return;
    }

    const roots = getRootFields(formState.fields);
    const insertIndex = roots.findIndex((item) => item.id === field.id) + 1;
    addField(firstClone.type, "root", insertIndex, firstClone);

    if (clonedTree.length > 1) {
      setFormState((current) => ({
        ...current,
        fields: reorderFields([...current.fields, ...clonedTree.slice(1)]),
      }));
    }
  };

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    if (source.droppableId === "palette") {
      const typeId = draggableId.replace("palette-", "");
      addField(typeId, destination.droppableId, destination.index);
      return;
    }

    const movingField = formState.fields.find((field) => field.id === draggableId);
    if (!movingField) return;
    if (movingField.type === "section" && destination.droppableId !== "root") return;

    const roots = getRootFields(formState.fields);
    const sectionChildrenMap = Object.fromEntries(
      roots
        .filter((root) => root.type === "section")
        .map((root) => [root.id, getSectionChildren(formState.fields, root.id)])
    );

    if (source.droppableId === destination.droppableId) {
      if (source.droppableId === "root") {
        syncFields(
          rebuildFieldOrders(
            formState.fields,
            moveItem(roots, source.index, destination.index),
            sectionChildrenMap
          )
        );
        return;
      }

      if (source.droppableId.startsWith("section:")) {
        const sectionId = source.droppableId.split(":")[1];
        sectionChildrenMap[sectionId] = moveItem(
          sectionChildrenMap[sectionId] || [],
          source.index,
          destination.index
        );
        syncFields(rebuildFieldOrders(formState.fields, roots, sectionChildrenMap));
      }
      return;
    }

    if (source.droppableId === "root") {
      roots.splice(source.index, 1);
    } else if (source.droppableId.startsWith("section:")) {
      const sourceSectionId = source.droppableId.split(":")[1];
      sectionChildrenMap[sourceSectionId] = [...(sectionChildrenMap[sourceSectionId] || [])];
      sectionChildrenMap[sourceSectionId].splice(source.index, 1);
    }

    if (destination.droppableId === "root") {
      roots.splice(destination.index, 0, { ...movingField, section_id: null });
    } else if (destination.droppableId.startsWith("section:")) {
      const sectionId = destination.droppableId.split(":")[1];
      sectionChildrenMap[sectionId] = [...(sectionChildrenMap[sectionId] || [])];
      sectionChildrenMap[sectionId].splice(destination.index, 0, {
        ...movingField,
        section_id: sectionId,
      });
    }

    syncFields(rebuildFieldOrders(formState.fields, roots, sectionChildrenMap));
  };

  const handleSave = async () => {
    setSaveStatus("saving");

    try {
      const payload = serializeFormDocument(formState);
      const savedForm = await saveForm.mutateAsync(payload);

      if (!formId && savedForm?.id) {
        navigate(`/forms/new?id=${savedForm.id}`, { replace: true });
      }

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Error saving form:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-800 border-t-emerald-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#070b16] text-slate-200">
      <BuilderHeader
        name={formState.name}
        description={formState.description}
        onChangeName={(name) => setFormState((current) => ({ ...current, name }))}
        onChangeDescription={(description) =>
          setFormState((current) => ({ ...current, description }))
        }
        acceptsResponses={formState.accepts_responses}
        setAcceptsResponses={(updater) =>
          setFormState((current) => ({
            ...current,
            accepts_responses:
              typeof updater === "function"
                ? updater(current.accepts_responses)
                : updater,
          }))
        }
        isPublic={formState.is_public}
        setIsPublic={(updater) =>
          setFormState((current) => ({
            ...current,
            is_public: typeof updater === "function" ? updater(current.is_public) : updater,
          }))
        }
        responseLimit={formState.response_limit}
        onOpenResponseLimit={() => setIsResponseLimitOpen(true)}
        onSave={handleSave}
        saveStatus={saveStatus}
      />

      <div className="flex min-h-0 flex-1">
        <FieldPalette
          onAddField={addField}
          onOpenCustomField={() => setIsCustomModalOpen(true)}
        />

        <div className="flex-1 overflow-y-auto bg-[#050816] px-8 py-4 custom-scrollbar">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="mx-auto max-w-4xl">
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => setIsCustomModalOpen(true)}
                  className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-300 transition-colors hover:bg-emerald-500/10"
                >
                  + Nuevo campo personalizado
                </button>
              </div>

              <Droppable droppableId="root" type="root-block">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 rounded-xl border border-dashed px-3 py-3 ${
                      snapshot.isDraggingOver
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "border-transparent"
                    }`}
                  >
                    {rootFields.length === 0 && (
                      <div className="rounded-xl border border-dashed border-slate-700 px-6 py-12 text-center text-slate-500">
                        <p className="text-sm">Arrastra campos aquí o haz clic en el panel izquierdo</p>
                        <button
                          onClick={() => setIsCustomModalOpen(true)}
                          className="mt-4 rounded-lg bg-emerald-500/10 px-4 py-2 text-xs text-emerald-300"
                        >
                          <Plus size={12} className="mr-1 inline-block" />
                          Campo personalizado
                        </button>
                      </div>
                    )}

                    {rootFields.map((field, index) =>
                      field.type === "section" ? (
                        <SectionItem
                          key={field.id}
                          section={field}
                          index={index}
                          childrenFields={getSectionChildren(formState.fields, field.id)}
                          isActive={selectedFieldId === field.id}
                          activeFieldId={selectedFieldId}
                          onSelectSection={() => setSelectedFieldId(field.id)}
                          onUpdateSection={updateField}
                          onRemoveSection={(sectionId, event) => {
                            event?.stopPropagation();
                            removeFieldTree(sectionId);
                          }}
                          onCopySection={(section, event) => {
                            event.stopPropagation();
                            duplicateField(section);
                          }}
                          onAddField={addField}
                          onCopyField={(_, selectedField, event) => {
                            event.stopPropagation();
                            duplicateField(selectedField);
                          }}
                          onRemoveField={(_, fieldId, event) => {
                            event.stopPropagation();
                            removeFieldTree(fieldId);
                          }}
                          onSelectField={(selected) => setSelectedFieldId(selected.id)}
                          onUpdateField={updateField}
                        />
                      ) : (
                        <Draggable key={field.id} draggableId={field.id} index={index}>
                          {(dragProvided, dragSnapshot) => (
                            <FieldItem
                              field={field}
                              isActive={selectedFieldId === field.id}
                              onSelect={() => setSelectedFieldId(field.id)}
                              onCopy={(selectedField, event) => {
                                event.stopPropagation();
                                duplicateField(selectedField);
                              }}
                              onRemove={(fieldId, event) => {
                                event.stopPropagation();
                                removeFieldTree(fieldId);
                              }}
                              onChange={(updates) => updateField(field.id, updates)}
                              provided={dragProvided}
                              snapshot={dragSnapshot}
                            />
                          )}
                        </Draggable>
                      )
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </DragDropContext>
        </div>

        <PropertyPanel
          activeField={selectedField}
          allFields={formState.fields}
          onUpdate={(updates) => {
            if (selectedField) updateField(selectedField.id, updates);
          }}
        />
      </div>

      <CustomFieldModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onCreate={(field) => addField(field.type, "root", rootFields.length, field)}
      />

      <ResponseLimitModal
        isOpen={isResponseLimitOpen}
        value={formState.response_limit}
        onClose={() => setIsResponseLimitOpen(false)}
        onSave={(responseLimit) => {
          setFormState((current) => ({ ...current, response_limit: responseLimit }));
          setIsResponseLimitOpen(false);
        }}
      />
    </div>
  );
};

export default FormBuilder;
