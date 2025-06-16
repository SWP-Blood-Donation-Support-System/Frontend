import { FaFacebook, FaTwitter, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-bold mb-4">Liên hệ</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FaPhone className="text-primary-500" />
                <span>Hotline: 1900 1234</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-primary-500" />
                <span>contact@bloodcare.vn</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaMapMarkerAlt className="text-primary-500" />
                <span>123 Đường ABC, Quận XYZ, TP. HCM</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li><a href="/blood-types" className="hover:text-primary-500">Nhóm máu</a></li>
              <li><a href="/donor-registration" className="hover:text-primary-500">Đăng ký hiến máu</a></li>
              <li><a href="/blood-search" className="hover:text-primary-500">Tìm kiếm máu</a></li>
              <li><a href="/emergency" className="hover:text-primary-500">Cấp cứu</a></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-xl font-bold mb-4">Kết nối với chúng tôi</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary-500">
                <FaFacebook size={24} />
              </a>
              <a href="#" className="hover:text-primary-500">
                <FaTwitter size={24} />
              </a>
              <a href="#" className="hover:text-primary-500">
                <FaInstagram size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p>&copy; {new Date().getFullYear()} BloodCare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 