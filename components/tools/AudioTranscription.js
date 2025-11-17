import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { HiUpload, HiClipboard } from 'react-icons/hi';

export default function AudioTranscription() {
    const [audio, setAudio] = useState(null);
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const onDrop = async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setAudio(file);
        setResult('');
        setError(null);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'audio/*': ['.mp3', '.wav', '.m4a', '.ogg'] },
        maxFiles: 1,
    });

    const handleTranscribe = async () => {
        if (!audio) return;

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('audio', audio);

            const response = await fetch('/api/tools/transcribe-audio', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Errore durante la trascrizione');
            }

            const data = await response.json();
            setResult(data.text);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result);
    };

    return (
        <div className="space-y-6">
            {!audio ? (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
                        isDragActive
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-gray-600 hover:border-gray-500'
                    }`}
                >
                    <input {...getInputProps()} />
                    <HiUpload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">
                        {isDragActive ? 'Rilascia qui...' : 'Carica un file audio'}
                    </p>
                    <p className="text-sm text-gray-400">MP3, WAV, M4A o OGG</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                        <p className="text-sm text-gray-400">File caricato:</p>
                        <p className="font-medium">{audio.name}</p>
                    </div>

                    {!result && (
                        <button
                            onClick={handleTranscribe}
                            disabled={loading}
                            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors"
                        >
                            {loading ? 'Trascrizione in corso...' : 'Trascrivi Audio'}
                        </button>
                    )}

                    {error && (
                        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
                            <p className="text-red-500">{error}</p>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-sm font-medium text-gray-400">Trascrizione</h3>
                                    <button
                                        onClick={handleCopy}
                                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center gap-2"
                                    >
                                        <HiClipboard className="w-4 h-4" />
                                        Copia
                                    </button>
                                </div>
                                <textarea
                                    value={result}
                                    readOnly
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none resize-none"
                                    rows={10}
                                />
                            </div>
                            <button
                                onClick={() => {
                                    setAudio(null);
                                    setResult('');
                                }}
                                className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
                            >
                                Carica Nuovo File
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
