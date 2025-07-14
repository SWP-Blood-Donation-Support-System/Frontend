import React, { useState, useRef } from "react";

const ImageUpload = ({ onImageChange, value, mode = "base64" }) => {
  const [preview, setPreview] = useState(value || null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const handleFiles = async (files) => {
    const file = files[0];
    if (file) {
      setLoading(true);
      
      try {
        if (mode === "base64") {
          // Convert to base64 for API upload
          const base64 = await fileToBase64(file);
          setPreview(base64);
          if (onImageChange) {
            onImageChange(base64, file);
          }
        } else {
          // Use object URL for preview only
          const url = URL.createObjectURL(file);
          setPreview(url);
          if (onImageChange) {
            onImageChange(url, file);
          }
        }
      } catch (error) {
        console.error('Error processing image:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageChange = (e) => {
    handleFiles(e.target.files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          border: "2px dashed #aaa",
          borderRadius: 8,
          padding: 20,
          textAlign: "center",
          cursor: "pointer",
          background: "#fafafa",
          position: "relative",
        }}
        onClick={() => fileInputRef.current.click()}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
        <div>
          {loading ? "Đang xử lý ảnh..." : "Kéo & thả ảnh vào đây hoặc bấm để chọn ảnh"}
        </div>
        {loading && (
          <div style={{ marginTop: 10 }}>
            <div style={{ 
              width: "20px", 
              height: "20px", 
              border: "2px solid #f3f3f3", 
              borderTop: "2px solid #3498db", 
              borderRadius: "50%", 
              animation: "spin 1s linear infinite",
              margin: "0 auto"
            }}></div>
          </div>
        )}
        {preview && !loading && (
          <div style={{ marginTop: 10 }}>
            <img src={preview} alt="Preview" style={{ maxWidth: "200px", maxHeight: "200px" }} />
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ImageUpload; 