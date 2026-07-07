import { useMutation, useQuery } from "@tanstack/react-query";
import { getSetupStatus, loginAdmin, resetPassword, setupAdmin, verifyForgotPassword } from "../../api/auth.api";

export const authQueryKeys = {
    setupStatus: ["auth", "setup-status"] as const,
};

export const useSetupStatusQuery = () => useQuery({
    queryKey: authQueryKeys.setupStatus,
    queryFn: getSetupStatus,
    retry: 1,
});

export const useLoginAdminMutation = () => useMutation({ mutationFn: loginAdmin });
export const useSetupAdminMutation = () => useMutation({ mutationFn: setupAdmin });
export const useVerifyForgotPasswordMutation = () => useMutation({ mutationFn: verifyForgotPassword });
export const useResetPasswordMutation = () => useMutation({ mutationFn: resetPassword });
