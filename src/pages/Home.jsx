import { Link } from 'react-router-dom';
import { FaHeartbeat, FaSearch, FaUserPlus, FaBell } from 'react-icons/fa';

const Home = () => {
  const features = [
    {
      icon: <FaHeartbeat className="w-8 h-8 text-primary-500" />,
      title: 'Hiến máu cứu người',
      description: 'Mỗi giọt máu của bạn có thể cứu sống một mạng người. Hãy cùng chúng tôi lan tỏa yêu thương.',
    },
    {
      icon: <FaSearch className="w-8 h-8 text-primary-500" />,
      title: 'Tìm kiếm máu nhanh chóng',
      description: 'Hệ thống tìm kiếm thông minh giúp kết nối người cần máu với người hiến máu một cách nhanh chóng.',
    },
    {
      icon: <FaUserPlus className="w-8 h-8 text-primary-500" />,
      title: 'Đăng ký hiến máu',
      description: 'Đăng ký thông tin và nhóm máu của bạn để sẵn sàng hiến máu khi cần thiết.',
    },
    {
      icon: <FaBell className="w-8 h-8 text-primary-500" />,
      title: 'Thông báo khẩn cấp',
      description: 'Nhận thông báo ngay lập tức khi có trường hợp cần máu khẩn cấp trong khu vực của bạn.',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Mỗi giọt máu đều quý giá
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Hãy cùng chúng tôi tạo nên một cộng đồng hiến máu nhân đạo
            </p>
            <div className="space-x-4">
              <Link to="/donor-registration" className="btn bg-white text-primary-600 hover:bg-gray-100">
                Đăng ký hiến máu
              </Link>
              <Link to="/blood-search" className="btn border-2 border-white hover:bg-white hover:text-primary-600">
                Tìm kiếm máu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Tính năng nổi bật</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card hover:shadow-lg transition-shadow duration-300">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Sẵn sàng cứu người?</h2>
          <p className="text-xl mb-8">
            Hãy đăng ký ngay hôm nay để trở thành một phần của cộng đồng hiến máu nhân đạo
          </p>
          <Link to="/donor-registration" className="btn bg-white text-primary-600 hover:bg-gray-100">
            Đăng ký ngay
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home; 