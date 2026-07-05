import { api } from '../lib/api';

export const getStudentProfile = async () => {
    const { data } = await api.get('/students/me');
    return data;
};

export const updateStudentProfile = async (profileData: any) => {
    const { data } = await api.put('/students/me', profileData);
    return data;
};

export const changeStudentPassword = async (passwordData: any) => {
    const { data } = await api.patch('/students/me/password', passwordData);
    return data;
};
