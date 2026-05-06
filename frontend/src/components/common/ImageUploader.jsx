import { useState, useRef } from 'react';
import { Upload, X, Image } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ImageUploader({ listingId, onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleSelect = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length + files.length > 10) {
      toast.error('Maximum 10 photos');
      return;
    }

    const newFiles = [];
    const newPreviews = [];

    selected.forEach(file => {
      if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
        toast.error(`${file.name} — format non supporté`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} — fichier trop lourd (max 5MB)`);
        return;
      }
      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setFiles(prev => [...prev, ...newFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    URL.revokeObjectURL(previews[index]);
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Sélectionnez au moins une photo');
      return;
    }
    if (!listingId) {
      toast.error('Annonce non trouvée');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));

      const token = localStorage.getItem('logezy_token');
      const res = await fetch(`http://localhost:5000/api/listings/${listingId}/images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Erreur upload');
      const data = await res.json();
      toast.success(`${files.length} photo(s) uploadée(s) ! 🎉`);
      setFiles([]);
      setPreviews([]);
      onUploadComplete && onUploadComplete(data.images);
    } catch (e) {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">

      {/* Zone de dépôt */}
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-[#E2E8F0] rounded-xl p-6 text-center cursor-pointer hover:border-[#1A6B3C] hover:bg-[#E8F5EE]/50 transition-all"
      >
        <Upload size={24} className="mx-auto text-[#94A3B8] mb-2" />
        <p className="text-sm font-medium text-[#334155]">Cliquez pour sélectionner des photos</p>
        <p className="text-xs text-[#94A3B8] mt-1">JPG, PNG, WEBP · Max 5MB · 10 photos maximum</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleSelect}
          className="hidden"
        />
      </div>

      {/* Aperçus */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          {previews.map((preview, i) => (
            <div key={i} className="relative group aspect-square">
              <img
                src={preview}
                alt={`Photo ${i + 1}`}
                className="w-full h-full object-cover rounded-xl border border-[#E2E8F0]"
              />
              {i === 0 && (
                <span className="absolute bottom-1 left-1 bg-[#1A6B3C] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  Couverture
                </span>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Bouton upload */}
      {files.length > 0 && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Upload en cours...
            </>
          ) : (
            <>
              <Upload size={16} />
              Uploader {files.length} photo(s)
            </>
          )}
        </button>
      )}
    </div>
  );
}