import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getDocument, establishConnection } from '../api/documents';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

function DocumentDetail() {
    const syncTime = 2000;
    const quillRef = useRef(null);
    const { documentId } = useParams();
    const [content, setContent] = useState();
    const baselineRef = useRef(null);
    const latestEditorContentRef = useRef(null);
    const [lastTime, setLastTime] = useState(Date.now());
    const socketRef = useRef(null);

    // Loads in document and defined websocket closing behavior
    useEffect(() => {
        loadDocument(documentId);

        return () => {
            if (socketRef.current && baselineRef.current && latestEditorContentRef.current) {
                const diff = baselineRef.current.diff(latestEditorContentRef.current);
                saveDocument(diff);
                socketRef.current.close(1000, 'Closing session');
            }
        };
    }, []);

    // Loading document srts initial content for editor and initialized logic to handle deltas
    const loadDocument = async (documentId) => {
        const document = await getDocument(documentId);
        setContent(document.Content);

        setTimeout(() => {
            if (quillRef.current) {
                baselineRef.current = quillRef.current.getEditor().getContents();
            }
        }, 0);

        socketRef.current = await establishConnection(documentId);
    };

    // Sends delta to server
    const saveDocument = async (delta) => {
        socketRef.current.send(JSON.stringify({ type: 'Update', delta }));
    };

    // Saves document using debounce logic
    const handleSaveDocument = async (delta) => {
        const curTime = Date.now();
        if (curTime - lastTime > syncTime) {
            await saveDocument(delta);
            setLastTime(curTime);
            baselineRef.current = quillRef.current.getEditor().getContents();
        }
    };

    // Calculates deltas based on last time document was saved
    const handleTextChange = (content, delta, source, editor) => {
        setContent(content);
        if (baselineRef.current) {
            const current = editor.getContents();
            latestEditorContentRef.current = current;
            const diff = baselineRef.current.diff(current);
            handleSaveDocument(diff);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <ReactQuill
                theme="snow"
                value={content}
                ref={quillRef}
                onChange={handleTextChange}
            />
        </div>
    );
}

export default DocumentDetail;
