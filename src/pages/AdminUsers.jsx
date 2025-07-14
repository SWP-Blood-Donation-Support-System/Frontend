import React, { useState, useEffect } from 'react';
import { getAuthToken } from '../utils/api';
import { FaUser, FaEnvelope, FaUserShield, FaUserTag, FaTint, FaCheckCircle, FaTimesCircle, FaSearch, FaChevronLeft, FaChevronRight, FaTrash, FaEdit, FaPlus } from 'react-icons/fa';
import Toast from '../components/Toast';

const API_URL = 'https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/admin/users';

const AdminUsers = () => {
  const [filters, setFilters] = useState({
    username: '',
    email: '',
    role: '',
    fullname: '',
    bloodtype: '',
    userStatus: '',
    profileStatus: '',
    page: 1,
    pageSize: 10,
    sortOrder: 'asc',
  });
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [detailUser, setDetailUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: '',
    password: '',
    email: '',
    role: 'Staff',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    address: '',
    bloodType: '',
  });
  const [createErrors, setCreateErrors] = useState({});
  const [creating, setCreating] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [pendingDeleteUser, setPendingDeleteUser] = useState(null);

  // Fetch users mỗi khi filters thay đổi
  useEffect(() => {
    fetchUsers(filters);
    // eslint-disable-next-line
  }, [filters.page, filters.pageSize, filters.sortOrder]);

  const fetchUsers = async (customFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      // Tạo query string từ customFilters
      const params = new URLSearchParams();
      Object.entries(customFilters).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== null) params.append(key, value);
      });
      const url = `${API_URL}?${params.toString()}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Lỗi API: ${res.status} - ${text}`);
      }
      const data = await res.json();
      let userArr = (data.data && data.data.users) || data.users || data.data || [];
      if (!Array.isArray(userArr)) userArr = [];
      setUsers(userArr);
      setTotalPages((data.data && (data.data.totalPages || data.data.total_pages)) || data.totalPages || data.total_pages || 1);
    } catch (err) {
      setError(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1 }));
    fetchUsers({ ...filters, page: 1 });
  };

  const handlePageChange = (delta) => {
    const newPage = Math.max(1, filters.page + delta);
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleSort = () => {
    const sortOrder = filters.sortOrder === 'asc' ? 'desc' : 'asc';
    setFilters((prev) => ({ ...prev, sortOrder, page: 1 }));
  };

  // Validate create form
  const validateCreateForm = () => {
    const errors = {};
    
    if (!createForm.username.trim()) {
      errors.username = 'Username là bắt buộc';
    } else if (createForm.username.length < 3) {
      errors.username = 'Username phải có ít nhất 3 ký tự';
    }
    
    if (!createForm.password.trim()) {
      errors.password = 'Mật khẩu là bắt buộc';
    } else if (createForm.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (!createForm.email.trim()) {
      errors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email)) {
      errors.email = 'Email không hợp lệ';
    }
    
    if (!createForm.role) {
      errors.role = 'Vai trò là bắt buộc';
    } else if (!['Admin', 'Staff'].includes(createForm.role)) {
      errors.role = 'Vai trò chỉ có thể là Admin hoặc Staff';
    }
    
    if (!createForm.fullName.trim()) {
      errors.fullName = 'Họ tên là bắt buộc';
    }
    
    if (!createForm.dateOfBirth) {
      errors.dateOfBirth = 'Ngày sinh là bắt buộc';
    }
    
    if (!createForm.gender) {
      errors.gender = 'Giới tính là bắt buộc';
    }
    
    if (!createForm.phone.trim()) {
      errors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10,11}$/.test(createForm.phone.replace(/\s/g, ''))) {
      errors.phone = 'Số điện thoại không hợp lệ';
    }
    
    if (!createForm.address.trim()) {
      errors.address = 'Địa chỉ là bắt buộc';
    }
    
    if (!createForm.bloodType) {
      errors.bloodType = 'Nhóm máu là bắt buộc';
    }
    
    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!validateCreateForm()) {
      return;
    }
    
    setCreating(true);
    setApiError(''); // Clear previous API errors
    
    try {
      const res = await fetch(`${API_URL}/create-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(createForm),
      });
      
      const responseData = await res.json();
      
      if (!res.ok || responseData.success === false) {
        // Show all API errors at the top
        if (responseData.message) {
          setApiError(responseData.message);
        } else {
          setApiError('Lỗi tạo tài khoản');
        }
        return;
      }
      
      // Success case
      setToast({ message: 'Tạo tài khoản thành công!', type: 'success' });
      setShowCreateModal(false);
      setCreateForm({
        username: '',
        password: '',
        email: '',
        role: 'Staff',
        fullName: '',
        dateOfBirth: '',
        gender: '',
        phone: '',
        address: '',
        bloodType: '',
      });
      setCreateErrors({});
      setApiError('');
      fetchUsers(filters);
    } catch (err) {
      setApiError(err.message || 'Lỗi tạo tài khoản');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;
    setCreateForm({ ...createForm, [name]: value });
    
    // Clear API error when user starts typing
    if (apiError) {
      setApiError('');
    }
    
    // Validate field in real-time
    validateField(name, value);
  };

  const validateField = (fieldName, value) => {
    const errors = { ...createErrors };
    
    switch (fieldName) {
      case 'username':
        if (!value.trim()) {
          errors.username = 'Username là bắt buộc';
        } else if (value.length < 3) {
          errors.username = 'Username phải có ít nhất 3 ký tự';
        } else {
          delete errors.username;
        }
        break;
        
      case 'password':
        if (!value.trim()) {
          errors.password = 'Mật khẩu là bắt buộc';
        } else if (value.length < 6) {
          errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        } else {
          delete errors.password;
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          errors.email = 'Email là bắt buộc';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Email không hợp lệ';
        } else {
          delete errors.email;
        }
        break;
        
      case 'role':
        if (!value) {
          errors.role = 'Vai trò là bắt buộc';
        } else if (!['Admin', 'Staff'].includes(value)) {
          errors.role = 'Vai trò chỉ có thể là Admin hoặc Staff';
        } else {
          delete errors.role;
        }
        break;
        
      case 'fullName':
        if (!value.trim()) {
          errors.fullName = 'Họ tên là bắt buộc';
        } else {
          delete errors.fullName;
        }
        break;
        
      case 'dateOfBirth':
        if (!value) {
          errors.dateOfBirth = 'Ngày sinh là bắt buộc';
        } else {
          delete errors.dateOfBirth;
        }
        break;
        
      case 'gender':
        if (!value) {
          errors.gender = 'Giới tính là bắt buộc';
        } else {
          delete errors.gender;
        }
        break;
        
      case 'phone':
        if (!value.trim()) {
          errors.phone = 'Số điện thoại là bắt buộc';
        } else if (!/^[0-9]{10,11}$/.test(value.replace(/\s/g, ''))) {
          errors.phone = 'Số điện thoại không hợp lệ';
        } else {
          delete errors.phone;
        }
        break;
        
      case 'address':
        if (!value.trim()) {
          errors.address = 'Địa chỉ là bắt buộc';
        } else {
          delete errors.address;
        }
        break;
        
      case 'bloodType':
        if (!value) {
          errors.bloodType = 'Nhóm máu là bắt buộc';
        } else {
          delete errors.bloodType;
        }
        break;
        
      default:
        break;
    }
    
    setCreateErrors(errors);
  };

  // Xóa user
  const handleDeleteUser = (username) => {
    setPendingDeleteUser({ username });
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!pendingDeleteUser) return;

    const { username } = pendingDeleteUser;
    try {
      const res = await fetch(`${API_URL}/${username}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Lỗi xóa user');
      }
      setToast({ message: 'Xóa người dùng thành công!', type: 'success' });
      fetchUsers(filters);
    } catch (err) {
      setToast({ message: err.message || 'Lỗi xóa user', type: 'error' });
    }

    setShowDeleteConfirmModal(false);
    setPendingDeleteUser(null);
  };

  const cancelDeleteUser = () => {
    setShowDeleteConfirmModal(false);
    setPendingDeleteUser(null);
  };

  // Sửa user
  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      role: user.role,
      fullName: user.fullName || user.fullname,
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
      gender: user.gender || '',
      phone: user.phone || '',
      address: user.address || '',
      userStatus: user.userStatus || '',
      profileStatus: user.profileStatus || '',
      bloodType: user.bloodType || user.bloodtype || '',
    });
  };

  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    try {
      // Chỉ gửi đúng các trường cho phép
      const updateData = {
        username: editForm.username,
        email: editForm.email,
        role: editForm.role,
        fullName: editForm.fullName,
        dateOfBirth: editForm.dateOfBirth,
        gender: editForm.gender,
        phone: editForm.phone,
        address: editForm.address,
        userStatus: editForm.userStatus,
        profileStatus: editForm.profileStatus,
        bloodType: editForm.bloodType,
      };
      const res = await fetch(`${API_URL}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Lỗi cập nhật user');
      }
      setToast({ message: 'Cập nhật người dùng thành công!', type: 'success' });
      setEditingUser(null);
      fetchUsers(filters);
    } catch (err) {
      setToast({ message: err.message || 'Lỗi cập nhật user', type: 'error' });
    }
  };



  return (
    <div className="w-full p-4 sm:p-6 bg-white rounded-xl shadow-lg mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-center text-red-600 flex items-center justify-center gap-2">
          <FaUserShield className="inline-block mb-1" /> Quản lý người dùng
        </h2>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <FaPlus /> Tạo tài khoản
        </button>
      </div>
      <form onSubmit={handleSearch} className="flex flex-wrap gap-4 mb-6 items-end justify-center">
        <div className="relative">
          <FaUser className="absolute left-3 top-3 text-gray-400" />
          <input name="username" value={filters.username} onChange={handleInputChange} placeholder="Username" className="input pl-10" />
        </div>
        <div className="relative">
          <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
          <input name="email" value={filters.email} onChange={handleInputChange} placeholder="Email" className="input pl-10" />
        </div>
        <div className="relative">
          <FaUserTag className="absolute left-3 top-3 text-gray-400" />
          <input name="fullname" value={filters.fullname} onChange={handleInputChange} placeholder="Họ tên" className="input pl-10" />
        </div>
        <div className="relative">
          <FaUserShield className="absolute left-3 top-3 text-gray-400" />
          <input name="role" value={filters.role} onChange={handleInputChange} placeholder="Role" className="input pl-10" />
        </div>
        <div className="relative">
          <FaTint className="absolute left-3 top-3 text-gray-400" />
          <input name="bloodtype" value={filters.bloodtype} onChange={handleInputChange} placeholder="Nhóm máu" className="input pl-10" />
        </div>
        <div className="relative">
          <FaCheckCircle className="absolute left-3 top-3 text-gray-400" />
          <select name="userStatus" value={filters.userStatus} onChange={handleInputChange} className="input pl-10">
            <option value="">Tất cả trạng thái tài khoản</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div className="relative">
          <FaCheckCircle className="absolute left-3 top-3 text-gray-400" />
          <select name="profileStatus" value={filters.profileStatus} onChange={handleInputChange} className="input pl-10">
            <option value="">Tất cả trạng thái hồ sơ</option>
            <option value="Sẵn sàng hiến máu">Sẵn sàng hiến máu</option>
            <option value="Đang nghỉ ngơi">Đang nghỉ ngơi</option>
            <option value="Không sẵn sàng">Không sẵn sàng</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary flex items-center gap-2"><FaSearch /> Tìm kiếm</button>
      </form>
      {error && <div className="text-red-600 mb-4 whitespace-pre-wrap">{error}</div>}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Modal xác nhận xóa user */}
      {showDeleteConfirmModal && pendingDeleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <FaTrash className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Xác nhận xóa người dùng
                </h3>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Bạn có chắc chắn muốn xóa người dùng <span className="font-semibold text-gray-900">"{pendingDeleteUser.username}"</span>?
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Hành động này không thể hoàn tác. Tất cả thông tin của người dùng này sẽ bị xóa vĩnh viễn.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeleteUser}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200 flex items-center"
              >
                <FaTrash className="mr-2" />
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-[1400px] w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer" onClick={handleSort}>
                Username {filters.sortOrder === 'asc' ? '▲' : '▼'}
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Họ tên</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Vai trò</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Trạng thái tài khoản</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Trạng thái hồ sơ</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8"><span className="animate-spin inline-block mr-2"><FaUser /></span>Đang tải...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8">Không có kết quả</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.username} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2 font-medium text-gray-900">{u.username}</td>
                  <td className="px-4 py-2 text-gray-700">{u.email}</td>
                  <td className="px-4 py-2 text-gray-700">{u.fullName || u.fullname}</td>
                  <td className="px-4 py-2">
                    <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">{u.role}</span>
                  </td>
                  <td className="px-4 py-2">
                    {u.userStatus ? (
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold
                        ${u.userStatus === 'Active' ? 'bg-green-100 text-green-700' :
                          u.userStatus === 'Inactive' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'}`}
                      >
                        {u.userStatus}
                      </span>
                    ) : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-2">
                    {u.profileStatus ? (
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold
                        ${u.profileStatus === 'Sẵn sàng hiến máu' ? 'bg-green-100 text-green-700' :
                          u.profileStatus === 'Đang nghỉ ngơi' ? 'bg-yellow-100 text-yellow-700' :
                          u.profileStatus === 'Không sẵn sàng' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'}`}
                      >
                        {u.profileStatus}
                      </span>
                    ) : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button title="Xem chi tiết" onClick={() => setDetailUser(u)} className="text-green-600 hover:text-green-800 p-2 rounded-full transition border border-green-200 hover:shadow-lg" >
                        <FaUser className="w-5 h-5" />
                      </button>
                      <button title="Sửa user" onClick={() => handleEditUser(u)} className="text-blue-600 hover:text-blue-800 p-2 rounded-full transition border border-blue-200 hover:shadow-lg" >
                        <FaEdit className="w-5 h-5" />
                      </button>
                      <button title="Xóa user" onClick={() => handleDeleteUser(u.username)} className="text-red-600 hover:text-red-800 p-2 rounded-full transition border border-red-200 hover:shadow-lg" >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-6 flex justify-between items-center gap-4">
        <button onClick={() => handlePageChange(-1)} disabled={filters.page === 1} className="btn flex items-center gap-1 disabled:opacity-50"><FaChevronLeft /> Trước</button>
        <span className="text-gray-700 font-medium">Trang {filters.page} / {totalPages}</span>
        <button onClick={() => handlePageChange(1)} disabled={filters.page === totalPages} className="btn flex items-center gap-1 disabled:opacity-50">Sau <FaChevronRight /></button>
      </div>

      {/* Modal tạo tài khoản */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowCreateModal(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-4 text-green-700 flex items-center gap-2"><FaPlus /> Tạo tài khoản mới</h3>
            
            {/* API Error Display */}
            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2">
                  <FaTimesCircle className="text-red-500" />
                  <p className="text-red-700 font-medium">{apiError}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Username <span className="text-red-500">*</span></label>
                                     <input 
                     name="username" 
                     value={createForm.username} 
                     onChange={handleCreateFormChange} 
                     onBlur={(e) => validateField('username', e.target.value)}
                     className={`input w-full ${createErrors.username ? 'border-red-500' : ''}`}
                     required 
                   />
                  {createErrors.username && <p className="text-red-500 text-xs mt-1">{createErrors.username}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mật khẩu <span className="text-red-500">*</span></label>
                                     <input 
                     name="password" 
                     type="password"
                     value={createForm.password} 
                     onChange={handleCreateFormChange} 
                     onBlur={(e) => validateField('password', e.target.value)}
                     className={`input w-full ${createErrors.password ? 'border-red-500' : ''}`}
                     required 
                   />
                  {createErrors.password && <p className="text-red-500 text-xs mt-1">{createErrors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email <span className="text-red-500">*</span></label>
                                     <input 
                     name="email" 
                     type="email"
                     value={createForm.email} 
                     onChange={handleCreateFormChange} 
                     onBlur={(e) => validateField('email', e.target.value)}
                     className={`input w-full ${createErrors.email ? 'border-red-500' : ''}`}
                     required 
                   />
                  {createErrors.email && <p className="text-red-500 text-xs mt-1">{createErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Vai trò <span className="text-red-500">*</span></label>
                                     <select 
                     name="role" 
                     value={createForm.role} 
                     onChange={handleCreateFormChange} 
                     onBlur={(e) => validateField('role', e.target.value)}
                     className={`input w-full ${createErrors.role ? 'border-red-500' : ''}`}
                     required
                   >
                    <option value="Staff">Staff</option>
                    <option value="Admin">Admin</option>
                  </select>
                  {createErrors.role && <p className="text-red-500 text-xs mt-1">{createErrors.role}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Họ tên <span className="text-red-500">*</span></label>
                                     <input 
                     name="fullName" 
                     value={createForm.fullName} 
                     onChange={handleCreateFormChange} 
                     onBlur={(e) => validateField('fullName', e.target.value)}
                     className={`input w-full ${createErrors.fullName ? 'border-red-500' : ''}`}
                     required 
                   />
                  {createErrors.fullName && <p className="text-red-500 text-xs mt-1">{createErrors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ngày sinh <span className="text-red-500">*</span></label>
                                     <input 
                     name="dateOfBirth" 
                     type="date"
                     value={createForm.dateOfBirth} 
                     onChange={handleCreateFormChange} 
                     onBlur={(e) => validateField('dateOfBirth', e.target.value)}
                     className={`input w-full ${createErrors.dateOfBirth ? 'border-red-500' : ''}`}
                     required 
                   />
                  {createErrors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{createErrors.dateOfBirth}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Giới tính <span className="text-red-500">*</span></label>
                                     <select 
                     name="gender" 
                     value={createForm.gender} 
                     onChange={handleCreateFormChange} 
                     onBlur={(e) => validateField('gender', e.target.value)}
                     className={`input w-full ${createErrors.gender ? 'border-red-500' : ''}`}
                     required
                   >
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                  {createErrors.gender && <p className="text-red-500 text-xs mt-1">{createErrors.gender}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                                     <input 
                     name="phone" 
                     value={createForm.phone} 
                     onChange={handleCreateFormChange} 
                     onBlur={(e) => validateField('phone', e.target.value)}
                     className={`input w-full ${createErrors.phone ? 'border-red-500' : ''}`}
                     required 
                   />
                  {createErrors.phone && <p className="text-red-500 text-xs mt-1">{createErrors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Địa chỉ <span className="text-red-500">*</span></label>
                                     <input 
                     name="address" 
                     value={createForm.address} 
                     onChange={handleCreateFormChange} 
                     onBlur={(e) => validateField('address', e.target.value)}
                     className={`input w-full ${createErrors.address ? 'border-red-500' : ''}`}
                     required 
                   />
                  {createErrors.address && <p className="text-red-500 text-xs mt-1">{createErrors.address}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nhóm máu <span className="text-red-500">*</span></label>
                                     <select 
                     name="bloodType" 
                     value={createForm.bloodType} 
                     onChange={handleCreateFormChange} 
                     onBlur={(e) => validateField('bloodType', e.target.value)}
                     className={`input w-full ${createErrors.bloodType ? 'border-red-500' : ''}`}
                     required
                   >
                    <option value="">Chọn nhóm máu</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                  {createErrors.bloodType && <p className="text-red-500 text-xs mt-1">{createErrors.bloodType}</p>}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={creating}
                >
                  {creating ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa user */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setEditingUser(null)}>&times;</button>
            <h3 className="text-xl font-bold mb-4 text-blue-700 flex items-center gap-2"><FaEdit /> Chỉnh sửa người dùng</h3>
            <form onSubmit={handleEditFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input name="email" value={editForm.email} onChange={handleEditFormChange} className="input w-full" required type="email" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Vai trò</label>
                  <select name="role" value={editForm.role} onChange={handleEditFormChange} className="input w-full" required>
                    <option value="User">User</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Họ tên</label>
                  <input name="fullName" value={editForm.fullName} onChange={handleEditFormChange} className="input w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ngày sinh</label>
                  <input name="dateOfBirth" value={editForm.dateOfBirth} onChange={handleEditFormChange} className="input w-full" type="date" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Giới tính</label>
                  <select name="gender" value={editForm.gender} onChange={handleEditFormChange} className="input w-full">
                    <option value="">--</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                  <input name="phone" value={editForm.phone} onChange={handleEditFormChange} className="input w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                  <input name="address" value={editForm.address} onChange={handleEditFormChange} className="input w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Trạng thái tài khoản</label>
                  <select name="userStatus" value={editForm.userStatus} onChange={handleEditFormChange} className="input w-full">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Deleted">Deleted</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Trạng thái hồ sơ</label>
                  <select name="profileStatus" value={editForm.profileStatus} onChange={handleEditFormChange} className="input w-full">
                    <option value="Sẵn sàng hiến máu">Sẵn sàng hiến máu</option>
                    <option value="Đang nghỉ ngơi">Đang nghỉ ngơi</option>
                    <option value="Không sẵn sàng">Không sẵn sàng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nhóm máu</label>
                  <input name="bloodType" value={editForm.bloodType} onChange={handleEditFormChange} className="input w-full" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="btn" onClick={() => setEditingUser(null)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal xem chi tiết user */}
      {detailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setDetailUser(null)}>&times;</button>
            <h3 className="text-xl font-bold mb-4 text-green-700 flex items-center gap-2"><FaUser /> Thông tin chi tiết người dùng</h3>
            <div className="space-y-2">
              <div><b>Username:</b> {detailUser.username}</div>
              <div><b>Email:</b> {detailUser.email}</div>
              <div><b>Họ tên:</b> {detailUser.fullName || detailUser.fullname}</div>
              <div><b>Vai trò:</b> {detailUser.role}</div>
              <div><b>Trạng thái tài khoản:</b> {detailUser.userStatus || '-'}</div>
              <div><b>Trạng thái hồ sơ:</b> {detailUser.profileStatus || '-'}</div>
              <div><b>Ngày sinh:</b> {detailUser.dateOfBirth ? new Date(detailUser.dateOfBirth).toLocaleDateString('vi-VN') : '-'}</div>
              <div><b>Giới tính:</b> {detailUser.gender || '-'}</div>
              <div><b>Số điện thoại:</b> {detailUser.phone || '-'}</div>
              <div><b>Địa chỉ:</b> {detailUser.address || '-'}</div>
              <div><b>Nhóm máu:</b> {detailUser.bloodType || detailUser.bloodtype || '-'}</div>
              <div><b>Tổng lịch hẹn:</b> {detailUser.totalAppointments ?? 0}</div>
              <div><b>Tổng hiến máu:</b> {detailUser.totalDonations ?? 0}</div>
              <div><b>Lần đăng nhập cuối:</b> {detailUser.lastLoginDate ? new Date(detailUser.lastLoginDate).toLocaleString('vi-VN') : '-'}</div>
              <div><b>Ngày tạo:</b> {detailUser.createdDate ? new Date(detailUser.createdDate).toLocaleString('vi-VN') : '-'}</div>
            </div>
            <div className="flex justify-end mt-6">
              <button className="btn" onClick={() => setDetailUser(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers; 