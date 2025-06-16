import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaExclamationTriangle, FaTint, FaMapMarkerAlt, FaPhone, FaEnvelope, FaHospital } from 'react-icons/fa';

const EmergencyRequests = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels = [
    { value: 'critical', label: 'Cấp cứu khẩn cấp' },
    { value: 'urgent', label: 'Cấp cứu' },
    { value: 'normal', label: 'Bình thường' },
  ];

  // Mock data for demonstration
  const mockRequests = [
    {
      id: 1,
      patientName: 'Nguyễn Văn A',
      bloodType: 'A+',
      units: 2,
      urgency: 'critical',
      hospital: 'Bệnh viện Chợ Rẫy',
      location: 'Quận 5, TP.HCM',
      contact: {
        name: 'Trần Thị B',
        phone: '0123456789',
        email: 'tranthib@email.com',
      },
      deadline: '2024-03-20',
      status: 'pending',
    },
    {
      id: 2,
      patientName: 'Lê Văn C',
      bloodType: 'O-',
      units: 1,
      urgency: 'urgent',
      hospital: 'Bệnh viện Nhân dân 115',
      location: 'Quận 10, TP.HCM',
      contact: {
        name: 'Phạm Thị D',
        phone: '0987654321',
        email: 'phamthid@email.com',
      },
      deadline: '2024-03-21',
      status: 'fulfilled',
    },
  ];

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement API call to save emergency request
      console.log('Form data:', data);
      alert('Yêu cầu cấp cứu đã được gửi thành công!');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Yêu cầu cấp cứu</h1>

      {/* Emergency Request Form */}
      <div className="card mb-12">
        <h2 className="text-2xl font-semibold mb-6">Đăng ký yêu cầu cấp cứu</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên bệnh nhân
              </label>
              <input
                type="text"
                {...register('patientName', { required: 'Vui lòng nhập tên bệnh nhân' })}
                className="input"
                placeholder="Nhập tên bệnh nhân"
              />
              {errors.patientName && (
                <p className="mt-1 text-sm text-red-600">{errors.patientName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nhóm máu cần
              </label>
              <select
                {...register('bloodType', { required: 'Vui lòng chọn nhóm máu' })}
                className="input"
              >
                <option value="">Chọn nhóm máu</option>
                {bloodTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.bloodType && (
                <p className="mt-1 text-sm text-red-600">{errors.bloodType.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số đơn vị máu cần
              </label>
              <input
                type="number"
                {...register('units', {
                  required: 'Vui lòng nhập số đơn vị máu',
                  min: { value: 1, message: 'Số đơn vị máu phải lớn hơn 0' },
                })}
                className="input"
                placeholder="Nhập số đơn vị máu"
              />
              {errors.units && (
                <p className="mt-1 text-sm text-red-600">{errors.units.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mức độ khẩn cấp
              </label>
              <select
                {...register('urgency', { required: 'Vui lòng chọn mức độ khẩn cấp' })}
                className="input"
              >
                <option value="">Chọn mức độ khẩn cấp</option>
                {urgencyLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
              {errors.urgency && (
                <p className="mt-1 text-sm text-red-600">{errors.urgency.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bệnh viện
              </label>
              <input
                type="text"
                {...register('hospital', { required: 'Vui lòng nhập tên bệnh viện' })}
                className="input"
                placeholder="Nhập tên bệnh viện"
              />
              {errors.hospital && (
                <p className="mt-1 text-sm text-red-600">{errors.hospital.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ
              </label>
              <input
                type="text"
                {...register('location', { required: 'Vui lòng nhập địa chỉ' })}
                className="input"
                placeholder="Nhập địa chỉ"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Người liên hệ
              </label>
              <input
                type="text"
                {...register('contactName', { required: 'Vui lòng nhập tên người liên hệ' })}
                className="input"
                placeholder="Nhập tên người liên hệ"
              />
              {errors.contactName && (
                <p className="mt-1 text-sm text-red-600">{errors.contactName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                {...register('contactPhone', {
                  required: 'Vui lòng nhập số điện thoại',
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: 'Số điện thoại không hợp lệ',
                  },
                })}
                className="input"
                placeholder="Nhập số điện thoại"
              />
              {errors.contactPhone && (
                <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                {...register('contactEmail', {
                  required: 'Vui lòng nhập email',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email không hợp lệ',
                  },
                })}
                className="input"
                placeholder="Nhập email"
              />
              {errors.contactEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời hạn cần máu
              </label>
              <input
                type="date"
                {...register('deadline', { required: 'Vui lòng chọn thời hạn' })}
                className="input"
              />
              {errors.deadline && (
                <p className="mt-1 text-sm text-red-600">{errors.deadline.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full md:w-auto"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Gửi yêu cầu cấp cứu'}
            </button>
          </div>
        </form>
      </div>

      {/* Active Emergency Requests */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Yêu cầu cấp cứu đang hoạt động</h2>
        <div className="space-y-4">
          {mockRequests.map((request) => (
            <div key={request.id} className="card">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-xl font-semibold mr-4">{request.patientName}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        request.urgency === 'critical'
                          ? 'bg-red-100 text-red-800'
                          : request.urgency === 'urgent'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {request.urgency === 'critical'
                        ? 'Cấp cứu khẩn cấp'
                        : request.urgency === 'urgent'
                        ? 'Cấp cứu'
                        : 'Bình thường'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <FaTint className="mr-2" />
                      <span>Nhóm máu: {request.bloodType}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaHospital className="mr-2" />
                      <span>{request.hospital}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaMapMarkerAlt className="mr-2" />
                      <span>{request.location}</span>
                    </div>
                    <div className="text-gray-600">
                      Số đơn vị máu cần: {request.units}
                    </div>
                    <div className="text-gray-600">
                      Thời hạn: {request.deadline}
                    </div>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 md:ml-4 space-y-2">
                  <div className="text-gray-600">
                    Người liên hệ: {request.contact.name}
                  </div>
                  <a
                    href={`tel:${request.contact.phone}`}
                    className="flex items-center text-gray-600 hover:text-primary-600"
                  >
                    <FaPhone className="mr-2" />
                    {request.contact.phone}
                  </a>
                  <a
                    href={`mailto:${request.contact.email}`}
                    className="flex items-center text-gray-600 hover:text-primary-600"
                  >
                    <FaEnvelope className="mr-2" />
                    {request.contact.email}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmergencyRequests; 