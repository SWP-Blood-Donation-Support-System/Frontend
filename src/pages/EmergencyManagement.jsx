import React, { useEffect, useState } from 'react';
import { getAuthToken, getUser } from '../utils/api';
import { FaUser, FaCalendarAlt, FaTint, FaInfoCircle, FaHospital, FaStickyNote, FaImage, FaSearch, FaSort, FaSortUp, FaSortDown, FaCheck, FaTimes, FaEye, FaCheckCircle, FaTimesCircle, FaArrowDown, FaArrowUp, FaExclamationTriangle } from 'react-icons/fa';
import Toast from '../components/Toast';

const EmergencyManagement = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('emergencyStatus');
  const [sortOrder, setSortOrder] = useState('asc');
  const [approvalStatus, setApprovalStatus] = useState('');
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [showBloodComparisonModal, setShowBloodComparisonModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const user = getUser();
  const isAdminOrStaff = user && (user.role === 'Admin' || user.role === 'Staff');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [transferLoading, setTransferLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (isAdminOrStaff) {
      fetchEmergencies();
      fetchHospitals();
    }
  }, []);

  const fetchHospitals = async () => {
    try {
      const res = await fetch('https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/Hospital/GetAll');
      if (!res.ok) throw new Error('Không thể tải danh sách bệnh viện');
      const data = await res.json();
      setHospitals(data);
    } catch (err) {
      console.error('Lỗi tải danh sách bệnh viện:', err);
      setHospitals([]);
    }
  };

  const getHospitalName = (hospitalId) => {
    const hospital = hospitals.find(h => h.id === hospitalId || h.hospitalId === hospitalId);
    return hospital ? (hospital.name || hospital.hospitalName) : `ID: ${hospitalId}`;
  };

  const fetchEmergencies = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/Emergency/GetEmergencies', {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setEmergencies(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (emergencyId, status) => {
    if (status !== 'Đã xét duyệt' && status !== 'Từ chối') {
      setToastMessage('Vui lòng nhập chính xác "Đã xét duyệt" hoặc "Từ chối"');
      setToastType('error');
      setShowToast(true);
      return;
    }

    setApprovalLoading(true);
    try {
      const response = await fetch(`https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/Emergency/UpdateStatus/${emergencyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(status),
      });

      if (!response.ok) {
        throw new Error('Cập nhật trạng thái thất bại');
      }

      // Refresh the emergencies list
      await fetchEmergencies();
      
      // Create notification if approved
      if (status === 'Đã xét duyệt') {
        await createNotification(emergencyId, 'Đơn khẩn cấp đã được xét duyệt');
      }

      setToastMessage(`Đã ${status.toLowerCase()} đơn khẩn cấp thành công!`);
      setToastType('success');
      setShowToast(true);
      setShowApprovalModal(false);
      setApprovalStatus('');
      setSelectedEmergency(null);
    } catch (error) {
      setToastMessage(`Lỗi: ${error.message}`);
      setToastType('error');
      setShowToast(true);
    } finally {
      setApprovalLoading(false);
    }
  };

  const createNotification = async (emergencyId, message) => {
    try {
      const response = await fetch('https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/Notification/CreateNotification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          title: 'Thông báo đơn khẩn cấp',
          message: message,
          type: 'Emergency',
          referenceId: emergencyId,
          isRead: false
        }),
      });

      if (!response.ok) {
        console.error('Failed to create notification');
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const openApprovalModal = (emergency) => {
    setSelectedEmergency(emergency);
    setShowApprovalModal(true);
    setApprovalStatus('');
  };

  const openDetailModal = (emergency) => {
    setSelectedEmergency(emergency);
    setShowDetailModal(true);
  };

  const viewBloodComparison = async (emergencyId) => {
    try {
      // Tìm emergency object từ danh sách để có đầy đủ thông tin
      const emergency = emergencies.find(e => (e.emergencyId || e.id) == emergencyId);
      if (!emergency) {
        throw new Error('Không tìm thấy đơn khẩn cấp');
      }

      const response = await fetch(`https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/Emergency/CompareBlood/${emergencyId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể lấy thông tin so sánh máu');
      }

      const data = await response.json();
      console.log('Blood comparison response:', data);
      
      // Hiển thị thông tin so sánh máu trong modal với đầy đủ thông tin emergency
      setSelectedEmergency({ ...emergency, bloodComparison: data });
      setShowBloodComparisonModal(true);
    } catch (error) {
      setToastMessage(`Lỗi: ${error.message}`);
      setToastType('error');
      setShowToast(true);
    }
  };

  // Search & sort logic
  const handleSearch = (e) => setSearch(e.target.value);
  const handleSort = (field) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('asc'); }
  };

  const filtered = emergencies.filter(item => {
    const s = search.toLowerCase();
    const matchesSearch = (
      (item.username || '').toLowerCase().includes(s) ||
      (item.bloodType || '').toLowerCase().includes(s) ||
      (item.hospitalId + '').includes(s) ||
      (item.hospitalName || '').toLowerCase().includes(s) ||
      (item.emergencyNote || '').toLowerCase().includes(s)
    );
    
    const matchesStatus = statusFilter === 'all' || item.emergencyStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    // Nếu sortField là emergencyStatus, sử dụng thứ tự tùy chỉnh
    if (sortField === 'emergencyStatus') {
      const statusOrder = {
        'Chờ xét duyệt': 1,
        'Đã xét duyệt': 2,
        'Lượng máu đang được chuyển đến': 3,
        'Đã được đáp ứng': 4,
        'Từ chối': 5,
        'Đã quá hạn': 6
      };
      
      const aStatus = a.emergencyStatus || 'Chờ xét duyệt';
      const bStatus = b.emergencyStatus || 'Chờ xét duyệt';
      
      const aOrder = statusOrder[aStatus] || 999;
      const bOrder = statusOrder[bStatus] || 999;
      
      if (aOrder !== bOrder) {
        return sortOrder === 'asc' ? aOrder - bOrder : bOrder - aOrder;
      }
    }
    
    // Xử lý các trường khác như bình thường
    let v1 = a[sortField], v2 = b[sortField];
    if (sortField === 'emergencyDate' || sortField === 'endDate') {
      v1 = v1 ? new Date(v1) : 0;
      v2 = v2 ? new Date(v2) : 0;
    }
    if (sortField === 'emergencyStatus') {
      v1 = v1 || '';
      v2 = v2 || '';
    }
    if (v1 < v2) return sortOrder === 'asc' ? -1 : 1;
    if (v1 > v2) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  if (!isAdminOrStaff) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow text-center">
        <h2 className="text-xl font-bold mb-2 text-red-700">Bạn không có quyền truy cập trang này</h2>
      </div>
    );
  }

  // Hàm chuyển máu
  const handleTransferBlood = async () => {
    if (!selectedEmergency || !selectedEmergency.bloodComparison) return;
    setTransferLoading(true);
    try {
      // Always get all 4 fields, fallback to selectedEmergency, and provide defaults if missing
      const bloodType =
        selectedEmergency.bloodComparison.bloodType ||
        selectedEmergency.bloodType ||
        (Array.isArray(selectedEmergency.bloodComparison.details) && selectedEmergency.bloodComparison.details.length > 0
          ? selectedEmergency.bloodComparison.details[0].bloodType
          : '') || '';
      // Ensure requiredUnits is a number
      let requiredUnits = selectedEmergency.bloodComparison.requiredUnits ?? selectedEmergency.requiredUnits;
      requiredUnits = Number(requiredUnits) || 0;
      // Ensure hospitalId is a number
      let hospitalId = selectedEmergency.hospitalId;
      hospitalId = Number(hospitalId) || 1;
      // Note: lấy từ emergencyNote nếu có, không thì sinh tự động
      const note = selectedEmergency.emergencyNote && selectedEmergency.emergencyNote.trim().length > 0
        ? selectedEmergency.emergencyNote
        : `Chuyển máu cho đơn khẩn cấp #${selectedEmergency.emergencyId || selectedEmergency.id || ''}`;

      // Bước 1: Chuyển máu từ kho
      const transferRes = await fetch('https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/blood-inventory/use', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          bloodType,
          requiredUnits,
          note,
          hospitalId,
        }),
      });
      
      if (!transferRes.ok) {
        const errorData = await transferRes.text();
        throw new Error(`Chuyển máu thất bại: ${errorData}`);
      }

      // Bước 2: Cập nhật trạng thái đơn khẩn cấp thành "Lượng máu đang được chuyển đến"
      const emergencyId = selectedEmergency.emergencyId;
      if (!emergencyId) {
        throw new Error('Không tìm thấy emergencyId');
      }
      
      const statusRes = await fetch(`https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/Emergency/SetStatusTransferring/${emergencyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!statusRes.ok) {
        const errorData = await statusRes.text();
        console.warn('Cập nhật trạng thái thất bại:', errorData);
        // Không throw error vì chuyển máu đã thành công, chỉ cảnh báo
      }

      setToastMessage('Chuyển máu thành công và đã cập nhật trạng thái đơn khẩn cấp!');
      setToastType('success');
      setShowToast(true);
      setShowBloodComparisonModal(false);
      setSelectedEmergency(null);
      await fetchEmergencies();
    } catch (err) {
      setToastMessage(err.message || 'Có lỗi khi chuyển máu');
      setToastType('error');
      setShowToast(true);
    } finally {
      setTransferLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-red-50 to-white py-8 px-2 md:px-8">
      <div className="w-full mb-10">
        <h2 className="text-4xl md:text-5xl font-extrabold text-red-700 tracking-wide flex items-center gap-4 mb-6 pl-2">
          <FaTint className="text-5xl text-red-500" />
          Quản lý đơn khẩn cấp
        </h2>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 w-full">
          <div className="flex flex-col gap-2 w-full md:w-1/2">
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 border border-gray-200 shadow-sm">
              <FaSearch className="text-gray-400 text-lg" />
              <input value={search} onChange={handleSearch} placeholder="Tìm kiếm theo tên, nhóm máu, bệnh viện, ghi chú..." className="input w-full bg-transparent border-0 focus:ring-0 text-base" />
            </div>
            {/* <div className="text-xs text-gray-500 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
              <strong>Thứ tự mặc định:</strong> Chờ xét duyệt → Đã xét duyệt → Đang chuyển máu → Đã đáp ứng → Từ chối → Đã quá hạn
            </div> */}
          </div>
          <div className="flex gap-3 items-center w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm bg-white shadow-sm"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Chờ xét duyệt">Chờ xét duyệt</option>
              <option value="Đã xét duyệt">Đã xét duyệt</option>
              <option value="Từ chối">Từ chối</option>
              <option value="Lượng máu đang được chuyển đến">Lượng máu đang được chuyển đến</option>
              <option value="Đã được đáp ứng">Đã được đáp ứng</option>
              <option value="Đã quá hạn">Đã quá hạn</option>
            </select>
            <button 
              className={`inline-flex items-center px-4 py-3 text-sm font-medium rounded-xl border transition-colors duration-200 ${
                sortField==='emergencyDate' 
                  ? 'bg-red-100 text-red-700 border-red-300 shadow-sm' 
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 shadow-sm'
              }`} 
              onClick={()=>handleSort('emergencyDate')}
            >
              <FaCalendarAlt className="w-4 h-4 mr-2" />
              Ngày tạo 
              {sortField==='emergencyDate' && (sortOrder==='asc'?<FaSortUp className="w-3 h-3 ml-1"/>:<FaSortDown className="w-3 h-3 ml-1"/>)}
            </button>
          </div>
        </div>
      </div>
      <div className="w-full">
        {loading ? (
          <div className="text-center text-gray-500 py-20 text-xl font-semibold">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="text-center text-red-600 py-20 text-xl font-semibold">{error}</div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border-2 border-red-100 shadow-2xl bg-white">
            <table className="min-w-full bg-white text-base rounded-3xl overflow-hidden">
              <thead className="sticky top-0 z-10 bg-gradient-to-r from-red-100 to-red-50 shadow-md">
                <tr>
                  <th className="px-6 py-4 text-center font-bold">ID</th>
                  <th className="px-6 py-4 text-center font-bold"><FaUser className="inline mr-1 text-red-500"/>Người tạo</th>
                  <th className="px-6 py-4 text-center font-bold cursor-pointer" onClick={()=>handleSort('emergencyDate')}> <span className="flex items-center justify-center gap-1"> <FaCalendarAlt className="inline text-red-500"/>Ngày tạo {sortField==='emergencyDate' && (sortOrder==='asc'?<FaSortUp/>:<FaSortDown/>)} </span></th>
                  <th className="px-6 py-4 text-center font-bold"><FaTint className="inline mr-1 text-red-500"/>Nhóm máu</th>
                  <th className="px-6 py-4 text-center font-bold cursor-pointer" onClick={()=>handleSort('emergencyStatus')}> <span className="flex items-center justify-center gap-1">Trạng thái {sortField==='emergencyStatus' && (sortOrder==='asc'?<FaSortUp/>:<FaSortDown/>)} {sortField==='emergencyStatus' && <span className="text-xs text-blue-600">(Mặc định)</span>}</span></th>
                  <th className="px-6 py-4 text-center font-bold"><FaHospital className="inline mr-1 text-red-500"/>Bệnh viện</th>
                  <th className="px-6 py-4 text-center font-bold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-16 text-gray-400 text-xl">Không có dữ liệu</td></tr>
                ) : (
                  sorted.map((item, idx) => {
                    const isCreatorAdminOrStaff = item.username === user?.username && (user?.role === 'Admin' || user?.role === 'Staff');
                    const canApprove = !isCreatorAdminOrStaff && (item.emergencyStatus === 'Chờ xét duyệt' || !item.emergencyStatus);
                    const canViewBloodComparison = item.emergencyStatus === 'Đã xét duyệt';
                    const status = (item.emergencyStatus ?? 'Chờ xét duyệt').toLowerCase();
                    let badgeColor = 'bg-gray-200 text-gray-700';
                    if (status.includes('chờ')) badgeColor = 'bg-yellow-100 text-yellow-800';
                    else if (status.includes('quá hạn')) badgeColor = 'bg-red-100 text-red-700';
                    else if (status.includes('đã duyệt') || status.includes('đã xét duyệt')) badgeColor = 'bg-green-100 text-green-700';
                    else if (status.includes('từ chối')) badgeColor = 'bg-red-100 text-red-700';
                    else if (status.includes('chuyển đến')) badgeColor = 'bg-blue-100 text-blue-700';
                    return (
                      <tr key={item.emergencyId || item.id || idx} className={"transition-colors " + (idx % 2 === 0 ? 'bg-white hover:bg-red-50' : 'bg-red-50 hover:bg-red-100')}>
                        <td className="px-6 py-4 text-center font-semibold align-middle">{item.emergencyId ?? item.id ?? <span className="text-gray-400">Chưa có</span>}</td>
                        <td className="px-6 py-4 text-center align-middle">{item.username ?? <span className="text-gray-400">Chưa có</span>}</td>
                        <td className="px-6 py-4 text-center align-middle">
                          {item.emergencyDate ? (
                            <div>
                              <div className="font-medium">{new Date(item.emergencyDate).toLocaleDateString('vi-VN')}</div>
                              <div className="text-sm text-gray-500">{new Date(item.emergencyDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Chưa có</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-red-700 align-middle">{item.bloodType ?? <span className="text-gray-400">Chưa có</span>}</td>
                        <td className="px-6 py-4 text-center align-middle">
                          <span className={`inline-block px-4 py-1 rounded-full text-base font-semibold shadow-sm border ${badgeColor} min-w-[120px] text-center`}>
                            {isCreatorAdminOrStaff ? 'Đã xét duyệt' : (item.emergencyStatus ?? 'Chờ xét duyệt')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center align-middle">{getHospitalName(item.hospitalId)}</td>
                        <td className="px-6 py-4 text-center align-middle">
                          <div className="flex gap-1 justify-center">
                            <button
                              onClick={() => openDetailModal(item)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors duration-200"
                              title="Xem chi tiết"
                            >
                              <FaEye className="w-3 h-3 mr-1" />
                              Chi tiết
                            </button>
                            {canApprove ? (
                              <button
                                onClick={() => openApprovalModal(item)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 hover:border-green-300 transition-colors duration-200"
                                title="Xét duyệt đơn khẩn cấp"
                              >
                                <FaCheck className="w-3 h-3 mr-1" />
                                Duyệt
                              </button>
                            ) : canViewBloodComparison ? (
                              <button
                                onClick={() => viewBloodComparison(item.emergencyId || item.id)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 hover:border-purple-300 transition-colors duration-200"
                                title="Xem so sánh máu"
                              >
                                <FaTint className="w-3 h-3 mr-1" />
                                Máu
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4 text-center">Xét duyệt đơn khẩn cấp</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Người tạo:</strong> {selectedEmergency?.username}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Nhóm máu:</strong> {selectedEmergency?.bloodType}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Ghi chú:</strong> {selectedEmergency?.emergencyNote || 'Không có'}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái xét duyệt:
              </label>
              <input
                type="text"
                value={approvalStatus}
                onChange={(e) => setApprovalStatus(e.target.value)}
                placeholder='Nhập "Đã xét duyệt" hoặc "Từ chối"'
                className="input w-full"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setApprovalStatus('');
                  setSelectedEmergency(null);
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                disabled={approvalLoading}
              >
                <FaTimes className="w-4 h-4 mr-2" />
                Hủy
              </button>
              <button
                onClick={() => handleApproval(selectedEmergency.emergencyId || selectedEmergency.id, approvalStatus)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={approvalLoading || !approvalStatus}
              >
                <FaCheck className="w-4 h-4 mr-2" />
                {approvalLoading ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blood Comparison Modal */}
      {showBloodComparisonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 max-h-[70vh] overflow-y-auto border border-red-200">
            <h3 className="text-lg font-bold mb-2 text-center text-red-700 flex items-center justify-center gap-2 pt-3">
              <FaTint className="text-red-500 text-sm" /> So sánh máu - Đơn khẩn cấp
            </h3>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm px-6">
              
      
            </div>
            <div className="mb-2 px-3">
              <h4 className="font-semibold mb-1 text-sm text-gray-800">Kết quả so sánh kho máu:</h4>
              <div className="bg-gray-50 p-2 rounded shadow-inner">
                {/* UI mới nếu có trường isEnough */}
                {selectedEmergency?.bloodComparison && typeof selectedEmergency.bloodComparison === 'object' && 'isEnough' in selectedEmergency.bloodComparison ? (
                  // UI đẹp như BloodInventoryDetail
                  <>
                    {/* Status Card */}
                    <div className={`rounded-md p-3 mb-3 ${
                      selectedEmergency.bloodComparison.isEnough 
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' 
                        : 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`rounded-full p-2 ${
                            selectedEmergency.bloodComparison.isEnough ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {selectedEmergency.bloodComparison.isEnough ? (
                              <FaCheckCircle className="text-white text-sm" />
                            ) : (
                              <FaTimesCircle className="text-white text-sm" />
                            )}
                          </div>
                          <div>
                            <h3 className={`text-base font-bold ${
                              selectedEmergency.bloodComparison.isEnough ? 'text-green-800' : 'text-red-800'
                            }`}>
                              {selectedEmergency.bloodComparison.isEnough ? 'Đủ máu' : 'Thiếu máu'}
                            </h3>
                            <p className={`text-xs ${
                              selectedEmergency.bloodComparison.isEnough ? 'text-green-600' : 'text-red-600'
                            }`}>
                              Trạng thái: {selectedEmergency.bloodComparison.status}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-800">
                            {selectedEmergency.bloodComparison.availableUnits}
                          </div>
                          <div className="text-xs text-gray-600">Đơn vị có sẵn (ml)</div>
                        </div>
                      </div>
                    </div>

                    {/* Comparison Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      {/* Required Units */}
                      <div className="bg-blue-50 rounded-md p-3 border border-blue-200">
                        <div className="flex items-center space-x-1 mb-1">
                          <div className="bg-blue-500 rounded-full p-1">
                            <FaArrowDown className="text-white text-xs" />
                          </div>
                          <h4 className="text-xs font-semibold text-blue-800">Cần thiết</h4>
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          {selectedEmergency.bloodComparison.requiredUnits}
                        </div>
                        <p className="text-blue-600 text-xs">Đơn vị máu cần thiết (ml)</p>
                      </div>

                      {/* Available Units */}
                      <div className="bg-green-50 rounded-md p-3 border border-green-200">
                        <div className="flex items-center space-x-1 mb-1">
                          <div className="bg-green-500 rounded-full p-1">
                            <FaArrowUp className="text-white text-xs" />
                          </div>
                          <h4 className="text-xs font-semibold text-green-800">Có sẵn</h4>
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          {selectedEmergency.bloodComparison.availableUnits}
                        </div>
                        <p className="text-green-600 text-xs">Đơn vị máu trong kho (ml)</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-700">Tỷ lệ đáp ứng</span>
                        <span className="text-xs font-bold text-gray-900">
                          {Math.round((selectedEmergency.bloodComparison.availableUnits / selectedEmergency.bloodComparison.requiredUnits) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            selectedEmergency.bloodComparison.isEnough ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ 
                            width: `${Math.min((selectedEmergency.bloodComparison.availableUnits / selectedEmergency.bloodComparison.requiredUnits) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Details Section */}
                    <div className="bg-gray-50 rounded-md p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <FaInfoCircle className="text-gray-500 text-xs" />
                        <h4 className="text-xs font-semibold text-gray-900">Chi tiết từng đơn vị máu</h4>
                      </div>
                      
                      {selectedEmergency.bloodComparison.details && selectedEmergency.bloodComparison.details.length > 0 ? (
                        <div className="space-y-1">
                          {selectedEmergency.bloodComparison.details.map((detail, index) => (
                            <div key={detail.bloodDetailId || index} className="bg-white rounded p-2 border border-gray-200 hover:shadow-sm transition-shadow">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div className="bg-red-100 rounded-full p-1">
                                    <FaTint className="text-red-600 text-xs" />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900 text-xs">
                                      {detail.bloodType}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      ID: {detail.bloodDetailId}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-sm text-gray-900">
                                    {detail.volume} ml
                                  </div>
                                  <div className="flex items-center space-x-1 text-xs text-gray-600">
                                    <FaCalendarAlt className="text-xs" />
                                    <span>{new Date(detail.bloodDetailDate).toLocaleDateString('vi-VN')}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <FaExclamationTriangle className="text-gray-400 text-lg mx-auto mb-1" />
                          <p className="text-gray-600 text-xs">Không có chi tiết đơn vị máu</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  // UI cũ giữ nguyên
                  selectedEmergency?.bloodComparison ? (
                    Array.isArray(selectedEmergency.bloodComparison) ? (
                      <table className="min-w-full text-sm border rounded overflow-hidden">
                        <thead className="bg-red-100">
                          <tr>
                            <th className="px-3 py-2 text-left">Kho máu</th>
                            <th className="px-3 py-2 text-left">Nhóm máu</th>
                            <th className="px-3 py-2 text-center">Số lượng còn</th>
                            <th className="px-3 py-2 text-center">Đáp ứng</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedEmergency.bloodComparison.map((row, idx) => (
                            <tr key={idx} className="border-b last:border-b-0">
                              <td className="px-3 py-2">{row.storageName || row.storage || row.hospitalName || '-'}</td>
                              <td className="px-3 py-2 font-bold text-red-700">{row.bloodType || '-'}</td>
                              <td className="px-3 py-2 text-center">{row.availableUnits ?? row.quantity ?? '-'}</td>
                              <td className="px-3 py-2 text-center">
                                {row.matched || row.sufficient || row.status === 'matched' ? (
                                  <span className="inline-flex items-center gap-1 text-green-700 font-semibold"><FaCheck className="inline"/> Đủ</span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-red-600 font-semibold"><FaTimes className="inline"/> Thiếu</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : typeof selectedEmergency.bloodComparison === 'object' ? (
                      <table className="min-w-full text-sm border rounded overflow-hidden">
                        <tbody>
                          {Object.entries(selectedEmergency.bloodComparison).map(([key, value]) => (
                            <tr key={key} className="border-b last:border-b-0">
                              <td className="px-3 py-2 font-semibold text-gray-700">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td>
                              <td className="px-3 py-2">
                                {typeof value === 'object' ? (
                                  <pre className="bg-white p-2 rounded border text-xs whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
                                ) : (
                                  <span>{String(value)}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-gray-600">
                        <pre className="text-sm bg-white p-2 rounded border">{JSON.stringify(selectedEmergency.bloodComparison, null, 2)}</pre>
                      </div>
                    )
                  ) : (
                    <p className="text-gray-500">Đang tải thông tin so sánh máu...</p>
                  )
                )}
              </div>
            </div>
            <div className="flex justify-end px-3 pb-3 gap-2">
              
              {/* Nút chuyển máu nếu đủ máu và đã được xét duyệt */}
              {selectedEmergency?.bloodComparison?.isEnough && 
               selectedEmergency?.emergencyStatus === 'Đã xét duyệt' && (
                <button
                  onClick={handleTransferBlood}
                  disabled={transferLoading}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 border border-green-700 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {transferLoading ? (
                    <span className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                  ) : null}
                  <FaCheckCircle className="w-4 h-4 mr-1" />
                  Chuyển máu
                </button>
              )}
              <button
                onClick={() => {
                  setShowBloodComparisonModal(false);
                  setSelectedEmergency(null);
                }}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                <FaTimes className="w-3 h-3 mr-1" />
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h3 className="text-xl font-bold text-red-700 flex items-center gap-2">
                <FaInfoCircle className="text-red-500" />
                Chi tiết đơn khẩn cấp
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaUser className="text-red-500" />
                    Thông tin người tạo
                  </h4>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Tên:</span> {selectedEmergency?.username || 'Chưa có'}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaCalendarAlt className="text-red-500" />
                    Thời gian
                  </h4>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Ngày tạo:</span> {selectedEmergency?.emergencyDate ? new Date(selectedEmergency.emergencyDate).toLocaleDateString('vi-VN') : 'Chưa có'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Ngày kết thúc:</span> {selectedEmergency?.endDate ? new Date(selectedEmergency.endDate).toLocaleDateString('vi-VN') : 'Chưa có'}
                  </p>
                </div>
              </div>

              {/* Blood Info */}
              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                  <FaTint className="text-red-600" />
                  Thông tin máu
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-red-700">
                      <span className="font-medium">Nhóm máu:</span> 
                      <span className="ml-2 font-bold text-lg">{selectedEmergency?.bloodType || 'Chưa có'}</span>
                    </p>
                    <p className="text-sm text-red-700">
                                              <span className="font-medium">Số đơn vị cần:</span> {selectedEmergency?.requiredUnits || 'Chưa có'} ml
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-red-700">
                      <span className="font-medium">Trạng thái:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                        (selectedEmergency?.emergencyStatus || '').toLowerCase().includes('chờ') ? 'bg-yellow-100 text-yellow-800' :
                        (selectedEmergency?.emergencyStatus || '').toLowerCase().includes('đã duyệt') ? 'bg-green-100 text-green-800' :
                        (selectedEmergency?.emergencyStatus || '').toLowerCase().includes('từ chối') ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedEmergency?.emergencyStatus || 'Chờ xét duyệt'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Hospital Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <FaHospital className="text-blue-600" />
                  Thông tin bệnh viện
                </h4>
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Bệnh viện:</span> {getHospitalName(selectedEmergency?.hospitalId)}
                </p>
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Tình trạng y tế:</span> {selectedEmergency?.emergencyMedical || 'Chưa có'}
                </p>
              </div>

              {/* Notes */}
              {selectedEmergency?.emergencyNote && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                    <FaStickyNote className="text-yellow-600" />
                    Ghi chú
                  </h4>
                  <p className="text-sm text-yellow-700 whitespace-pre-wrap">
                    {selectedEmergency.emergencyNote}
                  </p>
                </div>
              )}

              {/* Image */}
              {selectedEmergency?.emergencyImage && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaImage className="text-gray-600" />
                    Hình ảnh
                  </h4>
                  <div className="flex justify-center">
                    <a href={selectedEmergency.emergencyImage} target="_blank" rel="noopener noreferrer">
                      <img 
                        src={selectedEmergency.emergencyImage} 
                        alt="Ảnh khẩn cấp" 
                        className="max-w-full h-auto max-h-64 rounded-lg shadow-lg border"
                      />
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedEmergency(null);
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                <FaTimes className="w-4 h-4 mr-2" />
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Toast thông báo */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default EmergencyManagement; 