module.exports = [
"[project]/lib/openai.js [api] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/[root-of-the-server]__caeed9bc._.js",
  "server/chunks/lib_openai_d364a29d.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/lib/openai.js [api] (ecmascript)");
    });
});
}),
"[externals]/os [external] (os, cjs, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/[externals]_os_066ffa03._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[externals]/os [external] (os, cjs)");
    });
});
}),
];