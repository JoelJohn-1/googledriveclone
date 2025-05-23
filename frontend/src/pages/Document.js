import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getDocument, establishConnection } from '../api/documents';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

function DocumentDetail() {
    const quillRef = useRef(null);
    const { documentId } = useParams();
    // eslint-disable-next-line
    const [content, setContent] = useState();
    const [baseline, setBaseline] = useState(null);
    const [lastTime, setLastTime] = useState(Date.now())
    const socketRef = useRef(null);
    useEffect(() => {
        loadDocument(documentId);
        const currentContents = quillRef.current.getEditor().getContents();
        setBaseline(currentContents);

        //On unmount
        return () => {
            if (socketRef.current) socketRef.current.close();
        };
        
    }, []);

    const loadDocument = async (documentId) => {
        await getDocument(documentId);
        socketRef.current = await establishConnection(documentId);
    }

    const saveDocument = async (delta) => {
        const curTime = Date.now()
        if (curTime - lastTime > 2000) {
            // Save current frame
            setLastTime(Date.now());
            const currentContents = quillRef.current.getEditor().getContents();
            setBaseline(currentContents);

            // Send update
            socketRef.current.send(JSON.stringify({type: "Update", documentId: documentId, delta: delta}));
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
