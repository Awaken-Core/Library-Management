import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSetupStatusQuery } from "./queries/useAuthQueries";

export const useSetupCheck = () => {
    const router = useRouter();
    const { data, isLoading, error } = useSetupStatusQuery();
    const adminExists = data?.adminExists ?? null;

    useEffect(() => {
        if (!isLoading && adminExists === false) {
            router.push("/setup");
        }
    }, [adminExists, isLoading, router]);

    if (error) {
        console.error("Failed to check setup status", error);
    }

    return { isLoading, adminExists };
};
