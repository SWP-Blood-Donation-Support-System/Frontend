import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt, FaHeartbeat, FaYoutube, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: 'Nhóm máu', path: '/blood-types' },
    { name: 'Đăng ký hiến máu', path: '/register' },
    { name: 'Tìm kiếm máu', path: '/blood-search' },
   
  
  ];

  const socialLinks = [
    { icon: <FaFacebook size={20} />, href: '#', label: 'Facebook' },
    { icon: <FaTwitter size={20} />, href: '#', label: 'Twitter' },
    { icon: <FaInstagram size={20} />, href: '#', label: 'Instagram' },
    { icon: <FaYoutube size={20} />, href: '#', label: 'YouTube' },
    { icon: <FaLinkedin size={20} />, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 animate-fade-in-up">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                <FaHeartbeat className="text-white text-xl" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                BloodCare
              </span>
            </div>
            <p className="text-gray-300 leading-relaxed mb-6">
              Chúng tôi cam kết tạo nên một cộng đồng hiến máu nhân đạo, 
              kết nối những trái tim yêu thương để cứu sống nhiều mạng người.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center text-gray-300 hover:text-white transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white">Liên kết nhanh</h3>
            <ul className="space-y-3">
              {footerLinks.slice(0, 4).map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.path}
                    className="text-gray-300 hover:text-red-400 transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white">Liên hệ</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 group">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 group-hover:bg-red-500 transition-colors duration-200">
                  <FaPhone className="text-white text-sm" />
                </div>
                <div>
                  <p className="text-gray-300 font-medium">Hotline</p>
                  <p className="text-white">1900 1234</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 group">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 group-hover:bg-red-500 transition-colors duration-200">
                  <FaEnvelope className="text-white text-sm" />
                </div>
                <div>
                  <p className="text-gray-300 font-medium">Email</p>
                  <p className="text-white">contact@bloodcare.vn</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 group">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 group-hover:bg-red-500 transition-colors duration-200">
                  <FaMapMarkerAlt className="text-white text-sm" />
                </div>
                <div>
                  <p className="text-gray-300 font-medium">Địa chỉ</p>
                  <p className="text-white">123 Đường ABC, Quận XYZ, TP. HCM</p>
                </div>
              </div>
            </div>
          </div>

        
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-center md:text-left">
              &copy; {currentYear} BloodCare. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-red-400 transition-colors duration-200">
                Chính sách bảo mật
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-red-400 transition-colors duration-200">
                Điều khoản sử dụng
              </Link>
              <Link to="/sitemap" className="text-gray-400 hover:text-red-400 transition-colors duration-200">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 