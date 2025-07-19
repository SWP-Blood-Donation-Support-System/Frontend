import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeartbeat, FaSearch, FaUserPlus, FaBell, FaUsers, FaShieldAlt, FaClock, FaMapMarkerAlt, FaNewspaper, FaUser, FaCalendarAlt, FaArrowRight, FaTimes, FaSpinner, FaGift, FaHandHoldingHeart, FaTrophy, FaRocket } from 'react-icons/fa';
import { getAllBlogPosts, getBlogPostById, isAuthenticated, getEvents, getUserRegisteredEvents } from '../utils/api';

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [allBlogs, setAllBlogs] = useState([]);
  const [events, setEvents] = useState([]);
  const [userRegisteredEvents, setUserRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [blogDetailLoading, setBlogDetailLoading] = useState(false);
  const [showAllBlogs, setShowAllBlogs] = useState(false);
  const loggedIn = isAuthenticated();

  useEffect(() => {
    fetchBlogs();
    fetchEvents();
    if (loggedIn) {
      fetchUserRegisteredEvents();
    }
  }, [loggedIn]);

  const fetchBlogs = async () => {
    try {
      const data = await getAllBlogPosts();
      setAllBlogs(data);
      setBlogs(data.slice(0, 3));
    } catch (err) {
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setEventsLoading(false);
    }
  };

  const fetchUserRegisteredEvents = async () => {
    try {
      const data = await getUserRegisteredEvents();
      setUserRegisteredEvents(data);
    } catch (err) {
      console.error('Error fetching user registered events:', err);
      setUserRegisteredEvents([]);
    }
  };

  const isUserRegisteredForEvent = (eventId) => {
    return userRegisteredEvents.some(event => event.eventId === eventId);
  };

  const handleReadMore = async (blogId) => {
    setBlogDetailLoading(true);
    setShowBlogModal(true);
    try {
      const blogDetail = await getBlogPostById(blogId);
      setSelectedBlog(blogDetail);
    } catch (err) {
      console.error('Error fetching blog detail:', err);
      setSelectedBlog(null);
    } finally {
      setBlogDetailLoading(false);
    }
  };

  const closeBlogModal = () => {
    setShowBlogModal(false);
    setSelectedBlog(null);
  };

  const toggleShowAllBlogs = () => {
    setShowAllBlogs(!showAllBlogs);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Red */}
      <section className="relative bg-gradient-to-br from-red-500 to-red-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center animate-slide-up">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <FaHeartbeat className="text-white text-3xl" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-fade-in-up">
              Mỗi giọt máu đều{' '}
              <span className="text-yellow-300">
                quý giá
              </span>
            </h1>
            
            <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed text-gray-100 animate-slide-up-delay">
              Hãy cùng chúng tôi tạo nên một cộng đồng hiến máu nhân đạo, 
              kết nối những trái tim yêu thương để cứu sống nhiều mạng người
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up-delay-2">
              {!loggedIn && (
                <Link 
                  to="/register" 
                  className="inline-flex items-center px-6 py-3 bg-white text-red-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105"
                >
                  <FaUserPlus className="mr-2" />
                  Đăng ký hiến máu
                </Link>
              )}
              <Link 
                to="/blood-search" 
                className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-red-600 transition-all duration-300 hover:-translate-y-1 hover:scale-105"
              >
                <FaSearch className="mr-2" />
                Tìm kiếm máu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - White */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform duration-300">
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

      {/* Features Section - Light Blue */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Khám phá những tính năng độc đáo giúp việc hiến máu trở nên dễ dàng và hiệu quả hơn
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="group animate-slide-up" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 h-full hover:-translate-y-2">
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

      {/* Events Section - White */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sự kiện nổi bật
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tham gia các sự kiện hiến máu nhân đạo và trải nghiệm những hoạt động ý nghĩa
            </p>
          </div>
          {eventsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              <span className="ml-3 text-gray-600">Đang tải sự kiện...</span>
            </div>
          ) : events.filter(event => event.eventStatus === 'Public').length === 0 ? (
            <div className="text-center py-12">
              <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Chưa có sự kiện công khai nào</h3>
              <p className="text-gray-500">Hiện tại không có sự kiện hiến máu nào đang diễn ra. Hãy quay lại sau!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events
                .filter(event => event.eventStatus === 'Public')
                .slice(0, 3)
                .map((event, index) => {
                  const colors = [
                    'bg-gradient-to-br from-red-500 to-red-600',
                    'bg-gradient-to-br from-pink-500 to-pink-600',
                    'bg-gradient-to-br from-yellow-500 to-orange-500'
                  ];
                  const icons = [
                    <FaGift className="w-8 h-8" />,
                    <FaHandHoldingHeart className="w-8 h-8" />,
                    <FaTrophy className="w-8 h-8" />
                  ];
                  
                  const eventDate = new Date(event.eventDate);
                  const formattedDate = eventDate.toLocaleDateString('vi-VN');
                  const formattedTime = event.eventTime ? event.eventTime.substring(0, 5) : '';
                  
                  return (
                    <div key={event.eventId} className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-2 animate-slide-up" style={{ animationDelay: `${index * 0.3}s` }}>
                      <div className={`h-48 relative overflow-hidden ${colors[index % colors.length]}`}>
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          {icons[index % icons.length]}
                        </div>
                        <div className="absolute bottom-0 left-0 p-6 text-white">
                          <div className="flex items-center mb-2">
                            <FaCalendarAlt className="mr-2 text-sm" />
                            <span className="text-sm font-medium">
                              {formattedDate} {formattedTime && `• ${formattedTime}`}
                            </span>
                          </div>
                          <div className="flex items-center mb-3">
                            <FaMapMarkerAlt className="mr-2 text-sm" />
                            <span className="text-sm font-medium">{event.location || 'Chưa có địa điểm'}</span>
                          </div>
                          <h3 className="text-xl font-bold leading-tight">{event.eventTitle}</h3>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <span className="px-4 py-2 text-sm rounded-2xl font-black bg-green-500/20 text-green-300 border border-green-500/50">
                            {event.currentParticipants}/{event.maxParticipants} người tham gia
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
                          {event.eventContent || 'Mô tả sự kiện sẽ được cập nhật sớm nhất.'}
                        </p>
                        {!loggedIn && (
                          <Link 
                            to="/register" 
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium text-sm rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 hover:scale-105"
                          >
                            <FaUserPlus className="mr-2" />
                            Đăng ký tham gia
                          </Link>
                        )}
                        {loggedIn && isUserRegisteredForEvent(event.eventId) && (
                          <button 
                            className="inline-flex items-center px-4 py-2 bg-green-500 text-white font-medium text-sm rounded-lg cursor-not-allowed"
                            disabled
                          >
                            <FaCalendarAlt className="mr-2" />
                            Đã đăng ký
                          </button>
                        )}
                        {loggedIn && !isUserRegisteredForEvent(event.eventId) && (
                          <Link 
                            to={`/events?eventId=${event.eventId}`} 
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium text-sm rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 hover:scale-105"
                          >
                            <FaUserPlus className="mr-2" />
                            Đăng ký tham gia
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </section>

      {/* Blog Section - Light Green */}
      <section className="py-20 bg-green-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
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
              {(showAllBlogs ? allBlogs : blogs).map((blog, index) => (
                <div key={blog.blogId} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-2 animate-slide-up" style={{ animationDelay: `${index * 0.2}s` }}>
                  {blog.blogImage && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={blog.blogImage}
                        alt={blog.blogTitle}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        blog.blogStatus === 'available' ? 'bg-green-100 text-green-800' :
                        blog.blogStatus === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {blog.blogStatus === 'available' ? 'Đã xuất bản' :
                         blog.blogStatus === 'draft' ? 'Bản nháp' :
                         blog.blogStatus === 'archived' ? 'Đã lưu trữ' : blog.blogStatus}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-red-600 transition-colors duration-200">
                      {blog.blogTitle}
                    </h3>
                    
                    {blog.authorName && (
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <FaUser className="mr-2" />
                        {blog.authorName}
                      </div>
                    )}
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {blog.blogContent?.substring(0, 120)}...
                    </p>

                    <button 
                      onClick={() => handleReadMore(blog.blogId)}
                      className="inline-flex items-center text-red-600 hover:text-red-700 font-medium text-sm transition-colors duration-200 hover:underline"
                    >
                      Đọc thêm
                      <FaArrowRight className="ml-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {allBlogs.length > 3 && (
            <div className="text-center mt-12">
              <button 
                onClick={toggleShowAllBlogs}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 hover:scale-105"
              >
                <FaNewspaper className="mr-2" />
                {showAllBlogs ? 'Thu gọn' : 'Xem tất cả bài viết'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action - Purple */}
      <section className="bg-gradient-to-r from-purple-500 to-purple-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8 animate-fade-in-up">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
              <FaHeartbeat className="text-white text-2xl" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Sẵn sàng cứu người?
            </h2>
          </div>
          
          <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed text-gray-100 animate-slide-up-delay">
            Hãy đăng ký ngay hôm nay để trở thành một phần của cộng đồng hiến máu nhân đạo. 
            Mỗi hành động nhỏ của bạn có thể tạo nên sự khác biệt lớn.
          </p>
          
          {!loggedIn && (
            <Link 
              to="/register" 
              className="inline-flex items-center px-8 py-4 bg-white text-purple-600 font-bold text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-gray-50 hover:scale-105"
            >
              <FaUserPlus className="mr-3 text-xl" />
              Đăng ký ngay
            </Link>
          )}
        </div>
      </section>

             {/* Blog Modal */}
      {showBlogModal && selectedBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden animate-fade-in-up">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl z-10">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight truncate">
                    {selectedBlog.blogTitle || 'Chi tiết bài viết'}
                  </h2>
                  <div className="flex items-center space-x-4 flex-wrap">
                    <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                      selectedBlog.blogStatus === 'available' ? 'bg-green-100 text-green-800' :
                      selectedBlog.blogStatus === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedBlog.blogStatus === 'available' ? 'Đã xuất bản' :
                        selectedBlog.blogStatus === 'draft' ? 'Bản nháp' :
                        selectedBlog.blogStatus === 'archived' ? 'Đã lưu trữ' : selectedBlog.blogStatus}
                    </span>
                  </div>
                  {selectedBlog.authorName && (
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      <FaUser className="mr-2" />
                      {selectedBlog.authorName}
                    </div>
                  )}
                </div>
                <button 
                  onClick={closeBlogModal}
                  className="ml-4 p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 flex-shrink-0"
                  title="Đóng"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
              {blogDetailLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="text-center">
                    <FaSpinner className="animate-spin text-red-500 text-6xl mx-auto mb-6" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Đang tải bài viết...</h3>
                    <p className="text-gray-500">Vui lòng chờ trong giây lát</p>
                  </div>
                </div>
              ) : (
                <div className="px-8 py-8">
                  {selectedBlog.blogImage && (
                    <div className="mb-8 relative">
                      <img
                        src={selectedBlog.blogImage}
                        alt={selectedBlog.blogTitle}
                        className="w-full h-64 md:h-80 object-cover rounded-xl shadow-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                    </div>
                  )}
                  <div className="prose prose-lg max-w-none">
                    <div className="text-gray-800 leading-relaxed">
                      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                        <div className="whitespace-pre-wrap text-lg leading-8 text-gray-700">
                          {selectedBlog.blogDetail || selectedBlog.blogContent}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home; 