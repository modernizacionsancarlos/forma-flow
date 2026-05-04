import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export const PERMISSION_CONFIG_PATH = ["systemConfig", "permissions"];

/** Documento: { roleDefaults: { [role]: string[] }, updatedAt, updatedBy } */
export function usePermissionConfig() {
  return useQuery({
    queryKey: ["permission-config"],
    queryFn: async () => {
      const ref = doc(db, "systemConfig", "permissions");
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        return { roleDefaults: {} };
      }
      const d = snap.data();
      return {
        roleDefaults: d.roleDefaults && typeof d.roleDefaults === "object" ? d.roleDefaults : {},
        updatedAt: d.updatedAt,
        updatedBy: d.updatedBy,
      };
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useSavePermissionRoleDefaults() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ roleDefaults, updatedBy }) => {
      const ref = doc(db, "systemConfig", "permissions");
      await setDoc(
        ref,
        {
          roleDefaults,
          updatedAt: serverTimestamp(),
          updatedBy: updatedBy || null,
        },
        { merge: true }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permission-config"] });
    },
  });
}
