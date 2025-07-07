import React, { useState, useEffect } from 'react';
import { getToken } from '../utils/api';

const API_URL = 'https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/admin/users';

const AdminUsers = () => {
  const [filters, setFilters] = useState({
    username: '',
    email: '',
    role: '',
    fullname: '',
    bloodtype: '',
    status: '',
    page: 1,
    pageSize: 10,
    sortOrder: 'asc',
  });
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch users mỗi khi filters thay đổi
  useEffect(() => {
    fetchUsers(filters);
    // eslint-disable-next-line
  }, [filters.page, filters.pageSize, filters.sortOrder]);

  const fetchUsers = async (customFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(customFilters),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Lỗi API: ${res.status} - ${text}`);
      }
      const data = await res.json();
      setUsers(data.users || data.data || []);
      setTotalPages(data.totalPages || data.total_pages || 1);
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

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
      <h2>Quản lý người dùng</h2>
      <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <input name="username" value={filters.username} onChange={handleInputChange} placeholder="Username" />
        <input name="email" value={filters.email} onChange={handleInputChange} placeholder="Email" />
        <input name="fullname" value={filters.fullname} onChange={handleInputChange} placeholder="Họ tên" />
        <input name="role" value={filters.role} onChange={handleInputChange} placeholder="Role" />
        <input name="bloodtype" value={filters.bloodtype} onChange={handleInputChange} placeholder="Nhóm máu" />
        <input name="status" value={filters.status} onChange={handleInputChange} placeholder="Trạng thái" />
        <button type="submit">Tìm kiếm</button>
      </form>
      {error && <div style={{ color: 'red', whiteSpace: 'pre-wrap' }}>{error}</div>}
      <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', background: '#fff' }}>
        <thead>
          <tr>
            <th style={{ cursor: 'pointer' }} onClick={handleSort}>
              Username {filters.sortOrder === 'asc' ? '▲' : '▼'}
            </th>
            <th>Email</th>
            <th>Họ tên</th>
            <th>Vai trò</th>
            <th>Nhóm máu</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6}>Đang tải...</td></tr>
          ) : users.length === 0 ? (
            <tr><td colSpan={6}>Không có kết quả</td></tr>
          ) : (
            users.map((u) => (
              <tr key={u.id || u._id}>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.fullName || u.fullname}</td>
                <td>{u.role}</td>
                <td>{u.bloodType || u.bloodtype}</td>
                <td>{u.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => handlePageChange(-1)} disabled={filters.page === 1}>Trước</button>
        <span>Trang {filters.page} / {totalPages}</span>
        <button onClick={() => handlePageChange(1)} disabled={filters.page === totalPages}>Sau</button>
      </div>
    </div>
  );
};

export default AdminUsers; 