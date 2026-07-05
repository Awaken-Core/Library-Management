import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStudentProfile, updateStudentProfile, changeStudentPassword } from '../../api/student.api';

export const useStudentProfileQuery = () => {
    return useQuery({
        queryKey: ['student', 'profile'],
        queryFn: getStudentProfile,
    });
};

export const useUpdateProfileMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateStudentProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student', 'profile'] });
        },
    });
};

export const useChangePasswordMutation = () => {
    return useMutation({
        mutationFn: changeStudentPassword,
    });
};
