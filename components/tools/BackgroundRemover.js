import { useState, useCallback, useMemo, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { HiOutlineUpload, HiX, HiDownload } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const BackgroundRemover = () => {
    const [files, setFiles] = useState([]);
    const [processedImage, setProcessedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [subjectType, setSubjectType] = useState('auto');
    const [quality, setQuality] = useState(90); // maps to remove.bg size levels
    const [crop, setCrop] = useState(true);
    const [cropMargin, setCropMargin] = useState(8); // %
    const [bgPreview, setBgPreview] = useState('checker'); // checker | transparent | white | black
    const [autoProcess, setAutoProcess] = useState(true);
    const [compare, setCompare] = useState(50); // before/after slider percentage

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

    const mappedSize = useMemo(() => {
        if (quality >= 85) return 'full';
        if (quality >= 60) return 'medium';
        if (quality >= 35) return 'regular';
        if (quality >= 15) return 'small';
        return 'preview';
    }, [quality]);

    const handleProcessImage = async () => {
        if (files.length === 0) return;

        setIsLoading(true);
        setError(null);
        setProcessedImage(null);

        const formData = new FormData();
        formData.append('file', files[0]);
        formData.append('type', subjectType);
        formData.append('size', mappedSize);
        formData.append('crop', crop ? 'true' : 'false');
        if (crop) formData.append('crop_margin', `${cropMargin}%`);

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

    // Auto-process when file or main controls change
    useEffect(() => {
        if (autoProcess && files.length > 0) {
            const id = setTimeout(() => handleProcessImage(), 300);
            return () => clearTimeout(id);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [files, subjectType, quality, crop, cropMargin, autoProcess]);

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-gray-800 border border-gray-700 rounded-lg">
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

            {/* Controls */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                    <label className="block text-sm text-gray-300 mb-2">Tipo soggetto</label>
                    <select value={subjectType} onChange={(e)=>setSubjectType(e.target.value)} className="w-full bg-gray-800 text-gray-200 rounded-md border border-gray-600 px-3 py-2">
                        <option value="auto">Auto</option>
                        <option value="person">Persona</option>
                        <option value="product">Prodotto</option>
                        <option value="car">Auto</option>
                        <option value="animal">Animale</option>
                    </select>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm text-gray-300">Qualità/Dettagli</label>
                        <span className="text-xs text-gray-400 uppercase">{mappedSize}</span>
                    </div>
                    <input type="range" min="0" max="100" value={quality} onChange={(e)=>setQuality(parseInt(e.target.value,10))} className="w-full" />
                </div>
                <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                    <label className="block text-sm text-gray-300 mb-2">Ritaglio intelligente</label>
                    <div className="flex items-center gap-3">
                        <input id="crop" type="checkbox" checked={crop} onChange={(e)=>setCrop(e.target.checked)} />
                        <label htmlFor="crop" className="text-gray-200">Crop intorno al soggetto</label>
                    </div>
                    <div className={`mt-3 ${crop ? '' : 'opacity-50 pointer-events-none'}`}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-300">Margine</span>
                            <span className="text-xs text-gray-400">{cropMargin}%</span>
                        </div>
                        <input type="range" min="0" max="30" value={cropMargin} onChange={(e)=>setCropMargin(parseInt(e.target.value,10))} className="w-full" />
                    </div>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                    <label className="block text-sm text-gray-300 mb-2">Anteprima sfondo</label>
                    <div className="grid grid-cols-4 gap-2">
                        {['checker','transparent','white','black'].map(opt => (
                            <button key={opt} onClick={()=>setBgPreview(opt)} className={`h-10 rounded-md border ${bgPreview===opt?'border-purple-400':'border-gray-600'} bg-${opt}`}
                                style={opt==='checker'?{backgroundImage:'linear-gradient(45deg, #4a5568 25%, transparent 25%), linear-gradient(-45deg, #4a5568 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #4a5568 75%), linear-gradient(-45deg, transparent 75%, #4a5568 75%)', backgroundSize:'14px 14px', backgroundPosition:'0 0, 0 7px, 7px -7px, -7px 0px'}: opt==='white'?{background:'#fff'}:opt==='black'?{background:'#000'}:{background:'transparent'}}>
                            </button>
                        ))}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                        <input id="auto" type="checkbox" checked={autoProcess} onChange={(e)=>setAutoProcess(e.target.checked)} />
                        <label htmlFor="auto" className="text-gray-200 text-sm">Elabora automaticamente</label>
                    </div>
                </div>
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                            <button
                                onClick={handleProcessImage}
                                disabled={isLoading}
                                className="col-span-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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
                            <a
                                href={processedImage || '#'}
                                onClick={(e)=>{ if(!processedImage) e.preventDefault(); }}
                                download={processedImage ? `sfondo-rimosso-${files[0].name}` : undefined}
                                className={`px-6 py-3 text-center font-bold rounded-lg transition-colors ${processedImage ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-600 text-gray-300 cursor-not-allowed'}`}
                            >
                                <div className="flex items-center justify-center">
                                    <HiDownload className="w-5 h-5 mr-2" />
                                    Scarica PNG
                                </div>
                            </a>
                        </div>
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
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-8"
                    >
                        <h3 className="text-2xl font-bold mb-4 text-white text-center">Confronto Prima/Dopo</h3>
                        <div className="relative w-full overflow-hidden rounded-lg border border-gray-600" style={{background: bgPreview==='white'?'#fff':bgPreview==='black'?'#000':'transparent'}}>
                            {/* checker background */}
                            {bgPreview==='checker' && (
                                <div className="absolute inset-0" style={{backgroundImage:'linear-gradient(45deg, #4a5568 25%, transparent 25%), linear-gradient(-45deg, #4a5568 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #4a5568 75%), linear-gradient(-45deg, transparent 75%, #4a5568 75%)', backgroundSize:'20px 20px', backgroundPosition:'0 0, 0 10px, 10px -10px, -10px 0px'}} />
                            )}
                            <div className="relative w-full" style={{position:'relative'}}>
                                {/* Before */}
                                <img src={files[0]?.preview} alt="Prima" className="block w-full h-auto select-none" style={{userSelect:'none'}} />
                                {/* After clipped */}
                                <img src={processedImage} alt="Dopo" className="absolute inset-0 w-full h-full object-contain" style={{clipPath:`polygon(0 0, ${compare}% 0, ${compare}% 100%, 0 100%)`}} />
                                {/* Divider handle */}
                                <div className="absolute top-0 bottom-0" style={{left:`calc(${compare}% - 1px)`}}>
                                    <div className="w-0.5 h-full bg-purple-400 shadow" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                            <span className="text-xs text-gray-400">Prima</span>
                            <input type="range" min="0" max="100" value={compare} onChange={(e)=>setCompare(parseInt(e.target.value,10))} className="flex-1" />
                            <span className="text-xs text-gray-400">Dopo</span>
                        </div>
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
