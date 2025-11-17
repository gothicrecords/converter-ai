import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { HiOutlineUpload, HiX, HiDownload } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const BackgroundRemover = () => {
    const [files, setFiles] = useState([]);
    const [processedImage, setProcessedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const onDrop = useCallback(acceptedFiles => {
        setProcessedImage(null);
        setError(null);
        setFiles(acceptedFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        })));
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: 'image/jpeg, image/png',
        maxFiles: 1,
    });

    const handleRemoveFile = () => {
        setFiles([]);
        setProcessedImage(null);
        URL.revokeObjectURL(files[0].preview);
    };

    const handleProcessImage = async () => {
        if (files.length === 0) return;

        setIsLoading(true);
        setError(null);
        setProcessedImage(null);

        const formData = new FormData();
        formData.append('file', files[0]);

        try {
            const response = await fetch('/api/tools/remove-background', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Qualcosa è andato storto');
            }

            const blob = await response.blob();
            setProcessedImage(URL.createObjectURL(blob));

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6 bg-gray-800 border border-gray-700 rounded-lg">
            <div {...getRootProps()} className={`relative flex flex-col items-center justify-center w-full h-64 p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragActive ? 'border-purple-500 bg-gray-700' : 'border-gray-600 hover:border-purple-400'}`}>
                <input {...getInputProps()} />
                <HiOutlineUpload className="w-12 h-12 text-gray-500 mb-4" />
                {isDragActive ? (
                    <p className="text-lg font-semibold text-purple-400">Rilascia l'immagine qui</p>
                ) : (
                    <>
                        <p className="text-lg font-semibold text-gray-300">Trascina un'immagine o clicca per selezionarla</p>
                        <p className="text-sm text-gray-500">File supportati: JPG, PNG (max 1 file)</p>
                    </>
                )}
            </div>

            <AnimatePresence>
                {files.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mt-6"
                    >
                        <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                            <div className="flex items-center">
                                <img src={files[0].preview} alt="Anteprima" className="w-16 h-16 object-cover rounded-md mr-4" />
                                <div>
                                    <p className="font-semibold text-white">{files[0].name}</p>
                                    <p className="text-sm text-gray-400">{(files[0].size / 1024).toFixed(2)} KB</p>
                                </div>
                            </div>
                            <button onClick={handleRemoveFile} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-600 transition-colors">
                                <HiX className="w-6 h-6" />
                            </button>
                        </div>
                        <button
                            onClick={handleProcessImage}
                            disabled={isLoading}
                            className="w-full mt-4 px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Elaborazione in corso...
                                </>
                            ) : 'Rimuovi Sfondo'}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 p-4 bg-red-900 border border-red-700 text-red-200 rounded-lg text-center"
                >
                    <p><strong>Errore:</strong> {error}</p>
                </motion.div>
            )}

            <AnimatePresence>
                {processedImage && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-8 text-center"
                    >
                        <h3 className="text-2xl font-bold mb-4 text-white">Risultato</h3>
                        <div className="relative inline-block bg-grid-pattern p-4 border border-gray-600 rounded-lg">
                            <img src={processedImage} alt="Immagine processata" className="max-w-full h-auto rounded-md" />
                        </div>
                        <a
                            href={processedImage}
                            download={`sfondo-rimosso-${files[0].name}`}
                            className="mt-4 inline-flex items-center px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <HiDownload className="w-5 h-5 mr-2" />
                            Scarica Immagine
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <style jsx>{`
                .bg-grid-pattern {
                    background-image: linear-gradient(45deg, #4a5568 25%, transparent 25%), linear-gradient(-45deg, #4a5568 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #4a5568 75%), linear-gradient(-45deg, transparent 75%, #4a5568 75%);
                    background-size: 20px 20px;
                    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
                }
            `}</style>
        </div>
    );
};

export default BackgroundRemover;
