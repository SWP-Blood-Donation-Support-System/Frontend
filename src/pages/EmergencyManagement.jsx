import React, { useEffect, useState } from 'react';
import { getAuthToken, getUser } from '../utils/api';
import { FaUser, FaCalendarAlt, FaTint, FaInfoCircle, FaHospital, FaStickyNote, FaImage } from 'react-icons/fa';

const statusColor = (status) => {
  if (!status) return 'bg-gray-200 text-gray-700';
  if (status.toLowerCase().includes('chờ')) return 'bg-yellow-100 text-yellow-800';
  if (status.toLowerCase().includes('quá hạn')) return 'bg-red-100 text-red-700';
  if (status.toLowerCase().includes('đã duyệt')) return 'bg-green-100 text-green-700';
  return 'bg-gray-100 text-gray-700';
};

const EmergencyManagement = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const user = getUser();
  const isAdminOrStaff = user && (user.role === 'Admin' || user.role === 'Staff');

  useEffect(() => {
    if (isAdminOrStaff) fetchEmergencies();
    // eslint-disable-next-line
  }, []);

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

  if (!isAdminOrStaff) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow text-center">
        <h2 className="text-xl font-bold mb-2 text-red-700">Bạn không có quyền truy cập trang này</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-2xl border border-red-100">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-red-700 tracking-wide">Quản lý đơn khẩn cấp</h2>
      {loading ? (
        <div className="text-center text-gray-500">Đang tải...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white text-sm rounded-xl shadow border">
            <thead className="bg-gradient-to-r from-red-100 to-red-50">
              <tr>
                <th className="px-4 py-3 text-center font-bold">ID</th>
                <th className="px-4 py-3 text-center font-bold"><FaUser className="inline mr-1 text-red-500"/>Người tạo</th>
                <th className="px-4 py-3 text-center font-bold"><FaCalendarAlt className="inline mr-1 text-red-500"/>Ngày tạo</th>
                <th className="px-4 py-3 text-center font-bold"><FaTint className="inline mr-1 text-red-500"/>Nhóm máu</th>
                <th className="px-4 py-3 text-center font-bold">Trạng thái</th>
                <th className="px-4 py-3 text-center font-bold"><FaStickyNote className="inline mr-1 text-red-500"/>Ghi chú</th>
                <th className="px-4 py-3 text-center font-bold">Số đơn vị</th>
                <th className="px-4 py-3 text-center font-bold"><FaHospital className="inline mr-1 text-red-500"/>Bệnh viện</th>
                <th className="px-4 py-3 text-center font-bold"><FaInfoCircle className="inline mr-1 text-red-500"/>Tình trạng y tế</th>
                <th className="px-4 py-3 text-center font-bold"><FaImage className="inline mr-1 text-red-500"/>Ảnh</th>
                <th className="px-4 py-3 text-center font-bold">Ngày kết thúc</th>
              </tr>
            </thead>
            <tbody>
              {emergencies.length === 0 ? (
                <tr><td colSpan={11} className="text-center py-4 text-gray-400">Không có dữ liệu</td></tr>
              ) : (
                emergencies.map((item, idx) => (
                  <tr key={item.emergencyId || item.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-red-50 hover:bg-red-100 transition-colors'}>
                    <td className="px-4 py-2 text-center font-semibold">{item.emergencyId ?? item.id ?? <span className="text-gray-400">Chưa có</span>}</td>
                    <td className="px-4 py-2 text-center">{item.username ?? <span className="text-gray-400">Chưa có</span>}</td>
                    <td className="px-4 py-2 text-center">{item.emergencyDate ? item.emergencyDate.slice(0,10) : <span className="text-gray-400">Chưa có</span>}</td>
                    <td className="px-4 py-2 text-center font-bold text-red-700">{item.bloodType ?? <span className="text-gray-400">Chưa có</span>}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColor(item.emergencyStatus)}`}>{item.emergencyStatus ?? 'Chưa có'}</span>
                    </td>
                    <td className="px-4 py-2 text-center">{item.emergencyNote ?? <span className="text-gray-400">Chưa có</span>}</td>
                    <td className="px-4 py-2 text-center">{item.requiredUnits ?? <span className="text-gray-400">Chưa có</span>}</td>
                    <td className="px-4 py-2 text-center">{item.hospitalId ?? <span className="text-gray-400">Chưa có</span>}</td>
                    <td className="px-4 py-2 text-center">{item.emergencyMedical ?? <span className="text-gray-400">Chưa có</span>}</td>
                    <td className="px-4 py-2 text-center">
                      {item.emergencyImage ? (
                        <a href={item.emergencyImage} target="_blank" rel="noopener noreferrer">
                          <img src={item.emergencyImage} alt="Ảnh khẩn cấp" className="w-12 h-12 object-cover rounded shadow border mx-auto" />
                        </a>
                      ) : <span className="text-gray-400">Chưa có</span>}
                    </td>
                    <td className="px-4 py-2 text-center">{item.endDate ? item.endDate.slice(0,10) : <span className="text-gray-400">Chưa có</span>}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmergencyManagement; 