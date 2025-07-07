import React, { useState, useEffect } from 'react';
import { getAuthToken, getUser } from '../utils/api';

const EmergencyRegisterForm = () => {
  const [form, setForm] = useState({
    bloodType: '',
    requiredUnits: '',
    hospitalId: '',
    emergencyMedical: '',
    emergencyImage: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/Emergency/RegisterEmergency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess('Đăng ký đơn khẩn cấp thành công!');
      setForm({ bloodType: '', requiredUnits: '', hospitalId: '', emergencyMedical: '', emergencyImage: '', endDate: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white py-8 px-2">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-red-100">
        <h2 className="text-2xl font-bold mb-6 text-center text-red-700">Đăng ký đơn khẩn cấp</h2>
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Nhóm máu <span className="text-red-500">*</span></label>
          <input name="bloodType" value={form.bloodType} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400" placeholder="A+" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Số đơn vị máu cần <span className="text-red-500">*</span></label>
          <input name="requiredUnits" type="number" min="1" value={form.requiredUnits} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400" placeholder="2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">ID bệnh viện <span className="text-red-500">*</span></label>
          <input name="hospitalId" type="number" min="1" value={form.hospitalId} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400" placeholder="1" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Tình trạng y tế khẩn cấp <span className="text-red-500">*</span></label>
          <textarea name="emergencyMedical" value={form.emergencyMedical} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none" placeholder="Mô tả tình trạng..." rows={3} />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Ảnh minh họa (URL)</label>
          <input name="emergencyImage" value={form.emergencyImage} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400" placeholder="https://..." />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-medium text-gray-700">Ngày kết thúc <span className="text-red-500">*</span></label>
          <input name="endDate" type="date" value={form.endDate} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400" />
        </div>
        {error && <div className="text-red-600 text-sm mb-2 text-center">{error}</div>}
        {success && <div className="text-green-600 text-sm mb-2 text-center">{success}</div>}
        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-lg font-bold text-lg shadow-md transition-all duration-200">
          {loading ? 'Đang gửi...' : 'Gửi đơn khẩn cấp'}
        </button>
      </form>
    </div>
  );
};

const EmergencyRequests = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const user = getUser();
  const isAdminOrStaff = user && (user.role === 'Admin' || user.role === 'Staff');

  useEffect(() => {
    if (isAdminOrStaff) {
      fetchEmergencies();
    }
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

  return (
    <>
      {!isAdminOrStaff && <EmergencyRegisterForm />}
      {isAdminOrStaff && (
        <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-xl border border-red-100">
          <h2 className="text-2xl font-bold mb-6 text-red-700 text-center">Danh sách đơn khẩn cấp</h2>
          {loading ? (
            <div className="text-center text-gray-500">Đang tải...</div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white text-sm border rounded shadow">
                <thead className="bg-red-50">
                  <tr>
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Nhóm máu</th>
                    <th className="px-4 py-2">Số đơn vị</th>
                    <th className="px-4 py-2">Bệnh viện</th>
                    <th className="px-4 py-2">Tình trạng y tế</th>
                    <th className="px-4 py-2">Ảnh</th>
                    <th className="px-4 py-2">Ngày kết thúc</th>
                  </tr>
                </thead>
                <tbody>
                  {emergencies.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-4 text-gray-400">Không có dữ liệu</td></tr>
                  ) : (
                    emergencies.map((item, idx) => (
                      <tr key={item.id || idx} className="border-t hover:bg-red-50 transition-colors">
                        <td className="px-4 py-2">{item.id ?? <span className="text-gray-400">Chưa có</span>}</td>
                        <td className="px-4 py-2 font-semibold text-red-700">{item.bloodType ?? <span className="text-gray-400">Chưa có</span>}</td>
                        <td className="px-4 py-2">{item.requiredUnits ?? <span className="text-gray-400">Chưa có</span>}</td>
                        <td className="px-4 py-2">{item.hospitalId ?? <span className="text-gray-400">Chưa có</span>}</td>
                        <td className="px-4 py-2">{item.emergencyMedical ?? <span className="text-gray-400">Chưa có</span>}</td>
                        <td className="px-4 py-2">
                          {item.emergencyImage ? (
                            <a href={item.emergencyImage} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">Xem ảnh</a>
                          ) : <span className="text-gray-400">Chưa có</span>}
                        </td>
                        <td className="px-4 py-2">{item.endDate ? item.endDate.slice(0,10) : <span className="text-gray-400">Chưa có</span>}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default EmergencyRequests; 