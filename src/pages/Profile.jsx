import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTint, FaHistory, FaEdit, FaIdCard, FaCalendarAlt, FaFileAlt, FaStar, FaHeartbeat, FaShieldAlt, FaInfoCircle } from 'react-icons/fa';
import { getUser, getUserProfile, updateUserProfile, getUserReports } from '../utils/api';
import Toast from '../components/Toast';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userReports, setUserReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await getUserProfile();
        if (response && response.user) {
          setUserData(response.user);
          console.log('User data from server:', response.user);
          console.log('Profile complete:', response.isProfileComplete);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        const localUser = getUser();
        if (localUser) {
          setUserData(localUser);
          console.log('Using user data from localStorage:', localUser);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
    fetchUserReports();
  }, []);

  const fetchUserReports = async () => {
    try {
      setReportsLoading(true);
      const data = await getUserReports();
      setUserReports(data || []);
    } catch (err) {
      console.error('Error fetching user reports:', err);
      setUserReports([]);
    } finally {
      setReportsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      // Kiểm tra tuổi trước khi submit
      if (data.dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(data.dateOfBirth);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        // Tính tuổi chính xác
        let actualAge = age;
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          actualAge--;
        }
        
        if (actualAge < 18) {
          setToastMessage('Bạn phải từ 18 tuổi trở lên để hiến máu!');
          setToastType('error');
          setShowToast(true);
          return; // Dừng submit
        }
      }

      const profileData = {
        username: userData.username,
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        phone: data.phone,
        address: data.address,
        bloodType: data.bloodType,
        profileStatus: userData.profileStatus === 'Đang nghỉ ngơi' ? 'Đang nghỉ ngơi' : (data.profileStatus === 'Không sẵn sàng hiến máu' ? 'Không sẵn sàng hiến máu' : data.profileStatus)
      };

      await updateUserProfile(profileData);
      
      // Update local user data
      setUserData(prev => ({ ...prev, ...profileData }));
      setIsEditing(false);
      setToastMessage('Cập nhật thông tin thành công!');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error updating profile:', error);
      setToastMessage(error.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
      setToastType('error');
      setShowToast(true);
    }
  };

  const getReportTypeIcon = (reportType) => {
    switch (reportType) {
      case 'DonationReview':
        return <FaHeartbeat className="text-red-500" />;
      case 'Emergency':
        return <FaFileAlt className="text-orange-500" />;
      case 'General':
        return <FaFileAlt className="text-blue-500" />;
      default:
        return <FaFileAlt className="text-gray-500" />;
    }
  };

  const getReportTypeLabel = (reportType) => {
    switch (reportType) {
      case 'DonationReview':
        return 'Đánh giá hiến máu';
      case 'Emergency':
        return 'Khẩn cấp';
      case 'General':
        return 'Chung';
      default:
        return reportType;
    }
  };

  const parseDonationReview = (content) => {
    if (content.includes('Đánh giá:')) {
      const lines = content.split('\n');
      const ratingLine = lines[0];
      const ratingMatch = ratingLine.match(/Đánh giá:\s*(\d+)\/5/);
      const rating = ratingMatch ? parseInt(ratingMatch[1]) : 0;
      const reviewContent = lines.slice(2).join('\n').trim();
      return { rating, content: reviewContent };
    }
    return { rating: 0, content };
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`text-sm ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-xs text-gray-600 ml-1">({rating}/5)</span>
      </div>
    );
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Thông tin cá nhân</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <FaEdit className="mr-2" />
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
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Username không thể thay đổi</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    defaultValue={userData.fullName || userData.name || ''}
                    {...register('fullName', { required: 'Vui lòng nhập họ tên' })}
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày sinh <span className="text-red-500">*</span>
                </label>
                  <input
                  type="date"
                  defaultValue={userData.dateOfBirth || ''}
                  {...register('dateOfBirth', { 
                    required: 'Vui lòng nhập ngày sinh',
                    validate: (value) => {
                      if (!value) return true; // Skip validation if empty (handled by required)
                      
                      const today = new Date();
                      const birthDate = new Date(value);
                      const age = today.getFullYear() - birthDate.getFullYear();
                      const monthDiff = today.getMonth() - birthDate.getMonth();
                      
                      // Tính tuổi chính xác
                      let actualAge = age;
                      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        actualAge--;
                      }
                      
                      if (actualAge < 18) {
                        return 'Bạn phải từ 18 tuổi trở lên để hiến máu';
                      }
                      
                      return true;
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {errors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FaInfoCircle className="mr-1 text-xs" />
                    {errors.dateOfBirth.message}
                  </p>
                )}
                </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giới tính <span className="text-red-500">*</span>
                </label>
                <select
                  defaultValue={userData.gender || ''}
                  {...register('gender', { required: 'Vui lòng chọn giới tính' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
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
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    defaultValue={userData.address || ''}
                    {...register('address', { required: 'Vui lòng nhập địa chỉ' })}
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhóm máu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaTint className="text-gray-400" />
                  </div>
                  <select
                    defaultValue={userData.bloodType || ''}
                    {...register('bloodType', { required: 'Vui lòng chọn nhóm máu' })}
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                </div>
                {errors.bloodType && (
                  <p className="mt-1 text-sm text-red-600">{errors.bloodType.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái hồ sơ <span className="text-red-500">*</span>
                </label>
                <select
                  defaultValue={userData.profileStatus || 'Sẵn sàng hiến máu'}
                  {...register('profileStatus', { required: 'Vui lòng chọn trạng thái hồ sơ' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={userData.profileStatus === 'Đang nghỉ ngơi'}
                >
                  <option value="Sẵn sàng hiến máu">Sẵn sàng hiến máu</option>
                  <option value="Không sẵn sàng hiến máu">Không sẵn sàng hiến máu</option>
                </select>
                {userData.profileStatus === 'Đang nghỉ ngơi' && (
                  <p className="mt-1 text-xs text-yellow-600">Bạn đang trong thời gian nghỉ ngơi, không thể thay đổi trạng thái này.</p>
                )}
                {errors.profileStatus && (
                  <p className="mt-1 text-sm text-red-600">{errors.profileStatus.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Lưu thay đổi
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <FaIdCard className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="font-medium">{userData.username}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaEnvelope className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{userData.email || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaShieldAlt className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Vai trò</p>
                <p className="font-medium">
                  {userData.role === 'User' ? 'Người dùng' : 
                   userData.role === 'Admin' ? 'Quản trị viên' : 
                   userData.role === 'Staff' ? 'Nhân viên' : userData.role}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaInfoCircle className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Trạng thái hồ sơ</p>
                <p className="font-medium">{userData.profileStatus || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaUser className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Họ và tên</p>
                <p className="font-medium">{userData.fullName || userData.name || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaCalendarAlt className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Ngày sinh</p>
                <p className="font-medium">{userData.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaUser className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Giới tính</p>
                <p className="font-medium">{userData.gender || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaPhone className="text-gray-400" />
                <div>
                <p className="text-sm text-gray-500">Số điện thoại</p>
                <p className="font-medium">{userData.phoneNumber || userData.phone || 'Chưa cập nhật'}</p>
              </div>
                </div>

            <div className="flex items-center space-x-3">
              <FaMapMarkerAlt className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Địa chỉ</p>
                <p className="font-medium">{userData.address || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaTint className="text-gray-400" />
                <div>
                <p className="text-sm text-gray-500">Nhóm máu</p>
                <p className="font-medium">{userData.bloodType || 'Chưa cập nhật'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Reports */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
            <FaFileAlt className="text-red-500 mr-3" />
            Báo cáo của tôi
          </h2>
          {reportsLoading && (
            <div className="flex items-center text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
              Đang tải...
            </div>
          )}
        </div>

        {reportsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mr-3"></div>
            <span className="text-gray-600">Đang tải báo cáo...</span>
          </div>
        ) : userReports.length === 0 ? (
          <div className="text-center py-8">
            <FaFileAlt className="text-gray-400 text-3xl mx-auto mb-2" />
            <p className="text-gray-600">Chưa có báo cáo nào</p>
          </div>
        ) : (
        <div className="space-y-4">
            {userReports.map((report) => {
              const isDonationReview = report.reportType === 'DonationReview';
              const reviewData = isDonationReview ? parseDonationReview(report.reportContent) : null;

              return (
                <div
                  key={report.reportId}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex-shrink-0">
                          {getReportTypeIcon(report.reportType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {getReportTypeLabel(report.reportType)}
                            </span>
                            {isDonationReview && reviewData.rating > 0 && (
                              <div className="flex items-center">
                                {renderStars(reviewData.rating)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-1" />
                          <span>{new Date(report.reportDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                </div>

                      {/* Content */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {isDonationReview && reviewData.content 
                            ? reviewData.content 
                            : report.reportContent
                          }
                        </p>
                </div>
              </div>
              </div>
            </div>
              );
            })}
        </div>
        )}
      </div>

      {/* Toast notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          duration={4000}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default Profile; 