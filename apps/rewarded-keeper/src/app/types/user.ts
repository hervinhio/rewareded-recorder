export interface User {
    id: string;
    displayName: string;
    email: string;
    publisherId: string | 'unassociated';
    permissions: string[];
    validated: boolean;
}

const getCurrentUserPermissions = () => {
    try {
        return JSON.parse(window.sessionStorage.getItem('permissions') || '[]');
    } catch(e) {
        console.error(e);
    }

    return [];
}


export const currentUserHasPermission = (permission: string) => {
    const permissions = getCurrentUserPermissions() as string[];

    return permissions.some(p => p === permission);
}
