import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTint } from 'react-icons/fa';

const DonorRegistration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement API call to save donor registration
      console.log('Form data:', data);
      alert('Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Đăng ký hiến máu</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
        {/* Personal Information */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Thông tin cá nhân</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {...register('fullName', { required: 'Vui lòng nhập họ tên' })}
                  className="input pl-10"
                  placeholder="Nhập họ và tên"
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
                  {...register('email', {
                    required: 'Vui lòng nhập email',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email không hợp lệ',
                    },
                  })}
                  className="input pl-10"
                  placeholder="Nhập email"
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
                  {...register('phone', {
                    required: 'Vui lòng nhập số điện thoại',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Số điện thoại không hợp lệ',
                    },
                  })}
                  className="input pl-10"
                  placeholder="Nhập số điện thoại"
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
                  {...register('address', { required: 'Vui lòng nhập địa chỉ' })}
                  className="input pl-10"
                  placeholder="Nhập địa chỉ"
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Blood Information */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Thông tin máu</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nhóm máu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaTint className="text-gray-400" />
                </div>
                <select
                  {...register('bloodType', { required: 'Vui lòng chọn nhóm máu' })}
                  className="input pl-10"
                >
                  <option value="">Chọn nhóm máu</option>
                  {bloodTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              {errors.bloodType && (
                <p className="mt-1 text-sm text-red-600">{errors.bloodType.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời gian sẵn sàng hiến máu
              </label>
              <input
                type="date"
                {...register('availableDate', { required: 'Vui lòng chọn ngày' })}
                className="input"
              />
              {errors.availableDate && (
                <p className="mt-1 text-sm text-red-600">{errors.availableDate.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Health Information */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Thông tin sức khỏe</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cân nặng (kg)
              </label>
              <input
                type="number"
                {...register('weight', {
                  required: 'Vui lòng nhập cân nặng',
                  min: {
                    value: 45,
                    message: 'Cân nặng phải từ 45kg trở lên',
                  },
                })}
                className="input"
                placeholder="Nhập cân nặng"
              />
              {errors.weight && (
                <p className="mt-1 text-sm text-red-600">{errors.weight.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lần hiến máu gần nhất
              </label>
              <input
                type="date"
                {...register('lastDonation')}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary w-full md:w-auto"
          >
            {isSubmitting ? 'Đang xử lý...' : 'Đăng ký hiến máu'}
          </button>
        </div>
      </form>

      {/* Additional Information */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Lưu ý quan trọng</h2>
        <div className="card">
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Người hiến máu phải đủ 18 tuổi trở lên và có sức khỏe tốt.</li>
            <li>Cân nặng phải từ 45kg trở lên.</li>
            <li>Thời gian giữa các lần hiến máu phải cách nhau ít nhất 12 tuần.</li>
            <li>Không mắc các bệnh truyền nhiễm như HIV, viêm gan B, C, sốt rét, v.v.</li>
            <li>Không sử dụng ma túy hoặc các chất kích thích khác.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DonorRegistration; 