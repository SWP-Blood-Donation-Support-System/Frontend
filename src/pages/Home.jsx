import { Link } from 'react-router-dom';
import { FaHeartbeat, FaSearch, FaUserPlus, FaBell, FaUsers, FaShieldAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';

const Home = () => {
  const features = [
    {
      icon: <FaHeartbeat className="w-8 h-8 text-red-500" />,
      title: 'Hiến máu cứu người',
      description: 'Mỗi giọt máu của bạn có thể cứu sống một mạng người. Hãy cùng chúng tôi lan tỏa yêu thương.',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: <FaSearch className="w-8 h-8 text-blue-500" />,
      title: 'Tìm kiếm máu nhanh chóng',
      description: 'Hệ thống tìm kiếm thông minh giúp kết nối người cần máu với người hiến máu một cách nhanh chóng.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <FaUserPlus className="w-8 h-8 text-green-500" />,
      title: 'Đăng ký hiến máu',
      description: 'Đăng ký thông tin và nhóm máu của bạn để sẵn sàng hiến máu khi cần thiết.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <FaBell className="w-8 h-8 text-yellow-500" />,
      title: 'Thông báo khẩn cấp',
      description: 'Nhận thông báo ngay lập tức khi có trường hợp cần máu khẩn cấp trong khu vực của bạn.',
      color: 'from-yellow-500 to-yellow-600'
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Người hiến máu', icon: <FaUsers className="w-6 h-6" /> },
    { number: '50,000+', label: 'Lượt hiến máu', icon: <FaHeartbeat className="w-6 h-6" /> },
    { number: '100+', label: 'Bệnh viện', icon: <FaShieldAlt className="w-6 h-6" /> },
    { number: '24/7', label: 'Hỗ trợ', icon: <FaClock className="w-6 h-6" /> },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0 bg-dots-pattern opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center animate-fade-in">
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl hover:scale-110 hover:rotate-12 transition-all duration-600">
                <FaHeartbeat className="text-white text-4xl" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-slide-up">
              Mỗi giọt máu đều{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                quý giá
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up-delay">
              Hãy cùng chúng tôi tạo nên một cộng đồng hiến máu nhân đạo, 
              kết nối những trái tim yêu thương để cứu sống nhiều mạng người
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up-delay-2">
              <div className="hover:scale-105 transition-transform duration-300">
                <Link 
                  to="/donor-registration" 
                  className="inline-flex items-center px-8 py-4 bg-white text-red-600 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <FaUserPlus className="mr-2" />
                  Đăng ký hiến máu
                </Link>
              </div>
              
              <div className="hover:scale-105 transition-transform duration-300">
                <Link 
                  to="/blood-search" 
                  className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-red-600 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <FaSearch className="mr-2" />
                  Tìm kiếm máu
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in-up">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white shadow-lg">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Tính năng nổi bật
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Khám phá những tính năng độc đáo giúp việc hiến máu trở nên dễ dàng và hiệu quả hơn
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in-up">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group hover:-translate-y-2 transition-transform duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative bg-gradient-to-r from-red-600 to-red-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0 bg-dots-pattern opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Sẵn sàng cứu người?
            </h2>
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed">
              Hãy đăng ký ngay hôm nay để trở thành một phần của cộng đồng hiến máu nhân đạo. 
              Mỗi hành động nhỏ của bạn có thể tạo nên sự khác biệt lớn.
            </p>
            <div className="hover:scale-105 transition-transform duration-300">
              <Link 
                to="/donor-registration" 
                className="inline-flex items-center px-10 py-4 bg-white text-red-600 font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <FaUserPlus className="mr-3 text-xl" />
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 