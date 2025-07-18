import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaNewspaper, FaUser, FaImage, FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import { createBlogPost, getUser } from '../utils/api';
import Toast from '../components/Toast';

const CreateBlog = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    blogTitle: '',
    blogContent: '',
    blogImage: '',
    authorName: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const user = getUser();

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'blogTitle':
        if (!value.trim()) return 'Vui lòng nhập tiêu đề bài viết';
        if (value.trim().length < 5) return 'Tiêu đề phải có ít nhất 5 ký tự';
        if (value.trim().length > 200) return 'Tiêu đề không được vượt quá 200 ký tự';
        return '';
      case 'blogContent':
        if (!value.trim()) return 'Vui lòng nhập nội dung bài viết';
        if (value.trim().length < 50) return 'Nội dung phải có ít nhất 50 ký tự';
        if (value.trim().length > 5000) return 'Nội dung không được vượt quá 5000 ký tự';
        return '';
      case 'authorName':
        if (value.trim() && value.trim().length < 2) return 'Tên tác giả phải có ít nhất 2 ký tự';
        if (value.trim() && value.trim().length > 100) return 'Tên tác giả không được vượt quá 100 ký tự';
        return '';
      case 'blogImage':
        if (value.trim() && !isValidUrl(value.trim())) return 'Vui lòng nhập URL hợp lệ';
        return '';
      default:
        return '';
    }
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate field when user types (không cần đợi touched)
    const fieldError = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    const fieldError = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    if (!validateForm()) {
      setError('Vui lòng kiểm tra và sửa các lỗi trong form');
      return;
    }

    setIsSubmitting(true);

    try {
      const blogData = {
        blogTitle: formData.blogTitle.trim(),
        blogContent: formData.blogContent.trim(),
        blogImage: formData.blogImage.trim() || null,
        username: user?.username || '',
        authorName: formData.authorName.trim() || user?.fullName || user?.username || 'Tác giả'
      };

      await createBlogPost(blogData);
      
      setSuccessMessage('Tạo bài viết blog thành công!');
      setShowSuccess(true);
      
      // Reset form
      setFormData({
        blogTitle: '',
        blogContent: '',
        blogImage: '',
        authorName: ''
      });
      setErrors({});
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tạo bài viết. Vui lòng thử lại.');
      console.error('Error creating blog:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      {showSuccess && (
        <Toast
          message={successMessage}
          type="success"
          onClose={() => setShowSuccess(false)}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
              <FaNewspaper className="text-white text-3xl" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tạo bài viết blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Chia sẻ thông tin hữu ích về hiến máu, sức khỏe và các sự kiện quan trọng
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-8 animate-shake">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Blog Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề bài viết <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="blogTitle"
                value={formData.blogTitle}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Nhập tiêu đề bài viết..."
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 ${
                  errors.blogTitle ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={200}
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.blogTitle.length}/200 ký tự
              </p>
              {errors.blogTitle && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <FaTimes className="mr-1" />
                  {errors.blogTitle}
                </p>
              )}
            </div>

            {/* Author Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên tác giả
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="authorName"
                  value={formData.authorName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={user?.fullName || user?.username || 'Tên tác giả'}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 ${
                    errors.authorName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.authorName && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <FaTimes className="mr-1" />
                    {errors.authorName}
                  </p>
                )}
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL hình ảnh (tùy chọn)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaImage className="text-gray-400" />
                </div>
                <input
                  type="url"
                  name="blogImage"
                  value={formData.blogImage}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="https://example.com/image.jpg"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 ${
                    errors.blogImage ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Để trống nếu không có hình ảnh
              </p>
              {errors.blogImage && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <FaTimes className="mr-1" />
                  {errors.blogImage}
                </p>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung bài viết <span className="text-red-500">*</span>
              </label>
              <textarea
                name="blogContent"
                value={formData.blogContent}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Viết nội dung bài viết của bạn ở đây..."
                rows={12}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 resize-vertical ${
                  errors.blogContent ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={5000}
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.blogContent.length}/5000 ký tự
              </p>
              {errors.blogContent && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <FaTimes className="mr-1" />
                  {errors.blogContent}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/')}
                disabled={isSubmitting}
                className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <FaTimes className="mr-2" />
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Tạo bài viết
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBlog; 