import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getDocument, updateDocument } from '../api/documents';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

function DocumentDetail() {
    const quillRef = useRef(null);
    const { documentId } = useParams();
    const [content, setContent] = useState();
    const [baseline, setBaseline] = useState(null);
    const [lastTime, setLastTime] = useState(Date.now())
    useEffect(() => {
        loadDocument(documentId);
        const currentContents = quillRef.current.getEditor().getContents();
        setBaseline(currentContents);
    }, []);

    const loadDocument = async (documentId) => {
        await getDocument(documentId);
    }

    const saveDocument = async (delta) => {
        const curTime = Date.now()
        if (curTime - lastTime > 2000) {
            // Save current frame
            setLastTime(Date.now());
            const currentContents = quillRef.current.getEditor().getContents();
            setBaseline(currentContents);

            // Send update
            updateDocument(documentId, delta);
        }
    }

    const handleTextChange = (content, delta, source, editor) => {
        if (baseline) {
            const current = editor.getContents();
            const diff = baseline.diff(current);
            saveDocument(diff);
        }
    }

    return (
        <div style={{ padding: '2rem' }}>
            <ReactQuill theme='snow' defaultValue={content} ref={quillRef} onChange={handleTextChange} />
        </div>

    );
}

export default DocumentDetail;
