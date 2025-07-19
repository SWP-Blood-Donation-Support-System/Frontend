import React, { useState, useEffect } from 'react';
import { apiCall } from '../utils/api';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaClock, FaInfinity, FaExclamationTriangle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const DeferralReasonManagement = () => {
  const [deferralReasons, setDeferralReasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('reasonCode');
  const [sortOrder, setSortOrder] = useState('asc');

  // Form states
  const [formData, setFormData] = useState({
    reasonCode: '',
    reasonText: '',
    note: '',
    minDays: 0,
    minHours: 0,
    minMinutes: 0,
    isPermanent: false
  });

  // Validation states
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchDeferralReasons();
  }, []);

  const fetchDeferralReasons = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/DeferralReason/get-all');
      setDeferralReasons(response);
    } catch (err) {
      setError('Không thể tải danh sách lý do hoãn hiến máu');
      console.error('Error fetching deferral reasons:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate reasonCode
    if (!formData.reasonCode.trim()) {
      newErrors.reasonCode = 'Mã lý do không được để trống';
    } else if (!/^[A-Z_]{2,20}$/.test(formData.reasonCode)) {
      newErrors.reasonCode = 'Mã lý do chỉ được chứa chữ hoa và dấu gạch dưới, từ 2-20 ký tự';
    }

    // Validate reasonText
    if (!formData.reasonText.trim()) {
      newErrors.reasonText = 'Mô tả lý do không được để trống';
    } else if (formData.reasonText.length < 5 || formData.reasonText.length > 200) {
      newErrors.reasonText = 'Mô tả lý do phải từ 5-200 ký tự';
    }

    // Validate note
    if (formData.note && formData.note.length > 500) {
      newErrors.note = 'Ghi chú không được quá 500 ký tự';
    }

    // Validate time fields
    if (formData.minDays < 0 || formData.minDays > 365) {
      newErrors.minDays = 'Số ngày phải từ 0-365';
    }

    if (formData.minHours < 0 || formData.minHours > 23) {
      newErrors.minHours = 'Số giờ phải từ 0-23';
    }

    if (formData.minMinutes < 0 || formData.minMinutes > 59) {
      newErrors.minMinutes = 'Số phút phải từ 0-59';
    }

    // Validate that at least one time field is set if not permanent
    if (!formData.isPermanent) {
      if (formData.minDays === 0 && formData.minHours === 0 && formData.minMinutes === 0) {
        newErrors.minDays = 'Phải có ít nhất một giá trị thời gian nếu không phải vĩnh viễn';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const payload = {
        ...formData,
        minDays: parseInt(formData.minDays) || 0,
        minHours: parseInt(formData.minHours) || 0,
        minMinutes: parseInt(formData.minMinutes) || 0
      };

      await apiCall('/DeferralReason/create', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setShowCreateModal(false);
      resetForm();
      fetchDeferralReasons();
    } catch (err) {
      setError('Không thể tạo lý do hoãn hiến máu');
      console.error('Error creating deferral reason:', err);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const payload = {
        ...formData,
        minDays: parseInt(formData.minDays) || 0,
        minHours: parseInt(formData.minHours) || 0,
        minMinutes: parseInt(formData.minMinutes) || 0
      };

      await apiCall('/DeferralReason/update', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      setShowEditModal(false);
      resetForm();
      fetchDeferralReasons();
    } catch (err) {
      setError('Không thể cập nhật lý do hoãn hiến máu');
      console.error('Error updating deferral reason:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await apiCall(`/DeferralReason/delete/${selectedReason.reasonCode}`, {
        method: 'DELETE'
      });
      setShowDeleteModal(false);
      setSelectedReason(null);
      fetchDeferralReasons();
    } catch (err) {
      setError('Không thể xóa lý do hoãn hiến máu');
      console.error('Error deleting deferral reason:', err);
    }
  };

  const openEditModal = (reason) => {
    setSelectedReason(reason);
    setFormData({
      reasonCode: reason.reasonCode,
      reasonText: reason.reasonText,
      note: reason.note || '',
      minDays: reason.minDays || 0,
      minHours: reason.minHours || 0,
      minMinutes: reason.minMinutes || 0,
      isPermanent: reason.isPermanent || false
    });
    setErrors({});
    setShowEditModal(true);
  };

  const openDeleteModal = (reason) => {
    setSelectedReason(reason);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      reasonCode: '',
      reasonText: '',
      note: '',
      minDays: 0,
      minHours: 0,
      minMinutes: 0,
      isPermanent: false
    });
    setErrors({});
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const filteredAndSortedReasons = deferralReasons
    .filter(reason =>
      reason.reasonCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reason.reasonText.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'isPermanent') {
        aValue = aValue ? 1 : 0;
        bValue = bValue ? 1 : 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const formatTime = (days, hours, minutes) => {
    const parts = [];
    if (days > 0) parts.push(`${days} ngày`);
    if (hours > 0) parts.push(`${hours} giờ`);
    if (minutes > 0) parts.push(`${minutes} phút`);
    return parts.length > 0 ? parts.join(' ') : '0 phút';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Quản lý lý do hoãn hiến máu
              </h1>
              <p className="text-lg text-gray-600">
                Quản lý các lý do hoãn hiến máu và thời gian chờ
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3 self-start"
            >
              <FaPlus className="text-lg" />
              Thêm lý do mới
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng số lý do</p>
                <p className="text-3xl font-bold text-gray-900">{deferralReasons.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaExclamationTriangle className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lý do vĩnh viễn</p>
                <p className="text-3xl font-bold text-red-600">
                  {deferralReasons.filter(r => r.isPermanent).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <FaInfinity className="text-red-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lý do tạm thời</p>
                <p className="text-3xl font-bold text-green-600">
                  {deferralReasons.filter(r => !r.isPermanent).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FaClock className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center">
              <FaTimesCircle className="h-5 w-5 text-red-400 mr-3" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Tìm theo mã hoặc mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              >
                <option value="reasonCode">Mã lý do</option>
                <option value="reasonText">Mô tả</option>
                <option value="isPermanent">Loại</option>
                <option value="minDays">Thời gian chờ</option>
              </select>
            </div>
            <div>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              >
                <option value="asc">Tăng dần</option>
                <option value="desc">Giảm dần</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-red-50 to-red-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-red-800 uppercase tracking-wider">
                    Mã lý do
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-red-800 uppercase tracking-wider">
                    Mô tả
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-red-800 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-red-800 uppercase tracking-wider">
                    Thời gian chờ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-red-800 uppercase tracking-wider">
                    Ghi chú
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-red-800 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredAndSortedReasons.map((reason, index) => (
                  <tr key={reason.id} className={`hover:bg-red-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                        {reason.reasonCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 font-medium">{reason.reasonText}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        reason.isPermanent 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {reason.isPermanent ? (
                          <>
                            <FaInfinity className="mr-1" />
                            Vĩnh viễn
                          </>
                        ) : (
                          <>
                            <FaClock className="mr-1" />
                            Tạm thời
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-medium">
                        {reason.isPermanent 
                          ? (
                            <span className="text-red-600 font-semibold">Vĩnh viễn</span>
                          )
                          : formatTime(reason.minDays, reason.minHours, reason.minMinutes)
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {reason.note || (
                          <span className="text-gray-400 italic">Không có ghi chú</span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(reason)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                        >
                          <FaEdit className="mr-1" />
                          Sửa
                        </button>
                        <button
                          onClick={() => openDeleteModal(reason)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                        >
                          <FaTrash className="mr-1" />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAndSortedReasons.length === 0 && (
            <div className="text-center py-16">
              <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                <FaExclamationTriangle className="h-full w-full" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không có lý do hoãn hiến máu</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                {searchTerm ? 'Không tìm thấy kết quả phù hợp với từ khóa tìm kiếm.' : 'Bắt đầu bằng cách thêm lý do hoãn hiến máu mới.'}
              </p>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Thêm lý do hoãn hiến máu mới</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <FaTimesCircle className="text-xl" />
                  </button>
                </div>
                <form onSubmit={handleCreate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Mã lý do *
                      </label>
                      <input
                        type="text"
                        value={formData.reasonCode}
                        onChange={(e) => setFormData({...formData, reasonCode: e.target.value})}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
                          errors.reasonCode ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="VD: RECENT_SURGERY"
                      />
                      {errors.reasonCode && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <FaTimesCircle className="mr-1" />
                          {errors.reasonCode}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Mô tả lý do *
                      </label>
                      <textarea
                        value={formData.reasonText}
                        onChange={(e) => setFormData({...formData, reasonText: e.target.value})}
                        rows={3}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
                          errors.reasonText ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Mô tả chi tiết lý do hoãn hiến máu"
                      />
                      {errors.reasonText && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <FaTimesCircle className="mr-1" />
                          {errors.reasonText}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ghi chú
                      </label>
                      <textarea
                        value={formData.note}
                        onChange={(e) => setFormData({...formData, note: e.target.value})}
                        rows={2}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
                          errors.note ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ghi chú bổ sung (tùy chọn)"
                      />
                      {errors.note && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <FaTimesCircle className="mr-1" />
                          {errors.note}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                        <input
                          type="checkbox"
                          id="isPermanent"
                          checked={formData.isPermanent}
                          onChange={(e) => setFormData({...formData, isPermanent: e.target.checked})}
                          className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isPermanent" className="ml-3 block text-sm font-semibold text-gray-900">
                          <FaInfinity className="inline mr-2 text-red-600" />
                          Vĩnh viễn
                        </label>
                      </div>
                    </div>

                    {!formData.isPermanent && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Thời gian chờ
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ngày
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="365"
                              value={formData.minDays}
                              onChange={(e) => setFormData({...formData, minDays: parseInt(e.target.value) || 0})}
                              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
                                errors.minDays ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="0-365"
                            />
                            {errors.minDays && (
                              <p className="mt-2 text-sm text-red-600 flex items-center">
                                <FaTimesCircle className="mr-1" />
                                {errors.minDays}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Giờ
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="23"
                              value={formData.minHours}
                              onChange={(e) => setFormData({...formData, minHours: parseInt(e.target.value) || 0})}
                              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
                                errors.minHours ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="0-23"
                            />
                            {errors.minHours && (
                              <p className="mt-2 text-sm text-red-600 flex items-center">
                                <FaTimesCircle className="mr-1" />
                                {errors.minHours}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Phút
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="59"
                              value={formData.minMinutes}
                              onChange={(e) => setFormData({...formData, minMinutes: parseInt(e.target.value) || 0})}
                              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
                                errors.minMinutes ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="0-59"
                            />
                            {errors.minMinutes && (
                              <p className="mt-2 text-sm text-red-600 flex items-center">
                                <FaTimesCircle className="mr-1" />
                                {errors.minMinutes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl transition-all duration-200 transform hover:scale-105"
                    >
                      <FaPlus className="inline mr-2" />
                      Tạo
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Chỉnh sửa lý do hoãn hiến máu</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <FaTimesCircle className="text-xl" />
                  </button>
                </div>
                <form onSubmit={handleEdit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Mã lý do *
                      </label>
                      <input
                        type="text"
                        value={formData.reasonCode}
                        onChange={(e) => setFormData({...formData, reasonCode: e.target.value})}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
                          errors.reasonCode ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="VD: RECENT_SURGERY"
                      />
                      {errors.reasonCode && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <FaTimesCircle className="mr-1" />
                          {errors.reasonCode}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Mô tả lý do *
                      </label>
                      <textarea
                        value={formData.reasonText}
                        onChange={(e) => setFormData({...formData, reasonText: e.target.value})}
                        rows={3}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
                          errors.reasonText ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Mô tả chi tiết lý do hoãn hiến máu"
                      />
                      {errors.reasonText && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <FaTimesCircle className="mr-1" />
                          {errors.reasonText}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ghi chú
                      </label>
                      <textarea
                        value={formData.note}
                        onChange={(e) => setFormData({...formData, note: e.target.value})}
                        rows={2}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
                          errors.note ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ghi chú bổ sung (tùy chọn)"
                      />
                      {errors.note && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <FaTimesCircle className="mr-1" />
                          {errors.note}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                        <input
                          type="checkbox"
                          id="editIsPermanent"
                          checked={formData.isPermanent}
                          onChange={(e) => setFormData({...formData, isPermanent: e.target.checked})}
                          className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label htmlFor="editIsPermanent" className="ml-3 block text-sm font-semibold text-gray-900">
                          <FaInfinity className="inline mr-2 text-red-600" />
                          Vĩnh viễn
                        </label>
                      </div>
                    </div>

                    {!formData.isPermanent && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Thời gian chờ
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ngày
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="365"
                              value={formData.minDays}
                              onChange={(e) => setFormData({...formData, minDays: parseInt(e.target.value) || 0})}
                              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
                                errors.minDays ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="0-365"
                            />
                            {errors.minDays && (
                              <p className="mt-2 text-sm text-red-600 flex items-center">
                                <FaTimesCircle className="mr-1" />
                                {errors.minDays}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Giờ
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="23"
                              value={formData.minHours}
                              onChange={(e) => setFormData({...formData, minHours: parseInt(e.target.value) || 0})}
                              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
                                errors.minHours ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="0-23"
                            />
                            {errors.minHours && (
                              <p className="mt-2 text-sm text-red-600 flex items-center">
                                <FaTimesCircle className="mr-1" />
                                {errors.minHours}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Phút
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="59"
                              value={formData.minMinutes}
                              onChange={(e) => setFormData({...formData, minMinutes: parseInt(e.target.value) || 0})}
                              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
                                errors.minMinutes ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="0-59"
                            />
                            {errors.minMinutes && (
                              <p className="mt-2 text-sm text-red-600 flex items-center">
                                <FaTimesCircle className="mr-1" />
                                {errors.minMinutes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-200 transform hover:scale-105"
                    >
                      <FaEdit className="inline mr-2" />
                      Cập nhật
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto">
              <div className="p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                  <FaExclamationTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Xác nhận xóa</h3>
                <div className="mb-6">
                  <p className="text-gray-600 mb-3">
                    Bạn có chắc chắn muốn xóa lý do hoãn hiến máu 
                    <span className="font-semibold text-gray-900"> "{selectedReason?.reasonCode}" </span>
                    không?
                  </p>
                  {selectedReason?.isPermanent && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                      <div className="flex items-center text-red-800">
                        <FaInfinity className="mr-2" />
                        <span className="font-semibold">Đây là lý do vĩnh viễn!</span>
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-red-600 font-medium">
                    ⚠️ Hành động này không thể hoàn tác.
                  </p>
                </div>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <FaTrash className="inline mr-2" />
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeferralReasonManagement; 