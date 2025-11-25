module.exports = [
"[project]/lib/useMediaQuery.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useIsDesktop",
    ()=>useIsDesktop,
    "useIsMobile",
    ()=>useIsMobile,
    "useIsTablet",
    ()=>useIsTablet,
    "useMediaQuery",
    ()=>useMediaQuery
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
;
function useMediaQuery(query) {
    const [matches, setMatches] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        setMounted(true);
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
        const media = undefined;
        const listener = undefined;
    }, [
        query
    ]);
    // Return false during SSR to avoid hydration mismatch
    return mounted ? matches : false;
}
function useIsMobile() {
    const [isMobile, setIsMobile] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        setMounted(true);
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
        const checkMobile = undefined;
    }, []);
    // Return false during SSR to avoid hydration mismatch
    return mounted ? isMobile : false;
}
function useIsTablet() {
    return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
}
function useIsDesktop() {
    return useMediaQuery('(min-width: 1025px)');
}
}),
"[project]/components/ChatInput.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ChatInput
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$styled$2d$jsx$2f$style$2e$js__$5b$external$5d$__$28$styled$2d$jsx$2f$style$2e$js$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/styled-jsx/style.js [external] (styled-jsx/style.js, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$useMediaQuery$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/useMediaQuery.js [ssr] (ecmascript)");
;
;
;
;
function ChatInput({ onSendMessage, disabled, selectedFiles = [] }) {
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [attachedFiles, setAttachedFiles] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const isMobile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$useMediaQuery$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useIsMobile"])();
    const textareaRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [
        message
    ]);
    const handleSubmit = (e)=>{
        e.preventDefault();
        if (!message.trim() || disabled) return;
        // Usa i fileIds dai documenti caricati (selectedFiles) e dai file allegati
        const allFileIds = [
            ...selectedFiles.map((f)=>f.fileId || f.id).filter(Boolean),
            ...attachedFiles.map((f)=>f.fileId || f.id).filter(Boolean)
        ];
        // Rimuovi duplicati
        const uniqueFileIds = [
            ...new Set(allFileIds)
        ];
        onSendMessage({
            content: message,
            fileIds: uniqueFileIds.length > 0 ? uniqueFileIds : undefined
        });
        setMessage('');
        setAttachedFiles([]);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };
    const handleKeyDown = (e)=>{
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };
    const attachFile = (file)=>{
        if (!attachedFiles.find((f)=>f.id === file.id)) {
            setAttachedFiles([
                ...attachedFiles,
                file
            ]);
        }
    };
    const removeFile = (fileId)=>{
        setAttachedFiles(attachedFiles.filter((f)=>f.id !== fileId));
    };
    const handleFileUploadClick = ()=>{
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    const handleFileChange = (e)=>{
        const files = Array.from(e.target.files || []);
        // TODO: Handle file upload logic
        console.log('Files selected:', files);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: {
            borderTop: '1px solid rgba(102, 126, 234, 0.2)',
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(10px)',
            padding: isMobile ? '8px 12px' : '20px 24px'
        },
        className: "jsx-d08a2d59e2d19d47",
        children: [
            attachedFiles.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: {
                    marginBottom: '12px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                },
                className: "jsx-d08a2d59e2d19d47",
                children: attachedFiles.map((file)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: {
                            background: 'rgba(102, 126, 234, 0.15)',
                            border: '1px solid rgba(102, 126, 234, 0.3)',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            color: '#f1f5f9'
                        },
                        className: "jsx-d08a2d59e2d19d47",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                width: "16",
                                height: "16",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "currentColor",
                                strokeWidth: "2",
                                className: "jsx-d08a2d59e2d19d47",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                        d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
                                        className: "jsx-d08a2d59e2d19d47"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ChatInput.js",
                                        lineNumber: 98,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("polyline", {
                                        points: "14 2 14 8 20 8",
                                        className: "jsx-d08a2d59e2d19d47"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ChatInput.js",
                                        lineNumber: 99,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ChatInput.js",
                                lineNumber: 97,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                style: {
                                    fontWeight: '500',
                                    maxWidth: '200px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                },
                                className: "jsx-d08a2d59e2d19d47",
                                children: file.original_filename
                            }, void 0, false, {
                                fileName: "[project]/components/ChatInput.js",
                                lineNumber: 101,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                onClick: ()=>removeFile(file.id),
                                style: {
                                    background: 'none',
                                    border: 'none',
                                    color: '#a78bfa',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    padding: '0 4px',
                                    display: 'flex',
                                    alignItems: 'center'
                                },
                                className: "jsx-d08a2d59e2d19d47",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                    width: "14",
                                    height: "14",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    stroke: "currentColor",
                                    strokeWidth: "2",
                                    className: "jsx-d08a2d59e2d19d47",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("line", {
                                            x1: "18",
                                            y1: "6",
                                            x2: "6",
                                            y2: "18",
                                            className: "jsx-d08a2d59e2d19d47"
                                        }, void 0, false, {
                                            fileName: "[project]/components/ChatInput.js",
                                            lineNumber: 118,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("line", {
                                            x1: "6",
                                            y1: "6",
                                            x2: "18",
                                            y2: "18",
                                            className: "jsx-d08a2d59e2d19d47"
                                        }, void 0, false, {
                                            fileName: "[project]/components/ChatInput.js",
                                            lineNumber: 119,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/ChatInput.js",
                                    lineNumber: 117,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/ChatInput.js",
                                lineNumber: 104,
                                columnNumber: 15
                            }, this)
                        ]
                    }, file.id, true, {
                        fileName: "[project]/components/ChatInput.js",
                        lineNumber: 83,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/ChatInput.js",
                lineNumber: 81,
                columnNumber: 9
            }, this),
            selectedFiles.length > 0 && attachedFiles.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: {
                    marginBottom: '12px'
                },
                className: "jsx-d08a2d59e2d19d47",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: '12px',
                            color: '#94a3b8',
                            marginBottom: '8px'
                        },
                        className: "jsx-d08a2d59e2d19d47",
                        children: "Quick attach from your files:"
                    }, void 0, false, {
                        fileName: "[project]/components/ChatInput.js",
                        lineNumber: 130,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px'
                        },
                        className: "jsx-d08a2d59e2d19d47",
                        children: selectedFiles.slice(0, 5).map((file)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                onClick: ()=>attachFile(file),
                                style: {
                                    fontSize: '12px',
                                    background: 'rgba(102, 126, 234, 0.1)',
                                    border: '1px solid rgba(102, 126, 234, 0.2)',
                                    borderRadius: '8px',
                                    padding: '6px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    color: '#cbd5e1',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                },
                                onMouseEnter: (e)=>{
                                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
                                    e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.4)';
                                },
                                onMouseLeave: (e)=>{
                                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                                    e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                                },
                                className: "jsx-d08a2d59e2d19d47",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                        width: "14",
                                        height: "14",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeWidth: "2",
                                        className: "jsx-d08a2d59e2d19d47",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                                d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
                                                className: "jsx-d08a2d59e2d19d47"
                                            }, void 0, false, {
                                                fileName: "[project]/components/ChatInput.js",
                                                lineNumber: 159,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("polyline", {
                                                points: "14 2 14 8 20 8",
                                                className: "jsx-d08a2d59e2d19d47"
                                            }, void 0, false, {
                                                fileName: "[project]/components/ChatInput.js",
                                                lineNumber: 160,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/ChatInput.js",
                                        lineNumber: 158,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                        style: {
                                            maxWidth: '150px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        },
                                        className: "jsx-d08a2d59e2d19d47",
                                        children: file.original_filename
                                    }, void 0, false, {
                                        fileName: "[project]/components/ChatInput.js",
                                        lineNumber: 162,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, file.id, true, {
                                fileName: "[project]/components/ChatInput.js",
                                lineNumber: 133,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/ChatInput.js",
                        lineNumber: 131,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ChatInput.js",
                lineNumber: 129,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("form", {
                onSubmit: handleSubmit,
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '4px' : '12px',
                    width: '100%',
                    margin: 0
                },
                className: "jsx-d08a2d59e2d19d47",
                children: [
                    isMobile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: handleFileUploadClick,
                        "aria-label": "Carica file",
                        title: "Carica file",
                        style: {
                            background: 'transparent',
                            border: 'none',
                            padding: '0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'none',
                            width: 'auto',
                            minWidth: 'auto',
                            height: 'auto'
                        },
                        className: "jsx-d08a2d59e2d19d47",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                            width: "20",
                            height: "20",
                            viewBox: "0 0 24 24",
                            fill: "none",
                            stroke: "#667eea",
                            strokeWidth: "2",
                            className: "jsx-d08a2d59e2d19d47",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("line", {
                                    x1: "12",
                                    y1: "5",
                                    x2: "12",
                                    y2: "19",
                                    className: "jsx-d08a2d59e2d19d47"
                                }, void 0, false, {
                                    fileName: "[project]/components/ChatInput.js",
                                    lineNumber: 201,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("line", {
                                    x1: "5",
                                    y1: "12",
                                    x2: "19",
                                    y2: "12",
                                    className: "jsx-d08a2d59e2d19d47"
                                }, void 0, false, {
                                    fileName: "[project]/components/ChatInput.js",
                                    lineNumber: 202,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ChatInput.js",
                            lineNumber: 200,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/ChatInput.js",
                        lineNumber: 181,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                        ref: fileInputRef,
                        id: "file-upload-input",
                        name: "file-upload",
                        type: "file",
                        multiple: true,
                        accept: ".pdf,.doc,.docx,.txt",
                        onChange: handleFileChange,
                        style: {
                            display: 'none'
                        },
                        "aria-label": "Carica file",
                        className: "jsx-d08a2d59e2d19d47"
                    }, void 0, false, {
                        fileName: "[project]/components/ChatInput.js",
                        lineNumber: 207,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: {
                            flex: 1,
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center'
                        },
                        className: "jsx-d08a2d59e2d19d47",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("textarea", {
                                ref: textareaRef,
                                id: "chat-message-input",
                                name: "chat-message",
                                value: message,
                                onChange: (e)=>setMessage(e.target.value),
                                onKeyDown: handleKeyDown,
                                placeholder: isMobile ? "Scrivi un messaggio..." : "Ask me anything about your files... (Shift+Enter for new line)",
                                disabled: disabled,
                                rows: 1,
                                "aria-label": "Messaggio chat",
                                style: {
                                    flex: 1,
                                    padding: isMobile ? '7px 12px' : '14px 16px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(102, 126, 234, 0.3)',
                                    borderRadius: isMobile ? '16px' : '12px',
                                    color: '#f1f5f9',
                                    fontSize: isMobile ? '13px' : '15px',
                                    lineHeight: isMobile ? '18px' : '1.5',
                                    resize: 'none',
                                    maxHeight: isMobile ? '32px' : '200px',
                                    minHeight: isMobile ? '32px' : 'auto',
                                    overflow: isMobile ? 'hidden' : 'auto',
                                    fontFamily: 'inherit',
                                    transition: 'all 0.2s',
                                    whiteSpace: isMobile ? 'nowrap' : 'pre-wrap'
                                },
                                onFocus: (e)=>{
                                    e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                },
                                onBlur: (e)=>{
                                    e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                },
                                className: "jsx-d08a2d59e2d19d47"
                            }, void 0, false, {
                                fileName: "[project]/components/ChatInput.js",
                                lineNumber: 220,
                                columnNumber: 11
                            }, this),
                            message.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: {
                                    position: 'absolute',
                                    bottom: '8px',
                                    right: '12px',
                                    fontSize: '11px',
                                    color: '#64748b'
                                },
                                className: "jsx-d08a2d59e2d19d47",
                                children: message.length
                            }, void 0, false, {
                                fileName: "[project]/components/ChatInput.js",
                                lineNumber: 260,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ChatInput.js",
                        lineNumber: 219,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                        type: "submit",
                        disabled: !message.trim() || disabled,
                        style: {
                            background: isMobile ? 'transparent' : disabled ? '#4b5563' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: isMobile ? '#667eea' : 'white',
                            padding: isMobile ? '4px' : '14px 20px',
                            borderRadius: isMobile ? '50%' : '12px',
                            border: 'none',
                            fontWeight: '600',
                            fontSize: isMobile ? '14px' : '15px',
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: isMobile ? '0' : '8px',
                            transition: 'all 0.3s',
                            boxShadow: 'none',
                            opacity: disabled ? 0.5 : 1,
                            minWidth: isMobile ? '28px' : 'auto',
                            width: isMobile ? '28px' : 'auto',
                            height: isMobile ? '28px' : 'auto',
                            flexShrink: 0
                        },
                        onMouseEnter: (e)=>{
                            if (!disabled && !isMobile) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 25px rgba(102, 126, 234, 0.5)';
                            }
                        },
                        onMouseLeave: (e)=>{
                            if (!disabled && !isMobile) {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.4)';
                            }
                        },
                        className: "jsx-d08a2d59e2d19d47",
                        children: disabled ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: {
                                        width: '16px',
                                        height: '16px',
                                        border: '2px solid white',
                                        borderTopColor: 'transparent',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite'
                                    },
                                    className: "jsx-d08a2d59e2d19d47"
                                }, void 0, false, {
                                    fileName: "[project]/components/ChatInput.js",
                                    lineNumber: 312,
                                    columnNumber: 15
                                }, this),
                                !isMobile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                    className: "jsx-d08a2d59e2d19d47",
                                    children: "Sending..."
                                }, void 0, false, {
                                    fileName: "[project]/components/ChatInput.js",
                                    lineNumber: 320,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                            children: [
                                !isMobile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                    className: "jsx-d08a2d59e2d19d47",
                                    children: "Send"
                                }, void 0, false, {
                                    fileName: "[project]/components/ChatInput.js",
                                    lineNumber: 324,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                    width: isMobile ? "16" : "18",
                                    height: isMobile ? "16" : "18",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    stroke: "currentColor",
                                    strokeWidth: "2.5",
                                    className: "jsx-d08a2d59e2d19d47",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("line", {
                                            x1: "22",
                                            y1: "2",
                                            x2: "11",
                                            y2: "13",
                                            className: "jsx-d08a2d59e2d19d47"
                                        }, void 0, false, {
                                            fileName: "[project]/components/ChatInput.js",
                                            lineNumber: 326,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("polygon", {
                                            points: "22 2 15 22 11 13 2 9 22 2",
                                            className: "jsx-d08a2d59e2d19d47"
                                        }, void 0, false, {
                                            fileName: "[project]/components/ChatInput.js",
                                            lineNumber: 327,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/ChatInput.js",
                                    lineNumber: 325,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true)
                    }, void 0, false, {
                        fileName: "[project]/components/ChatInput.js",
                        lineNumber: 273,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ChatInput.js",
                lineNumber: 172,
                columnNumber: 7
            }, this),
            !isMobile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: '10px',
                    fontSize: '12px',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                },
                className: "jsx-d08a2d59e2d19d47",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                        width: "14",
                        height: "14",
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor",
                        strokeWidth: "2",
                        className: "jsx-d08a2d59e2d19d47",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("circle", {
                                cx: "12",
                                cy: "12",
                                r: "10",
                                className: "jsx-d08a2d59e2d19d47"
                            }, void 0, false, {
                                fileName: "[project]/components/ChatInput.js",
                                lineNumber: 345,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("line", {
                                x1: "12",
                                y1: "16",
                                x2: "12",
                                y2: "12",
                                className: "jsx-d08a2d59e2d19d47"
                            }, void 0, false, {
                                fileName: "[project]/components/ChatInput.js",
                                lineNumber: 346,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("line", {
                                x1: "12",
                                y1: "8",
                                x2: "12.01",
                                y2: "8",
                                className: "jsx-d08a2d59e2d19d47"
                            }, void 0, false, {
                                fileName: "[project]/components/ChatInput.js",
                                lineNumber: 347,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ChatInput.js",
                        lineNumber: 344,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                        className: "jsx-d08a2d59e2d19d47",
                        children: "Tip: Attach files to ask specific questions about their content"
                    }, void 0, false, {
                        fileName: "[project]/components/ChatInput.js",
                        lineNumber: 349,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ChatInput.js",
                lineNumber: 336,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$styled$2d$jsx$2f$style$2e$js__$5b$external$5d$__$28$styled$2d$jsx$2f$style$2e$js$2c$__cjs$29$__["default"], {
                id: "d08a2d59e2d19d47",
                children: "@keyframes spin{to{transform:rotate(360deg)}}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ChatInput.js",
        lineNumber: 73,
        columnNumber: 5
    }, this);
}
}),
"[externals]/tty [external] (tty, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs) <export default as minpath>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "minpath",
    ()=>__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
}),
"[externals]/node:process [external] (node:process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:process", () => require("node:process"));

module.exports = mod;
}),
"[externals]/node:process [external] (node:process, cjs) <export default as minproc>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "minproc",
    ()=>__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$process__$5b$external$5d$__$28$node$3a$process$2c$__cjs$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$process__$5b$external$5d$__$28$node$3a$process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:process [external] (node:process, cjs)");
}),
"[externals]/node:url [external] (node:url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:url", () => require("node:url"));

module.exports = mod;
}),
"[externals]/node:url [external] (node:url, cjs) <export fileURLToPath as urlToPath>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "urlToPath",
    ()=>__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$url__$5b$external$5d$__$28$node$3a$url$2c$__cjs$29$__["fileURLToPath"]
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$url__$5b$external$5d$__$28$node$3a$url$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:url [external] (node:url, cjs)");
}),
"[project]/components/ChatMessage.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ChatMessage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$markdown$2f$lib$2f$index$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__Markdown__as__default$3e$__ = __turbopack_context__.i("[project]/node_modules/react-markdown/lib/index.js [ssr] (ecmascript) <export Markdown as default>");
;
;
;
function ChatMessage({ message, onFileClick }) {
    const [formattedTime, setFormattedTime] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (message.created_at) {
            setFormattedTime(new Date(message.created_at).toLocaleTimeString('it-IT', {
                hour: '2-digit',
                minute: '2-digit'
            }));
        }
    }, [
        message.created_at
    ]);
    if (isSystem) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            style: {
                display: 'flex',
                justifyContent: 'center',
                margin: '16px 0'
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: {
                    background: 'rgba(148, 163, 184, 0.1)',
                    color: '#64748b',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '14px'
                },
                children: message.content
            }, void 0, false, {
                fileName: "[project]/components/ChatMessage.js",
                lineNumber: 23,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/ChatMessage.js",
            lineNumber: 22,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            justifyContent: isUser ? 'flex-end' : 'flex-start',
            marginBottom: '20px',
            animation: 'fadeIn 0.3s ease-in'
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            style: {
                maxWidth: '700px',
                width: '100%',
                paddingLeft: isUser ? '60px' : '0',
                paddingRight: isUser ? '0' : '60px'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px',
                        flexDirection: isUser ? 'row-reverse' : 'row'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: {
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                fontWeight: '600',
                                background: isUser ? '#667eea' : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                color: 'white'
                            },
                            children: isUser ? '👤' : '🤖'
                        }, void 0, false, {
                            fileName: "[project]/components/ChatMessage.js",
                            lineNumber: 52,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                            style: {
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#f1f5f9'
                            },
                            children: isUser ? 'You' : 'AI Assistant'
                        }, void 0, false, {
                            fileName: "[project]/components/ChatMessage.js",
                            lineNumber: 66,
                            columnNumber: 11
                        }, this),
                        formattedTime && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                            style: {
                                fontSize: '12px',
                                color: '#64748b'
                            },
                            children: formattedTime
                        }, void 0, false, {
                            fileName: "[project]/components/ChatMessage.js",
                            lineNumber: 70,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/ChatMessage.js",
                    lineNumber: 45,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    style: {
                        borderRadius: '16px',
                        padding: '16px 20px',
                        background: message.error ? 'rgba(239, 68, 68, 0.15)' : isUser ? '#667eea' : 'rgba(255, 255, 255, 0.05)',
                        border: message.error ? '1px solid rgba(239, 68, 68, 0.4)' : isUser ? 'none' : '1px solid rgba(102, 126, 234, 0.2)',
                        color: isUser ? 'white' : '#f1f5f9',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: {
                                fontSize: '15px',
                                lineHeight: '1.6'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$markdown$2f$lib$2f$index$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__$3c$export__Markdown__as__default$3e$__["default"], {
                                components: {
                                    code ({ node, inline, className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        return !inline && match ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("pre", {
                                            style: {
                                                background: '#1e1e1e',
                                                color: '#d4d4d4',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                overflow: 'auto',
                                                margin: '8px 0',
                                                fontSize: '14px',
                                                fontFamily: 'monospace'
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("code", {
                                                children: String(children).replace(/\n$/, '')
                                            }, void 0, false, {
                                                fileName: "[project]/components/ChatMessage.js",
                                                lineNumber: 105,
                                                columnNumber: 23
                                            }, void 0)
                                        }, void 0, false, {
                                            fileName: "[project]/components/ChatMessage.js",
                                            lineNumber: 95,
                                            columnNumber: 21
                                        }, void 0) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("code", {
                                            style: {
                                                background: isUser ? 'rgba(255,255,255,0.2)' : 'rgba(102, 126, 234, 0.2)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                fontSize: '14px'
                                            },
                                            ...props,
                                            children: children
                                        }, void 0, false, {
                                            fileName: "[project]/components/ChatMessage.js",
                                            lineNumber: 108,
                                            columnNumber: 21
                                        }, void 0);
                                    },
                                    a ({ href, children }) {
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
                                            href: href,
                                            target: "_blank",
                                            rel: "noopener noreferrer",
                                            style: {
                                                textDecoration: 'underline',
                                                color: isUser ? 'white' : '#a78bfa'
                                            },
                                            children: children
                                        }, void 0, false, {
                                            fileName: "[project]/components/ChatMessage.js",
                                            lineNumber: 120,
                                            columnNumber: 21
                                        }, void 0);
                                    },
                                    p ({ children }) {
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                            style: {
                                                margin: '8px 0'
                                            },
                                            children: children
                                        }, void 0, false, {
                                            fileName: "[project]/components/ChatMessage.js",
                                            lineNumber: 131,
                                            columnNumber: 26
                                        }, void 0);
                                    },
                                    ul ({ children }) {
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("ul", {
                                            style: {
                                                paddingLeft: '20px',
                                                margin: '8px 0'
                                            },
                                            children: children
                                        }, void 0, false, {
                                            fileName: "[project]/components/ChatMessage.js",
                                            lineNumber: 134,
                                            columnNumber: 26
                                        }, void 0);
                                    },
                                    ol ({ children }) {
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("ol", {
                                            style: {
                                                paddingLeft: '20px',
                                                margin: '8px 0'
                                            },
                                            children: children
                                        }, void 0, false, {
                                            fileName: "[project]/components/ChatMessage.js",
                                            lineNumber: 137,
                                            columnNumber: 26
                                        }, void 0);
                                    }
                                },
                                children: message.content
                            }, void 0, false, {
                                fileName: "[project]/components/ChatMessage.js",
                                lineNumber: 90,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/ChatMessage.js",
                            lineNumber: 89,
                            columnNumber: 11
                        }, this),
                        message.file_references && message.file_references.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: {
                                marginTop: '16px',
                                paddingTop: '16px',
                                borderTop: isUser ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(102, 126, 234, 0.2)'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        marginBottom: '8px',
                                        opacity: 0.8
                                    },
                                    children: "📚 Referenced Files:"
                                }, void 0, false, {
                                    fileName: "[project]/components/ChatMessage.js",
                                    lineNumber: 152,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '8px'
                                    },
                                    children: message.file_references.map((file, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                            onClick: ()=>onFileClick && onFileClick(file),
                                            style: {
                                                fontSize: '12px',
                                                padding: '6px 12px',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                background: isUser ? 'rgba(255,255,255,0.2)' : 'rgba(102, 126, 234, 0.2)',
                                                border: 'none',
                                                color: isUser ? 'white' : '#a78bfa',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            },
                                            onMouseEnter: (e)=>{
                                                e.currentTarget.style.background = isUser ? 'rgba(255,255,255,0.3)' : 'rgba(102, 126, 234, 0.3)';
                                            },
                                            onMouseLeave: (e)=>{
                                                e.currentTarget.style.background = isUser ? 'rgba(255,255,255,0.2)' : 'rgba(102, 126, 234, 0.2)';
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                    children: "📄"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ChatMessage.js",
                                                    lineNumber: 180,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontWeight: '500',
                                                        maxWidth: '200px',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    },
                                                    children: file.filename || file.original_filename
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ChatMessage.js",
                                                    lineNumber: 181,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, idx, true, {
                                            fileName: "[project]/components/ChatMessage.js",
                                            lineNumber: 157,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/components/ChatMessage.js",
                                    lineNumber: 155,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ChatMessage.js",
                            lineNumber: 147,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/ChatMessage.js",
                    lineNumber: 77,
                    columnNumber: 9
                }, this),
                message.thinking && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    style: {
                        marginTop: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#94a3b8',
                        fontSize: '14px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                gap: '4px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: {
                                        width: '8px',
                                        height: '8px',
                                        background: '#a78bfa',
                                        borderRadius: '50%',
                                        animation: 'bounce 1s infinite'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/ChatMessage.js",
                                    lineNumber: 195,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: {
                                        width: '8px',
                                        height: '8px',
                                        background: '#a78bfa',
                                        borderRadius: '50%',
                                        animation: 'bounce 1s infinite 150ms'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/ChatMessage.js",
                                    lineNumber: 196,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: {
                                        width: '8px',
                                        height: '8px',
                                        background: '#a78bfa',
                                        borderRadius: '50%',
                                        animation: 'bounce 1s infinite 300ms'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/ChatMessage.js",
                                    lineNumber: 197,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ChatMessage.js",
                            lineNumber: 194,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                            style: {
                                fontSize: '12px'
                            },
                            children: "AI is thinking..."
                        }, void 0, false, {
                            fileName: "[project]/components/ChatMessage.js",
                            lineNumber: 199,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/ChatMessage.js",
                    lineNumber: 193,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/ChatMessage.js",
            lineNumber: 43,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/ChatMessage.js",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
}),
"[project]/lib/tools.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "tools",
    ()=>tools
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/bs/index.mjs [ssr] (ecmascript)");
;
const tools = [
    {
        title: 'Rimozione Sfondo AI',
        description: 'Rimuovi lo sfondo da qualsiasi immagine con un click.',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["BsImage"],
        href: '/tools/rimozione-sfondo-ai',
        category: 'Immagini',
        pro: true
    },
    {
        title: 'Clean Noise AI',
        description: 'Rimuovi rumore di fondo e migliora la qualità dei tuoi audio.',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["BsSoundwave"],
        href: '/tools/clean-noise-ai',
        category: 'Audio',
        pro: true
    },
    {
        title: 'Generazione Immagini AI',
        description: 'Crea immagini uniche da una descrizione testuale.',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["BsStars"],
        href: '/tools/generazione-immagini-ai',
        category: 'Immagini',
        pro: true
    },
    {
        title: 'Trascrizione Audio',
        description: 'Converti file audio e vocali in testo modificabile.',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["BsSoundwave"],
        href: '/tools/trascrizione-audio',
        category: 'Audio'
    },
    {
        title: 'OCR Avanzato AI',
        description: 'Estrai testo da immagini, PDF e documenti scansionati.',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["BsJournalCode"],
        href: '/tools/ocr-avanzato-ai',
        category: 'Testo',
        pro: true
    },
    {
        title: 'Traduzione Documenti AI',
        description: 'Traduci interi documenti mantenendo la formattazione.',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["BsTranslate"],
        href: '/tools/traduzione-documenti-ai',
        category: 'Testo',
        pro: true
    },
    {
        title: 'Riassunto Testo',
        description: 'Sintetizza testi lunghi in riassunti chiari e concisi.',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["BsTextParagraph"],
        href: '/tools/riassunto-testo',
        category: 'Testo'
    },
    {
        title: 'Traduci Testo',
        description: 'Traduzioni multilingua istantanee per testi e frasi.',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["BsTranslate"],
        href: '/tools/traduci-testo',
        category: 'Testo'
    },
    {
        title: 'Correttore Grammaticale',
        description: 'Correggi errori grammaticali e migliora lo stile del tuo testo.',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["BsSpellcheck"],
        href: '/tools/correttore-grammaticale',
        category: 'Testo'
    },
    {
        title: 'Elabora e Riassumi',
        description: 'Analisi e sintesi avanzata di documenti e articoli.',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["BsTextareaT"],
        href: '/tools/elabora-e-riassumi',
        category: 'Testo',
        pro: true
    },
    {
        title: 'Combina/Splitta PDF',
        description: 'Unisci più PDF in un unico file o dividi un PDF in più parti.',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["BsFileZip"],
        href: '/tools/combina-splitta-pdf',
        category: 'PDF'
    },
    {
        title: 'Thumbnail Generator',
        description: 'Crea miniature accattivanti per video e social media.',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["BsCardImage"],
        href: '/tools/thumbnail-generator',
        category: 'Immagini',
        pro: true
    },
    {
        title: 'Compressione Video',
        description: 'Riduci le dimensioni dei tuoi file video senza perdere qualità.',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["BsCameraVideo"],
        href: '/tools/compressione-video',
        category: 'Video',
        pro: true
    },
    {
        title: 'Upscaler AI',
        description: 'Migliora la risoluzione delle tue immagini fino a 4x.',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["BsArrowsAngleContract"],
        href: '/tools/upscaler-ai',
        category: 'Immagini',
        pro: true
    },
    {
        title: 'Convertitore PDF',
        description: 'Converti facilmente file da e verso PDF: JPG, DOCX e altri formati.',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["BsFileEarmarkPdf"],
        href: '/pdf',
        category: 'PDF'
    }
];
}),
"[project]/lib/conversionRegistry.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Registry of conversion tool pages for SEO.
// Each entry defines a slug (URL under /tools/), title, description, category, and targetFormat.
// Initially many formats will fallback to placeholder conversion until native implementation is added.
__turbopack_context__.s([
    "conversionTools",
    ()=>conversionTools,
    "getAllCategories",
    ()=>getAllCategories,
    "getAllConversionTools",
    ()=>getAllConversionTools,
    "getConversionTool",
    ()=>getConversionTool,
    "getToolsByCategory",
    ()=>getToolsByCategory,
    "listConversionSlugs",
    ()=>listConversionSlugs
]);
const conversionTools = [
    // Full Image list from request (slugs normalized)
    {
        slug: '3fr-converter',
        title: '3FR Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Hasselblad 3FR RAW images to JPG/PNG.'
    },
    {
        slug: 'arw-converter',
        title: 'ARW Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Sony ARW RAW images to JPG/PNG.'
    },
    {
        slug: 'avif-converter',
        title: 'AVIF Converter',
        category: 'Image',
        targetFormat: 'avif',
        description: 'Convert images to AVIF or from AVIF to JPG/PNG (if supported by sharp).'
    },
    {
        slug: 'cr2-converter',
        title: 'CR2 Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Canon CR2 RAW images to JPG/PNG.'
    },
    {
        slug: 'cr3-converter',
        title: 'CR3 Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Canon CR3 RAW images to JPG/PNG.'
    },
    {
        slug: 'crw-converter',
        title: 'CRW Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Canon CRW RAW images to JPG/PNG.'
    },
    {
        slug: 'dcr-converter',
        title: 'DCR Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Kodak DCR RAW images to JPG/PNG.'
    },
    {
        slug: 'dng-converter',
        title: 'DNG Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Adobe DNG RAW images to JPG/PNG.'
    },
    {
        slug: 'eps-converter',
        title: 'EPS Converter',
        category: 'Vector',
        targetFormat: 'pdf',
        description: 'Converti file EPS in PDF o PNG mantenendo la qualità vettoriale.'
    },
    {
        slug: 'erf-converter',
        title: 'ERF Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Epson ERF RAW images to JPG/PNG.'
    },
    {
        slug: 'heif-converter',
        title: 'HEIF Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert HEIF to JPG/PNG (support depends on libvips build).'
    },
    {
        slug: 'icns-converter',
        title: 'ICNS Converter',
        category: 'Image',
        targetFormat: 'png',
        description: 'Convert Apple ICNS icons to PNG.'
    },
    {
        slug: 'ico-converter',
        title: 'ICO Converter',
        category: 'Image',
        targetFormat: 'png',
        description: 'Convert Windows ICO icons to PNG.'
    },
    {
        slug: 'jfif-converter',
        title: 'JFIF Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert JFIF images to JPG/PNG.'
    },
    {
        slug: 'mos-converter',
        title: 'MOS Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Leaf MOS RAW images to JPG/PNG.'
    },
    {
        slug: 'mrw-converter',
        title: 'MRW Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Minolta MRW RAW images to JPG/PNG.'
    },
    {
        slug: 'nef-converter',
        title: 'NEF Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Nikon NEF RAW images to JPG/PNG.'
    },
    {
        slug: 'odd-converter',
        title: 'ODD Converter',
        category: 'Vector',
        targetFormat: 'pdf',
        description: 'Converti template di disegno OpenDocument (ODD) in PDF o PNG.'
    },
    {
        slug: 'odg-converter',
        title: 'ODG Converter',
        category: 'Vector',
        targetFormat: 'pdf',
        description: 'Converti disegni ODG in PDF o PNG preservando gli elementi grafici.'
    },
    {
        slug: 'orf-converter',
        title: 'ORF Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Olympus ORF RAW images to JPG/PNG.'
    },
    {
        slug: 'pef-converter',
        title: 'PEF Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Pentax PEF RAW images to JPG/PNG.'
    },
    {
        slug: 'ppm-converter',
        title: 'PPM Converter',
        category: 'Image',
        targetFormat: 'png',
        description: 'Convert PPM images to PNG/JPG.'
    },
    {
        slug: 'ps-converter',
        title: 'PS Converter',
        category: 'Vector',
        targetFormat: 'pdf',
        description: 'Converti file PostScript (PS) in PDF o PNG ad alta risoluzione.'
    },
    {
        slug: 'psd-converter',
        title: 'PSD Converter',
        category: 'Image',
        targetFormat: 'png',
        description: 'Convert Adobe PSD to PNG/JPG (flatten).'
    },
    {
        slug: 'pub-converter',
        title: 'PUB Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti documenti Microsoft Publisher (PUB) in PDF preservando layout e grafica.'
    },
    {
        slug: 'raf-converter',
        title: 'RAF Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Fuji RAF RAW to JPG/PNG.'
    },
    {
        slug: 'raw-converter',
        title: 'RAW Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert various RAW formats to JPG/PNG (best-effort).'
    },
    {
        slug: 'rw2-converter',
        title: 'RW2 Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Panasonic RW2 RAW to JPG/PNG.'
    },
    {
        slug: 'tif-converter',
        title: 'TIF Converter',
        category: 'Image',
        targetFormat: 'tiff',
        description: 'Convert TIF/TIFF images to PNG/JPG or viceversa.'
    },
    {
        slug: 'x3f-converter',
        title: 'X3F Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Convert Sigma X3F RAW to JPG/PNG.'
    },
    {
        slug: 'xcf-converter',
        title: 'XCF Converter',
        category: 'Image',
        targetFormat: 'png',
        description: 'Convert GIMP XCF to PNG/JPG (flatten).'
    },
    {
        slug: 'xps-converter',
        title: 'XPS Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti documenti XPS in PDF mantenendo formattazione e immagini.'
    },
    // Vector additions
    {
        slug: 'ai-converter',
        title: 'AI Converter',
        category: 'Vector',
        targetFormat: 'pdf',
        description: 'Converti file Adobe Illustrator (AI) in PDF o PNG ad alta qualità.'
    },
    {
        slug: 'cdr-converter',
        title: 'CDR Converter',
        category: 'Vector',
        targetFormat: 'pdf',
        description: 'Converti disegni CorelDRAW (CDR) in PDF o PNG preservando i vettori.'
    },
    {
        slug: 'cgm-converter',
        title: 'CGM Converter',
        category: 'Vector',
        targetFormat: 'pdf',
        description: 'Converti grafici CGM in PDF o PNG mantenendo la qualità vettoriale.'
    },
    {
        slug: 'emf-converter',
        title: 'EMF Converter',
        category: 'Vector',
        targetFormat: 'png',
        description: 'Converti file EMF (Enhanced Metafile) in PNG o PDF.'
    },
    {
        slug: 'sk-converter',
        title: 'SK Converter',
        category: 'Vector',
        targetFormat: 'pdf',
        description: 'Converti file SK in PDF o PNG preservando gli elementi grafici.'
    },
    {
        slug: 'sk1-converter',
        title: 'SK1 Converter',
        category: 'Vector',
        targetFormat: 'pdf',
        description: 'Converti file SK1 in PDF o PNG ad alta risoluzione.'
    },
    {
        slug: 'svgz-converter',
        title: 'SVGZ Converter',
        category: 'Vector',
        targetFormat: 'svg',
        description: 'Convert SVGZ (compressed SVG) to SVG/PNG.'
    },
    {
        slug: 'vsd-converter',
        title: 'VSD Converter',
        category: 'Vector',
        targetFormat: 'pdf',
        description: 'Converti diagrammi Microsoft Visio (VSD) in PDF o PNG.'
    },
    {
        slug: 'wmf-converter',
        title: 'WMF Converter',
        category: 'Vector',
        targetFormat: 'png',
        description: 'Converti file WMF (Windows Metafile) in PNG o PDF.'
    },
    // Video list (map to common targets)
    {
        slug: '3g2-converter',
        title: '3G2 Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert 3G2 videos to MP4 or WEBM.'
    },
    {
        slug: '3gp-converter',
        title: '3GP Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert 3GP videos to MP4 or WEBM.'
    },
    {
        slug: '3gpp-converter',
        title: '3GPP Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert 3GPP videos to MP4 or WEBM.'
    },
    {
        slug: 'cavs-converter',
        title: 'CAVS Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert CAVS to MP4 (best-effort).'
    },
    {
        slug: 'dv-converter',
        title: 'DV Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert DV to MP4.'
    },
    {
        slug: 'dvr-converter',
        title: 'DVR Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert DVR MS to MP4 (best-effort).'
    },
    {
        slug: 'flv-converter',
        title: 'FLV Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert FLV to MP4 or WEBM.'
    },
    {
        slug: 'm2ts-converter',
        title: 'M2TS Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert M2TS to MP4.'
    },
    {
        slug: 'm4v-converter',
        title: 'M4V Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert M4V to MP4.'
    },
    {
        slug: 'mkv-converter',
        title: 'MKV Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert MKV to MP4 or WEBM.'
    },
    {
        slug: 'mod-converter',
        title: 'MOD Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert MOD to MP4 (best-effort).'
    },
    {
        slug: 'mov-converter',
        title: 'MOV Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert MOV to MP4 or WEBM.'
    },
    {
        slug: 'mpeg-converter',
        title: 'MPEG Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert MPEG to MP4.'
    },
    {
        slug: 'mpg-converter',
        title: 'MPG Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert MPG to MP4.'
    },
    {
        slug: 'mts-converter',
        title: 'MTS Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert MTS to MP4.'
    },
    {
        slug: 'mxf-converter',
        title: 'MXF Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert MXF to MP4 (best-effort).'
    },
    {
        slug: 'ogg-converter',
        title: 'OGG Converter',
        category: 'Video',
        targetFormat: 'webm',
        description: 'Convert OGG videos to WEBM (or audio OGG to OGG).'
    },
    {
        slug: 'rm-converter',
        title: 'RM Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert RealMedia RM to MP4 (best-effort).'
    },
    {
        slug: 'rmvb-converter',
        title: 'RMVB Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert RMVB to MP4 (best-effort).'
    },
    {
        slug: 'swf-converter',
        title: 'SWF Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert SWF to MP4 (best-effort).'
    },
    {
        slug: 'ts-converter',
        title: 'TS Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert TS transport streams to MP4.'
    },
    {
        slug: 'vob-converter',
        title: 'VOB Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert VOB (DVD) to MP4.'
    },
    {
        slug: 'wmv-converter',
        title: 'WMV Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert WMV to MP4.'
    },
    {
        slug: 'wtv-converter',
        title: 'WTV Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Convert WTV to MP4 (best-effort).'
    },
    // Archive list (creation-focused)
    {
        slug: '7z-converter',
        title: '7Z Converter',
        category: 'Archive',
        targetFormat: '7z',
        description: 'Crea o estrai archivi 7Z compressi ad alta efficienza.'
    },
    {
        slug: 'ace-converter',
        title: 'ACE Converter',
        category: 'Archive',
        targetFormat: 'ace',
        description: 'Gestisci archivi ACE: crea o estrai file compressi.'
    },
    {
        slug: 'alz-converter',
        title: 'ALZ Converter',
        category: 'Archive',
        targetFormat: 'alz',
        description: 'Converti o estrai archivi ALZ compressi.'
    },
    {
        slug: 'arc-converter',
        title: 'ARC Converter',
        category: 'Archive',
        targetFormat: 'arc',
        description: 'Gestisci archivi ARC: crea o estrai contenuti.'
    },
    {
        slug: 'arj-converter',
        title: 'ARJ Converter',
        category: 'Archive',
        targetFormat: 'arj',
        description: 'Crea o estrai archivi ARJ compressi.'
    },
    {
        slug: 'bz-converter',
        title: 'BZ Converter',
        category: 'Archive',
        targetFormat: 'bz',
        description: 'Comprimi file usando l\'algoritmo Bzip.'
    },
    {
        slug: 'bz2-converter',
        title: 'BZ2 Converter',
        category: 'Archive',
        targetFormat: 'bz2',
        description: 'Comprimi file con Bzip2 per massima compressione.'
    },
    {
        slug: 'cab-converter',
        title: 'CAB Converter',
        category: 'Archive',
        targetFormat: 'cab',
        description: 'Gestisci archivi CAB di Windows: crea o estrai.'
    },
    {
        slug: 'cpio-converter',
        title: 'CPIO Converter',
        category: 'Archive',
        targetFormat: 'cpio',
        description: 'Crea o estrai archivi CPIO Unix/Linux.'
    },
    {
        slug: 'deb-converter',
        title: 'DEB Converter',
        category: 'Archive',
        targetFormat: 'deb',
        description: 'Gestisci pacchetti DEB Debian: estrai o crea.'
    },
    {
        slug: 'dmg-converter',
        title: 'DMG Converter',
        category: 'Archive',
        targetFormat: 'dmg',
        description: 'Gestisci immagini disco DMG di macOS.'
    },
    {
        slug: 'img-converter',
        title: 'IMG Converter',
        category: 'Archive',
        targetFormat: 'img',
        description: 'Gestisci immagini disco IMG: estrai o crea.'
    },
    {
        slug: 'iso-converter',
        title: 'ISO Converter',
        category: 'Archive',
        targetFormat: 'iso',
        description: 'Gestisci immagini ISO: estrai contenuti o crea nuove immagini.'
    },
    {
        slug: 'jar-converter',
        title: 'JAR Converter',
        category: 'Archive',
        targetFormat: 'jar',
        description: 'JAR archive creation (zip-based).'
    },
    {
        slug: 'lha-converter',
        title: 'LHA Converter',
        category: 'Archive',
        targetFormat: 'lha',
        description: 'Gestisci archivi LHA: crea o estrai file compressi.'
    },
    {
        slug: 'lz-converter',
        title: 'LZ Converter',
        category: 'Archive',
        targetFormat: 'lz',
        description: 'Comprimi file usando l\'algoritmo LZ.'
    },
    {
        slug: 'lzma-converter',
        title: 'LZMA Converter',
        category: 'Archive',
        targetFormat: 'lzma',
        description: 'Comprimi file con LZMA per alta compressione.'
    },
    {
        slug: 'lzo-converter',
        title: 'LZO Converter',
        category: 'Archive',
        targetFormat: 'lzo',
        description: 'Comprimi file con LZO per compressione veloce.'
    },
    {
        slug: 'rar-converter',
        title: 'RAR Converter',
        category: 'Archive',
        targetFormat: 'rar',
        description: 'Gestisci archivi RAR: estrai contenuti compressi.'
    },
    {
        slug: 'rpm-converter',
        title: 'RPM Converter',
        category: 'Archive',
        targetFormat: 'rpm',
        description: 'Gestisci pacchetti RPM: estrai o crea pacchetti.'
    },
    {
        slug: 'rz-converter',
        title: 'RZ Converter',
        category: 'Archive',
        targetFormat: 'rz',
        description: 'Comprimi file usando l\'algoritmo Rzip.'
    },
    {
        slug: 'tar-7z-converter',
        title: 'TAR.7Z Converter',
        category: 'Archive',
        targetFormat: '7z',
        description: 'Crea archivi .tar.7z combinando TAR e compressione 7Z.'
    },
    {
        slug: 'tar-bz-converter',
        title: 'TAR.BZ Converter',
        category: 'Archive',
        targetFormat: 'tar.bz',
        description: 'Crea archivi .tar.bz combinando TAR e Bzip.'
    },
    {
        slug: 'tar-bz2-converter',
        title: 'TAR.BZ2 Converter',
        category: 'Archive',
        targetFormat: 'tar.bz2',
        description: 'Crea archivi .tar.bz2 combinando TAR e Bzip2.'
    },
    {
        slug: 'tar-gz-converter',
        title: 'TAR.GZ Converter',
        category: 'Archive',
        targetFormat: 'tgz',
        description: 'Create .tar.gz (tgz) archives from files.'
    },
    {
        slug: 'tar-lzo-converter',
        title: 'TAR.LZO Converter',
        category: 'Archive',
        targetFormat: 'tar.lzo',
        description: 'Crea archivi .tar.lzo combinando TAR e LZO.'
    },
    {
        slug: 'tar-xz-converter',
        title: 'TAR.XZ Converter',
        category: 'Archive',
        targetFormat: 'tar.xz',
        description: 'Crea archivi .tar.xz combinando TAR e XZ.'
    },
    {
        slug: 'tar-z-converter',
        title: 'TAR.Z Converter',
        category: 'Archive',
        targetFormat: 'tar.z',
        description: 'Crea archivi .tar.Z combinando TAR e compress Unix.'
    },
    {
        slug: 'tbz-converter',
        title: 'TBZ Converter',
        category: 'Archive',
        targetFormat: 'tbz',
        description: 'Comprimi file in formato TBZ (TAR + Bzip).'
    },
    {
        slug: 'tbz2-converter',
        title: 'TBZ2 Converter',
        category: 'Archive',
        targetFormat: 'tbz2',
        description: 'Comprimi file in formato TBZ2 (TAR + Bzip2).'
    },
    {
        slug: 'tgz-converter',
        title: 'TGZ Converter',
        category: 'Archive',
        targetFormat: 'tgz',
        description: 'Create TGZ archives (tar.gz) from files.'
    },
    {
        slug: 'tz-converter',
        title: 'TZ Converter',
        category: 'Archive',
        targetFormat: 'tz',
        description: 'Comprimi file in formato TZ compresso.'
    },
    {
        slug: 'tzo-converter',
        title: 'TZO Converter',
        category: 'Archive',
        targetFormat: 'tzo',
        description: 'Comprimi file in formato TZO compresso.'
    },
    {
        slug: 'xz-converter',
        title: 'XZ Converter',
        category: 'Archive',
        targetFormat: 'xz',
        description: 'Comprimi file con XZ per massima compressione.'
    },
    {
        slug: 'z-converter',
        title: 'Z Converter',
        category: 'Archive',
        targetFormat: 'z',
        description: 'Comprimi file in formato Unix .Z compresso.'
    },
    // Audio list
    {
        slug: 'aac-converter',
        title: 'AAC Converter',
        category: 'Audio',
        targetFormat: 'aac',
        description: 'Convert audio to AAC/M4A (best-effort).'
    },
    {
        slug: 'ac3-converter',
        title: 'AC3 Converter',
        category: 'Audio',
        targetFormat: 'mp3',
        description: 'Convert AC3 to MP3/WAV.'
    },
    {
        slug: 'aif-converter',
        title: 'AIF Converter',
        category: 'Audio',
        targetFormat: 'wav',
        description: 'Convert AIF to WAV/MP3.'
    },
    {
        slug: 'aifc-converter',
        title: 'AIFC Converter',
        category: 'Audio',
        targetFormat: 'wav',
        description: 'Convert AIFC to WAV/MP3.'
    },
    {
        slug: 'aiff-converter',
        title: 'AIFF Converter',
        category: 'Audio',
        targetFormat: 'wav',
        description: 'Convert AIFF to WAV/MP3.'
    },
    {
        slug: 'amr-converter',
        title: 'AMR Converter',
        category: 'Audio',
        targetFormat: 'mp3',
        description: 'Convert AMR to MP3/WAV.'
    },
    {
        slug: 'au-converter',
        title: 'AU Converter',
        category: 'Audio',
        targetFormat: 'wav',
        description: 'Convert AU to WAV/MP3.'
    },
    {
        slug: 'caf-converter',
        title: 'CAF Converter',
        category: 'Audio',
        targetFormat: 'wav',
        description: 'Convert CAF to WAV/MP3.'
    },
    {
        slug: 'dss-converter',
        title: 'DSS Converter',
        category: 'Audio',
        targetFormat: 'mp3',
        description: 'Convert DSS to MP3/WAV (best-effort).'
    },
    {
        slug: 'flac-converter',
        title: 'FLAC Converter',
        category: 'Audio',
        targetFormat: 'flac',
        description: 'Convert audio to/from FLAC.'
    },
    {
        slug: 'm4a-converter',
        title: 'M4A Converter',
        category: 'Audio',
        targetFormat: 'm4a',
        description: 'Convert audio to M4A (AAC).'
    },
    {
        slug: 'm4b-converter',
        title: 'M4B Converter',
        category: 'Audio',
        targetFormat: 'm4b',
        description: 'Converti audiolibri in formato M4B con capitoli e segnalibri.'
    },
    {
        slug: 'mp3-converter',
        title: 'MP3 Converter',
        category: 'Audio',
        targetFormat: 'mp3',
        description: 'Convert audio to MP3 (bitrate configurabile).'
    },
    {
        slug: 'oga-converter',
        title: 'OGA Converter',
        category: 'Audio',
        targetFormat: 'ogg',
        description: 'Convert audio to OGG (Opus).'
    },
    {
        slug: 'voc-converter',
        title: 'VOC Converter',
        category: 'Audio',
        targetFormat: 'wav',
        description: 'Convert VOC to WAV (best-effort).'
    },
    {
        slug: 'weba-converter',
        title: 'WEBA Converter',
        category: 'Audio',
        targetFormat: 'weba',
        description: 'Convert audio to WEBA (OGG/Opus).'
    },
    {
        slug: 'wma-converter',
        title: 'WMA Converter',
        category: 'Audio',
        targetFormat: 'mp3',
        description: 'Convert WMA to MP3/WAV.'
    },
    // Document additions
    {
        slug: 'abw-converter',
        title: 'ABW Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti documenti AbiWord (ABW) in PDF preservando formattazione e layout.'
    },
    {
        slug: 'djvu-converter',
        title: 'DJVU Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti file DJVU in PDF mantenendo immagini e testo ad alta qualità.'
    },
    {
        slug: 'doc-converter',
        title: 'DOC Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti documenti Word legacy (DOC) in PDF moderni.'
    },
    {
        slug: 'docm-converter',
        title: 'DOCM Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti documenti DOCM in PDF (le macro vengono rimosse per sicurezza).'
    },
    {
        slug: 'dot-converter',
        title: 'DOT Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti template Word (DOT) in PDF preservando lo stile.'
    },
    {
        slug: 'dotx-converter',
        title: 'DOTX Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti template Word moderni (DOTX) in PDF.'
    },
    {
        slug: 'html-converter',
        title: 'HTML Converter',
        category: 'Document',
        targetFormat: 'html',
        description: 'Converti tra HTML/MD/TXT/PDF.'
    },
    {
        slug: 'hwp-converter',
        title: 'HWP Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti documenti HWP (Hancom Word) in PDF preservando formattazione.'
    },
    {
        slug: 'lwp-converter',
        title: 'LWP Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti documenti LWP in PDF mantenendo layout e stili.'
    },
    {
        slug: 'md-converter',
        title: 'MD Converter',
        category: 'Document',
        targetFormat: 'md',
        description: 'Converti documenti tra Markdown, HTML e PDF.'
    },
    {
        slug: 'odt-converter',
        title: 'ODT Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti documenti OpenDocument (ODT) in PDF ad alta qualità.'
    },
    {
        slug: 'pages-converter',
        title: 'PAGES Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti documenti Apple Pages in PDF preservando design e formattazione.'
    },
    {
        slug: 'rst-converter',
        title: 'RST Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti file reStructuredText in PDF per documentazione professionale.'
    },
    {
        slug: 'rtf-converter',
        title: 'RTF Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti documenti RTF (Rich Text Format) in PDF mantenendo formattazione.'
    },
    {
        slug: 'tex-converter',
        title: 'TEX Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti documenti LaTeX (TEX) in PDF preservando formule e layout.'
    },
    {
        slug: 'wpd-converter',
        title: 'WPD Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti documenti WordPerfect (WPD) in PDF moderni.'
    },
    {
        slug: 'wps-converter',
        title: 'WPS Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti documenti WPS in PDF preservando contenuto e formattazione.'
    },
    {
        slug: 'zabw-converter',
        title: 'ZABW Converter',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti archivi compressi ABW (ZABW) in PDF.'
    },
    // Ebook
    {
        slug: 'azw-converter',
        title: 'AZW Converter',
        category: 'Ebook',
        targetFormat: 'epub',
        description: 'Converti ebook Kindle (AZW) in formato EPUB universale.'
    },
    {
        slug: 'azw3-converter',
        title: 'AZW3 Converter',
        category: 'Ebook',
        targetFormat: 'epub',
        description: 'Converti ebook AZW3 di Amazon in EPUB per lettura su qualsiasi dispositivo.'
    },
    {
        slug: 'azw4-converter',
        title: 'AZW4 Converter',
        category: 'Ebook',
        targetFormat: 'epub',
        description: 'Converti ebook AZW4 in formato EPUB standard.'
    },
    {
        slug: 'cbc-converter',
        title: 'CBC Converter',
        category: 'Ebook',
        targetFormat: 'cbz',
        description: 'Converti fumetti CBC in formato CBZ compresso.'
    },
    {
        slug: 'cbr-converter',
        title: 'CBR Converter',
        category: 'Ebook',
        targetFormat: 'cbz',
        description: 'Converti fumetti CBR (RAR) in formato CBZ (ZIP) universale.'
    },
    {
        slug: 'cbz-converter',
        title: 'CBZ Converter',
        category: 'Ebook',
        targetFormat: 'cbz',
        description: 'Crea archivi CBZ per fumetti da immagini.'
    },
    {
        slug: 'chm-converter',
        title: 'CHM Converter',
        category: 'Ebook',
        targetFormat: 'pdf',
        description: 'Converti file CHM (help di Windows) in PDF per lettura universale.'
    },
    {
        slug: 'epub-converter',
        title: 'EPUB Converter',
        category: 'Ebook',
        targetFormat: 'epub',
        description: 'Gestisci ebook EPUB: converti da e verso altri formati ebook.'
    },
    {
        slug: 'fb2-converter',
        title: 'FB2 Converter',
        category: 'Ebook',
        targetFormat: 'epub',
        description: 'Converti ebook FictionBook (FB2) in formato EPUB.'
    },
    {
        slug: 'htm-converter',
        title: 'HTM Converter',
        category: 'Ebook',
        targetFormat: 'epub',
        description: 'Converti pagine HTML/HTM in ebook EPUB strutturati.'
    },
    {
        slug: 'htmlz-converter',
        title: 'HTMLZ Converter',
        category: 'Ebook',
        targetFormat: 'htmlz',
        description: 'Crea archivi HTMLZ (HTML compresso) per ebook.'
    },
    {
        slug: 'lit-converter',
        title: 'LIT Converter',
        category: 'Ebook',
        targetFormat: 'epub',
        description: 'Converti ebook Microsoft LIT in formato EPUB moderno.'
    },
    {
        slug: 'lrf-converter',
        title: 'LRF Converter',
        category: 'Ebook',
        targetFormat: 'epub',
        description: 'Converti ebook Sony LRF in formato EPUB universale.'
    },
    {
        slug: 'mobi-converter',
        title: 'MOBI Converter',
        category: 'Ebook',
        targetFormat: 'mobi',
        description: 'Converti ebook EPUB in formato MOBI per Kindle.'
    },
    {
        slug: 'pdb-converter',
        title: 'PDB Converter',
        category: 'Ebook',
        targetFormat: 'epub',
        description: 'Converti ebook Palm (PDB) in formato EPUB.'
    },
    {
        slug: 'pml-converter',
        title: 'PML Converter',
        category: 'Ebook',
        targetFormat: 'epub',
        description: 'Converti ebook PML in formato EPUB standard.'
    },
    {
        slug: 'prc-converter',
        title: 'PRC Converter',
        category: 'Ebook',
        targetFormat: 'epub',
        description: 'Converti ebook PRC in formato EPUB universale.'
    },
    {
        slug: 'rb-converter',
        title: 'RB Converter',
        category: 'Ebook',
        targetFormat: 'epub',
        description: 'Converti ebook RocketBook (RB) in formato EPUB.'
    },
    {
        slug: 'snb-converter',
        title: 'SNB Converter',
        category: 'Ebook',
        targetFormat: 'epub',
        description: 'Converti ebook SNB in formato EPUB standard.'
    },
    {
        slug: 'tcr-converter',
        title: 'TCR Converter',
        category: 'Ebook',
        targetFormat: 'epub',
        description: 'Converti ebook TCR in formato EPUB universale.'
    },
    {
        slug: 'txtz-converter',
        title: 'TXTZ Converter',
        category: 'Ebook',
        targetFormat: 'txtz',
        description: 'Crea archivi TXTZ (testo compresso) per ebook.'
    },
    // Presentation
    {
        slug: 'dps-converter',
        title: 'DPS Converter',
        category: 'Presentation',
        targetFormat: 'dps',
        description: 'Convert DPS presentation files to and from PPTX, PPT, PDF easily online.'
    },
    {
        slug: 'key-converter',
        title: 'KEY Converter',
        category: 'Presentation',
        targetFormat: 'key',
        description: 'Convert Apple Keynote KEY files to PPTX or PDF preserving layout.'
    },
    {
        slug: 'odp-converter',
        title: 'ODP Converter',
        category: 'Presentation',
        targetFormat: 'odp',
        description: 'Transform OpenDocument presentations (ODP) into PPTX, PDF and vice versa.'
    },
    {
        slug: 'pot-converter',
        title: 'POT Converter',
        category: 'Presentation',
        targetFormat: 'pot',
        description: 'Convert legacy PowerPoint template POT files to modern PPTX or PDF.'
    },
    {
        slug: 'potx-converter',
        title: 'POTX Converter',
        category: 'Presentation',
        targetFormat: 'potx',
        description: 'Convert POTX templates to PPTX presentations or PDF handouts.'
    },
    {
        slug: 'pps-converter',
        title: 'PPS Converter',
        category: 'Presentation',
        targetFormat: 'pps',
        description: 'Convert PPS show files to editable PPTX or PDF.'
    },
    {
        slug: 'ppsx-converter',
        title: 'PPSX Converter',
        category: 'Presentation',
        targetFormat: 'ppsx',
        description: 'Convert PPSX slide shows to PPTX or PDF quickly.'
    },
    {
        slug: 'ppt-converter',
        title: 'PPT Converter',
        category: 'Presentation',
        targetFormat: 'ppt',
        description: 'Convert legacy PPT files to PPTX or PDF retaining content.'
    },
    {
        slug: 'pptm-converter',
        title: 'PPTM Converter',
        category: 'Presentation',
        targetFormat: 'pptm',
        description: 'Convert PPTM macro-enabled presentations to PPTX or PDF (macros excluded).'
    },
    {
        slug: 'pptx-converter',
        title: 'PPTX Converter',
        category: 'Presentation',
        targetFormat: 'pptx',
        description: 'Convert PPTX presentations to PDF, or other formats (initial support: PDF).'
    },
    // Spreadsheet
    {
        slug: 'csv-converter',
        title: 'CSV Converter',
        category: 'Spreadsheet',
        targetFormat: 'csv',
        description: 'Convert CSV data to XLSX or PDF tables and back.'
    },
    {
        slug: 'et-converter',
        title: 'ET Converter',
        category: 'Spreadsheet',
        targetFormat: 'et',
        description: 'Convert Kingsoft ET spreadsheet files to XLSX or PDF.'
    },
    {
        slug: 'numbers-converter',
        title: 'NUMBERS Converter',
        category: 'Spreadsheet',
        targetFormat: 'numbers',
        description: 'Convert Apple Numbers documents to XLSX or PDF.'
    },
    {
        slug: 'ods-converter',
        title: 'ODS Converter',
        category: 'Spreadsheet',
        targetFormat: 'ods',
        description: 'Convert OpenDocument spreadsheets (ODS) to XLSX or PDF.'
    },
    {
        slug: 'xls-converter',
        title: 'XLS Converter',
        category: 'Spreadsheet',
        targetFormat: 'xls',
        description: 'Convert legacy Excel XLS files to modern XLSX or PDF.'
    },
    {
        slug: 'xlsm-converter',
        title: 'XLSM Converter',
        category: 'Spreadsheet',
        targetFormat: 'xlsm',
        description: 'Convert XLSM macro-enabled workbooks to XLSX or PDF (macros excluded).'
    },
    {
        slug: 'xlsx-converter',
        title: 'XLSX Converter',
        category: 'Spreadsheet',
        targetFormat: 'xlsx',
        description: 'Convert XLSX spreadsheets to PDF or CSV (initial support: PDF, CSV).'
    },
    // Image (subset initially supported; raw formats)
    {
        slug: 'png-converter',
        title: 'PNG Converter',
        category: 'Image',
        targetFormat: 'png',
        description: 'Converti immagini in PNG ottimizzato o da PNG a JPG, WEBP.'
    },
    {
        slug: 'jpg-converter',
        title: 'JPG Converter',
        category: 'Image',
        targetFormat: 'jpg',
        description: 'Converti immagini in JPG con qualità regolabile per file più leggeri.'
    },
    {
        slug: 'jpeg-converter',
        title: 'JPEG Converter',
        category: 'Image',
        targetFormat: 'jpeg',
        description: 'Converti immagini in formato JPEG controllando qualità e dimensione.'
    },
    {
        slug: 'webp-converter',
        title: 'WEBP Converter',
        category: 'Image',
        targetFormat: 'webp',
        description: 'Converti immagini in formato WEBP moderno per ottimizzazione web.'
    },
    {
        slug: 'gif-converter',
        title: 'GIF Converter',
        category: 'Image',
        targetFormat: 'gif',
        description: 'Converti immagini statiche in GIF (supporto animazioni in arrivo).'
    },
    {
        slug: 'heic-converter',
        title: 'HEIC Converter',
        category: 'Image',
        targetFormat: 'heic',
        description: 'Converti foto HEIC (iPhone) in JPG o PNG per compatibilità universale.'
    },
    {
        slug: 'tiff-converter',
        title: 'TIFF Converter',
        category: 'Image',
        targetFormat: 'tiff',
        description: 'Converti immagini TIFF ad alta qualità in PNG, JPG o PDF.'
    },
    {
        slug: 'bmp-converter',
        title: 'BMP Converter',
        category: 'Image',
        targetFormat: 'bmp',
        description: 'Converti immagini BMP in PNG o JPG compressi per risparmiare spazio.'
    },
    {
        slug: 'raw-converter',
        title: 'RAW Converter',
        category: 'Image',
        targetFormat: 'raw',
        description: 'Converti formati RAW delle fotocamere in JPG o PNG processati.'
    },
    // Vector - duplicati rimossi, già presenti sopra
    // Video (initial support limited to container remux via ffmpeg if available)
    {
        slug: 'mp4-converter',
        title: 'MP4 Converter',
        category: 'Video',
        targetFormat: 'mp4',
        description: 'Converti video in MP4 (H.264/AAC) con risoluzione e qualità regolabili.'
    },
    {
        slug: 'webm-converter',
        title: 'WEBM Converter',
        category: 'Video',
        targetFormat: 'webm',
        description: 'Converti video in WEBM (VP9/Opus) ottimizzato per web.'
    },
    {
        slug: 'avi-converter',
        title: 'AVI Converter',
        category: 'Video',
        targetFormat: 'avi',
        description: 'Converti video in formato AVI legacy per compatibilità.'
    },
    // Archive (initial: zip create/extract) - duplicati rimossi, già presenti sopra
    // Audio (initial conversion using ffmpeg if available) - duplicati rimossi, già presenti sopra
    // Document conversions
    {
        slug: 'docx-converter',
        title: 'DOCX Converter',
        category: 'Document',
        targetFormat: 'docx',
        description: 'Converti documenti in formato DOCX (Word) preservando formattazione e stili.'
    },
    {
        slug: 'txt-converter',
        title: 'TXT Converter',
        category: 'Document',
        targetFormat: 'txt',
        description: 'Converti documenti in testo semplice (TXT) estraendo solo il contenuto testuale.'
    },
    {
        slug: 'md-converter',
        title: 'MD Converter',
        category: 'Document',
        targetFormat: 'md',
        description: 'Converti documenti o HTML in formato Markdown per documentazione e note.'
    },
    {
        slug: 'html-converter',
        title: 'HTML Converter',
        category: 'Document',
        targetFormat: 'html',
        description: 'Converti Markdown o testo in pagine HTML con formattazione completa.'
    },
    // Ebook (duplicati rimossi - già presenti sopra)
    {
        slug: 'cbz-converter',
        title: 'CBZ Converter',
        category: 'Ebook',
        targetFormat: 'cbz',
        description: 'Create comic book CBZ archive from images.'
    },
    // Font (initial: ttf/otf -> woff/woff2 if library available)
    {
        slug: 'ttf-converter',
        title: 'TTF Converter',
        category: 'Font',
        targetFormat: 'ttf',
        description: 'Converti font TTF in WOFF/WOFF2 per web o viceversa.'
    },
    {
        slug: 'otf-converter',
        title: 'OTF Converter',
        category: 'Font',
        targetFormat: 'otf',
        description: 'Converti font OTF in TTF o WOFF per compatibilità web.'
    },
    {
        slug: 'woff-converter',
        title: 'WOFF Converter',
        category: 'Font',
        targetFormat: 'woff',
        description: 'Convert fonts to web-optimized WOFF format.'
    },
    {
        slug: 'woff2-converter',
        title: 'WOFF2 Converter',
        category: 'Font',
        targetFormat: 'woff2',
        description: 'Convert fonts to modern compressed WOFF2 format.'
    },
    {
        slug: 'eot-converter',
        title: 'EOT Converter',
        category: 'Font',
        targetFormat: 'eot',
        description: 'Convert fonts to legacy EOT format for older browsers.'
    },
    // PDF Tools - Convertitori specifici per PDF
    {
        slug: 'pdf-to-powerpoint',
        title: 'PDF to PowerPoint',
        category: 'PDF',
        targetFormat: 'pptx',
        description: 'Converti documenti PDF in presentazioni PowerPoint modificabili (PPTX).'
    },
    {
        slug: 'pdf-to-excel',
        title: 'PDF to Excel',
        category: 'PDF',
        targetFormat: 'xlsx',
        description: 'Estrai tabelle da PDF e convertile in fogli Excel modificabili (XLSX).'
    },
    {
        slug: 'pdf-to-pdfa',
        title: 'PDF to PDF/A',
        category: 'PDF',
        targetFormat: 'pdfa',
        description: 'Converti PDF in formato PDF/A conforme per archiviazione a lungo termine.'
    },
    {
        slug: 'pdf-to-docx',
        title: 'PDF to Word',
        category: 'PDF',
        targetFormat: 'docx',
        description: 'Converti PDF in documenti Word modificabili (DOCX) preservando la formattazione.'
    },
    {
        slug: 'pdf-to-jpg',
        title: 'PDF to JPG',
        category: 'PDF',
        targetFormat: 'jpg',
        description: 'Estrai immagini da PDF e convertile in file JPG ad alta qualità.'
    },
    {
        slug: 'pdf-to-png',
        title: 'PDF to PNG',
        category: 'PDF',
        targetFormat: 'png',
        description: 'Converti pagine PDF in immagini PNG mantenendo la qualità originale.'
    },
    {
        slug: 'pdf-to-txt',
        title: 'PDF to TXT',
        category: 'PDF',
        targetFormat: 'txt',
        description: 'Estrai il testo da PDF e convertilo in file di testo semplice (TXT).'
    },
    {
        slug: 'pdf-to-html',
        title: 'PDF to HTML',
        category: 'PDF',
        targetFormat: 'html',
        description: 'Converti PDF in pagine HTML preservando layout e formattazione.'
    },
    // Specific conversion tools (bidirectional) - Da altri formati a PDF
    {
        slug: 'powerpoint-to-pdf',
        title: 'PowerPoint to PDF',
        category: 'Presentation',
        targetFormat: 'pdf',
        description: 'Converti presentazioni PowerPoint (PPT, PPTX) in PDF ad alta qualità.'
    },
    {
        slug: 'excel-to-pdf',
        title: 'Excel to PDF',
        category: 'Spreadsheet',
        targetFormat: 'pdf',
        description: 'Converti fogli Excel (XLS, XLSX) in PDF preservando formattazione e tabelle.'
    },
    {
        slug: 'html-to-pdf',
        title: 'HTML to PDF',
        category: 'Document',
        targetFormat: 'pdf',
        description: 'Converti pagine web HTML in documenti PDF con stili completi.'
    }
];
function getConversionTool(slug) {
    return conversionTools.find((t)=>t.slug === slug);
}
function listConversionSlugs() {
    return conversionTools.map((t)=>t.slug);
}
function getToolsByCategory() {
    const categorized = {};
    const seenSlugs = new Set(); // Per evitare duplicati
    conversionTools.forEach((tool)=>{
        // Salta se abbiamo già visto questo slug
        if (seenSlugs.has(tool.slug)) {
            return;
        }
        seenSlugs.add(tool.slug);
        if (!categorized[tool.category]) {
            categorized[tool.category] = [];
        }
        categorized[tool.category].push({
            title: tool.title,
            description: tool.description,
            href: `/tools/${tool.slug}`,
            category: tool.category,
            targetFormat: tool.targetFormat,
            slug: tool.slug // Aggiungi anche lo slug per facilitare il confronto
        });
    });
    return categorized;
}
function getAllCategories() {
    return [
        ...new Set(conversionTools.map((t)=>t.category))
    ];
}
function getAllConversionTools() {
    return conversionTools.map((tool)=>({
            title: tool.title,
            description: tool.description,
            href: `/tools/${tool.slug}`,
            category: tool.category,
            targetFormat: tool.targetFormat,
            icon: null // Will use fallback icon in ToolCard
        }));
}
}),
"[project]/components/DropdownPortal.jsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DropdownPortal
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2d$dom__$5b$external$5d$__$28$react$2d$dom$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react-dom [external] (react-dom, cjs)");
;
;
;
const MARGIN = 8;
function DropdownPortal({ anchorEl, open, onClose, children, offset = 8, preferRight = false }) {
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [container, setContainer] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [style, setStyle] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])({
        visibility: 'hidden',
        position: 'fixed',
        top: '-9999px',
        left: '-9999px',
        zIndex: 10050
    });
    const elRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    // Gestisci il mounting lato client per evitare errori di hydration
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        setMounted(true);
        if (typeof document !== 'undefined') {
            const portalContainer = document.createElement('div');
            setContainer(portalContainer);
            document.body.appendChild(portalContainer);
            return ()=>{
                if (document.body.contains(portalContainer)) {
                    document.body.removeChild(portalContainer);
                }
            };
        }
    }, []);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
        let active;
        let rafId;
        let retryCount;
        const MAX_RETRIES = undefined;
        const updatePosition = undefined;
    }, [
        open,
        anchorEl,
        offset,
        preferRight,
        mounted
    ]);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (typeof document === 'undefined') return;
        const onDocClick = (e)=>{
            if (!open) return;
            const target = e.target;
            // Non chiudere se si clicca sull'elemento anchor
            if (anchorEl && anchorEl.contains(target)) return;
            // Se si clicca su un link, non fare nulla (lascia che navighi)
            if (target.closest('a')) return;
            // Non chiudere se si clicca all'interno del dropdown
            if (elRef.current && elRef.current.contains(target)) {
                return;
            }
            // Chiudi solo se si clicca fuori
            onClose && onClose();
        };
        if (open) {
            document.addEventListener('click', onDocClick);
        }
        return ()=>document.removeEventListener('click', onDocClick);
    }, [
        open,
        anchorEl,
        onClose
    ]);
    // Non renderizzare nulla durante SSR o se il container non è ancora montato
    if (!mounted || !container || typeof document === 'undefined') {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2d$dom__$5b$external$5d$__$28$react$2d$dom$2c$__cjs$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        ref: elRef,
        style: style,
        className: "dropdown-portal",
        children: children
    }, void 0, false, {
        fileName: "[project]/components/DropdownPortal.jsx",
        lineNumber: 182,
        columnNumber: 5
    }, this), container);
}
}),
"[project]/components/LanguageSwitcher.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DropdownPortal$2e$jsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/DropdownPortal.jsx [ssr] (ecmascript)");
;
;
;
;
const languages = [
    {
        code: 'en',
        name: 'English',
        flag: '🇬🇧'
    },
    {
        code: 'it',
        name: 'Italiano',
        flag: '🇮🇹'
    },
    {
        code: 'es',
        name: 'Español',
        flag: '🇪🇸'
    },
    {
        code: 'fr',
        name: 'Français',
        flag: '🇫🇷'
    },
    {
        code: 'de',
        name: 'Deutsch',
        flag: '🇩🇪'
    },
    {
        code: 'pt',
        name: 'Português',
        flag: '🇵🇹'
    },
    {
        code: 'ru',
        name: 'Русский',
        flag: '🇷🇺'
    },
    {
        code: 'ja',
        name: '日本語',
        flag: '🇯🇵'
    },
    {
        code: 'zh',
        name: '中文',
        flag: '🇨🇳'
    },
    {
        code: 'ar',
        name: 'العربية',
        flag: '🇸🇦'
    },
    {
        code: 'hi',
        name: 'हिन्दी',
        flag: '🇮🇳'
    },
    {
        code: 'ko',
        name: '한국어',
        flag: '🇰🇷'
    }
];
const LanguageSwitcher = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["memo"])(function LanguageSwitcher() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [hoveredLang, setHoveredLang] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const buttonRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    const currentLang = languages.find((lang)=>lang.code === router.locale) || languages[0];
    const changeLanguage = async (locale)=>{
        setIsOpen(false);
        await router.push(router.pathname, router.asPath, {
            locale,
            scroll: false
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: styles.container,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                ref: buttonRef,
                onClick: ()=>setIsOpen((prev)=>!prev),
                style: {
                    ...styles.button,
                    background: isOpen ? 'rgba(102, 126, 234, 0.15)' : 'transparent'
                },
                "aria-label": "Change language",
                "aria-expanded": isOpen,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                        style: styles.flag,
                        children: currentLang.flag
                    }, void 0, false, {
                        fileName: "[project]/components/LanguageSwitcher.js",
                        lineNumber: 44,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                        style: styles.chevron,
                        width: "10",
                        height: "10",
                        viewBox: "0 0 12 12",
                        fill: "none",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                            d: "M2.5 4.5L6 8L9.5 4.5",
                            stroke: "currentColor",
                            strokeWidth: "1.5",
                            strokeLinecap: "round",
                            strokeLinejoin: "round"
                        }, void 0, false, {
                            fileName: "[project]/components/LanguageSwitcher.js",
                            lineNumber: 46,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/LanguageSwitcher.js",
                        lineNumber: 45,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/LanguageSwitcher.js",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DropdownPortal$2e$jsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                anchorEl: buttonRef.current,
                open: isOpen,
                onClose: ()=>setIsOpen(false),
                offset: 6,
                preferRight: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    style: styles.dropdown,
                    className: "language-dropdown",
                    children: languages.map((lang)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                            onClick: ()=>changeLanguage(lang.code),
                            onMouseEnter: ()=>setHoveredLang(lang.code),
                            onMouseLeave: ()=>setHoveredLang(null),
                            style: {
                                ...styles.option,
                                ...lang.code === router.locale ? styles.optionActive : {},
                                background: hoveredLang === lang.code ? 'rgba(102, 126, 234, 0.2)' : 'transparent'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                    style: styles.optionFlag,
                                    children: lang.flag
                                }, void 0, false, {
                                    fileName: "[project]/components/LanguageSwitcher.js",
                                    lineNumber: 70,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                    style: styles.optionName,
                                    children: lang.name
                                }, void 0, false, {
                                    fileName: "[project]/components/LanguageSwitcher.js",
                                    lineNumber: 71,
                                    columnNumber: 15
                                }, this),
                                lang.code === router.locale && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                    style: styles.check,
                                    width: "16",
                                    height: "16",
                                    viewBox: "0 0 16 16",
                                    fill: "none",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                        d: "M13.5 4.5L6 12L2.5 8.5",
                                        stroke: "#667eea",
                                        strokeWidth: "2",
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round"
                                    }, void 0, false, {
                                        fileName: "[project]/components/LanguageSwitcher.js",
                                        lineNumber: 74,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/LanguageSwitcher.js",
                                    lineNumber: 73,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, lang.code, true, {
                            fileName: "[project]/components/LanguageSwitcher.js",
                            lineNumber: 59,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/components/LanguageSwitcher.js",
                    lineNumber: 57,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/LanguageSwitcher.js",
                lineNumber: 50,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/LanguageSwitcher.js",
        lineNumber: 33,
        columnNumber: 5
    }, this);
});
const styles = {
    container: {
        position: 'relative',
        zIndex: 1000
    },
    button: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        background: 'transparent',
        border: 'none',
        borderRadius: '6px',
        color: '#e2e8f0',
        fontSize: '11px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        position: 'relative'
    },
    flag: {
        fontSize: '16px'
    },
    langCode: {
        fontSize: '11px',
        fontWeight: '700'
    },
    chevron: {
        color: '#94a3b8',
        transition: 'transform 0.2s'
    },
    dropdown: {
        minWidth: '200px',
        maxHeight: '360px',
        overflowY: 'auto',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        padding: '8px',
        animation: 'fadeInUp 0.2s ease-out',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
    },
    option: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        padding: '10px 12px',
        background: 'transparent',
        border: 'none',
        borderRadius: '8px',
        color: '#cbd5e1',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.15s',
        textAlign: 'left'
    },
    optionActive: {
        background: 'rgba(102, 126, 234, 0.1)',
        color: '#667eea'
    },
    optionFlag: {
        fontSize: '20px'
    },
    optionName: {
        flex: 1
    },
    check: {
        flexShrink: 0
    }
};
const __TURBOPACK__default__export__ = LanguageSwitcher;
}),
"[project]/components/Navbar.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$styled$2d$jsx$2f$style$2e$js__$5b$external$5d$__$28$styled$2d$jsx$2f$style$2e$js$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/styled-jsx/style.js [external] (styled-jsx/style.js, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/hi/index.mjs [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/bs/index.mjs [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$tools$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/tools.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$conversionRegistry$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/conversionRegistry.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/i18n.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LanguageSwitcher$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/LanguageSwitcher.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DropdownPortal$2e$jsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/DropdownPortal.jsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$performance$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/performance.js [ssr] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
const Navbar = ()=>{
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useTranslation"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [isMobile, setIsMobile] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [dropdownOpen, setDropdownOpen] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [scrolled, setScrolled] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [hoveredItem, setHoveredItem] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [mobileMenuOpen, setMobileMenuOpen] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [mobileSecondaryMenuOpen, setMobileSecondaryMenuOpen] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [expandedCategory, setExpandedCategory] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const navRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    // refs for dropdown buttons
    const buttonRefs = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])({});
    const closeTimeoutRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    // Safe client-side mobile detection
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        const checkMobile = ()=>setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return ()=>window.removeEventListener('resize', checkMobile);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (!isMobile) {
            setMobileMenuOpen(false);
            setMobileSecondaryMenuOpen(false);
            setExpandedCategory(null);
        }
    }, [
        isMobile
    ]);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
        // Throttle scroll handler for better performance
        const handleScroll = undefined; // Update at most once per 100ms
        const handleClickOutside = undefined;
    }, []);
    // Memoize categories computation per evitare re-calcolo ad ogni render
    const categories = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useMemo"])(()=>{
        // Combine AI tools and conversion tools - categorizzazione migliorata
        const conversionToolsByCat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$conversionRegistry$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["getToolsByCategory"])();
        // Unisco categorie simili per semplificare la navbar
        const pdfAndDocs = [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$tools$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["tools"].filter((t)=>t.category === 'PDF' || t.category === 'Testo'),
            ...conversionToolsByCat['Document'] || [],
            ...conversionToolsByCat['Presentation'] || [],
            ...conversionToolsByCat['Spreadsheet'] || []
        ];
        const mediaTools = [
            ...conversionToolsByCat['Video'] || [],
            ...conversionToolsByCat['Audio'] || []
        ];
        // Categorizzazione semplificata e intuitiva
        const allCategories = {
            'AI & Immagini': [
                ...__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$tools$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["tools"].filter((t)=>t.category === 'Immagini'),
                ...conversionToolsByCat['Image'] || []
            ],
            'Documenti & PDF': pdfAndDocs,
            'Video & Audio': [
                ...__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$tools$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["tools"].filter((t)=>t.category === 'Video' || t.category === 'Audio'),
                ...mediaTools
            ],
            'Grafica': [
                ...conversionToolsByCat['Vector'] || [],
                ...conversionToolsByCat['Font'] || []
            ],
            'Archivi & Ebook': [
                ...conversionToolsByCat['Archive'] || [],
                ...conversionToolsByCat['Ebook'] || []
            ]
        };
        // Ordina i tool all'interno di ogni categoria: prima AI/Pro, poi gli altri
        Object.keys(allCategories).forEach((cat)=>{
            allCategories[cat].sort((a, b)=>{
                // Prima i tool AI/Pro
                const aIsPro = a.pro === true || a.href?.includes('ai') || a.href?.includes('upscaler');
                const bIsPro = b.pro === true || b.href?.includes('ai') || b.href?.includes('upscaler');
                if (aIsPro && !bIsPro) return -1;
                if (!aIsPro && bIsPro) return 1;
                // Poi ordina alfabeticamente
                return (a.title || '').localeCompare(b.title || '');
            });
        });
        // Filtra categorie vuote
        return Object.fromEntries(Object.entries(allCategories).filter(([_, tools])=>tools && tools.length > 0));
    }, []);
    const handleDropdownEnter = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])((catName)=>{
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        setDropdownOpen(catName);
    }, []);
    const handleDropdownLeave = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])(()=>{
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
        }
        closeTimeoutRef.current = setTimeout(()=>{
            setDropdownOpen(null);
        }, 300); // 0.3 secondi di ritardo prima di chiudere
    }, []);
    const styles = {
        navbar: {
            position: 'sticky',
            top: 0,
            zIndex: 100000,
            background: scrolled ? 'rgba(10, 14, 26, 0.9)' : 'rgba(10, 14, 26, 0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: scrolled ? '1px solid rgba(102, 126, 234, 0.3)' : '1px solid rgba(102, 126, 234, 0.2)',
            padding: scrolled ? '6px 0' : '10px 0',
            boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.4), 0 0 20px rgba(102, 126, 234, 0.1)' : '0 2px 12px rgba(0,0,0,0.3)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            width: '100%',
            maxWidth: '100%',
            overflowX: 'hidden',
            overflowY: 'visible',
            boxSizing: 'border-box'
        },
        navContent: {
            width: '100%',
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'visible',
            zIndex: 100000,
            boxSizing: 'border-box'
        },
        navLogo: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: scrolled ? '16px' : '18px',
            fontWeight: '700',
            color: '#e2e8f0',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            flexShrink: 0
        },
        logoText: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            lineHeight: '1.2'
        },
        logoMain: {
            fontSize: scrolled ? '16px' : '18px',
            fontWeight: '700',
            color: '#e2e8f0'
        },
        logoSub: {
            fontSize: scrolled ? '9px' : '10px',
            fontWeight: '600',
            color: '#667eea',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginTop: '-2px'
        },
        navMenu: {
            display: isMobile ? 'none' : 'flex',
            gap: '4px',
            alignItems: 'center',
            flexWrap: 'nowrap',
            whiteSpace: 'nowrap',
            flexShrink: 1,
            overflow: 'visible',
            position: 'relative',
            zIndex: 100001
        },
        homeBtn: {
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: isMobile ? 'none' : 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            background: 'transparent',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            color: '#cbd5e1',
            textDecoration: 'none',
            cursor: 'pointer',
            borderRadius: '6px',
            transition: 'background 0.2s'
        },
        dropdown: {
            position: 'relative',
            zIndex: 100002
        },
        dropdownBtn: {
            display: 'flex',
            alignItems: 'center',
            padding: '8px 10px',
            background: 'transparent',
            border: 'none',
            fontSize: '13px',
            fontWeight: '600',
            color: '#cbd5e1',
            cursor: 'pointer',
            borderRadius: '6px',
            transition: 'background 0.2s',
            whiteSpace: 'nowrap'
        },
        dropdownMenu: {
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '8px',
            background: 'rgba(15, 23, 42, 0.98)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            borderRadius: '16px',
            boxShadow: '0 12px 48px rgba(0,0,0,0.6), 0 0 30px rgba(102, 126, 234, 0.2)',
            padding: '12px',
            minWidth: '280px',
            maxWidth: '320px',
            maxHeight: '500px',
            overflowY: 'auto',
            overflowX: 'hidden',
            zIndex: 100003,
            animation: 'fadeInUp 0.3s ease-out',
            scrollBehavior: 'smooth',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(102, 126, 234, 0.5) rgba(15, 23, 42, 0.3)',
            isolation: 'isolate'
        },
        dropdownItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            color: '#cbd5e1',
            textDecoration: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            pointerEvents: 'auto',
            zIndex: 1
        },
        signupBtn: {
            display: 'flex',
            alignItems: 'center',
            padding: '10px 20px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '700',
            color: '#ffffff',
            cursor: 'pointer',
            borderRadius: '10px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4), 0 0 15px rgba(102, 126, 234, 0.2)',
            backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: '200% 200%',
            backgroundPosition: '0% 0%',
            backgroundRepeat: 'no-repeat',
            position: 'relative',
            overflow: 'hidden',
            willChange: 'transform, box-shadow'
        },
        hamburgerBtn: {
            display: isMobile ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            background: 'transparent',
            border: 'none',
            color: '#cbd5e1',
            cursor: 'pointer',
            fontSize: '24px',
            marginRight: '8px'
        },
        secondaryMenuBtn: {
            display: isMobile ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            background: 'transparent',
            border: 'none',
            color: '#cbd5e1',
            cursor: 'pointer',
            fontSize: '24px',
            marginRight: '12px'
        },
        mobileMenu: {
            position: 'fixed',
            top: 0,
            right: mobileMenuOpen ? 0 : '-100%',
            bottom: 0,
            width: '80%',
            maxWidth: '320px',
            background: 'rgba(10, 14, 26, 0.98)',
            backdropFilter: 'blur(16px)',
            borderLeft: '1px solid rgba(102, 126, 234, 0.2)',
            overflowY: 'auto',
            padding: '20px',
            zIndex: 1002,
            transition: 'right 0.3s ease',
            boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.5)',
            display: isMobile ? 'block' : 'none'
        },
        mobileSecondaryMenu: {
            position: 'fixed',
            top: 0,
            right: mobileSecondaryMenuOpen ? 0 : '-100%',
            bottom: 0,
            width: '280px',
            background: 'rgba(10, 14, 26, 0.98)',
            backdropFilter: 'blur(16px)',
            borderLeft: '1px solid rgba(102, 126, 234, 0.2)',
            overflowY: 'auto',
            padding: '20px',
            zIndex: 1002,
            transition: 'right 0.3s ease',
            boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.5)',
            display: isMobile ? 'block' : 'none'
        },
        mobileOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1001,
            backdropFilter: 'blur(4px)'
        },
        mobileMenuHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid rgba(102, 126, 234, 0.2)'
        },
        mobileMenuTitle: {
            fontSize: '20px',
            fontWeight: '700',
            color: '#e2e8f0',
            margin: 0
        },
        closeBtn: {
            background: 'transparent',
            border: 'none',
            color: '#cbd5e1',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '4px'
        },
        mobileMenuItem: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            color: '#cbd5e1',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
            marginBottom: '8px',
            cursor: 'pointer'
        },
        mobileCategoryHeader: {
            padding: '12px 16px',
            color: '#667eea',
            fontSize: '12px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginTop: '16px',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            background: 'rgba(102, 126, 234, 0.1)',
            borderRadius: '8px'
        },
        mobileDropdownItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 16px 10px 32px',
            color: '#cbd5e1',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            background: 'rgba(15, 23, 42, 0.7)',
            marginBottom: '4px'
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$styled$2d$jsx$2f$style$2e$js__$5b$external$5d$__$28$styled$2d$jsx$2f$style$2e$js$2c$__cjs$29$__["default"], {
                id: "3b10be881c6611e8",
                children: ".dropdown-menu-scroll.jsx-3b10be881c6611e8::-webkit-scrollbar{width:8px}.dropdown-menu-scroll.jsx-3b10be881c6611e8::-webkit-scrollbar-track{background:#0f172a4d;border-radius:10px}.dropdown-menu-scroll.jsx-3b10be881c6611e8::-webkit-scrollbar-thumb{background:#667eea80;border-radius:10px;transition:background .2s}.dropdown-menu-scroll.jsx-3b10be881c6611e8.jsx-3b10be881c6611e8::-webkit-scrollbar-thumb:hover{background:#667eeab3}"
            }, void 0, false, void 0, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("nav", {
                style: styles.navbar,
                ref: navRef,
                suppressHydrationWarning: true,
                className: "jsx-3b10be881c6611e8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: styles.navContent,
                        className: "jsx-3b10be881c6611e8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/",
                                style: styles.navLogo,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                        width: scrolled ? "28" : "32",
                                        height: scrolled ? "28" : "32",
                                        viewBox: "0 0 40 40",
                                        fill: "none",
                                        style: {
                                            transition: 'all 0.3s'
                                        },
                                        className: "jsx-3b10be881c6611e8",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("defs", {
                                                className: "jsx-3b10be881c6611e8",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("linearGradient", {
                                                        id: "logoGradient",
                                                        x1: "0%",
                                                        y1: "0%",
                                                        x2: "100%",
                                                        y2: "100%",
                                                        className: "jsx-3b10be881c6611e8",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("stop", {
                                                                offset: "0%",
                                                                style: {
                                                                    stopColor: '#667eea',
                                                                    stopOpacity: 1
                                                                },
                                                                className: "jsx-3b10be881c6611e8"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/Navbar.js",
                                                                lineNumber: 481,
                                                                columnNumber: 33
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("stop", {
                                                                offset: "100%",
                                                                style: {
                                                                    stopColor: '#764ba2',
                                                                    stopOpacity: 1
                                                                },
                                                                className: "jsx-3b10be881c6611e8"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/Navbar.js",
                                                                lineNumber: 482,
                                                                columnNumber: 33
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/Navbar.js",
                                                        lineNumber: 480,
                                                        columnNumber: 29
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("filter", {
                                                        id: "glow",
                                                        className: "jsx-3b10be881c6611e8",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("feGaussianBlur", {
                                                                stdDeviation: "2",
                                                                result: "coloredBlur",
                                                                className: "jsx-3b10be881c6611e8"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/Navbar.js",
                                                                lineNumber: 485,
                                                                columnNumber: 33
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("feMerge", {
                                                                className: "jsx-3b10be881c6611e8",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("feMergeNode", {
                                                                        in: "coloredBlur",
                                                                        className: "jsx-3b10be881c6611e8"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/Navbar.js",
                                                                        lineNumber: 487,
                                                                        columnNumber: 37
                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("feMergeNode", {
                                                                        in: "SourceGraphic",
                                                                        className: "jsx-3b10be881c6611e8"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/Navbar.js",
                                                                        lineNumber: 488,
                                                                        columnNumber: 37
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/Navbar.js",
                                                                lineNumber: 486,
                                                                columnNumber: 33
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/Navbar.js",
                                                        lineNumber: 484,
                                                        columnNumber: 29
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 479,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                                d: "M20 2 L34 10 L34 26 L20 34 L6 26 L6 10 Z",
                                                stroke: "url(#logoGradient)",
                                                strokeWidth: "1.5",
                                                fill: "none",
                                                opacity: "0.6",
                                                className: "jsx-3b10be881c6611e8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 494,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("rect", {
                                                x: "14",
                                                y: "12",
                                                width: "4",
                                                height: "4",
                                                fill: "url(#logoGradient)",
                                                opacity: "0.9",
                                                className: "jsx-3b10be881c6611e8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 501,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("rect", {
                                                x: "22",
                                                y: "12",
                                                width: "4",
                                                height: "4",
                                                fill: "url(#logoGradient)",
                                                opacity: "0.7",
                                                className: "jsx-3b10be881c6611e8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 502,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("rect", {
                                                x: "14",
                                                y: "18",
                                                width: "4",
                                                height: "4",
                                                fill: "url(#logoGradient)",
                                                opacity: "0.8",
                                                className: "jsx-3b10be881c6611e8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 503,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("rect", {
                                                x: "22",
                                                y: "18",
                                                width: "4",
                                                height: "4",
                                                fill: "url(#logoGradient)",
                                                opacity: "1",
                                                filter: "url(#glow)",
                                                className: "jsx-3b10be881c6611e8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 504,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("rect", {
                                                x: "14",
                                                y: "24",
                                                width: "4",
                                                height: "4",
                                                fill: "url(#logoGradient)",
                                                opacity: "0.7",
                                                className: "jsx-3b10be881c6611e8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 505,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("rect", {
                                                x: "22",
                                                y: "24",
                                                width: "4",
                                                height: "4",
                                                fill: "url(#logoGradient)",
                                                opacity: "0.6",
                                                className: "jsx-3b10be881c6611e8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 506,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("circle", {
                                                cx: "10",
                                                cy: "10",
                                                r: "1.5",
                                                fill: "#667eea",
                                                opacity: "0.8",
                                                className: "jsx-3b10be881c6611e8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 509,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("circle", {
                                                cx: "30",
                                                cy: "10",
                                                r: "1.5",
                                                fill: "#764ba2",
                                                opacity: "0.8",
                                                className: "jsx-3b10be881c6611e8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 510,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("circle", {
                                                cx: "10",
                                                cy: "30",
                                                r: "1.5",
                                                fill: "#764ba2",
                                                opacity: "0.8",
                                                className: "jsx-3b10be881c6611e8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 511,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("circle", {
                                                cx: "30",
                                                cy: "30",
                                                r: "1.5",
                                                fill: "#667eea",
                                                opacity: "0.8",
                                                className: "jsx-3b10be881c6611e8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 512,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("line", {
                                                x1: "10",
                                                y1: "10",
                                                x2: "18",
                                                y2: "14",
                                                stroke: "#667eea",
                                                strokeWidth: "0.5",
                                                opacity: "0.4",
                                                className: "jsx-3b10be881c6611e8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 515,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("line", {
                                                x1: "30",
                                                y1: "10",
                                                x2: "26",
                                                y2: "14",
                                                stroke: "#764ba2",
                                                strokeWidth: "0.5",
                                                opacity: "0.4",
                                                className: "jsx-3b10be881c6611e8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 516,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("line", {
                                                x1: "10",
                                                y1: "30",
                                                x2: "18",
                                                y2: "26",
                                                stroke: "#764ba2",
                                                strokeWidth: "0.5",
                                                opacity: "0.4",
                                                className: "jsx-3b10be881c6611e8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 517,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("line", {
                                                x1: "30",
                                                y1: "30",
                                                x2: "26",
                                                y2: "26",
                                                stroke: "#667eea",
                                                strokeWidth: "0.5",
                                                opacity: "0.4",
                                                className: "jsx-3b10be881c6611e8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 518,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 477,
                                        columnNumber: 21
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.logoText,
                                        className: "jsx-3b10be881c6611e8",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                style: styles.logoMain,
                                                className: "jsx-3b10be881c6611e8",
                                                children: "MegaPixelAI"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 521,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                style: styles.logoSub,
                                                className: "jsx-3b10be881c6611e8",
                                                children: "ToolSuite"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 522,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 520,
                                        columnNumber: 21
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Navbar.js",
                                lineNumber: 476,
                                columnNumber: 17
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: styles.navMenu,
                                className: "jsx-3b10be881c6611e8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/tools",
                                        style: {
                                            ...styles.dropdownBtn,
                                            background: hoveredItem === 'tools' ? 'rgba(102, 126, 234, 0.15)' : 'transparent',
                                            textDecoration: 'none'
                                        },
                                        onMouseEnter: ()=>setHoveredItem('tools'),
                                        onMouseLeave: ()=>setHoveredItem(null),
                                        onClick: (e)=>{
                                            e.stopPropagation();
                                            router.push('/tools');
                                        },
                                        children: "Tutti i Tool"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 527,
                                        columnNumber: 21
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    Object.keys(categories).map((catName)=>{
                                        const isOpen = dropdownOpen === catName;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: styles.dropdown,
                                            onMouseEnter: ()=>handleDropdownEnter(catName),
                                            onMouseLeave: handleDropdownLeave,
                                            className: "jsx-3b10be881c6611e8",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                    style: {
                                                        ...styles.dropdownBtn,
                                                        background: hoveredItem === `cat-${catName}` || isOpen ? 'rgba(102, 126, 234, 0.15)' : 'transparent'
                                                    },
                                                    ref: (el)=>{
                                                        if (el) buttonRefs.current[catName] = el;
                                                    },
                                                    onClick: ()=>setDropdownOpen(isOpen ? null : catName),
                                                    onMouseEnter: ()=>setHoveredItem(`cat-${catName}`),
                                                    onMouseLeave: ()=>setHoveredItem(null),
                                                    className: "jsx-3b10be881c6611e8",
                                                    children: [
                                                        catName,
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["BsChevronDown"], {
                                                            style: {
                                                                marginLeft: '6px',
                                                                width: '14px',
                                                                height: '14px',
                                                                transition: 'transform 0.3s ease',
                                                                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                opacity: 0.8
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/Navbar.js",
                                                            lineNumber: 566,
                                                            columnNumber: 33
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/Navbar.js",
                                                    lineNumber: 553,
                                                    columnNumber: 29
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                isOpen && buttonRefs.current[catName] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DropdownPortal$2e$jsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                    anchorEl: buttonRefs.current[catName],
                                                    open: isOpen,
                                                    onClose: ()=>setDropdownOpen(null),
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            ...styles.dropdownMenu,
                                                            maxWidth: 'calc(100vw - 32px)'
                                                        },
                                                        onWheel: (e)=>{
                                                            e.stopPropagation();
                                                        },
                                                        className: "jsx-3b10be881c6611e8" + " " + "dropdown-menu-scroll",
                                                        children: [
                                                            categories[catName].slice(0, 20).map((tool, index)=>{
                                                                // Aggiungi separatore visivo dopo i tool AI/Pro se necessario
                                                                const isPro = tool.pro === true || tool.href?.includes('ai') || tool.href?.includes('upscaler');
                                                                const nextTool = categories[catName][index + 1];
                                                                const nextIsPro = nextTool && (nextTool.pro === true || nextTool.href?.includes('ai') || nextTool.href?.includes('upscaler'));
                                                                const showSeparator = isPro && !nextIsPro && index < categories[catName].length - 1 && index < 19;
                                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].Fragment, {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                ...styles.dropdownItem,
                                                                                background: hoveredItem === `item-${tool.href}` ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
                                                                                cursor: 'pointer'
                                                                            },
                                                                            onClick: (e)=>{
                                                                                // Non fermare la propagazione per permettere la navigazione
                                                                                if (closeTimeoutRef.current) {
                                                                                    clearTimeout(closeTimeoutRef.current);
                                                                                }
                                                                                setDropdownOpen(null);
                                                                                setHoveredItem(null);
                                                                                // Naviga usando router.push
                                                                                if (tool.href) {
                                                                                    router.push(tool.href);
                                                                                }
                                                                            },
                                                                            onMouseDown: (e)=>{
                                                                                // Previeni la chiusura del dropdown quando si clicca
                                                                                e.stopPropagation();
                                                                            },
                                                                            onMouseEnter: ()=>setHoveredItem(`item-${tool.href}`),
                                                                            onMouseLeave: ()=>setHoveredItem(null),
                                                                            className: "jsx-3b10be881c6611e8",
                                                                            children: [
                                                                                tool.icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(tool.icon, {
                                                                                    style: {
                                                                                        width: 18,
                                                                                        height: 18,
                                                                                        flexShrink: 0
                                                                                    }
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/components/Navbar.js",
                                                                                    lineNumber: 625,
                                                                                    columnNumber: 67
                                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                    style: {
                                                                                        flex: 1,
                                                                                        minWidth: 0
                                                                                    },
                                                                                    className: "jsx-3b10be881c6611e8",
                                                                                    children: tool.title
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/components/Navbar.js",
                                                                                    lineNumber: 626,
                                                                                    columnNumber: 53
                                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                                tool.pro && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                    style: {
                                                                                        fontSize: '10px',
                                                                                        padding: '2px 6px',
                                                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                                        borderRadius: '4px',
                                                                                        fontWeight: '600',
                                                                                        color: '#fff',
                                                                                        textTransform: 'uppercase',
                                                                                        letterSpacing: '0.5px'
                                                                                    },
                                                                                    className: "jsx-3b10be881c6611e8",
                                                                                    children: "PRO"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/components/Navbar.js",
                                                                                    lineNumber: 628,
                                                                                    columnNumber: 57
                                                                                }, ("TURBOPACK compile-time value", void 0))
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/components/Navbar.js",
                                                                            lineNumber: 600,
                                                                            columnNumber: 49
                                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                                        showSeparator && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                height: '1px',
                                                                                background: 'rgba(102, 126, 234, 0.2)',
                                                                                margin: '8px 0',
                                                                                marginLeft: '16px',
                                                                                marginRight: '16px'
                                                                            },
                                                                            className: "jsx-3b10be881c6611e8"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/Navbar.js",
                                                                            lineNumber: 643,
                                                                            columnNumber: 53
                                                                        }, ("TURBOPACK compile-time value", void 0))
                                                                    ]
                                                                }, tool.href, true, {
                                                                    fileName: "[project]/components/Navbar.js",
                                                                    lineNumber: 599,
                                                                    columnNumber: 45
                                                                }, ("TURBOPACK compile-time value", void 0));
                                                            }),
                                                            categories[catName].length > 20 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                href: "/tools",
                                                                style: {
                                                                    ...styles.dropdownItem,
                                                                    background: 'rgba(102, 126, 234, 0.1)',
                                                                    fontWeight: '600',
                                                                    justifyContent: 'center',
                                                                    marginTop: '8px',
                                                                    borderTop: '1px solid rgba(102, 126, 234, 0.2)',
                                                                    paddingTop: '16px'
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                        className: "jsx-3b10be881c6611e8",
                                                                        children: [
                                                                            "Vedi tutti (",
                                                                            categories[catName].length,
                                                                            ")"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/components/Navbar.js",
                                                                        lineNumber: 667,
                                                                        columnNumber: 45
                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["BsChevronRight"], {
                                                                        style: {
                                                                            marginLeft: '8px',
                                                                            width: '14px',
                                                                            height: '14px'
                                                                        }
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/Navbar.js",
                                                                        lineNumber: 668,
                                                                        columnNumber: 45
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/Navbar.js",
                                                                lineNumber: 655,
                                                                columnNumber: 41
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/Navbar.js",
                                                        lineNumber: 583,
                                                        columnNumber: 37
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Navbar.js",
                                                    lineNumber: 578,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, catName, true, {
                                            fileName: "[project]/components/Navbar.js",
                                            lineNumber: 547,
                                            columnNumber: 25
                                        }, ("TURBOPACK compile-time value", void 0));
                                    }),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/pricing",
                                        style: {
                                            ...styles.dropdownBtn,
                                            background: hoveredItem === 'pricing' ? 'rgba(102, 126, 234, 0.15)' : 'transparent',
                                            textDecoration: 'none'
                                        },
                                        onMouseEnter: ()=>setHoveredItem('pricing'),
                                        onMouseLeave: ()=>setHoveredItem(null),
                                        children: t('nav.pricing')
                                    }, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 678,
                                        columnNumber: 21
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/faq",
                                        style: {
                                            ...styles.dropdownBtn,
                                            background: 'transparent',
                                            textDecoration: 'none'
                                        },
                                        children: "FAQ"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 691,
                                        columnNumber: 21
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/login",
                                        style: {
                                            ...styles.signupBtn,
                                            backgroundImage: hoveredItem === 'login' ? 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            textDecoration: 'none'
                                        },
                                        onMouseEnter: ()=>setHoveredItem('login'),
                                        onMouseLeave: ()=>setHoveredItem(null),
                                        children: "Accedi"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 702,
                                        columnNumber: 21
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LanguageSwitcher$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 715,
                                        columnNumber: 21
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Navbar.js",
                                lineNumber: 526,
                                columnNumber: 17
                            }, ("TURBOPACK compile-time value", void 0)),
                            isMobile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center'
                                },
                                className: "jsx-3b10be881c6611e8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                        style: styles.hamburgerBtn,
                                        onClick: ()=>{
                                            setMobileMenuOpen(!mobileMenuOpen);
                                            setMobileSecondaryMenuOpen(false);
                                        },
                                        "aria-label": "Apri menu",
                                        title: "Apri menu",
                                        className: "jsx-3b10be881c6611e8",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiMenu"], {}, void 0, false, {
                                            fileName: "[project]/components/Navbar.js",
                                            lineNumber: 730,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 721,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                        style: styles.secondaryMenuBtn,
                                        onClick: ()=>{
                                            setMobileSecondaryMenuOpen(!mobileSecondaryMenuOpen);
                                            setMobileMenuOpen(false);
                                        },
                                        "aria-label": "Apri menu secondario",
                                        title: "Apri menu secondario",
                                        className: "jsx-3b10be881c6611e8",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiDotsVertical"], {}, void 0, false, {
                                            fileName: "[project]/components/Navbar.js",
                                            lineNumber: 742,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 733,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Navbar.js",
                                lineNumber: 720,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Navbar.js",
                        lineNumber: 474,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    isMobile && (mobileMenuOpen || mobileSecondaryMenuOpen) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: styles.mobileOverlay,
                        onClick: ()=>{
                            setMobileMenuOpen(false);
                            setMobileSecondaryMenuOpen(false);
                        },
                        className: "jsx-3b10be881c6611e8"
                    }, void 0, false, {
                        fileName: "[project]/components/Navbar.js",
                        lineNumber: 750,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    isMobile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: styles.mobileMenu,
                        className: "jsx-3b10be881c6611e8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: styles.mobileMenuHeader,
                                className: "jsx-3b10be881c6611e8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                        style: styles.mobileMenuTitle,
                                        className: "jsx-3b10be881c6611e8",
                                        children: "Menu"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 763,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                        style: styles.closeBtn,
                                        onClick: ()=>setMobileMenuOpen(false),
                                        "aria-label": "Chiudi menu",
                                        title: "Chiudi menu",
                                        className: "jsx-3b10be881c6611e8",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiX"], {}, void 0, false, {
                                            fileName: "[project]/components/Navbar.js",
                                            lineNumber: 770,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 764,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Navbar.js",
                                lineNumber: 762,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/tools",
                                style: styles.mobileMenuItem,
                                onClick: (e)=>{
                                    e.stopPropagation();
                                    setMobileMenuOpen(false);
                                    router.push('/tools');
                                },
                                children: "Tutti i Tool"
                            }, void 0, false, {
                                fileName: "[project]/components/Navbar.js",
                                lineNumber: 774,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            Object.keys(categories).map((catName)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "jsx-3b10be881c6611e8",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: styles.mobileCategoryHeader,
                                            onClick: ()=>setExpandedCategory(expandedCategory === catName ? null : catName),
                                            className: "jsx-3b10be881c6611e8",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                    className: "jsx-3b10be881c6611e8",
                                                    children: catName
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Navbar.js",
                                                    lineNumber: 792,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$bs$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["BsChevronRight"], {
                                                    style: {
                                                        width: 16,
                                                        height: 16,
                                                        transform: expandedCategory === catName ? 'rotate(90deg)' : 'rotate(0deg)',
                                                        transition: 'transform 0.3s ease'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Navbar.js",
                                                    lineNumber: 793,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/Navbar.js",
                                            lineNumber: 788,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        expandedCategory === catName && categories[catName].slice(0, 15).map((tool)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                href: tool.href,
                                                style: styles.mobileDropdownItem,
                                                onClick: ()=>setMobileMenuOpen(false),
                                                children: [
                                                    tool.icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(tool.icon, {
                                                        style: {
                                                            width: 18,
                                                            height: 18
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/Navbar.js",
                                                        lineNumber: 809,
                                                        columnNumber: 51
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                        className: "jsx-3b10be881c6611e8",
                                                        children: tool.title
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/Navbar.js",
                                                        lineNumber: 810,
                                                        columnNumber: 37
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, tool.href, true, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 803,
                                                columnNumber: 33
                                            }, ("TURBOPACK compile-time value", void 0))),
                                        expandedCategory === catName && categories[catName].length > 15 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/tools",
                                            style: {
                                                ...styles.mobileDropdownItem,
                                                background: 'rgba(102, 126, 234, 0.1)',
                                                fontWeight: '600',
                                                justifyContent: 'center'
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                className: "jsx-3b10be881c6611e8",
                                                children: [
                                                    "Vedi tutti (",
                                                    categories[catName].length,
                                                    ")"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/Navbar.js",
                                                lineNumber: 823,
                                                columnNumber: 37
                                            }, ("TURBOPACK compile-time value", void 0))
                                        }, void 0, false, {
                                            fileName: "[project]/components/Navbar.js",
                                            lineNumber: 814,
                                            columnNumber: 33
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, catName, true, {
                                    fileName: "[project]/components/Navbar.js",
                                    lineNumber: 787,
                                    columnNumber: 25
                                }, ("TURBOPACK compile-time value", void 0)))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Navbar.js",
                        lineNumber: 761,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    isMobile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: styles.mobileSecondaryMenu,
                        className: "jsx-3b10be881c6611e8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: styles.mobileMenuHeader,
                                className: "jsx-3b10be881c6611e8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                        style: styles.mobileMenuTitle,
                                        className: "jsx-3b10be881c6611e8",
                                        children: "Account"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 835,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                        style: styles.closeBtn,
                                        onClick: ()=>setMobileSecondaryMenuOpen(false),
                                        className: "jsx-3b10be881c6611e8",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiX"], {}, void 0, false, {
                                            fileName: "[project]/components/Navbar.js",
                                            lineNumber: 840,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 836,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Navbar.js",
                                lineNumber: 834,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/login",
                                style: {
                                    ...styles.mobileMenuItem,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: '#fff'
                                },
                                onClick: ()=>setMobileSecondaryMenuOpen(false),
                                children: "Accedi"
                            }, void 0, false, {
                                fileName: "[project]/components/Navbar.js",
                                lineNumber: 844,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/pricing",
                                style: styles.mobileMenuItem,
                                onClick: ()=>setMobileSecondaryMenuOpen(false),
                                children: t('nav.pricing')
                            }, void 0, false, {
                                fileName: "[project]/components/Navbar.js",
                                lineNumber: 856,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/faq",
                                style: styles.mobileMenuItem,
                                onClick: ()=>setMobileSecondaryMenuOpen(false),
                                children: "FAQ"
                            }, void 0, false, {
                                fileName: "[project]/components/Navbar.js",
                                lineNumber: 864,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: '24px',
                                    paddingTop: '24px',
                                    borderTop: '1px solid rgba(102, 126, 234, 0.2)'
                                },
                                className: "jsx-3b10be881c6611e8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginBottom: '12px',
                                            fontSize: '13px',
                                            color: '#667eea',
                                            fontWeight: '600'
                                        },
                                        className: "jsx-3b10be881c6611e8",
                                        children: "Lingua"
                                    }, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 873,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LanguageSwitcher$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                        fileName: "[project]/components/Navbar.js",
                                        lineNumber: 876,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Navbar.js",
                                lineNumber: 872,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Navbar.js",
                        lineNumber: 833,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/Navbar.js",
                lineNumber: 473,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true);
};
const __TURBOPACK__default__export__ = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["memo"])(Navbar);
}),
"[externals]/react-dropzone [external] (react-dropzone, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("react-dropzone");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/components/FileUploadZone.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>FileUploadZone
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2d$dropzone__$5b$external$5d$__$28$react$2d$dropzone$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/react-dropzone [external] (react-dropzone, esm_import)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/hi/index.mjs [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$react$2d$dropzone__$5b$external$5d$__$28$react$2d$dropzone$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$react$2d$dropzone__$5b$external$5d$__$28$react$2d$dropzone$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
function FileUploadZone({ onFilesSelected, maxFiles = 10 }) {
    const [uploadedFiles, setUploadedFiles] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const [uploading, setUploading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [uploadProgress, setUploadProgress] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])({
        current: 0,
        total: 0
    });
    const onDrop = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])(async (acceptedFiles)=>{
        setUploading(true);
        setUploadProgress({
            current: 0,
            total: acceptedFiles.length
        });
        try {
            // Prepara FormData per inviare i file al server
            const formData = new FormData();
            acceptedFiles.forEach((file)=>{
                formData.append('files', file);
            });
            // Carica e analizza i file sul server
            // Usa AbortController per timeout (opzionale)
            const controller = new AbortController();
            const timeoutId = setTimeout(()=>controller.abort(), 300000); // 5 minuti timeout
            const response = await fetch('/api/chat/upload-document', {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            // L'API restituisce sempre JSON, quindi proviamo sempre a parsare come JSON
            let result;
            try {
                result = await response.json();
            } catch (jsonError) {
                // Se il parsing JSON fallisce, è un errore grave
                console.error('Error parsing JSON response:', jsonError);
                if (!response.ok) {
                    throw new Error(`Errore HTTP ${response.status}: impossibile parsare la risposta`);
                }
                throw new Error('Formato risposta non valido dal server');
            }
            // Controlla se la risposta è OK dopo il parsing
            if (!response.ok) {
                const errorMessage = result?.error || result?.details || `Errore HTTP ${response.status}`;
                throw new Error(errorMessage);
            }
            console.log('Upload API response:', result);
            // Verifica che result.files esista e sia un array
            if (!result.files || !Array.isArray(result.files)) {
                console.warn('Invalid response format:', result);
                throw new Error('Formato risposta non valido dal server');
            }
            // Crea oggetti file con i fileId dal server
            const newFiles = result.files.filter((f)=>f.success && f.fileId).map((fileResult)=>({
                    id: fileResult.fileId,
                    fileId: fileResult.fileId,
                    name: fileResult.filename,
                    size: fileResult.size || 0,
                    type: 'document',
                    wordCount: fileResult.wordCount || 0,
                    chunkCount: fileResult.chunkCount || 0,
                    pages: fileResult.pages || 0,
                    preview: null
                }));
            console.log('Processed new files:', newFiles);
            console.log('Full API response files:', result.files);
            console.log('Result structure:', JSON.stringify(result, null, 2));
            // Mostra messaggio di successo o errore
            if (newFiles.length > 0) {
                console.log(`${newFiles.length} file analizzati con successo`);
                setUploadProgress({
                    current: acceptedFiles.length,
                    total: acceptedFiles.length
                });
                // Aggiorna lo stato
                setUploadedFiles((prev)=>{
                    const updated = [
                        ...prev,
                        ...newFiles
                    ];
                    console.log('Updated uploaded files:', updated);
                    // Chiama onFilesSelected dopo che lo stato è stato aggiornato
                    // Usa setTimeout per evitare il warning React
                    setTimeout(()=>{
                        if (onFilesSelected) {
                            console.log('Calling onFilesSelected with files:', updated);
                            onFilesSelected(updated);
                        }
                    }, 0);
                    return updated;
                });
            } else {
                // Se non ci sono file validi, mostra un errore
                const failedFiles = result.files.filter((f)=>!f.success);
                if (failedFiles.length > 0) {
                    // Usa console.warn invece di console.error per evitare l'overlay di Next.js
                    console.warn('Alcuni file non sono stati caricati:', failedFiles);
                    console.warn('Failed files details:', failedFiles.map((f)=>({
                            filename: f.filename,
                            error: f.error
                        })));
                    const errorDetails = failedFiles.map((f)=>`- ${f.filename}: ${f.error || 'Errore sconosciuto'}`).join('\n');
                    alert(`Errore: ${failedFiles.length} file non sono stati caricati.\n\nDettagli:\n${errorDetails}\n\nVerifica che siano documenti supportati (PDF, DOCX, XLSX, TXT).`);
                } else {
                    console.warn('Nessun file valido nella risposta:', result);
                    console.warn('Result structure:', JSON.stringify(result, null, 2));
                    alert('Errore: nessun file valido ricevuto dal server. Riprova.\n\nControlla la console per più dettagli.');
                }
            }
        } catch (error) {
            // Usa console.warn per errori gestiti per evitare l'overlay di Next.js
            console.warn('Errore caricamento file:', error);
            const errorMessage = error.message || 'Errore sconosciuto durante il caricamento';
            alert(`Errore nel caricamento: ${errorMessage}\n\nVerifica che:\n- Il file sia un documento supportato (PDF, DOCX, XLSX, TXT)\n- Il file non superi i 50MB\n- La tua connessione internet sia attiva`);
        } finally{
            setUploading(false);
            setUploadProgress({
                current: 0,
                total: 0
            });
        }
    }, [
        onFilesSelected
    ]); // Rimuovo uploadedFiles dalle dipendenze
    const { getRootProps, getInputProps, isDragActive, open } = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2d$dropzone__$5b$external$5d$__$28$react$2d$dropzone$2c$__esm_import$29$__["useDropzone"])({
        onDrop,
        noClick: true,
        noKeyboard: false,
        accept: {
            'application/pdf': [
                '.pdf'
            ],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
                '.docx'
            ],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
                '.xlsx'
            ],
            'application/vnd.ms-excel': [
                '.xls'
            ],
            'text/plain': [
                '.txt'
            ],
            'text/csv': [
                '.csv'
            ],
            'image/*': [
                '.png',
                '.jpg',
                '.jpeg',
                '.gif',
                '.webp'
            ]
        },
        maxFiles,
        maxSize: 100 * 1024 * 1024 // 100MB
    });
    const removeFile = (fileId)=>{
        setUploadedFiles((prev)=>{
            const updated = prev.filter((f)=>f.id !== fileId);
            // Chiama onFilesSelected dopo che lo stato è stato aggiornato
            setTimeout(()=>{
                if (onFilesSelected) {
                    onFilesSelected(updated);
                }
            }, 0);
            return updated;
        });
    };
    const formatFileSize = (bytes)=>{
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = [
            'B',
            'KB',
            'MB',
            'GB'
        ];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };
    const getFileIcon = (type)=>{
        if (type.startsWith('image/')) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiPhotograph"], {
            style: {
                fontSize: '24px',
                color: '#667eea'
            }
        }, void 0, false, {
            fileName: "[project]/components/FileUploadZone.js",
            lineNumber: 169,
            columnNumber: 43
        }, this);
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiDocumentText"], {
            style: {
                fontSize: '24px',
                color: '#667eea'
            }
        }, void 0, false, {
            fileName: "[project]/components/FileUploadZone.js",
            lineNumber: 170,
            columnNumber: 12
        }, this);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: styles.container,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                ...getRootProps({
                    onClick: (e)=>{
                        // Ferma la propagazione per evitare che il click chiuda altri elementi
                        e.stopPropagation();
                        // Apri il file dialog quando si clicca sulla zona
                        if (!uploading) {
                            open();
                        }
                    },
                    onKeyDown: (e)=>{
                        // Ferma la propagazione anche per la tastiera
                        e.stopPropagation();
                        // Apri il file dialog con Enter o Space
                        if ((e.key === 'Enter' || e.key === ' ') && !uploading) {
                            e.preventDefault();
                            open();
                        }
                    }
                }),
                style: {
                    ...styles.dropzone,
                    ...isDragActive ? styles.dropzoneActive : {},
                    ...uploading ? styles.dropzoneUploading : {}
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                        ...getInputProps()
                    }, void 0, false, {
                        fileName: "[project]/components/FileUploadZone.js",
                        lineNumber: 201,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: {
                            ...styles.uploadIcon,
                            pointerEvents: 'none'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiOutlineUpload"], {
                            style: {
                                fontSize: '48px',
                                color: isDragActive ? '#667eea' : '#94a3b8'
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/FileUploadZone.js",
                            lineNumber: 203,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/FileUploadZone.js",
                        lineNumber: 202,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                        style: {
                            ...styles.uploadTitle,
                            pointerEvents: 'none'
                        },
                        children: isDragActive ? 'Rilascia i file qui' : 'Trascina i file o clicca per selezionare'
                    }, void 0, false, {
                        fileName: "[project]/components/FileUploadZone.js",
                        lineNumber: 205,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        style: {
                            ...styles.uploadDesc,
                            pointerEvents: 'none'
                        },
                        children: [
                            "Supportati: PDF, DOCX, XLSX, TXT, CSV, Immagini",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/components/FileUploadZone.js",
                                lineNumber: 209,
                                columnNumber: 58
                            }, this),
                            "Max 100MB per file"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/FileUploadZone.js",
                        lineNumber: 208,
                        columnNumber: 9
                    }, this),
                    uploading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: {
                            ...styles.uploadingIndicator,
                            pointerEvents: 'none'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: styles.spinner
                            }, void 0, false, {
                                fileName: "[project]/components/FileUploadZone.js",
                                lineNumber: 214,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                children: uploadProgress.total > 1 ? `Caricamento ${uploadProgress.current}/${uploadProgress.total} file...` : 'Caricamento e analisi in corso...'
                            }, void 0, false, {
                                fileName: "[project]/components/FileUploadZone.js",
                                lineNumber: 215,
                                columnNumber: 13
                            }, this),
                            uploadProgress.total > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: styles.progressBar,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: {
                                        ...styles.progressFill,
                                        width: `${uploadProgress.current / uploadProgress.total * 100}%`
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/FileUploadZone.js",
                                    lineNumber: 222,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/FileUploadZone.js",
                                lineNumber: 221,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/FileUploadZone.js",
                        lineNumber: 213,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/FileUploadZone.js",
                lineNumber: 175,
                columnNumber: 7
            }, this),
            uploadedFiles.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: styles.filesList,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h4", {
                        style: styles.filesListTitle,
                        children: [
                            "File caricati (",
                            uploadedFiles.length,
                            ")"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/FileUploadZone.js",
                        lineNumber: 236,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: styles.filesGrid,
                        children: uploadedFiles.map((fileItem)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: styles.fileCard,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                        onClick: ()=>removeFile(fileItem.id),
                                        style: styles.removeBtn,
                                        onMouseEnter: (e)=>e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)',
                                        onMouseLeave: (e)=>e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)',
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$hi$2f$index$2e$mjs__$5b$ssr$5d$__$28$ecmascript$29$__["HiX"], {
                                            style: {
                                                fontSize: '16px'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/FileUploadZone.js",
                                            lineNumber: 246,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/FileUploadZone.js",
                                        lineNumber: 240,
                                        columnNumber: 17
                                    }, this),
                                    fileItem.preview ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.filePreview,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("img", {
                                            src: fileItem.preview,
                                            alt: fileItem.name,
                                            style: styles.previewImage
                                        }, void 0, false, {
                                            fileName: "[project]/components/FileUploadZone.js",
                                            lineNumber: 251,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/FileUploadZone.js",
                                        lineNumber: 250,
                                        columnNumber: 19
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.fileIcon,
                                        children: getFileIcon(fileItem.type)
                                    }, void 0, false, {
                                        fileName: "[project]/components/FileUploadZone.js",
                                        lineNumber: 254,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.fileInfo,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: styles.fileName,
                                                children: fileItem.name
                                            }, void 0, false, {
                                                fileName: "[project]/components/FileUploadZone.js",
                                                lineNumber: 260,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: styles.fileSize,
                                                children: formatFileSize(fileItem.size)
                                            }, void 0, false, {
                                                fileName: "[project]/components/FileUploadZone.js",
                                                lineNumber: 261,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/FileUploadZone.js",
                                        lineNumber: 259,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, fileItem.id, true, {
                                fileName: "[project]/components/FileUploadZone.js",
                                lineNumber: 239,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/FileUploadZone.js",
                        lineNumber: 237,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/FileUploadZone.js",
                lineNumber: 235,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/FileUploadZone.js",
        lineNumber: 174,
        columnNumber: 5
    }, this);
}
const styles = {
    container: {
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto'
    },
    dropzone: {
        border: '2px dashed rgba(102, 126, 234, 0.3)',
        borderRadius: '20px',
        padding: '56px 32px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%)',
        backdropFilter: 'blur(16px)',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), 0 0 20px rgba(102, 126, 234, 0.1)',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none'
    },
    dropzoneActive: {
        borderColor: '#667eea',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.12) 100%)',
        transform: 'scale(1.02)',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3), 0 0 40px rgba(102, 126, 234, 0.2)'
    },
    dropzoneUploading: {
        opacity: 0.7,
        pointerEvents: 'none'
    },
    uploadIcon: {
        marginBottom: '16px'
    },
    uploadTitle: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#f1f5f9',
        marginBottom: '8px'
    },
    uploadDesc: {
        fontSize: '14px',
        color: '#94a3b8',
        lineHeight: 1.6,
        margin: 0
    },
    uploadingIndicator: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        marginTop: '16px',
        color: '#667eea',
        fontSize: '14px',
        fontWeight: '600'
    },
    spinner: {
        width: '20px',
        height: '20px',
        border: '2px solid rgba(102, 126, 234, 0.3)',
        borderTopColor: '#667eea',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
    },
    progressBar: {
        width: '100%',
        maxWidth: '300px',
        height: '4px',
        background: 'rgba(102, 126, 234, 0.2)',
        borderRadius: '2px',
        marginTop: '8px',
        overflow: 'hidden'
    },
    progressFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #667eea 0%, #8a5db8 100%)',
        borderRadius: '2px',
        transition: 'width 0.3s ease'
    },
    filesList: {
        marginTop: '32px'
    },
    filesListTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#f1f5f9',
        marginBottom: '16px'
    },
    filesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '16px'
    },
    fileCard: {
        position: 'relative',
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(30, 41, 59, 0.5) 100%)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(102, 126, 234, 0.25)',
        borderRadius: '16px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden'
    },
    removeBtn: {
        position: 'absolute',
        top: '8px',
        right: '8px',
        width: '28px',
        height: '28px',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: '#ef4444',
        transition: 'all 0.2s',
        zIndex: 1
    },
    filePreview: {
        width: '100%',
        height: '120px',
        marginBottom: '12px',
        borderRadius: '8px',
        overflow: 'hidden',
        background: 'rgba(0, 0, 0, 0.2)'
    },
    previewImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    fileIcon: {
        width: '100%',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '12px'
    },
    fileInfo: {
        textAlign: 'left'
    },
    fileName: {
        fontSize: '13px',
        fontWeight: '500',
        color: '#f1f5f9',
        marginBottom: '4px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    },
    fileSize: {
        fontSize: '12px',
        color: '#64748b'
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/components/Footer.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/i18n.js [ssr] (ecmascript)");
;
;
;
;
const Footer = ()=>{
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useTranslation"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("footer", {
        style: styles.footer,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: styles.footerContent,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: styles.footerSection,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h4", {
                                style: styles.footerTitle,
                                children: "MegaPixelAI"
                            }, void 0, false, {
                                fileName: "[project]/components/Footer.js",
                                lineNumber: 12,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                style: styles.footerDesc,
                                children: t('footer.description')
                            }, void 0, false, {
                                fileName: "[project]/components/Footer.js",
                                lineNumber: 13,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Footer.js",
                        lineNumber: 11,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: styles.footerSection,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h4", {
                                style: styles.footerTitle,
                                children: t('footer.product')
                            }, void 0, false, {
                                fileName: "[project]/components/Footer.js",
                                lineNumber: 16,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/home",
                                style: styles.footerLink,
                                onMouseEnter: (e)=>{
                                    e.target.style.color = '#667eea';
                                    e.target.style.transform = 'translateX(4px)';
                                },
                                onMouseLeave: (e)=>{
                                    e.target.style.color = '#94a3b8';
                                    e.target.style.transform = 'translateX(0)';
                                },
                                children: t('footer.tools')
                            }, void 0, false, {
                                fileName: "[project]/components/Footer.js",
                                lineNumber: 17,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/#features",
                                style: styles.footerLink,
                                onMouseEnter: (e)=>{
                                    e.target.style.color = '#667eea';
                                    e.target.style.transform = 'translateX(4px)';
                                },
                                onMouseLeave: (e)=>{
                                    e.target.style.color = '#94a3b8';
                                    e.target.style.transform = 'translateX(0)';
                                },
                                children: t('footer.features')
                            }, void 0, false, {
                                fileName: "[project]/components/Footer.js",
                                lineNumber: 18,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/pricing",
                                style: styles.footerLink,
                                onMouseEnter: (e)=>{
                                    e.target.style.color = '#667eea';
                                    e.target.style.transform = 'translateX(4px)';
                                },
                                onMouseLeave: (e)=>{
                                    e.target.style.color = '#94a3b8';
                                    e.target.style.transform = 'translateX(0)';
                                },
                                children: t('footer.pricing')
                            }, void 0, false, {
                                fileName: "[project]/components/Footer.js",
                                lineNumber: 19,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Footer.js",
                        lineNumber: 15,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: styles.footerSection,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h4", {
                                style: styles.footerTitle,
                                children: t('footer.company')
                            }, void 0, false, {
                                fileName: "[project]/components/Footer.js",
                                lineNumber: 22,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/about",
                                style: styles.footerLink,
                                onMouseEnter: (e)=>{
                                    e.target.style.color = '#667eea';
                                    e.target.style.transform = 'translateX(4px)';
                                },
                                onMouseLeave: (e)=>{
                                    e.target.style.color = '#94a3b8';
                                    e.target.style.transform = 'translateX(0)';
                                },
                                children: t('footer.aboutUs')
                            }, void 0, false, {
                                fileName: "[project]/components/Footer.js",
                                lineNumber: 23,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/blog",
                                style: styles.footerLink,
                                onMouseEnter: (e)=>{
                                    e.target.style.color = '#667eea';
                                    e.target.style.transform = 'translateX(4px)';
                                },
                                onMouseLeave: (e)=>{
                                    e.target.style.color = '#94a3b8';
                                    e.target.style.transform = 'translateX(0)';
                                },
                                children: t('footer.blog')
                            }, void 0, false, {
                                fileName: "[project]/components/Footer.js",
                                lineNumber: 24,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/contact",
                                style: styles.footerLink,
                                onMouseEnter: (e)=>{
                                    e.target.style.color = '#667eea';
                                    e.target.style.transform = 'translateX(4px)';
                                },
                                onMouseLeave: (e)=>{
                                    e.target.style.color = '#94a3b8';
                                    e.target.style.transform = 'translateX(0)';
                                },
                                children: t('footer.contact')
                            }, void 0, false, {
                                fileName: "[project]/components/Footer.js",
                                lineNumber: 25,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Footer.js",
                        lineNumber: 21,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: styles.footerSection,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h4", {
                                style: styles.footerTitle,
                                children: t('footer.legal')
                            }, void 0, false, {
                                fileName: "[project]/components/Footer.js",
                                lineNumber: 28,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/privacy",
                                style: styles.footerLink,
                                onMouseEnter: (e)=>{
                                    e.target.style.color = '#667eea';
                                    e.target.style.transform = 'translateX(4px)';
                                },
                                onMouseLeave: (e)=>{
                                    e.target.style.color = '#94a3b8';
                                    e.target.style.transform = 'translateX(0)';
                                },
                                children: t('footer.privacy')
                            }, void 0, false, {
                                fileName: "[project]/components/Footer.js",
                                lineNumber: 29,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/terms",
                                style: styles.footerLink,
                                onMouseEnter: (e)=>{
                                    e.target.style.color = '#667eea';
                                    e.target.style.transform = 'translateX(4px)';
                                },
                                onMouseLeave: (e)=>{
                                    e.target.style.color = '#94a3b8';
                                    e.target.style.transform = 'translateX(0)';
                                },
                                children: t('footer.terms')
                            }, void 0, false, {
                                fileName: "[project]/components/Footer.js",
                                lineNumber: 30,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/cookies",
                                style: styles.footerLink,
                                onMouseEnter: (e)=>{
                                    e.target.style.color = '#667eea';
                                    e.target.style.transform = 'translateX(4px)';
                                },
                                onMouseLeave: (e)=>{
                                    e.target.style.color = '#94a3b8';
                                    e.target.style.transform = 'translateX(0)';
                                },
                                children: t('footer.cookies')
                            }, void 0, false, {
                                fileName: "[project]/components/Footer.js",
                                lineNumber: 31,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Footer.js",
                        lineNumber: 27,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/Footer.js",
                lineNumber: 10,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: styles.enterpriseFooter,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                    style: {
                        margin: 0,
                        fontSize: '14px',
                        opacity: 0.7
                    },
                    children: t('footer.description')
                }, void 0, false, {
                    fileName: "[project]/components/Footer.js",
                    lineNumber: 35,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/Footer.js",
                lineNumber: 34,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: styles.footerBottom,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                    style: styles.footerCopyright,
                    children: "© 2025 MegaPixelAI. All rights reserved."
                }, void 0, false, {
                    fileName: "[project]/components/Footer.js",
                    lineNumber: 38,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/Footer.js",
                lineNumber: 37,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/Footer.js",
        lineNumber: 9,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["memo"])(Footer);
const styles = {
    footer: {
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(10, 14, 26, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(102, 126, 234, 0.3)',
        padding: '50px 24px 24px',
        marginTop: 'auto',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3), 0 0 20px rgba(102, 126, 234, 0.1)'
    },
    footerContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '40px',
        marginBottom: '40px'
    },
    footerSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    footerTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#e2e8f0',
        margin: '0 0 8px'
    },
    footerDesc: {
        fontSize: '14px',
        color: '#94a3b8',
        lineHeight: '1.6',
        margin: 0
    },
    footerLink: {
        fontSize: '14px',
        color: '#94a3b8',
        textDecoration: 'none',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        padding: '4px 0',
        position: 'relative',
        display: 'inline-block'
    },
    footerLinkHover: {
        color: '#667eea',
        transform: 'translateX(4px)'
    },
    enterpriseFooter: {
        textAlign: 'center',
        padding: '24px 24px 20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        color: '#cbd5e1'
    },
    footerBottom: {
        maxWidth: '1200px',
        margin: '0 auto',
        paddingTop: '20px',
        borderTop: '1px solid rgba(102, 126, 234, 0.2)',
        textAlign: 'center'
    },
    footerCopyright: {
        fontSize: '14px',
        color: '#94a3b8',
        margin: 0
    }
};
}),
"[project]/pages/chat.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "getServerSideProps",
    ()=>getServerSideProps
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$styled$2d$jsx$2f$style$2e$js__$5b$external$5d$__$28$styled$2d$jsx$2f$style$2e$js$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/styled-jsx/style.js [external] (styled-jsx/style.js, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$head$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/head.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ChatInput$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ChatInput.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ChatMessage$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ChatMessage.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Navbar$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Navbar.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$FileUploadZone$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/FileUploadZone.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Footer$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Footer.js [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$FileUploadZone$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$FileUploadZone$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
;
function ChatPage() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [messages, setMessages] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const [files, setFiles] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const [conversations, setConversations] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const [currentConversationId, setCurrentConversationId] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(true);
    const [sending, setSending] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [sidebarOpen, setSidebarOpen] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [showUpload, setShowUpload] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const messagesEndRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    const [isMobile, setIsMobile] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        const checkMobile = ()=>{
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (!mobile) setSidebarOpen(true);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return ()=>window.removeEventListener('resize', checkMobile);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        checkUser();
    }, []);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        scrollToBottom();
    }, [
        messages
    ]);
    const checkUser = async ()=>{
        // Allow access without login for testing
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const userData = JSON.parse(userStr);
            setUser(userData);
        }
        await loadFiles();
        await loadConversations();
        setLoading(false);
    };
    const loadFiles = async ()=>{
        // Mock per ora - in futuro collegare alle API
        setFiles([]);
    };
    const loadConversations = async ()=>{
        // Mock per ora
        setConversations([]);
    };
    const startNewConversation = async ()=>{
        setCurrentConversationId(crypto.randomUUID());
        setMessages([]);
    };
    const handleSendMessage = async ({ content, fileIds })=>{
        setSending(true);
        // Log per debug
        console.log('=== SENDING MESSAGE ===');
        console.log('Message content:', content);
        console.log('FileIds passed explicitly:', fileIds);
        console.log('Available files in state:', files);
        console.log('Files count:', files.length);
        // Combina fileIds passati esplicitamente con quelli disponibili nello stato
        const allFileIds = new Set();
        if (fileIds && Array.isArray(fileIds)) {
            fileIds.forEach((id)=>{
                if (id) allFileIds.add(String(id));
            });
        }
        // Aggiungi anche i fileId dei file caricati
        files.forEach((f)=>{
            const id = f.fileId || f.id;
            if (id) {
                allFileIds.add(String(id));
                console.log('Adding fileId from files state:', id, 'from file:', f.name);
            }
        });
        const finalFileIds = Array.from(allFileIds);
        console.log('Final fileIds to send to API:', finalFileIds);
        console.log('Final fileIds count:', finalFileIds.length);
        if (finalFileIds.length === 0 && files.length > 0) {
            console.warn('⚠️ WARNING: Files in state but no fileIds extracted!');
            console.warn('Files structure:', files.map((f)=>({
                    id: f.id,
                    fileId: f.fileId,
                    name: f.name
                })));
        }
        // Add user message
        const userMsg = {
            role: 'user',
            content,
            file_references: finalFileIds.map((id)=>files.find((f)=>(f.fileId || f.id) === id)).filter(Boolean),
            created_at: new Date().toISOString()
        };
        setMessages((prev)=>[
                ...prev,
                userMsg
            ]);
        // Add thinking indicator
        const thinkingMsg = {
            role: 'assistant',
            content: '',
            thinking: true,
            created_at: new Date().toISOString()
        };
        setMessages((prev)=>[
                ...prev,
                thinkingMsg
            ]);
        try {
            // Call the chat API
            const response = await fetch('/api/chat/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: content,
                    fileIds: finalFileIds,
                    conversationHistory: messages.filter((m)=>!m.thinking).slice(-5)
                })
            });
            // Parse response
            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                console.error('Error parsing JSON response:', jsonError);
                // Even if JSON parsing fails, try to get text
                try {
                    const textResponse = await response.text();
                    console.error('Non-JSON response:', textResponse);
                    data = {
                        message: 'Errore nel formato della risposta. Riprova.',
                        error: true
                    };
                } catch (textError) {
                    console.error('Error reading response:', textError);
                    data = {
                        message: 'Errore nella comunicazione con il server. Riprova.',
                        error: true
                    };
                }
            }
            // Create AI response (API always returns 200 with a message)
            const aiResponse = {
                role: 'assistant',
                content: data.message || data.content || `Ho ricevuto il tuo messaggio: "${content}"`,
                file_references: [],
                error: data.error || data.fallback || false,
                created_at: new Date().toISOString()
            };
            // Remove thinking indicator and add response
            setMessages((prev)=>{
                const filtered = prev.filter((m)=>!m.thinking);
                return [
                    ...filtered,
                    aiResponse
                ];
            });
        } catch (error) {
            console.error('Send message error:', error);
            setMessages((prev)=>prev.filter((m)=>!m.thinking));
            // Show user-friendly error message
            const errorMessage = error.message || 'Errore sconosciuto durante l\'invio del messaggio';
            const errorMsg = {
                role: 'assistant',
                content: `❌ **Errore**: ${errorMessage}\n\nVerifica che:\n- Il servizio AI sia configurato correttamente\n- La tua connessione internet sia attiva\n- Riprova tra qualche istante`,
                error: true,
                created_at: new Date().toISOString()
            };
            setMessages((prev)=>[
                    ...prev,
                    errorMsg
                ]);
        } finally{
            setSending(false);
        }
    };
    const handleFileClick = (file)=>{
        console.log('File clicked:', file);
    };
    const handleFilesUploaded = (uploadedFiles)=>{
        console.log('Files uploaded and analyzed:', uploadedFiles);
        if (!uploadedFiles || !Array.isArray(uploadedFiles)) {
            console.error('Invalid uploadedFiles:', uploadedFiles);
            return;
        }
        // I file sono già stati analizzati dal server e hanno fileId
        const processedFiles = uploadedFiles.filter((f)=>f && (f.fileId || f.id)) // Filtra solo file validi con ID
        .map((f)=>({
                id: f.fileId || f.id,
                fileId: f.fileId || f.id,
                name: f.name || f.filename || 'Documento',
                original_filename: f.name || f.filename || 'Documento',
                size: f.size || 0,
                type: f.type || 'document',
                wordCount: f.wordCount || 0,
                chunkCount: f.chunkCount || 0,
                pages: f.pages || 0
            }));
        console.log('Processed files to add:', processedFiles);
        // Aggiungi solo i nuovi file (evita duplicati)
        setFiles((prev)=>{
            const existingIds = new Set(prev.map((f)=>f.fileId || f.id));
            const newFiles = processedFiles.filter((f)=>{
                const fileId = f.fileId || f.id;
                return fileId && !existingIds.has(fileId);
            });
            console.log('Adding new files to state:', newFiles);
            console.log('Previous files count:', prev.length);
            console.log('New files count:', newFiles.length);
            // Mostra messaggio di successo nella chat
            if (newFiles.length > 0) {
                const fileNames = newFiles.map((f)=>f.name).join(', ');
                const successMsg = {
                    role: 'assistant',
                    content: `✅ **${newFiles.length} documento/i caricato/i con successo!**\n\n**File analizzati:** ${fileNames}\n\nOra puoi fare domande su questi documenti. Il sistema AI locale analizzerà il contenuto e risponderà alle tue domande.`,
                    file_references: newFiles,
                    created_at: new Date().toISOString()
                };
                setMessages((prevMsgs)=>[
                        ...prevMsgs,
                        successMsg
                    ]);
            }
            return [
                ...prev,
                ...newFiles
            ];
        });
        // Chiudi automaticamente il pannello dopo il caricamento con successo
        if (processedFiles.length > 0) {
            setShowUpload(false);
        }
        // Mostra messaggio di successo nella console
        if (processedFiles.length > 0) {
            const successCount = processedFiles.filter((f)=>f.fileId || f.id).length;
            console.log(`${successCount} documenti analizzati e pronti per la chat`);
        }
    };
    const scrollToBottom = ()=>{
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth'
        });
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            style: styles.loadingContainer,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: styles.spinner
            }, void 0, false, {
                fileName: "[project]/pages/chat.js",
                lineNumber: 274,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/pages/chat.js",
            lineNumber: 273,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$head$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("title", {
                    className: "jsx-c3c894b17165e4c1",
                    children: "AI Chat - MegaPixelAI"
                }, void 0, false, {
                    fileName: "[project]/pages/chat.js",
                    lineNumber: 282,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/pages/chat.js",
                lineNumber: 281,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: styles.container,
                className: "jsx-c3c894b17165e4c1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Navbar$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/pages/chat.js",
                        lineNumber: 286,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: styles.chatContainer,
                        className: "jsx-c3c894b17165e4c1",
                        children: [
                            !isMobile && sidebarOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("aside", {
                                style: styles.sidebar,
                                className: "jsx-c3c894b17165e4c1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.sidebarHeader,
                                        className: "jsx-c3c894b17165e4c1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                                                style: styles.sidebarTitle,
                                                className: "jsx-c3c894b17165e4c1",
                                                children: "Conversations"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/chat.js",
                                                lineNumber: 293,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                onClick: startNewConversation,
                                                style: styles.newChatBtn,
                                                onMouseEnter: (e)=>{
                                                    e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                                                },
                                                onMouseLeave: (e)=>{
                                                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)';
                                                },
                                                className: "jsx-c3c894b17165e4c1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '20px'
                                                        },
                                                        className: "jsx-c3c894b17165e4c1",
                                                        children: "+"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/chat.js",
                                                        lineNumber: 304,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                        className: "jsx-c3c894b17165e4c1",
                                                        children: "New Chat"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/chat.js",
                                                        lineNumber: 305,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/chat.js",
                                                lineNumber: 294,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/chat.js",
                                        lineNumber: 292,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.conversationsList,
                                        className: "jsx-c3c894b17165e4c1",
                                        children: conversations.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: styles.emptyState,
                                            className: "jsx-c3c894b17165e4c1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                    className: "jsx-c3c894b17165e4c1",
                                                    children: "No conversations yet."
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/chat.js",
                                                    lineNumber: 312,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                    style: {
                                                        fontSize: '13px',
                                                        marginTop: '8px',
                                                        opacity: 0.7
                                                    },
                                                    className: "jsx-c3c894b17165e4c1",
                                                    children: "Start a new chat!"
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/chat.js",
                                                    lineNumber: 313,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/pages/chat.js",
                                            lineNumber: 311,
                                            columnNumber: 19
                                        }, this) : conversations.map((conv)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                onClick: ()=>{},
                                                style: styles.conversationItem,
                                                className: "jsx-c3c894b17165e4c1",
                                                children: conv.title
                                            }, conv.id, false, {
                                                fileName: "[project]/pages/chat.js",
                                                lineNumber: 317,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/pages/chat.js",
                                        lineNumber: 309,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.sidebarFooter,
                                        className: "jsx-c3c894b17165e4c1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    color: '#f1f5f9',
                                                    marginBottom: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                },
                                                className: "jsx-c3c894b17165e4c1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                                        width: "18",
                                                        height: "18",
                                                        viewBox: "0 0 24 24",
                                                        fill: "none",
                                                        stroke: "currentColor",
                                                        strokeWidth: "2",
                                                        className: "jsx-c3c894b17165e4c1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                                                d: "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z",
                                                                className: "jsx-c3c894b17165e4c1"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/chat.js",
                                                                lineNumber: 331,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("polyline", {
                                                                points: "13 2 13 9 20 9",
                                                                className: "jsx-c3c894b17165e4c1"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/chat.js",
                                                                lineNumber: 332,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/chat.js",
                                                        lineNumber: 330,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                        className: "jsx-c3c894b17165e4c1",
                                                        children: "Your Documents"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/chat.js",
                                                        lineNumber: 334,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/chat.js",
                                                lineNumber: 329,
                                                columnNumber: 17
                                            }, this),
                                            files.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    padding: '24px 16px',
                                                    textAlign: 'center',
                                                    background: 'rgba(102, 126, 234, 0.05)',
                                                    border: '2px dashed rgba(102, 126, 234, 0.3)',
                                                    borderRadius: '12px',
                                                    cursor: 'pointer'
                                                },
                                                onClick: ()=>setShowUpload(true),
                                                className: "jsx-c3c894b17165e4c1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '48px',
                                                            marginBottom: '8px'
                                                        },
                                                        className: "jsx-c3c894b17165e4c1",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                                            width: "48",
                                                            height: "48",
                                                            viewBox: "0 0 24 24",
                                                            fill: "none",
                                                            stroke: "currentColor",
                                                            strokeWidth: "2",
                                                            style: {
                                                                margin: '0 auto',
                                                                color: '#667eea'
                                                            },
                                                            className: "jsx-c3c894b17165e4c1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                                                    d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
                                                                    className: "jsx-c3c894b17165e4c1"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/pages/chat.js",
                                                                    lineNumber: 350,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("polyline", {
                                                                    points: "17 8 12 3 7 8",
                                                                    className: "jsx-c3c894b17165e4c1"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/pages/chat.js",
                                                                    lineNumber: 351,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("line", {
                                                                    x1: "12",
                                                                    y1: "3",
                                                                    x2: "12",
                                                                    y2: "15",
                                                                    className: "jsx-c3c894b17165e4c1"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/pages/chat.js",
                                                                    lineNumber: 352,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/pages/chat.js",
                                                            lineNumber: 349,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/chat.js",
                                                        lineNumber: 348,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '13px',
                                                            color: '#94a3b8',
                                                            marginBottom: '8px'
                                                        },
                                                        className: "jsx-c3c894b17165e4c1",
                                                        children: "No documents uploaded"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/chat.js",
                                                        lineNumber: 355,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '12px',
                                                            color: '#667eea',
                                                            fontWeight: '600'
                                                        },
                                                        className: "jsx-c3c894b17165e4c1",
                                                        children: "Click to upload"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/chat.js",
                                                        lineNumber: 358,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/chat.js",
                                                lineNumber: 338,
                                                columnNumber: 19
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: styles.filesList,
                                                        className: "jsx-c3c894b17165e4c1",
                                                        children: files.slice(0, 10).map((file)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: styles.fileItem,
                                                                className: "jsx-c3c894b17165e4c1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                                                        width: "16",
                                                                        height: "16",
                                                                        viewBox: "0 0 24 24",
                                                                        fill: "none",
                                                                        stroke: "currentColor",
                                                                        strokeWidth: "2",
                                                                        className: "jsx-c3c894b17165e4c1",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                                                                d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
                                                                                className: "jsx-c3c894b17165e4c1"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/pages/chat.js",
                                                                                lineNumber: 372,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("polyline", {
                                                                                points: "14 2 14 8 20 8",
                                                                                className: "jsx-c3c894b17165e4c1"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/pages/chat.js",
                                                                                lineNumber: 373,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/pages/chat.js",
                                                                        lineNumber: 371,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                        style: styles.fileName,
                                                                        className: "jsx-c3c894b17165e4c1",
                                                                        children: file.original_filename || file.name
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/chat.js",
                                                                        lineNumber: 375,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, file.id, true, {
                                                                fileName: "[project]/pages/chat.js",
                                                                lineNumber: 370,
                                                                columnNumber: 25
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/chat.js",
                                                        lineNumber: 368,
                                                        columnNumber: 21
                                                    }, this),
                                                    files.length > 10 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            textAlign: 'center',
                                                            fontSize: '12px',
                                                            color: '#64748b',
                                                            marginTop: '8px'
                                                        },
                                                        className: "jsx-c3c894b17165e4c1",
                                                        children: [
                                                            "+",
                                                            files.length - 10,
                                                            " altri file"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/chat.js",
                                                        lineNumber: 380,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>router.push('/dashboard'),
                                                        style: {
                                                            width: '100%',
                                                            padding: '10px',
                                                            marginTop: '12px',
                                                            background: 'rgba(102, 126, 234, 0.1)',
                                                            border: '1px solid rgba(102, 126, 234, 0.3)',
                                                            borderRadius: '8px',
                                                            color: '#667eea',
                                                            fontSize: '13px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        },
                                                        onMouseEnter: (e)=>e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)',
                                                        onMouseLeave: (e)=>e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)',
                                                        className: "jsx-c3c894b17165e4c1",
                                                        children: "Manage Files"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/chat.js",
                                                        lineNumber: 389,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/chat.js",
                                        lineNumber: 328,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/chat.js",
                                lineNumber: 291,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("main", {
                                style: styles.main,
                                className: "jsx-c3c894b17165e4c1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: {
                                            ...styles.chatHeader,
                                            padding: isMobile ? '8px 12px' : '20px 24px',
                                            justifyContent: isMobile ? 'center' : 'flex-start'
                                        },
                                        className: "jsx-c3c894b17165e4c1",
                                        children: [
                                            !isMobile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setSidebarOpen(!sidebarOpen),
                                                style: styles.toggleBtn,
                                                onMouseEnter: (e)=>e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)',
                                                onMouseLeave: (e)=>e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)',
                                                className: "jsx-c3c894b17165e4c1",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                                    width: "20",
                                                    height: "20",
                                                    viewBox: "0 0 24 24",
                                                    fill: "none",
                                                    stroke: "currentColor",
                                                    strokeWidth: "2",
                                                    className: "jsx-c3c894b17165e4c1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("line", {
                                                            x1: "3",
                                                            y1: "12",
                                                            x2: "21",
                                                            y2: "12",
                                                            className: "jsx-c3c894b17165e4c1"
                                                        }, void 0, false, {
                                                            fileName: "[project]/pages/chat.js",
                                                            lineNumber: 431,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("line", {
                                                            x1: "3",
                                                            y1: "6",
                                                            x2: "21",
                                                            y2: "6",
                                                            className: "jsx-c3c894b17165e4c1"
                                                        }, void 0, false, {
                                                            fileName: "[project]/pages/chat.js",
                                                            lineNumber: 432,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("line", {
                                                            x1: "3",
                                                            y1: "18",
                                                            x2: "21",
                                                            y2: "18",
                                                            className: "jsx-c3c894b17165e4c1"
                                                        }, void 0, false, {
                                                            fileName: "[project]/pages/chat.js",
                                                            lineNumber: 433,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/pages/chat.js",
                                                    lineNumber: 430,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/pages/chat.js",
                                                lineNumber: 424,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                                                style: {
                                                    ...styles.chatTitle,
                                                    fontSize: isMobile ? '16px' : '20px'
                                                },
                                                className: "jsx-c3c894b17165e4c1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                                        width: isMobile ? "18" : "24",
                                                        height: isMobile ? "18" : "24",
                                                        viewBox: "0 0 24 24",
                                                        fill: "none",
                                                        stroke: "currentColor",
                                                        strokeWidth: "2",
                                                        style: {
                                                            marginRight: isMobile ? '6px' : '12px'
                                                        },
                                                        className: "jsx-c3c894b17165e4c1",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                                            d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
                                                            className: "jsx-c3c894b17165e4c1"
                                                        }, void 0, false, {
                                                            fileName: "[project]/pages/chat.js",
                                                            lineNumber: 442,
                                                            columnNumber: 19
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/chat.js",
                                                        lineNumber: 441,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                        className: "jsx-c3c894b17165e4c1",
                                                        children: isMobile ? 'Documenti AI' : 'AI Document Intelligence'
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/chat.js",
                                                        lineNumber: 444,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/chat.js",
                                                lineNumber: 437,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/chat.js",
                                        lineNumber: 418,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.messagesContainer,
                                        className: "jsx-c3c894b17165e4c1",
                                        children: showUpload ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: {
                                                padding: '24px'
                                            },
                                            onClick: (e)=>{
                                                // Ferma la propagazione per evitare che i click chiudano il pannello
                                                e.stopPropagation();
                                            },
                                            className: "jsx-c3c894b17165e4c1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginBottom: '24px'
                                                    },
                                                    className: "jsx-c3c894b17165e4c1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                                                            style: {
                                                                fontSize: '24px',
                                                                fontWeight: '600',
                                                                color: '#f1f5f9',
                                                                margin: 0
                                                            },
                                                            className: "jsx-c3c894b17165e4c1",
                                                            children: "Carica Documenti"
                                                        }, void 0, false, {
                                                            fileName: "[project]/pages/chat.js",
                                                            lineNumber: 459,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                            onClick: (e)=>{
                                                                e.stopPropagation();
                                                                setShowUpload(false);
                                                            },
                                                            style: {
                                                                padding: '8px 16px',
                                                                background: 'rgba(255, 255, 255, 0.05)',
                                                                border: '1px solid rgba(102, 126, 234, 0.3)',
                                                                borderRadius: '8px',
                                                                color: '#f1f5f9',
                                                                fontSize: '14px',
                                                                cursor: 'pointer'
                                                            },
                                                            className: "jsx-c3c894b17165e4c1",
                                                            children: "Chiudi"
                                                        }, void 0, false, {
                                                            fileName: "[project]/pages/chat.js",
                                                            lineNumber: 462,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/pages/chat.js",
                                                    lineNumber: 458,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$FileUploadZone$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                    onFilesSelected: handleFilesUploaded
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/chat.js",
                                                    lineNumber: 480,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/pages/chat.js",
                                            lineNumber: 451,
                                            columnNumber: 17
                                        }, this) : messages.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: styles.emptyChat,
                                            className: "jsx-c3c894b17165e4c1",
                                            children: isMobile ? /* Mobile empty state */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            width: '48px',
                                                            height: '48px',
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            marginBottom: '16px',
                                                            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                                                        },
                                                        className: "jsx-c3c894b17165e4c1",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                                            width: "24",
                                                            height: "24",
                                                            viewBox: "0 0 24 24",
                                                            fill: "none",
                                                            stroke: "currentColor",
                                                            strokeWidth: "2",
                                                            className: "jsx-c3c894b17165e4c1",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                                                d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
                                                                className: "jsx-c3c894b17165e4c1"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/chat.js",
                                                                lineNumber: 499,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/pages/chat.js",
                                                            lineNumber: 498,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/chat.js",
                                                        lineNumber: 487,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                                                        style: {
                                                            fontSize: '18px',
                                                            fontWeight: '600',
                                                            marginBottom: '8px',
                                                            color: '#f1f5f9'
                                                        },
                                                        className: "jsx-c3c894b17165e4c1",
                                                        children: "Analizza Documenti"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/chat.js",
                                                        lineNumber: 502,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                        style: {
                                                            fontSize: '13px',
                                                            color: '#94a3b8',
                                                            marginBottom: '20px',
                                                            textAlign: 'center',
                                                            lineHeight: '1.5',
                                                            maxWidth: '280px'
                                                        },
                                                        className: "jsx-c3c894b17165e4c1",
                                                        children: "Usa il pulsante + in basso per caricare file"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/chat.js",
                                                        lineNumber: 505,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            gap: '20px',
                                                            flexWrap: 'wrap'
                                                        },
                                                        className: "jsx-c3c894b17165e4c1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    textAlign: 'center',
                                                                    width: '70px'
                                                                },
                                                                className: "jsx-c3c894b17165e4c1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            width: '40px',
                                                                            height: '40px',
                                                                            margin: '0 auto 8px',
                                                                            background: 'rgba(102, 126, 234, 0.15)',
                                                                            borderRadius: '10px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            color: '#667eea'
                                                                        },
                                                                        className: "jsx-c3c894b17165e4c1",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                                                            width: "20",
                                                                            height: "20",
                                                                            viewBox: "0 0 24 24",
                                                                            fill: "none",
                                                                            stroke: "currentColor",
                                                                            strokeWidth: "2",
                                                                            className: "jsx-c3c894b17165e4c1",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                                                                    d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
                                                                                    className: "jsx-c3c894b17165e4c1"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/pages/chat.js",
                                                                                    lineNumber: 522,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("polyline", {
                                                                                    points: "14 2 14 8 20 8",
                                                                                    className: "jsx-c3c894b17165e4c1"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/pages/chat.js",
                                                                                    lineNumber: 523,
                                                                                    columnNumber: 31
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/pages/chat.js",
                                                                            lineNumber: 521,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/chat.js",
                                                                        lineNumber: 510,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            fontSize: '11px',
                                                                            color: '#94a3b8'
                                                                        },
                                                                        className: "jsx-c3c894b17165e4c1",
                                                                        children: "PDF, DOCX"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/chat.js",
                                                                        lineNumber: 526,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/chat.js",
                                                                lineNumber: 509,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    textAlign: 'center',
                                                                    width: '70px'
                                                                },
                                                                className: "jsx-c3c894b17165e4c1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            width: '40px',
                                                                            height: '40px',
                                                                            margin: '0 auto 8px',
                                                                            background: 'rgba(102, 126, 234, 0.15)',
                                                                            borderRadius: '10px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            color: '#667eea'
                                                                        },
                                                                        className: "jsx-c3c894b17165e4c1",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                                                            width: "20",
                                                                            height: "20",
                                                                            viewBox: "0 0 24 24",
                                                                            fill: "none",
                                                                            stroke: "currentColor",
                                                                            strokeWidth: "2",
                                                                            className: "jsx-c3c894b17165e4c1",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("circle", {
                                                                                    cx: "11",
                                                                                    cy: "11",
                                                                                    r: "8",
                                                                                    className: "jsx-c3c894b17165e4c1"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/pages/chat.js",
                                                                                    lineNumber: 541,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                                                                    d: "m21 21-4.35-4.35",
                                                                                    className: "jsx-c3c894b17165e4c1"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/pages/chat.js",
                                                                                    lineNumber: 542,
                                                                                    columnNumber: 31
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/pages/chat.js",
                                                                            lineNumber: 540,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/chat.js",
                                                                        lineNumber: 529,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            fontSize: '11px',
                                                                            color: '#94a3b8'
                                                                        },
                                                                        className: "jsx-c3c894b17165e4c1",
                                                                        children: "Ricerca AI"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/chat.js",
                                                                        lineNumber: 545,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/chat.js",
                                                                lineNumber: 528,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    textAlign: 'center',
                                                                    width: '70px'
                                                                },
                                                                className: "jsx-c3c894b17165e4c1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            width: '40px',
                                                                            height: '40px',
                                                                            margin: '0 auto 8px',
                                                                            background: 'rgba(102, 126, 234, 0.15)',
                                                                            borderRadius: '10px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            color: '#667eea'
                                                                        },
                                                                        className: "jsx-c3c894b17165e4c1",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                                                            width: "20",
                                                                            height: "20",
                                                                            viewBox: "0 0 24 24",
                                                                            fill: "none",
                                                                            stroke: "currentColor",
                                                                            strokeWidth: "2",
                                                                            className: "jsx-c3c894b17165e4c1",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                                                                d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
                                                                                className: "jsx-c3c894b17165e4c1"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/pages/chat.js",
                                                                                lineNumber: 560,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/pages/chat.js",
                                                                            lineNumber: 559,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/chat.js",
                                                                        lineNumber: 548,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            fontSize: '11px',
                                                                            color: '#94a3b8'
                                                                        },
                                                                        className: "jsx-c3c894b17165e4c1",
                                                                        children: "Chat AI"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/chat.js",
                                                                        lineNumber: 563,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/chat.js",
                                                                lineNumber: 547,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/chat.js",
                                                        lineNumber: 508,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true) : /* Desktop empty state */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: styles.aiAvatar,
                                                        className: "jsx-c3c894b17165e4c1",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                                            width: "56",
                                                            height: "56",
                                                            viewBox: "0 0 24 24",
                                                            fill: "none",
                                                            stroke: "currentColor",
                                                            strokeWidth: "2",
                                                            className: "jsx-c3c894b17165e4c1",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                                                d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
                                                                className: "jsx-c3c894b17165e4c1"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/chat.js",
                                                                lineNumber: 572,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/pages/chat.js",
                                                            lineNumber: 571,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/chat.js",
                                                        lineNumber: 570,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                                                        style: styles.emptyChatTitle,
                                                        className: "jsx-c3c894b17165e4c1",
                                                        children: "Analyze Your Documents with AI"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/chat.js",
                                                        lineNumber: 575,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                        style: styles.emptyChatDesc,
                                                        className: "jsx-c3c894b17165e4c1",
                                                        children: "Upload files and ask questions about the content. AI analyzes, extracts information, and answers your questions."
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/chat.js",
                                                        lineNumber: 576,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: styles.suggestedPrompts,
                                                        className: "jsx-c3c894b17165e4c1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>handleSendMessage({
                                                                        content: 'How does document analysis work?',
                                                                        fileIds: []
                                                                    }),
                                                                style: styles.promptBtn,
                                                                onMouseEnter: (e)=>{
                                                                    e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                                                                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.15)';
                                                                },
                                                                onMouseLeave: (e)=>{
                                                                    e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                                                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                                                },
                                                                className: "jsx-c3c894b17165e4c1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                        style: styles.promptIconPro,
                                                                        className: "jsx-c3c894b17165e4c1",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                                                            width: "24",
                                                                            height: "24",
                                                                            viewBox: "0 0 24 24",
                                                                            fill: "none",
                                                                            stroke: "currentColor",
                                                                            strokeWidth: "2",
                                                                            className: "jsx-c3c894b17165e4c1",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("circle", {
                                                                                    cx: "12",
                                                                                    cy: "12",
                                                                                    r: "10",
                                                                                    className: "jsx-c3c894b17165e4c1"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/pages/chat.js",
                                                                                    lineNumber: 595,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("line", {
                                                                                    x1: "12",
                                                                                    y1: "16",
                                                                                    x2: "12",
                                                                                    y2: "12",
                                                                                    className: "jsx-c3c894b17165e4c1"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/pages/chat.js",
                                                                                    lineNumber: 596,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("line", {
                                                                                    x1: "12",
                                                                                    y1: "8",
                                                                                    x2: "12.01",
                                                                                    y2: "8",
                                                                                    className: "jsx-c3c894b17165e4c1"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/pages/chat.js",
                                                                                    lineNumber: 597,
                                                                                    columnNumber: 27
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/pages/chat.js",
                                                                            lineNumber: 594,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/chat.js",
                                                                        lineNumber: 593,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-c3c894b17165e4c1",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                                style: styles.promptTitle,
                                                                                className: "jsx-c3c894b17165e4c1",
                                                                                children: "How It Works"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/pages/chat.js",
                                                                                lineNumber: 601,
                                                                                columnNumber: 25
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                                style: styles.promptDesc,
                                                                                className: "jsx-c3c894b17165e4c1",
                                                                                children: "Discover the features"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/pages/chat.js",
                                                                                lineNumber: 602,
                                                                                columnNumber: 25
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/pages/chat.js",
                                                                        lineNumber: 600,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/chat.js",
                                                                lineNumber: 581,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>handleSendMessage({
                                                                        content: 'What file formats are supported?',
                                                                        fileIds: []
                                                                    }),
                                                                style: styles.promptBtn,
                                                                onMouseEnter: (e)=>{
                                                                    e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                                                                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.15)';
                                                                },
                                                                onMouseLeave: (e)=>{
                                                                    e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                                                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                                                },
                                                                className: "jsx-c3c894b17165e4c1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                        style: styles.promptIconPro,
                                                                        className: "jsx-c3c894b17165e4c1",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                                                            width: "24",
                                                                            height: "24",
                                                                            viewBox: "0 0 24 24",
                                                                            fill: "none",
                                                                            stroke: "currentColor",
                                                                            strokeWidth: "2",
                                                                            className: "jsx-c3c894b17165e4c1",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                                                                    d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
                                                                                    className: "jsx-c3c894b17165e4c1"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/pages/chat.js",
                                                                                    lineNumber: 620,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("polyline", {
                                                                                    points: "14 2 14 8 20 8",
                                                                                    className: "jsx-c3c894b17165e4c1"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/pages/chat.js",
                                                                                    lineNumber: 621,
                                                                                    columnNumber: 27
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/pages/chat.js",
                                                                            lineNumber: 619,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/chat.js",
                                                                        lineNumber: 618,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-c3c894b17165e4c1",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                                style: styles.promptTitle,
                                                                                className: "jsx-c3c894b17165e4c1",
                                                                                children: "Supported Formats"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/pages/chat.js",
                                                                                lineNumber: 625,
                                                                                columnNumber: 25
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                                style: styles.promptDesc,
                                                                                className: "jsx-c3c894b17165e4c1",
                                                                                children: "PDF, DOCX, XLSX, images"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/pages/chat.js",
                                                                                lineNumber: 626,
                                                                                columnNumber: 25
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/pages/chat.js",
                                                                        lineNumber: 624,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/chat.js",
                                                                lineNumber: 606,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>handleSendMessage({
                                                                        content: 'What can you do with my documents?',
                                                                        fileIds: []
                                                                    }),
                                                                style: styles.promptBtn,
                                                                onMouseEnter: (e)=>{
                                                                    e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                                                                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.15)';
                                                                },
                                                                onMouseLeave: (e)=>{
                                                                    e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                                                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                                                },
                                                                className: "jsx-c3c894b17165e4c1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                        style: styles.promptIconPro,
                                                                        className: "jsx-c3c894b17165e4c1",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                                                            width: "24",
                                                                            height: "24",
                                                                            viewBox: "0 0 24 24",
                                                                            fill: "none",
                                                                            stroke: "currentColor",
                                                                            strokeWidth: "2",
                                                                            className: "jsx-c3c894b17165e4c1",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("circle", {
                                                                                    cx: "11",
                                                                                    cy: "11",
                                                                                    r: "8",
                                                                                    className: "jsx-c3c894b17165e4c1"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/pages/chat.js",
                                                                                    lineNumber: 644,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                                                                    d: "m21 21-4.35-4.35",
                                                                                    className: "jsx-c3c894b17165e4c1"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/pages/chat.js",
                                                                                    lineNumber: 645,
                                                                                    columnNumber: 27
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/pages/chat.js",
                                                                            lineNumber: 643,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/chat.js",
                                                                        lineNumber: 642,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-c3c894b17165e4c1",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                                style: styles.promptTitle,
                                                                                className: "jsx-c3c894b17165e4c1",
                                                                                children: "AI Capabilities"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/pages/chat.js",
                                                                                lineNumber: 649,
                                                                                columnNumber: 25
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                                style: styles.promptDesc,
                                                                                className: "jsx-c3c894b17165e4c1",
                                                                                children: "Analysis and semantic search"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/pages/chat.js",
                                                                                lineNumber: 650,
                                                                                columnNumber: 25
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/pages/chat.js",
                                                                        lineNumber: 648,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/chat.js",
                                                                lineNumber: 630,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>setShowUpload(true),
                                                                style: styles.promptBtn,
                                                                onMouseEnter: (e)=>{
                                                                    e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                                                                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.15)';
                                                                },
                                                                onMouseLeave: (e)=>{
                                                                    e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                                                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                                                },
                                                                className: "jsx-c3c894b17165e4c1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                        style: styles.promptIconPro,
                                                                        className: "jsx-c3c894b17165e4c1",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                                                            width: "24",
                                                                            height: "24",
                                                                            viewBox: "0 0 24 24",
                                                                            fill: "none",
                                                                            stroke: "currentColor",
                                                                            strokeWidth: "2",
                                                                            className: "jsx-c3c894b17165e4c1",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                                                                    d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
                                                                                    className: "jsx-c3c894b17165e4c1"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/pages/chat.js",
                                                                                    lineNumber: 668,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("polyline", {
                                                                                    points: "17 8 12 3 7 8",
                                                                                    className: "jsx-c3c894b17165e4c1"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/pages/chat.js",
                                                                                    lineNumber: 669,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("line", {
                                                                                    x1: "12",
                                                                                    y1: "3",
                                                                                    x2: "12",
                                                                                    y2: "15",
                                                                                    className: "jsx-c3c894b17165e4c1"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/pages/chat.js",
                                                                                    lineNumber: 670,
                                                                                    columnNumber: 27
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/pages/chat.js",
                                                                            lineNumber: 667,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/chat.js",
                                                                        lineNumber: 666,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-c3c894b17165e4c1",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                                style: styles.promptTitle,
                                                                                className: "jsx-c3c894b17165e4c1",
                                                                                children: "Upload Documents"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/pages/chat.js",
                                                                                lineNumber: 674,
                                                                                columnNumber: 25
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                                style: styles.promptDesc,
                                                                                className: "jsx-c3c894b17165e4c1",
                                                                                children: "Start analysis"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/pages/chat.js",
                                                                                lineNumber: 675,
                                                                                columnNumber: 25
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/pages/chat.js",
                                                                        lineNumber: 673,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/chat.js",
                                                                lineNumber: 654,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/chat.js",
                                                        lineNumber: 580,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true)
                                        }, void 0, false, {
                                            fileName: "[project]/pages/chat.js",
                                            lineNumber: 483,
                                            columnNumber: 17
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: styles.messagesList,
                                            className: "jsx-c3c894b17165e4c1",
                                            children: [
                                                messages.map((message, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ChatMessage$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                        message: message,
                                                        onFileClick: handleFileClick
                                                    }, index, false, {
                                                        fileName: "[project]/pages/chat.js",
                                                        lineNumber: 685,
                                                        columnNumber: 21
                                                    }, this)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    ref: messagesEndRef,
                                                    className: "jsx-c3c894b17165e4c1"
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/chat.js",
                                                    lineNumber: 691,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/pages/chat.js",
                                            lineNumber: 683,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/pages/chat.js",
                                        lineNumber: 449,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ChatInput$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        onSendMessage: handleSendMessage,
                                        disabled: sending,
                                        selectedFiles: files.filter((f)=>f.fileId || f.id)
                                    }, void 0, false, {
                                        fileName: "[project]/pages/chat.js",
                                        lineNumber: 697,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/chat.js",
                                lineNumber: 416,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/chat.js",
                        lineNumber: 288,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/chat.js",
                lineNumber: 285,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$styled$2d$jsx$2f$style$2e$js__$5b$external$5d$__$28$styled$2d$jsx$2f$style$2e$js$2c$__cjs$29$__["default"], {
                id: "c3c894b17165e4c1",
                children: "@keyframes fadeIn{0%{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes bounce{0%,to{transform:translateY(0)}50%{transform:translateY(-10px)}}@keyframes spin{0%{transform:rotate(0)}to{transform:rotate(360deg)}}"
            }, void 0, false, void 0, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Footer$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/pages/chat.js",
                lineNumber: 721,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
async function getServerSideProps() {
    return {
        props: {}
    };
}
const __TURBOPACK__default__export__ = ChatPage;
const styles = {
    loadingContainer: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
    },
    spinner: {
        width: '48px',
        height: '48px',
        border: '4px solid rgba(102, 126, 234, 0.3)',
        borderTopColor: '#667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#f1f5f9'
    },
    chatContainer: {
        display: 'flex',
        height: 'calc(100vh - 64px)',
        maxWidth: '1800px',
        margin: '0 auto'
    },
    sidebar: {
        width: '320px',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(10px)',
        borderRight: '1px solid rgba(102, 126, 234, 0.2)',
        display: 'flex',
        flexDirection: 'column'
    },
    sidebarHeader: {
        padding: '20px',
        borderBottom: '1px solid rgba(102, 126, 234, 0.2)'
    },
    sidebarTitle: {
        fontSize: '18px',
        fontWeight: '700',
        marginBottom: '16px',
        color: '#f1f5f9'
    },
    newChatBtn: {
        width: '100%',
        padding: '12px',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        borderRadius: '10px',
        color: '#f1f5f9',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.3s'
    },
    conversationsList: {
        flex: 1,
        overflowY: 'auto',
        padding: '12px'
    },
    emptyState: {
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: '14px',
        padding: '40px 20px'
    },
    conversationItem: {
        width: '100%',
        padding: '12px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '8px',
        color: '#f1f5f9',
        fontSize: '14px',
        textAlign: 'left',
        cursor: 'pointer',
        marginBottom: '8px',
        transition: 'all 0.2s'
    },
    sidebarFooter: {
        padding: '16px',
        borderTop: '1px solid rgba(102, 126, 234, 0.2)'
    },
    filesList: {
        maxHeight: '200px',
        overflowY: 'auto'
    },
    fileItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '6px',
        marginBottom: '6px',
        fontSize: '13px'
    },
    fileName: {
        flex: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        color: '#cbd5e1'
    },
    main: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(30, 41, 59, 0.5)'
    },
    chatHeader: {
        padding: '20px 24px',
        borderBottom: '1px solid rgba(102, 126, 234, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(10px)'
    },
    toggleBtn: {
        width: '40px',
        height: '40px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '8px',
        color: '#f1f5f9',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s'
    },
    chatTitle: {
        fontSize: '20px',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        margin: 0
    },
    messagesContainer: {
        flex: 1,
        overflowY: 'auto',
        padding: '24px'
    },
    emptyChat: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
    },
    aiAvatar: {
        width: '80px',
        height: '80px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '40px',
        marginBottom: '24px',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
    },
    emptyChatTitle: {
        fontSize: '28px',
        fontWeight: '700',
        marginBottom: '12px',
        color: '#f1f5f9'
    },
    emptyChatDesc: {
        fontSize: '16px',
        color: '#94a3b8',
        marginBottom: '32px',
        maxWidth: '500px'
    },
    suggestedPrompts: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        maxWidth: '700px'
    },
    promptBtn: {
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        borderRadius: '12px',
        color: '#f1f5f9',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.3s',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    promptIconPro: {
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        marginRight: '16px',
        flexShrink: 0,
        color: '#667eea'
    },
    promptTitle: {
        fontSize: '15px',
        fontWeight: '600',
        marginBottom: '4px'
    },
    promptDesc: {
        fontSize: '13px',
        color: '#94a3b8'
    },
    messagesList: {
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%'
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ccee4787._.js.map