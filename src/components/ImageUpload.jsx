import React, { useState, useRef } from "react";

const ImageUpload = ({ onImageChange, value }) => {
  const [preview, setPreview] = useState(value || null);
  const fileInputRef = useRef();

  const handleFiles = (files) => {
    const file = files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      if (onImageChange) {
        onImageChange(url, file);
      }
    }
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
        <div>Kéo & thả ảnh vào đây hoặc bấm để chọn ảnh</div>
        {preview && (
          <div style={{ marginTop: 10 }}>
            <img src={preview} alt="Preview" style={{ maxWidth: "200px", maxHeight: "200px" }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload; 