import { useState, useCallback, useEffect, type ChangeEvent } from "react";

interface FileUploadProps {
  label: string;
  accept?: string;
  onChange: (file: File | null) => void;
  initialFile?: File;
}

export function FileUpload({ label, accept = "image/*", onChange, initialFile }: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(initialFile?.name ?? null);
  const [preview, setPreview] = useState<string | null>(null);

  // Generate preview for initial file
  useEffect(() => {
    if (initialFile && initialFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(initialFile);
    }
  }, [initialFile]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      setFileName(file?.name ?? null);
      onChange(file);

      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    },
    [onChange]
  );

  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
        {label}
      </label>
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all overflow-hidden
          ${fileName
            ? "border-emerald-500 bg-emerald-500/10"
            : "border-[var(--color-border)] hover:border-indigo-500 hover:bg-indigo-500/5"
          }`}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        {preview ? (
          <img src={preview} alt={label} className="max-h-[120px] mx-auto rounded-lg object-contain" />
        ) : (
          <div className="text-3xl mb-2">📄</div>
        )}
        {fileName ? (
          <div className="text-sm text-emerald-400 font-medium mt-1">✓ {fileName}</div>
        ) : (
          <div className="text-sm text-slate-400">Click or drag to upload</div>
        )}
      </div>
    </div>
  );
}
