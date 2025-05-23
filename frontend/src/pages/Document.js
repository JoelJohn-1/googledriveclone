import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getDocument, establishConnection } from '../api/documents';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

function DocumentDetail() {
    const syncTime = 2000;
    const quillRef = useRef(null);
    const { documentId } = useParams();
    // eslint-disable-next-line
    const [content, setContent] = useState();
    const latestEditorContentRef = useRef();
    const baselineRef = useRef();
    const [lastTime, setLastTime] = useState(Date.now())
    const socketRef = useRef(null);
    useEffect(() => {
        loadDocument(documentId);

        //On unmount
        return () => {
            if (socketRef.current) {
                const diff = baselineRef.current.diff(latestEditorContentRef.current);
                saveDocument(diff);
                socketRef.current.close(1000, 'Closing session');
            }
        };

    }, []);

    const loadDocument = async (documentId) => {
        const document = await getDocument(documentId);
        setContent(document.Content);
        setTimeout(() => {
            if (quillRef.current) {
                const currentContents = quillRef.current.getEditor().getContents();
                baselineRef.current = currentContents;
            }
        }, 0);    
        socketRef.current = await establishConnection(documentId);
    }

    const saveDocument = async (delta) => {
        socketRef.current.send(JSON.stringify({ type: "Update", delta: delta }));
    }
    const handleSaveDocument = async (delta) => {
        const curTime = Date.now()
        if (curTime - lastTime > syncTime) {
            // Send update
            const resp = saveDocument(delta);
            // Save current frame
            setLastTime(Date.now());
            const currentContents = quillRef.current.getEditor().getContents();
            baselineRef.current = currentContents;

        }
    }

    const handleTextChange = (content, delta, source, editor) => {
        setContent(content);
        if (baselineRef.current) {
            const current = editor.getContents();
            latestEditorContentRef.current = editor.getContents();
            const diff = baselineRef.current.diff(current);
            handleSaveDocument(diff);
        }
    }

    return (
        <div style={{ padding: '2rem' }}>
            <ReactQuill theme='snow' value={content} ref={quillRef} onChange={handleTextChange} />
        </div>

    );
}

export default DocumentDetail;
