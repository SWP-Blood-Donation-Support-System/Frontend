const API_BASE_URL = 'https://blooddonationsystem-gzgdhdhzh5c0gmff.southeastasia-01.azurewebsites.net/api';

// Helper function to get auth token
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to set auth token
export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

// Helper function to remove auth token
export const removeAuthToken = () => {
  localStorage.removeItem('token');
};

// Helper function to get user data
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Helper function to set user data
export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Helper function to remove user data
export const removeUser = () => {
  localStorage.removeItem('user');
};

// API call helper
export const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API call failed');
    }

    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Login API call
export const loginUser = async (username, password) => {
  try {
    console.log('Attempting login with:', { username, password });
    
    const response = await fetch(`${API_BASE_URL}/User/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    // Handle different response types
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
      console.log('Non-JSON response:', data);
    }

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 500) {
        throw new Error('Lỗi máy chủ (500). Vui lòng thử lại sau hoặc liên hệ quản trị viên.');
      } else if (response.status === 404) {
        throw new Error('API endpoint không tồn tại. Vui lòng kiểm tra lại URL.');
      } else if (response.status === 401) {
        throw new Error('Username hoặc mật khẩu không đúng.');
      } else {
        throw new Error(data.message || `Lỗi ${response.status}: ${response.statusText}`);
      }
    }

    // Validate response format
    if (!data.token) {
      throw new Error('Response không chứa token. Vui lòng thử lại.');
    }

    console.log('Login successful, token received:', data.token);
    console.log('User data:', data.user);

    return data;
  } catch (error) {
    console.error('Login error details:', error);
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.');
    }
    
    throw error;
  }
};

// Register API call
export const registerUser = async (userData) => {
  try {
    console.log('Attempting registration with:', userData);
    
    const response = await fetch(`${API_BASE_URL}/User/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    console.log('Registration response status:', response.status);
    console.log('Registration response headers:', response.headers);

    // Handle different response types
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
      console.log('Non-JSON registration response:', data);
    }

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 400) {
        throw new Error(data.message || 'Dữ liệu đăng ký không hợp lệ. Vui lòng kiểm tra lại.');
      } else if (response.status === 409) {
        throw new Error('Username hoặc email đã tồn tại. Vui lòng chọn thông tin khác.');
      } else if (response.status === 500) {
        throw new Error('Lỗi máy chủ (500). Vui lòng thử lại sau.');
      } else {
        throw new Error(data.message || `Lỗi ${response.status}: ${response.statusText}`);
      }
    }

    console.log('Registration successful:', data);
    return data;
  } catch (error) {
    console.error('Registration error details:', error);
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.');
    }
    
    throw error;
  }
};

// Get events list
export const getEvents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/Appointment/GetEventsLists`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Register for an event
export const registerForEvent = async (eventId) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Bạn cần đăng nhập để đăng ký sự kiện');
    }

    const user = getUser();
    if (!user || !user.username) {
      throw new Error('Không tìm thấy thông tin người dùng');
    }

    console.log('Registering for event:', { eventId, username: user.username });

    const response = await fetch(`${API_BASE_URL}/Appointment/RegisterAppointment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        eventId: eventId,
        username: user.username
      })
    });

    console.log('Registration response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Registration error response:', errorData);
      
      // Handle specific error cases
      if (response.status === 400) {
        throw new Error(errorData.message || 'Dữ liệu đăng ký không hợp lệ');
      } else if (response.status === 409) {
        throw new Error('Bạn đã đăng ký sự kiện này rồi');
      } else if (response.status === 404) {
        throw new Error('Không tìm thấy sự kiện');
      } else {
        throw new Error(errorData.message || `Lỗi đăng ký: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('Registration successful:', data);
    return data;
  } catch (error) {
    console.error('Error registering for event:', error);
    throw error;
  }
};

// Get user's registered events
export const getUserRegisteredEvents = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Bạn cần đăng nhập để xem sự kiện đã đăng ký');
    }

    const user = getUser();
    if (!user || !user.username) {
      throw new Error('Không tìm thấy thông tin người dùng');
    }

    const response = await fetch(`${API_BASE_URL}/Appointment/AppointmentHistory/${user.username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch user appointments: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user appointments:', error);
    throw error;
  }
};

// Get appointment history for a user
export const getAppointmentHistory = async (username) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Bạn cần đăng nhập để xem lịch sử lịch hẹn');
    }

    const response = await fetch(`${API_BASE_URL}/Appointment/AppointmentHistory/${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch appointment history: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching appointment history:', error);
    throw error;
  }
};

// Cancel an appointment
export const cancelAppointment = async (appointmentId) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Bạn cần đăng nhập để hủy lịch hẹn');
    }

    console.log('Cancelling appointment:', appointmentId);

    const response = await fetch(`${API_BASE_URL}/Appointment/CancelAppointment/${appointmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });

    console.log('Cancel response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Cancel error response:', errorData);
      
      // Handle specific error cases
      if (response.status === 400) {
        throw new Error(errorData.message || 'Dữ liệu hủy lịch hẹn không hợp lệ');
      } else if (response.status === 404) {
        throw new Error('Không tìm thấy lịch hẹn');
      } else if (response.status === 409) {
        throw new Error('Lịch hẹn đã được hủy trước đó');
      } else {
        throw new Error(errorData.message || `Lỗi hủy lịch hẹn: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('Cancel successful:', data);
    return data;
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
};

// Logout function
export const logout = () => {
  removeAuthToken();
  removeUser();
  
  // Dispatch custom event to notify components
  window.dispatchEvent(new Event('authStateChanged'));
  
  window.location.href = '/login';
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Get registered participants by event ID (for staff/admin)
export const getRegisteredParticipantsByEventId = async (eventId) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Bạn cần đăng nhập để xem danh sách người tham gia');
    }

    const response = await fetch(`${API_BASE_URL}/BloodDonationProcess/GetRegisterListByEventID/${eventId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch registered participants: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching registered participants:', error);
    throw error;
  }
};

// Check-in participant (for staff/admin)
export const checkinParticipant = async (appointmentId) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Bạn cần đăng nhập để thực hiện check-in');
    }

    console.log('Checking in participant:', appointmentId);

    const response = await fetch(`${API_BASE_URL}/BloodDonationProcess/Checkin`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ appointmentId: appointmentId })
    });

    console.log('Check-in response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Check-in error response:', errorData);
      
      // Handle specific error cases
      if (response.status === 400) {
        throw new Error(errorData.message || 'Dữ liệu check-in không hợp lệ');
      } else if (response.status === 404) {
        throw new Error('Không tìm thấy lịch hẹn');
      } else if (response.status === 409) {
        throw new Error('Người tham gia đã được check-in trước đó');
      } else {
        throw new Error(errorData.message || `Lỗi check-in: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('Check-in successful:', data);
    return data;
  } catch (error) {
    console.error('Error checking in participant:', error);
    throw error;
  }
};

// Record donation (for staff/admin)
export const recordDonation = async (appointmentId, bloodType, donationVolume) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Bạn cần đăng nhập để ghi nhận hiến máu');
    }

    console.log('Recording donation:', { appointmentId, bloodType, donationVolume });

    const response = await fetch(`${API_BASE_URL}/BloodDonationProcess/RecordDonation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        appointmentId: appointmentId,
        bloodType: bloodType,
        donationVolume: donationVolume
      })
    });

    console.log('Record donation response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Record donation error response:', errorData);
      
      // Handle specific error cases
      if (response.status === 400) {
        throw new Error(errorData.message || 'Dữ liệu ghi nhận hiến máu không hợp lệ');
      } else if (response.status === 404) {
        throw new Error('Không tìm thấy lịch hẹn');
      } else if (response.status === 409) {
        throw new Error('Hiến máu đã được ghi nhận trước đó');
      } else {
        throw new Error(errorData.message || `Lỗi ghi nhận hiến máu: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('Record donation successful:', data);
    return data;
  } catch (error) {
    console.error('Error recording donation:', error);
    throw error;
  }
};

// Blog Management APIs
// Create a new blog post
export const createBlogPost = async (blogData) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Bạn cần đăng nhập để tạo bài viết blog');
    }

    console.log('Creating blog post:', blogData);

    const response = await fetch(`${API_BASE_URL}/Blog/CreateBlog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(blogData)
    });

    console.log('Create blog response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Create blog error response:', errorData);
      
      if (response.status === 400) {
        throw new Error(errorData.message || 'Dữ liệu bài viết không hợp lệ');
      } else if (response.status === 401) {
        throw new Error('Bạn không có quyền tạo bài viết blog');
      } else {
        throw new Error(errorData.message || `Lỗi tạo bài viết: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('Create blog successful:', data);
    return data;
  } catch (error) {
    console.error('Error creating blog post:', error);
    throw error;
  }
};

// Get all blog posts
export const getAllBlogPosts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/Blog`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch blogs: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    throw error;
  }
};

// Get blog post by ID
export const getBlogPostById = async (blogId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Blog/GetBlogById/${blogId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch blog: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    throw error;
  }
};

// Update blog post
export const updateBlogPost = async (blogId, blogData) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Bạn cần đăng nhập để cập nhật bài viết blog');
    }

    console.log('Updating blog post:', { blogId, blogData });

    const response = await fetch(`${API_BASE_URL}/Blog/UpdateBlog/${blogId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(blogData)
    });

    console.log('Update blog response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Update blog error response:', errorData);
      
      if (response.status === 400) {
        throw new Error(errorData.message || 'Dữ liệu cập nhật không hợp lệ');
      } else if (response.status === 401) {
        throw new Error('Bạn không có quyền cập nhật bài viết này');
      } else if (response.status === 404) {
        throw new Error('Không tìm thấy bài viết blog');
      } else {
        throw new Error(errorData.message || `Lỗi cập nhật bài viết: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('Update blog successful:', data);
    return data;
  } catch (error) {
    console.error('Error updating blog post:', error);
    throw error;
  }
};

// Delete blog post
export const deleteBlogPost = async (blogId) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Bạn cần đăng nhập để xóa bài viết blog');
    }

    console.log('Deleting blog post:', blogId);

    const response = await fetch(`${API_BASE_URL}/Blog/DeleteBlog/${blogId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });

    console.log('Delete blog response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Delete blog error response:', errorData);
      
      if (response.status === 401) {
        throw new Error('Bạn không có quyền xóa bài viết này');
      } else if (response.status === 404) {
        throw new Error('Không tìm thấy bài viết blog');
      } else {
        throw new Error(errorData.message || `Lỗi xóa bài viết: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('Delete blog successful:', data);
    return data;
  } catch (error) {
    console.error('Error deleting blog post:', error);
    throw error;
  }
};

// Get blog posts by author
export const getBlogPostsByAuthor = async (username) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Blog/GetBlogsByAuthor/${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch author blogs: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching author blog posts:', error);
    throw error;
  }
};

// Get blood inventory
export const getBloodInventory = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Bạn cần đăng nhập để xem thông tin kho máu');
    }

    const response = await fetch(`${API_BASE_URL}/blood-inventory`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch blood inventory: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching blood inventory:', error);
    throw error;
  }
};

// Get all reports
export const getAllReports = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Bạn cần đăng nhập để xem báo cáo');
    }

    const response = await fetch(`${API_BASE_URL}/Report/GetAllReports`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch reports: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

// Submit survey answers
export const submitSurveyAnswers = async (appointmentId, surveyAnswers) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Bạn cần đăng nhập để gửi khảo sát');
    }

    // Format dữ liệu theo yêu cầu của server
    const formattedAnswers = {
      appointmentId: appointmentId,
      answers: Object.keys(surveyAnswers).map(questionId => {
        const answer = surveyAnswers[questionId];
        if (answer.optionId) {
          // Single choice
          return {
            questionId: parseInt(questionId),
            optionId: answer.optionId,
            additionalText: answer[`text_${answer.optionId}`] || null
          };
        } else if (answer.options) {
          // Multiple choice - tạo nhiều answer cho mỗi option được chọn
          return answer.options.map(optionId => ({
            questionId: parseInt(questionId),
            optionId: optionId,
            additionalText: answer[`text_${optionId}`] || null
          }));
        }
        return null;
      }).filter(Boolean).flat() // Flatten array để xử lý multiple choice
    };

    console.log('Submitting survey answers:', formattedAnswers);

    const response = await fetch(`${API_BASE_URL}/Survey/submit-survey-answers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(formattedAnswers)
    });

    console.log('Submit survey response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Submit survey error response:', errorData);
      
      // Handle specific error cases
      if (response.status === 400) {
        throw new Error(errorData.message || 'Dữ liệu khảo sát không hợp lệ');
      } else if (response.status === 404) {
        throw new Error('API khảo sát không tồn tại');
      } else if (response.status === 500) {
        throw new Error('Lỗi máy chủ. Vui lòng thử lại sau.');
      } else {
        throw new Error(errorData.message || `Lỗi gửi khảo sát: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('Submit survey successful:', data);
    return data;
  } catch (error) {
    console.error('Error submitting survey:', error);
    throw error;
  }
};

// Get survey answers for a specific appointment
export const getSurveyAnswers = async (appointmentId) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Bạn cần đăng nhập để xem câu trả lời khảo sát');
    }

    console.log('Getting survey answers for appointment:', appointmentId);

    const response = await fetch(`${API_BASE_URL}/Survey/answered/${appointmentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });

    console.log('Get survey answers response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Get survey answers error response:', errorData);
      
      // Handle specific error cases
      if (response.status === 400) {
        throw new Error(errorData.message || 'Dữ liệu yêu cầu không hợp lệ');
      } else if (response.status === 404) {
        throw new Error('Không tìm thấy câu trả lời khảo sát cho cuộc hẹn này');
      } else if (response.status === 500) {
        throw new Error('Lỗi máy chủ. Vui lòng thử lại sau.');
      } else {
        throw new Error(errorData.message || `Lỗi lấy câu trả lời khảo sát: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('Get survey answers successful:', data);
    return data;
  } catch (error) {
    console.error('Error getting survey answers:', error);
    throw error;
  }
};

// Update appointment status after survey review
export const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Bạn cần đăng nhập để cập nhật trạng thái cuộc hẹn');
    }

    console.log('Updating appointment status:', { appointmentId, status });

    const response = await fetch(`${API_BASE_URL}/Survey/update-appointment-status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        appointmentId: appointmentId,
        status: status
      })
    });

    console.log('Update appointment status response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Update appointment status error response:', errorData);
      
      // Handle specific error cases
      if (response.status === 400) {
        throw new Error(errorData.message || 'Dữ liệu yêu cầu không hợp lệ');
      } else if (response.status === 404) {
        throw new Error('Không tìm thấy cuộc hẹn');
      } else if (response.status === 500) {
        throw new Error('Lỗi máy chủ. Vui lòng thử lại sau.');
      } else {
        throw new Error(errorData.message || `Lỗi cập nhật trạng thái: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('Update appointment status successful:', data);
    return data;
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};

// Đăng ký lịch hẹn kèm khảo sát (API mới)
export const registerAppointmentWithSurvey = async (eventId, surveyAnswers) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Bạn cần đăng nhập để đăng ký sự kiện');
    }

    console.log('Raw survey answers:', surveyAnswers);
    console.log('Number of questions answered:', Object.keys(surveyAnswers).length);

    // Format dữ liệu gửi lên server
    const userSurveyAnswerDtos = Object.keys(surveyAnswers).map(questionId => {
      const answer = surveyAnswers[questionId];
      if (answer.optionId) {
        // Single choice
        return {
          questionId: parseInt(questionId),
          optionId: answer.optionId,
          additionalText: answer[`text_${answer.optionId}`] || null
        };
      } else if (answer.options) {
        // Multiple choice - tạo nhiều answer cho mỗi option được chọn
        return answer.options.map(optionId => ({
          questionId: parseInt(questionId),
          optionId: optionId,
          additionalText: answer[`text_${optionId}`] || null
        }));
      }
      return null;
    }).filter(Boolean).flat();

    console.log('userSurveyAnswerDtos:', userSurveyAnswerDtos);
    console.log('Number of userSurveyAnswerDtos:', userSurveyAnswerDtos.length);

    const requestBody = {
      eventId,
      userSurveyAnswerDtos
    };

    console.log('Request body being sent:', requestBody);

    const response = await fetch(`${API_BASE_URL}/Appointment/RegisterAppointmentV2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response:', errorData);
      throw new Error(errorData.message || `Lỗi đăng ký: ${response.status}`);
    }

    const data = await response.json();
    console.log('Success response:', data);
    return data;
  } catch (error) {
    console.error('Error registerAppointmentWithSurvey:', error);
    throw error;
  }
};

// Gửi OTP về email khi đăng ký sự kiện
export const sendOTP = async (eventId, surveyAnswers) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Bạn cần đăng nhập để đăng ký sự kiện');
    }

    console.log('Sending OTP for event:', eventId);

    // Format dữ liệu gửi lên server
    const userSurveyAnswerDtos = Object.keys(surveyAnswers).map(questionId => {
      const answer = surveyAnswers[questionId];
      if (answer.optionId) {
        // Single choice
        return {
          questionId: parseInt(questionId),
          optionId: answer.optionId,
          additionalText: answer[`text_${answer.optionId}`] || null
        };
      } else if (answer.options) {
        // Multiple choice - tạo nhiều answer cho mỗi option được chọn
        return answer.options.map(optionId => ({
          questionId: parseInt(questionId),
          optionId: optionId,
          additionalText: answer[`text_${optionId}`] || null
        }));
      }
      return null;
    }).filter(Boolean).flat();

    const requestBody = {
      eventId,
      userSurveyAnswerDtos
    };

    console.log('Send OTP request body:', requestBody);

    const response = await fetch(`${API_BASE_URL}/Appointment/RegisterAppointmentV2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Send OTP response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Send OTP error response:', errorData);
      throw new Error(errorData.message || `Lỗi gửi OTP: ${response.status}`);
    }

    const data = await response.json();
    console.log('Send OTP successful:', data);
    return data;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

// Xác nhận OTP
export const verifyOTP = async (otp) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Bạn cần đăng nhập để xác nhận OTP');
    }

    console.log('Verifying OTP:', otp);

    const response = await fetch(`${API_BASE_URL}/User/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ otp })
    });

    console.log('Verify OTP response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Verify OTP error response:', errorData);
      throw new Error(errorData.message || `Lỗi xác nhận OTP: ${response.status}`);
    }

    const data = await response.json();
    console.log('Verify OTP successful:', data);
    return data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

// Gửi OTP khi đăng ký tài khoản
export const sendRegistrationOTP = async (userData) => {
  try {
    console.log('Sending registration OTP for:', userData.email);
    
    const response = await fetch(`${API_BASE_URL}/User/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    console.log('Send registration OTP response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Send registration OTP error response:', errorData);
      
      if (response.status === 400) {
        throw new Error(errorData.message || 'Dữ liệu đăng ký không hợp lệ');
      } else if (response.status === 409) {
        throw new Error('Email đã được sử dụng. Vui lòng chọn email khác.');
      } else if (response.status === 500) {
        throw new Error('Lỗi máy chủ. Vui lòng thử lại sau.');
      } else {
        throw new Error(errorData.message || `Lỗi gửi OTP: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('Send registration OTP successful:', data);
    return data;
  } catch (error) {
    console.error('Error sending registration OTP:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.');
    }
    
    throw error;
  }
};

// Xác thực OTP và tạo tài khoản
export const verifyRegistrationOTP = async (otp) => {
  try {
    console.log('Verifying registration OTP:', otp);
    
    const response = await fetch(`${API_BASE_URL}/User/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ otp }),
    });

    console.log('Verify registration OTP response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Verify registration OTP error response:', errorData);
      
      if (response.status === 400) {
        throw new Error(errorData.message || 'OTP không hợp lệ hoặc đã hết hạn');
      } else if (response.status === 404) {
        throw new Error('Không tìm thấy yêu cầu OTP. Vui lòng gửi lại OTP.');
      } else if (response.status === 500) {
        throw new Error('Lỗi máy chủ. Vui lòng thử lại sau.');
      } else {
        throw new Error(errorData.message || `Lỗi xác thực OTP: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('Verify registration OTP successful:', data);
    return data;
  } catch (error) {
    console.error('Error verifying registration OTP:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.');
    }
    
    throw error;
  }
};

// Gửi OTP để đặt lại mật khẩu
export const requestPasswordReset = async (emailOrUsername) => {
  try {
    console.log('Requesting password reset for:', emailOrUsername);
    
    const response = await fetch(`${API_BASE_URL}/User/request-password-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emailOrUsername }),
    });

    console.log('Request password reset response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Request password reset error response:', errorData);
      
      if (response.status === 400) {
        throw new Error(errorData.message || 'Dữ liệu không hợp lệ');
      } else if (response.status === 404) {
        throw new Error('Không tìm thấy tài khoản với thông tin này');
      } else if (response.status === 500) {
        throw new Error('Lỗi máy chủ. Vui lòng thử lại sau.');
      } else {
        throw new Error(errorData.message || `Lỗi gửi OTP: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('Request password reset successful:', data);
    return data;
  } catch (error) {
    console.error('Error requesting password reset:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.');
    }
    
    throw error;
  }
};

// Đặt lại mật khẩu với OTP
export const resetPassword = async (otp, newPassword, confirmPassword) => {
  try {
    console.log('Resetting password with OTP');
    
    const response = await fetch(`${API_BASE_URL}/User/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        otp,
        newPassword,
        confirmPassword
      }),
    });

    console.log('Reset password response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Reset password error response:', errorData);
      
      if (response.status === 400) {
        throw new Error(errorData.message || 'OTP không hợp lệ hoặc mật khẩu không đúng định dạng');
      } else if (response.status === 404) {
        throw new Error('Không tìm thấy yêu cầu OTP. Vui lòng gửi lại OTP.');
      } else if (response.status === 500) {
        throw new Error('Lỗi máy chủ. Vui lòng thử lại sau.');
      } else {
        throw new Error(errorData.message || `Lỗi đặt lại mật khẩu: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('Reset password successful:', data);
    return data;
  } catch (error) {
    console.error('Error resetting password:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.');
    }
    
    throw error;
  }
}; 