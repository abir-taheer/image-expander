// pages/upload.tsx
import { FormEvent, useState } from "react";
import Image from "next/image";
import { Download, Upload, Image as ImageIcon } from "lucide-react";

export default function UploadForm() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    xPercent: "10",
    yPercent: "10",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDownload = async () => {
    if (imageUrl) {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "processed-image." + blob.type.split("/")[1];
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const response = await fetch(
        `/api/convert?x=${formValues.xPercent}&y=${formValues.yPercent}`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (response.ok) {
        const blob = await response.blob();
        const newImageUrl = URL.createObjectURL(blob);

        // Cleanup old URL if it exists
        if (imageUrl) {
          URL.revokeObjectURL(imageUrl);
        }

        setImageUrl(newImageUrl);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Upload failed");
      }
    } catch (error) {
      setError("Error processing image");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Image Border Generator
            </h1>
            <p className="mt-2 text-gray-600">
              Add custom borders to your images
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Section */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Upload Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="image"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="image"
                        name="image"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            {preview && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Preview:
                </p>
                <div className="relative h-48 w-full rounded-lg overflow-hidden">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}

            {/* Border Controls */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="xPercent"
                  className="block text-sm font-medium text-gray-700"
                >
                  Horizontal Border (%)
                </label>
                <input
                  style={{ color: "black" }}
                  type="number"
                  name="xPercent"
                  id="xPercent"
                  value={formValues.xPercent}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="yPercent"
                  className="block text-sm font-medium text-gray-700"
                >
                  Vertical Border (%)
                </label>
                <input
                  type="number"
                  name="yPercent"
                  id="yPercent"
                  style={{ color: "black" }}
                  value={formValues.yPercent}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading || !selectedFile}
                className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading || !selectedFile
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Process Image
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Result Section */}
          {imageUrl && (
            <div className="mt-8 space-y-4">
              <h2 className="text-lg font-medium text-gray-900">
                Processed Image
              </h2>
              <div className="relative h-96 w-full rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={imageUrl}
                  alt="Processed image"
                  fill
                  className="object-contain"
                />
              </div>
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Image
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
