import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";

export const useForms = () => {
    const { claims } = useAuth();
    const queryClient = useQueryClient();

    const fetchForms = async () => {
        let q = query(collection(db, "FormSchemas"));
        if (claims.role !== 'super_admin' && claims.tenantId) {
            q = query(collection(db, "FormSchemas"), where("tenant_id", "==", claims.tenantId));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const getFormById = async (formId) => {
        const docRef = doc(db, "FormSchemas", formId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    };

    const saveForm = useMutation({
        mutationFn: async (formData) => {
            if (formData.id) {
                const docRef = doc(db, "FormSchemas", formData.id);
                await updateDoc(docRef, {
                    ...formData,
                    updated_date: Timestamp.now(),
                });
                return formData;
            } else {
                const docRef = await addDoc(collection(db, "FormSchemas"), {
                    ...formData,
                    tenant_id: claims.tenantId || "global",
                    created_date: Timestamp.now(),
                    updated_date: Timestamp.now(),
                    status: "active",
                });
                return { id: docRef.id, ...formData };
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["forms"] });
        }
    });

    return {
        forms: useQuery({ queryKey: ["forms"], queryFn: fetchForms }).data,
        getFormById,
        saveForm,
    };
};
