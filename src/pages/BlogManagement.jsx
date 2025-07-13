import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaTimes, FaSave, FaNewspaper, FaSearch, FaUser, FaCalendarAlt } from 'react-icons/fa';
import { getAllBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from '../utils/api';
import ImageUpload from '../components/ImageUpload';

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [formData, setFormData] = useState({
    blogTitle: '',
    blogContent: '',
    blogImage: '',
    blogStatus: 'available',
    blogDetail: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
      case 'blogDetail':
        if (value.trim() && value.trim().length < 50) return 'Chi tiết bài viết phải có ít nhất 50 ký tự';
        if (value.trim() && value.trim().length > 10000) return 'Chi tiết bài viết không được vượt quá 10000 ký tự';
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

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllBlogPosts();
      setBlogs(data);
    } catch (err) {
      setError(err.message || 'Lỗi tải danh sách blog');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.blogTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.blogContent?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setFormData({ 
      blogTitle: '', 
      blogContent: '', 
      blogImage: '', 
      blogStatus: 'available',
      blogDetail: ''
    });
    setErrors({});
    setIsEdit(false);
    setShowModal(true);
  };

  const openEditModal = (blog) => {
    setFormData({
      blogTitle: blog.blogTitle,
      blogContent: blog.blogContent,
      blogImage: blog.blogImage || '',
      blogStatus: blog.blogStatus || 'available',
      blogDetail: blog.blogDetail || blog.blogContent
    });
    setErrors({});
    setSelectedBlog(blog);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    setIsSubmitting(true);
    try {
      await deleteBlogPost(blogId);
      await fetchBlogs();
    } catch (err) {
      setError(err.message || 'Lỗi xóa blog');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Validate field when user types
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
      if (isEdit && selectedBlog) {
        await updateBlogPost(selectedBlog.blogId, formData);
      } else {
        await createBlogPost(formData);
      }
      setShowModal(false);
      setErrors({});
      await fetchBlogs();
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu blog');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải danh sách blog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
              <FaNewspaper className="text-white text-2xl" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Blog</h1>
          <p className="text-gray-600">Tạo, chỉnh sửa và quản lý các bài viết blog</p>
        </div>

        {/* Search and Create */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm blog..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <FaPlus className="mr-2" />
            Tạo blog mới
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Blog List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-2xl text-red-500 mr-3" />
            <span className="text-gray-600">Đang tải...</span>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-12">
            <FaNewspaper className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm ? 'Không tìm thấy blog nào' : 'Chưa có bài viết blog nào'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Hãy tạo bài viết blog đầu tiên của bạn'}
            </p>
            {!searchTerm && (
              <button
                onClick={openCreateModal}
                className="flex items-center mx-auto px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                <FaPlus className="mr-2" />
                Tạo Blog Đầu Tiên
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <div key={blog.blogId} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                {blog.blogImage && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={blog.blogImage}
                      alt={blog.blogTitle}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                    {blog.blogTitle}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {blog.blogContent?.substring(0, 120)}...
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <FaCalendarAlt className="mr-2" />
                      {formatDate(blog.createdDate)}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        blog.blogStatus === 'available' ? 'bg-green-100 text-green-800' :
                        blog.blogStatus === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {blog.blogStatus === 'available' ? 'Đã xuất bản' :
                         blog.blogStatus === 'draft' ? 'Bản nháp' :
                         blog.blogStatus === 'archived' ? 'Đã lưu trữ' : blog.blogStatus}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(blog)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium"
                    >
                      <FaEdit className="mr-1" />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(blog.blogId)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm font-medium"
                      disabled={isSubmitting}
                    >
                      <FaTrash className="mr-1" />
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {isEdit ? 'Chỉnh sửa blog' : 'Tạo blog mới'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  name="blogTitle"
                  value={formData.blogTitle}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.blogTitle ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập tiêu đề bài viết..."
                  maxLength={200}
                />
                {errors.blogTitle && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <FaTimes className="mr-1" />
                    {errors.blogTitle}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  name="blogStatus"
                  value={formData.blogStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="available">Đã xuất bản</option>
                  <option value="draft">Bản nháp</option>
                  <option value="archived">Đã lưu trữ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh bài viết (tùy chọn)
                </label>
                <ImageUpload
                  value={formData.blogImage}
                  onChange={(url) => {
                    setFormData(prev => ({ ...prev, blogImage: url }));
                    const fieldError = validateField('blogImage', url);
                    setErrors(prev => ({ ...prev, blogImage: fieldError }));
                  }}
                  placeholder="Kéo thả ảnh vào đây hoặc click để chọn file"
                  disabled={isSubmitting}
                />
                {errors.blogImage && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <FaTimes className="mr-1" />
                    {errors.blogImage}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung tóm tắt <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="blogContent"
                  value={formData.blogContent}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-vertical ${
                    errors.blogContent ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Viết nội dung tóm tắt bài viết của bạn ở đây..."
                  rows={4}
                  maxLength={5000}
                />
                {errors.blogContent && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <FaTimes className="mr-1" />
                    {errors.blogContent}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung chi tiết
                </label>
                <textarea
                  name="blogDetail"
                  value={formData.blogDetail}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-vertical ${
                    errors.blogDetail ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Viết nội dung chi tiết bài viết của bạn ở đây..."
                  rows={8}
                  maxLength={10000}
                />
                {errors.blogDetail && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <FaTimes className="mr-1" />
                    {errors.blogDetail}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                  className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <FaTimes className="mr-2" />
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Lưu
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement; 