import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeartbeat, FaSearch, FaUserPlus, FaBell, FaUsers, FaShieldAlt, FaClock, FaMapMarkerAlt, FaNewspaper, FaUser, FaCalendarAlt, FaArrowRight } from 'react-icons/fa';
import { getAllBlogPosts } from '../utils/api';

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const data = await getAllBlogPosts();
      // Chỉ lấy 3 blog mới nhất
      setBlogs(data.slice(0, 3));
    } catch (err) {
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <FaHeartbeat className="w-6 h-6" />,
      title: 'Hiến máu cứu người',
      description: 'Mỗi giọt máu của bạn có thể cứu sống một mạng người. Hãy cùng chúng tôi lan tỏa yêu thương.',
      color: 'bg-red-500'
    },
    {
      icon: <FaSearch className="w-6 h-6" />,
      title: 'Tìm kiếm máu nhanh chóng',
      description: 'Hệ thống tìm kiếm thông minh giúp kết nối người cần máu với người hiến máu một cách nhanh chóng.',
      color: 'bg-blue-500'
    },
    {
      icon: <FaUserPlus className="w-6 h-6" />,
      title: 'Đăng ký hiến máu',
      description: 'Đăng ký thông tin và nhóm máu của bạn để sẵn sàng hiến máu khi cần thiết.',
      color: 'bg-green-500'
    },
    {
      icon: <FaBell className="w-6 h-6" />,
      title: 'Thông báo khẩn cấp',
      description: 'Nhận thông báo ngay lập tức khi có trường hợp cần máu khẩn cấp trong khu vực của bạn.',
      color: 'bg-yellow-500'
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Người hiến máu', icon: <FaUsers className="w-5 h-5" /> },
    { number: '50,000+', label: 'Lượt hiến máu', icon: <FaHeartbeat className="w-5 h-5" /> },
    { number: '100+', label: 'Bệnh viện', icon: <FaShieldAlt className="w-5 h-5" /> },
    { number: '24/7', label: 'Hỗ trợ', icon: <FaClock className="w-5 h-5" /> },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-500 to-red-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                <FaHeartbeat className="text-white text-3xl" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Mỗi giọt máu đều{' '}
              <span className="text-yellow-300">
                quý giá
              </span>
            </h1>
            
            <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed text-gray-100">
              Hãy cùng chúng tôi tạo nên một cộng đồng hiến máu nhân đạo, 
              kết nối những trái tim yêu thương để cứu sống nhiều mạng người
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/donor-registration" 
                className="inline-flex items-center px-6 py-3 bg-white text-red-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <FaUserPlus className="mr-2" />
                Đăng ký hiến máu
              </Link>
              
              <Link 
                to="/blood-search" 
                className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-red-600 transition-all duration-300 hover:-translate-y-1"
              >
                <FaSearch className="mr-2" />
                Tìm kiếm máu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white shadow-md">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Khám phá những tính năng độc đáo giúp việc hiến máu trở nên dễ dàng và hiệu quả hơn
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 h-full">
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Bài viết mới nhất
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Cập nhật những thông tin mới nhất về hiến máu, sức khỏe và các sự kiện quan trọng
            </p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              <span className="ml-3 text-gray-600">Đang tải bài viết...</span>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-12">
              <FaNewspaper className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Chưa có bài viết nào</h3>
              <p className="text-gray-500">Hãy quay lại sau để xem những bài viết mới nhất</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <div key={blog.blogId} className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {blog.blogImage && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={blog.blogImage}
                        alt={blog.blogTitle}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                      {blog.blogTitle}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {blog.blogContent?.substring(0, 120)}...
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <FaUser className="mr-2" />
                        {blog.authorName || 'Tác giả'}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <FaCalendarAlt className="mr-2" />
                        {formatDate(blog.createdDate)}
                      </div>
                    </div>

                    <Link 
                      to={`/blog/${blog.blogId}`}
                      className="inline-flex items-center text-red-600 hover:text-red-700 font-medium text-sm transition-colors duration-200"
                    >
                      Đọc thêm
                      <FaArrowRight className="ml-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {blogs.length > 0 && (
            <div className="text-center mt-12">
              <Link 
                to="/blog-management"
                className="inline-flex items-center px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <FaNewspaper className="mr-2" />
                Xem tất cả bài viết
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-red-500 to-red-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Sẵn sàng cứu người?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto leading-relaxed text-gray-100">
            Hãy đăng ký ngay hôm nay để trở thành một phần của cộng đồng hiến máu nhân đạo. 
            Mỗi hành động nhỏ của bạn có thể tạo nên sự khác biệt lớn.
          </p>
          <Link 
            to="/donor-registration" 
            className="inline-flex items-center px-8 py-3 bg-white text-red-600 font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <FaUserPlus className="mr-2" />
            Đăng ký ngay
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home; 