import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTint, FaHistory, FaEdit, FaIdCard } from 'react-icons/fa';
import { getUser } from '../utils/api';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    const user = getUser();
    if (user) {
      setUserData(user);
      console.log('User data from localStorage:', user);
    }
    setLoading(false);
  }, []);

  // Mock donation history (có thể thay bằng API call sau)
  const donationHistory = [
    {
      id: 1,
      date: '2024-01-15',
      location: 'Bệnh viện Chợ Rẫy',
      bloodType: userData?.bloodType || 'A+',
      status: 'completed',
    },
    {
      id: 2,
      date: '2023-10-20',
      location: 'Bệnh viện Nhân dân 115',
      bloodType: userData?.bloodType || 'A+',
      status: 'completed',
    },
    {
      id: 3,
      date: '2023-07-15',
      location: 'Bệnh viện Đại học Y Dược',
      bloodType: userData?.bloodType || 'A+',
      status: 'completed',
    },
  ];

  const onSubmit = async (data) => {
    try {
      // TODO: Implement API call to update user profile
      console.log('Updated profile data:', data);
      setIsEditing(false);
      alert('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin cá nhân...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Thông tin cá nhân</h1>
          <p className="text-gray-600">Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Thông tin cá nhân</h1>

      {/* Profile Information */}
      <div className="card mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Thông tin cá nhân</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn btn-primary"
          >
            <FaEdit className="inline-block mr-2" />
            {isEditing ? 'Hủy' : 'Chỉnh sửa'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaIdCard className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    defaultValue={userData.username}
                    disabled
                    className="input pl-10 bg-gray-100"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Username không thể thay đổi</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    defaultValue={userData.fullName || userData.name || ''}
                    {...register('fullName', { required: 'Vui lòng nhập họ tên' })}
                    className="input pl-10"
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    defaultValue={userData.email || ''}
                    {...register('email', {
                      required: 'Vui lòng nhập email',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email không hợp lệ',
                      },
                    })}
                    className="input pl-10"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    defaultValue={userData.phoneNumber || userData.phone || ''}
                    {...register('phone', {
                      required: 'Vui lòng nhập số điện thoại',
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: 'Số điện thoại không hợp lệ',
                      },
                    })}
                    className="input pl-10"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    defaultValue={userData.address || ''}
                    {...register('address', { required: 'Vui lòng nhập địa chỉ' })}
                    className="input pl-10"
                  />
                </div>
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhóm máu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaTint className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    defaultValue={userData.bloodType || ''}
                    {...register('bloodType')}
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vai trò
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    defaultValue={userData.role || ''}
                    disabled
                    className="input pl-10 bg-gray-100"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Vai trò không thể thay đổi</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary">
                Lưu thay đổi
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4">
              <FaIdCard className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Username</p>
                <p className="font-medium">{userData.username || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <FaUser className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Họ và tên</p>
                <p className="font-medium">{userData.fullName || userData.name || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <FaEnvelope className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{userData.email || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <FaPhone className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Số điện thoại</p>
                <p className="font-medium">{userData.phoneNumber || userData.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <FaMapMarkerAlt className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Địa chỉ</p>
                <p className="font-medium">{userData.address || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <FaTint className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Nhóm máu</p>
                <p className="font-medium">{userData.bloodType || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <FaUser className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Vai trò</p>
                <p className="font-medium">{userData.role || 'N/A'}</p>
              </div>
            </div>

            {userData.userId && (
              <div className="flex items-center space-x-4">
                <FaIdCard className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">User ID</p>
                  <p className="font-medium">{userData.userId}</p>
                </div>
              </div>
            )}

            {userData.dateOfBirth && (
              <div className="flex items-center space-x-4">
                <FaHistory className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Ngày sinh</p>
                  <p className="font-medium">{userData.dateOfBirth}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Debug Info
      <div className="card mb-8">
        <h3 className="text-lg font-semibold mb-4">Thông tin Debug</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <pre className="text-xs text-gray-700 overflow-auto">
            {JSON.stringify(userData, null, 2)}
          </pre>
        </div>
      </div> */}

      {/* Donation History */}
      <div className="card">
        <h2 className="text-2xl font-semibold mb-6">Lịch sử hiến máu</h2>
        <div className="space-y-4">
          {donationHistory.map((donation) => (
            <div key={donation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="flex items-center text-gray-600">
                  <FaTint className="mr-2" />
                  <span>Nhóm máu: {donation.bloodType}</span>
                </div>
                <div className="flex items-center text-gray-600 mt-1">
                  <FaMapMarkerAlt className="mr-2" />
                  <span>{donation.location}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{donation.date}</p>
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                  Hoàn thành
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile; 