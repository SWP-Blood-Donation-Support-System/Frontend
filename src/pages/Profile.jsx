import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTint, FaHistory, FaEdit } from 'react-icons/fa';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Mock user data
  const userData = {
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0123456789',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    bloodType: 'A+',
    lastDonation: '2024-01-15',
    totalDonations: 5,
  };

  // Mock donation history
  const donationHistory = [
    {
      id: 1,
      date: '2024-01-15',
      location: 'Bệnh viện Chợ Rẫy',
      bloodType: 'A+',
      status: 'completed',
    },
    {
      id: 2,
      date: '2023-10-20',
      location: 'Bệnh viện Nhân dân 115',
      bloodType: 'A+',
      status: 'completed',
    },
    {
      id: 3,
      date: '2023-07-15',
      location: 'Bệnh viện Đại học Y Dược',
      bloodType: 'A+',
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
                  Họ và tên
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    defaultValue={userData.fullName}
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
                    defaultValue={userData.email}
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
                    defaultValue={userData.phone}
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
                    defaultValue={userData.address}
                    {...register('address', { required: 'Vui lòng nhập địa chỉ' })}
                    className="input pl-10"
                  />
                </div>
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
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
              <FaUser className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Họ và tên</p>
                <p className="font-medium">{userData.fullName}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <FaEnvelope className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{userData.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <FaPhone className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Số điện thoại</p>
                <p className="font-medium">{userData.phone}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <FaMapMarkerAlt className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Địa chỉ</p>
                <p className="font-medium">{userData.address}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <FaTint className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Nhóm máu</p>
                <p className="font-medium">{userData.bloodType}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <FaHistory className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Lần hiến máu gần nhất</p>
                <p className="font-medium">{userData.lastDonation}</p>
              </div>
            </div>
          </div>
        )}
      </div>

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