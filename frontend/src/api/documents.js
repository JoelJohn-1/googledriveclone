const API_BASE = 'http://localhost:3001/documents';

export async function createDocument() {
    const token = localStorage.getItem('token');
    console.log(token);
    const res = await fetch(`${API_BASE}/create`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Unauthorized');
    return data;
}