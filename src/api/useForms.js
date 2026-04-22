import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";
import { cleanObject } from "../lib/utils";


export const useForms = () => {
    const { claims } = useAuth();
    const queryClient = useQueryClient();

    const fetchForms = useCallback(async () => {
        let q = query(collection(db, "FormSchemas"));
        if (claims.role !== 'super_admin' && claims.tenantId) {
            q = query(collection(db, "FormSchemas"), where("tenant_id", "==", claims.tenantId));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }, [claims.role, claims.tenantId]);

    const getFormById = useCallback(async (formId) => {
        const docRef = doc(db, "FormSchemas", formId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    }, []);

    const saveForm = useMutation({
        mutationFn: async (formData) => {
            if (formData.id) {
                const docRef = doc(db, "FormSchemas", formData.id);
                const payload = cleanObject({
                    ...formData,
                    updated_date: Timestamp.now(),
                });
                await updateDoc(docRef, payload);
                return { id: formData.id, ...payload };
            } else {
                const payload = cleanObject({
                    ...formData,
                    tenant_id: claims.tenantId || "global",
                    created_date: Timestamp.now(),
                    updated_date: Timestamp.now(),
                    status: formData.status || "draft",
                    version: formData.version || 1,
                });
                const docRef = await addDoc(collection(db, "FormSchemas"), payload);

                return { id: docRef.id, ...payload };
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["forms"] });
        }
    });

    return {
        forms: useQuery({ queryKey: ["forms", claims.role, claims.tenantId], queryFn: fetchForms }).data,
        getFormById,
        saveForm,
    };
};
