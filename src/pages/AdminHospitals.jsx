import React, { useEffect, useState } from 'react';
import { FaHospital, FaSearch, FaPlus } from 'react-icons/fa';
import { apiCall } from '../utils/api';
import ImageUpload from '../components/ImageUpload';

const AdminHospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ hospitalName: '', hospitalAddress: '', hospitalPhone: '', hospitalImage: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchHospitals(); }, []);

  const fetchHospitals = async () => {
    setLoading(true); setError('');
    try {
      const data = await apiCall('/Hospital/GetAll', { method: 'GET' });
      setHospitals(Array.isArray(data) ? data : []);
    } catch (e) { setError(e.message || 'Không thể tải danh sách bệnh viện'); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => { setSearch(e.target.value); };
  const filtered = hospitals.filter(h => h.hospitalName?.toLowerCase().includes(search.toLowerCase()));

  const openModal = () => {
    setForm({ hospitalName: '', hospitalAddress: '', hospitalPhone: '', hospitalImage: '' });
    setFormError('');
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setFormError(''); };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.hospitalName || !form.hospitalAddress || !form.hospitalPhone) {
      setFormError('Vui lòng nhập đầy đủ tên, địa chỉ và số điện thoại.');
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        hospitalName: form.hospitalName,
        hospitalAddress: form.hospitalAddress,
        hospitalPhone: form.hospitalPhone,
        hospitalImage: form.hospitalImage,
      };
      await apiCall('/Hospital/Create', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setToast({ type: 'success', message: 'Thêm bệnh viện thành công!' });
      closeModal();
      fetchHospitals();
    } catch (e) {
      setFormError(e.message || 'Lỗi khi thêm bệnh viện');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700 flex items-center justify-center gap-2">
        <FaHospital className="inline-block mb-1" /> Danh sách bệnh viện
      </h2>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <FaSearch className="text-gray-400" />
          <input value={search} onChange={handleSearch} placeholder="Tìm kiếm bệnh viện..." className="input w-full md:w-64" />
        </div>
        <button onClick={openModal} className="btn btn-primary flex items-center gap-2"><FaPlus /> Thêm bệnh viện</button>
      </div>
      {error && <div className="text-red-600 mb-4 whitespace-pre-wrap">{error}</div>}
      {toast && (
        <div className={`mb-4 px-4 py-2 rounded font-semibold ${toast.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{toast.message}</div>
      )}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Tên bệnh viện</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Địa chỉ</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Số điện thoại</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Ảnh</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-8">Đang tải...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8">Không có kết quả</td></tr>
            ) : (
              filtered.map(h => (
                <tr key={h.hospitalId} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2 font-medium text-gray-900">{h.hospitalName}</td>
                  <td className="px-4 py-2 text-gray-700">{h.hospitalAddress}</td>
                  <td className="px-4 py-2 text-gray-700">{h.hospitalPhone}</td>
                  <td className="px-4 py-2">
                    {h.hospitalImage ? <img src={h.hospitalImage} alt={h.hospitalName} className="w-16 h-12 object-cover rounded shadow" /> : <span className="text-gray-400">-</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Modal thêm bệnh viện */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={closeModal}>&times;</button>
            <h3 className="text-xl font-bold mb-4 text-blue-700 flex items-center gap-2"><FaPlus /> Thêm bệnh viện</h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên bệnh viện <span className="text-red-500">*</span></label>
                <input name="hospitalName" value={form.hospitalName} onChange={handleFormChange} className="input w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Địa chỉ <span className="text-red-500">*</span></label>
                <input name="hospitalAddress" value={form.hospitalAddress} onChange={handleFormChange} className="input w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                <input name="hospitalPhone" value={form.hospitalPhone} onChange={handleFormChange} className="input w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ảnh bệnh viện (tùy chọn)</label>
                <ImageUpload
                  value={form.hospitalImage}
                  onChange={(url) => setForm(prev => ({ ...prev, hospitalImage: url }))}
                  placeholder="Kéo thả ảnh vào đây hoặc click để chọn file"
                  disabled={submitting}
                />
              </div>
              {formError && <div className="text-red-600 text-sm mb-2">{formError}</div>}
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="btn" onClick={closeModal}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Đang lưu...' : 'Lưu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHospitals; 