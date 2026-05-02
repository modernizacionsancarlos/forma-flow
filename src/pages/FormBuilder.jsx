import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { useForms } from "../api/useForms";
import { toast } from "react-hot-toast";
import BuilderHeader from "../components/forms/builder/BuilderHeader";
import CustomFieldModal from "../components/forms/builder/CustomFieldModal";
import ResponseLimitModal from "../components/forms/ResponseLimitModal";
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
  parseSectionIdFromDroppableId,
  reorderFields,
  sectionDroppableId,
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

/** Mapa hijos por id de sección (todas las secciones, incluidas anidadas). */
const buildSectionChildrenMap = (fields) =>
  Object.fromEntries(
    fields.filter((f) => f.type === "section").map((s) => [s.id, getSectionChildren(fields, s.id)])
  );

/** Añade en profundidad los hijos de una sección (subsecciones y sus descendientes). */
const appendSectionSubtree = (rebuilt, sectionId, sectionChildrenMap) => {
  (sectionChildrenMap[sectionId] || []).forEach((child) => {
    rebuilt.push({ ...child, section_id: sectionId });
    if (child.type === "section") {
      appendSectionSubtree(rebuilt, child.id, sectionChildrenMap);
    }
  });
};

const rebuildFieldOrders = (allFields, orderedRoots, sectionChildrenMap) => {
  const rebuilt = [];

  orderedRoots.forEach((rootField) => {
    rebuilt.push({ ...rootField, section_id: null });

    if (rootField.type === "section") {
      appendSectionSubtree(rebuilt, rootField.id, sectionChildrenMap);
    }
  });

  const knownSectionIds = new Set(allFields.filter((f) => f.type === "section").map((f) => f.id));
  const orphanFields = allFields.filter(
    (field) => field.section_id && !knownSectionIds.has(field.section_id)
  );
  rebuilt.push(...orphanFields);

  return reorderFields(rebuilt);
};

/** ¿candidateSectionId es la sección ancestor o una subsección dentro de su árbol? */
const isSectionOrDescendantId = (fields, ancestorSectionId, candidateSectionId) => {
  if (ancestorSectionId === candidateSectionId) return true;
  const children = getSectionChildren(fields, ancestorSectionId);
  for (const ch of children) {
    if (ch.type === "section" && isSectionOrDescendantId(fields, ch.id, candidateSectionId)) {
      return true;
    }
  }
  return false;
};

/**
 * Elige la sección más específica bajo (x,y): elementsFromPoint ve debajo del preview del drag
 * (pointer-events: none) y evita fallos cuando la sección está vacía (destination null o "root").
 */
const findBestSectionIdUnderPoint = (clientX, clientY, droppableRegistry) => {
  let bestId = null;
  let bestArea = Infinity;

  if (typeof document !== "undefined" && typeof document.elementsFromPoint === "function") {
    let stack = [];
    try {
      stack = document.elementsFromPoint(clientX, clientY) || [];
    } catch {
      stack = [];
    }
    for (const hit of stack) {
      droppableRegistry.forEach((regEl, sectionId) => {
        if (!regEl || !(regEl instanceof HTMLElement)) return;
        if (hit === regEl || regEl.contains(hit)) {
          const r = regEl.getBoundingClientRect();
          const area = r.width * r.height;
          if (area > 0 && area < bestArea) {
            bestArea = area;
            bestId = sectionId;
          }
        }
      });
    }
  }

  if (bestId) return bestId;

  droppableRegistry.forEach((el, sectionId) => {
    if (!el || !(el instanceof HTMLElement)) return;
    const r = el.getBoundingClientRect();
    if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
      const area = r.width * r.height;
      if (area > 0 && area < bestArea) {
        bestArea = area;
        bestId = sectionId;
      }
    }
  });
  return bestId;
};

/**
 * Con @hello-pangea/dnd, varios Droppables superpuestos (root + sección) suelen resolverse
 * a favor del canvas; con sección vacía a menudo destination es null o "root".
 * Corregimos usando la posición real del soltar (mouseup) y el DOM bajo el cursor.
 */
const fixPaletteDropIfPointerOverSection = (result, fields, clientX, clientY, droppableRegistry) => {
  if (result.source.droppableId !== "palette") return result;

  const dest = result.destination;
  const needsFix =
    !dest ||
    dest.droppableId === "root" ||
    dest.droppableId === "palette";

  if (!needsFix) return result;

  if (typeof clientX !== "number" || typeof clientY !== "number") return result;

  const bestId = findBestSectionIdUnderPoint(clientX, clientY, droppableRegistry);
  if (!bestId) return result;

  const droppableId = sectionDroppableId(bestId);
  const sectionChildren = getSectionChildren(fields, bestId);
  let index = sectionChildren.length;
  for (let i = 0; i < sectionChildren.length; i += 1) {
    const childEl = document.querySelector(`[data-rfd-draggable-id="${sectionChildren[i].id}"]`);
    if (!childEl) continue;
    const cr = childEl.getBoundingClientRect();
    if (clientY < cr.top + cr.height / 2) {
      index = i;
      break;
    }
  }

  return {
    ...result,
    destination: { droppableId, index },
  };
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

  /** Registro de nodos Droppable de cada sección (para corregir destino al soltar desde la paleta). */
  const sectionDroppableRegistryRef = useRef(new Map());
  /** Última posición del puntero durante el arrastre; mouseup/touchend en captura actualiza al soltar (importante si la sección está vacía). */
  const lastPointerRef = useRef({ x: 0, y: 0 });

  const registerSectionDroppable = useCallback((sectionId, el) => {
    if (el) sectionDroppableRegistryRef.current.set(sectionId, el);
    else sectionDroppableRegistryRef.current.delete(sectionId);
  }, []);

  const trackPointerDuringDrag = useCallback((e) => {
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const trackTouchDuringDrag = useCallback((e) => {
    const t = e.touches && e.touches[0];
    if (t) lastPointerRef.current = { x: t.clientX, y: t.clientY };
  }, []);

  const trackPointerUpDuringDrag = useCallback((e) => {
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const trackTouchEndDuringDrag = useCallback((e) => {
    const t = e.changedTouches && e.changedTouches[0];
    if (t) lastPointerRef.current = { x: t.clientX, y: t.clientY };
  }, []);

  const handleBuilderDragStart = useCallback(() => {
    lastPointerRef.current = { x: 0, y: 0 };
    window.addEventListener("mousemove", trackPointerDuringDrag);
    window.addEventListener("touchmove", trackTouchDuringDrag, { passive: true });
    window.addEventListener("mouseup", trackPointerUpDuringDrag, true);
    window.addEventListener("touchend", trackTouchEndDuringDrag, true);
  }, [trackPointerDuringDrag, trackTouchDuringDrag, trackPointerUpDuringDrag, trackTouchEndDuringDrag]);

  const clearBuilderDragTracking = useCallback(() => {
    window.removeEventListener("mousemove", trackPointerDuringDrag);
    window.removeEventListener("touchmove", trackTouchDuringDrag);
    window.removeEventListener("mouseup", trackPointerUpDuringDrag, true);
    window.removeEventListener("touchend", trackTouchEndDuringDrag, true);
  }, [trackPointerDuringDrag, trackTouchDuringDrag, trackPointerUpDuringDrag, trackTouchEndDuringDrag]);

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
  const publicUrl = useMemo(() => {
    if (!formState.is_public || !formState.id) return "";
    return `${window.location.origin}/public-form/${formState.id}`;
  }, [formState.id, formState.is_public]);

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
    const sectionChildrenMap = buildSectionChildrenMap(formState.fields);

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

    const destSectionId = parseSectionIdFromDroppableId(destinationDroppableId);
    if (destSectionId) {
      const nextChildren = [...(sectionChildrenMap[destSectionId] || [])];
      nextChildren.splice(destinationIndex ?? nextChildren.length, 0, {
        ...field,
        section_id: destSectionId,
      });
      sectionChildrenMap[destSectionId] = nextChildren;

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
      addField(firstClone.type, sectionDroppableId(field.section_id), insertIndex, firstClone);

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
    clearBuilderDragTracking();

    const adjusted =
      result.source.droppableId === "palette"
        ? fixPaletteDropIfPointerOverSection(
            result,
            formState.fields,
            lastPointerRef.current.x,
            lastPointerRef.current.y,
            sectionDroppableRegistryRef.current
          )
        : result;

    const { source, destination, draggableId } = adjusted;
    if (!destination) return;

    if (source.droppableId === "palette") {
      const typeId = draggableId.replace("palette-", "");
      addField(typeId, destination.droppableId, destination.index);
      return;
    }

    const movingField = formState.fields.find((field) => field.id === draggableId);
    if (!movingField) return;

    const destSectionFromDrop = parseSectionIdFromDroppableId(destination.droppableId);
    if (movingField.type === "section" && destSectionFromDrop) {
      if (isSectionOrDescendantId(formState.fields, movingField.id, destSectionFromDrop)) {
        return;
      }
    }

    const roots = getRootFields(formState.fields);
    const sectionChildrenMap = buildSectionChildrenMap(formState.fields);

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

      const sameSec = parseSectionIdFromDroppableId(source.droppableId);
      if (sameSec) {
        sectionChildrenMap[sameSec] = moveItem(
          sectionChildrenMap[sameSec] || [],
          source.index,
          destination.index
        );
        syncFields(rebuildFieldOrders(formState.fields, roots, sectionChildrenMap));
      }
      return;
    }

    if (source.droppableId === "root") {
      roots.splice(source.index, 1);
    } else {
      const sourceSectionId = parseSectionIdFromDroppableId(source.droppableId);
      if (sourceSectionId) {
        sectionChildrenMap[sourceSectionId] = [...(sectionChildrenMap[sourceSectionId] || [])];
        sectionChildrenMap[sourceSectionId].splice(source.index, 1);
      }
    }

    if (destination.droppableId === "root") {
      roots.splice(destination.index, 0, { ...movingField, section_id: null });
    } else {
      const destSection = parseSectionIdFromDroppableId(destination.droppableId);
      if (destSection) {
        sectionChildrenMap[destSection] = [...(sectionChildrenMap[destSection] || [])];
        sectionChildrenMap[destSection].splice(destination.index, 0, {
          ...movingField,
          section_id: destSection,
        });
      }
    }

    syncFields(rebuildFieldOrders(formState.fields, roots, sectionChildrenMap));
  };

  /** Vista previa: abre la URL de respuesta; refleja lo guardado en el servidor hasta el último guardado. */
  const handlePreview = () => {
    if (!formState.id) {
      toast.error("Guardá el formulario al menos una vez para poder ver la vista previa.");
      return;
    }
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const previewUrl = formState.is_public
      ? `${origin}/public-form/${formState.id}`
      : `${origin}/view/${formState.id}`;
    window.open(previewUrl, "_blank", "noopener,noreferrer");
  };

  const handleSave = async ({ navigateToList = false } = {}) => {
    setSaveStatus("saving");

    try {
      const payload = serializeFormDocument(formState);
      const savedForm = await saveForm.mutateAsync(payload);
      const savedId = savedForm?.id || formState.id;

      if (savedId && savedId !== formState.id) {
        setFormState((current) => ({ ...current, id: savedId }));
      }

      setSaveStatus("saved");
      toast.success("Formulario guardado correctamente");
      if (formState.is_public && savedId) {
        const nextPublicUrl = `${window.location.origin}/public-form/${savedId}`;
        toast.success(`URL pública generada: ${nextPublicUrl}`);
      }
      if (navigateToList) {
        navigate("/forms");
      }
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Error saving form:", error);
      setSaveStatus("error");
      toast.error(error?.message || "No se pudo guardar el formulario");
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
        publicUrl={publicUrl}
        onCopyPublicUrl={() => {
          if (!publicUrl) return;
          navigator.clipboard.writeText(publicUrl);
          toast.success("URL pública copiada");
        }}
        onSave={() => handleSave({ navigateToList: false })}
        onSaveAndExit={() => handleSave({ navigateToList: true })}
        onPreview={handlePreview}
        previewDisabled={saveStatus === "saving"}
        saveStatus={saveStatus}
      />

      <DragDropContext onDragStart={handleBuilderDragStart} onDragEnd={handleDragEnd}>
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <FieldPalette
            onAddField={addField}
            onOpenCustomField={() => setIsCustomModalOpen(true)}
          />

          {/* El scroll debe vivir en el mismo nodo que innerRef del Droppable raíz para que los Droppables
              anidados (p. ej. dentro de secciones) calculen bien el viewport y el soltado no “caiga” solo en root. */}
          <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-hidden bg-[#050816] px-8 py-4">
            <div className="mx-auto flex h-full min-h-0 max-w-4xl flex-col">
              <div className="mb-4 flex shrink-0 justify-end">
                <button
                  onClick={() => setIsCustomModalOpen(true)}
                  className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-300 transition-colors hover:bg-emerald-500/10"
                >
                  + Nuevo campo personalizado
                </button>
              </div>

              <Droppable
                droppableId="root"
                type="builder-field"
                direction="vertical"
                ignoreContainerClipping
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`custom-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden rounded-xl border border-dashed px-3 py-3 ${
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
                        <Draggable key={field.id} draggableId={field.id} index={index}>
                          {(sectionDragProvided, sectionDragSnapshot) => (
                            <SectionItem
                              section={field}
                              dragProvided={sectionDragProvided}
                              dragSnapshot={sectionDragSnapshot}
                              allFields={formState.fields}
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
                              registerSectionDroppable={registerSectionDroppable}
                            />
                          )}
                        </Draggable>
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
          </div>

          <PropertyPanel
            activeField={selectedField}
            allFields={formState.fields}
            onUpdate={(updates) => {
              if (selectedField) updateField(selectedField.id, updates);
            }}
          />
        </div>
      </DragDropContext>

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
