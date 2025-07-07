import React from 'react';

const BloodInventoryDetail = ({ bloodInventory, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-3xl w-full relative border border-red-100">
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl font-bold">×</button>
      <div className="flex items-center justify-center mb-4">
        <span className="inline-block w-10 h-10 bg-gradient-to-r from-red-500 to-red-700 rounded-full flex items-center justify-center mr-3 shadow">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21C12 21 4 13.5 4 8.5C4 5.46243 6.46243 3 9.5 3C11.1566 3 12.5 4.34315 12.5 6C12.5 4.34315 13.8434 3 15.5 3C18.5376 3 21 5.46243 21 8.5C21 13.5 12 21 12 21Z" /></svg>
        </span>
        <h2 className="text-2xl font-bold text-red-700">Chi tiết kho máu</h2>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-red-50">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">ID</th>
              <th className="px-4 py-2 text-left font-semibold">Nhóm máu</th>
              <th className="px-4 py-2 text-left font-semibold">Thể tích (ml)</th>
              <th className="px-4 py-2 text-left font-semibold">Ngày nhập</th>
              <th className="px-4 py-2 text-left font-semibold">Trạng thái</th>
              <th className="px-4 py-2 text-left font-semibold">Ghi chú</th>
              <th className="px-4 py-2 text-left font-semibold">Bệnh viện (ID)</th>
            </tr>
          </thead>
          <tbody>
            {bloodInventory && bloodInventory.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-4 text-gray-400">Không có dữ liệu</td></tr>
            ) : (
              bloodInventory.map((item, idx) => (
                <tr key={item.bloodDetailId || idx} className="border-t hover:bg-red-50 transition-colors">
                  <td className="px-4 py-2">{item.bloodDetailId ?? <span className="text-gray-400">Chưa có</span>}</td>
                  <td className="px-4 py-2 font-semibold text-red-700">{item.bloodType ?? <span className="text-gray-400">Chưa có</span>}</td>
                  <td className="px-4 py-2">{item.volume ?? <span className="text-gray-400">Chưa có</span>}</td>
                  <td className="px-4 py-2">{item.bloodDetailDate ? item.bloodDetailDate.slice(0,10) : <span className="text-gray-400">Chưa có</span>}</td>
                  <td className={`px-4 py-2 ${item.bloodDetailStatus === 'Còn hạn' ? 'text-green-600 font-semibold' : item.bloodDetailStatus === 'Hết hạn' ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>{item.bloodDetailStatus ?? <span className="text-gray-400">Chưa có</span>}</td>
                  <td className="px-4 py-2">{item.note ?? <span className="text-gray-400">Chưa có</span>}</td>
                  <td className="px-4 py-2">{item.hospitalId ?? <span className="text-gray-400">Chưa có</span>}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default BloodInventoryDetail; 