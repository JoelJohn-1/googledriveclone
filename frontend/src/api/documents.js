const API_BASE = 'http://localhost:3001/documents';

export async function createDocument(title) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 

        },
        body: JSON.stringify({
            title: title
        })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error');
    return data;
}


export async function getDocument(documentId) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/${documentId}`, {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
        },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error');
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
    if (!res.ok) throw new Error(data.message || 'Error');
    return data;
}

export async function updateDocument(documentId, delta) {
    const token = localStorage.getItem('token');
    console.log(token);

    const res = await fetch(`${API_BASE}/${documentId}`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
            delta: delta
        })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error');
    return data;
}