const API_BASE = 'http://localhost:3001/documents';

export async function createDocument() {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Unauthorized');
    return data;
}

export async function getDocuments(page, limit) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
        },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Unauthorized');
    return data;
}