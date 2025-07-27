import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaHeartbeat } from 'react-icons/fa';
import { loginUser, setAuthToken, setUser, googleLogin } from '../utils/api';
import Toast from '../components/Toast';
import { useEffect } from 'react';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await loginUser(formData.username, formData.password);
      
      if (data.token) {
        setAuthToken(data.token);
      }
      if (data.user) {
        setUser(data.user);
      }
      
      console.log('Login successful:', data);
      setShowSuccess(true);
      
      window.dispatchEvent(new Event('authStateChanged'));
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Username hoặc mật khẩu không đúng. Vui lòng thử lại.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (googleUser) => {
    setError('');
    setIsLoading(true);
    try {
      const email = googleUser.email;
      const googleToken = googleUser.credential;
      
      console.log('Attempting Google login with:', { email, tokenLength: googleToken.length });
      
      const data = await googleLogin(email, googleToken);
      
      if (data.token) {
        setAuthToken(data.token);
      }
      if (data.user) {
        setUser(data.user);
      }
      
      setShowSuccess(true);
      window.dispatchEvent(new Event('authStateChanged'));
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Google login error:', err);
      
      // Handle specific error cases
      if (err.message.includes('Invalid Google token')) {
        setError('Token Google không hợp lệ. Vui lòng thử lại hoặc đăng nhập bằng username/password.');
      } else if (err.message.includes('Internal server error')) {
        setError('Lỗi máy chủ. Vui lòng thử lại sau hoặc liên hệ quản trị viên.');
      } else if (err.message.includes('Network')) {
        setError('Lỗi kết nối. Vui lòng kiểm tra internet và thử lại.');
      } else {
        setError(err.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeGoogleLogin = () => {
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.initialize({
            client_id: '78348296273-co8unhaomb7kh3mqjsckad62km60mc5a.apps.googleusercontent.com',
            callback: (response) => {
              // Decode JWT to get email
              const base64Url = response.credential.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join(''));
              const payload = JSON.parse(jsonPayload);
              handleGoogleLogin({ email: payload.email, credential: response.credential });
            },
          });
          
          const buttonElement = document.getElementById('google-login-btn');
          if (buttonElement) {
            window.google.accounts.id.renderButton(
              buttonElement,
              { theme: 'outline', size: 'large', width: '100%' }
            );
          }
        } catch (error) {
          console.error('Error initializing Google login:', error);
        }
      } else {
        // Retry after a short delay if Google script hasn't loaded yet
        setTimeout(initializeGoogleLogin, 100);
      }
    };

    // Start initialization
    initializeGoogleLogin();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {showSuccess && (
        <Toast
          message="Đăng nhập thành công! Đang chuyển hướng..."
          type="success"
          onClose={() => setShowSuccess(false)}
        />
      )}
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-r from-red-600 to-red-400 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
            <FaHeartbeat className="text-white text-3xl" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Đăng nhập vào tài khoản
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Hoặc{' '}
          <Link to="/register" className="font-medium text-red-600 hover:text-red-500 transition-colors duration-200">
            tạo tài khoản mới
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-slide-up">
        <div className="bg-white/80 backdrop-blur-md py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 hover:scale-105 transition-transform duration-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md animate-shake">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 pr-3 py-3 sm:text-sm border-gray-300 rounded-md transition-colors duration-200"
                  placeholder="Nhập username của bạn"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 pr-10 py-3 sm:text-sm border-gray-300 rounded-md transition-colors duration-200"
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-red-600 hover:text-red-500 transition-colors duration-200">
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-red-600 to-red-400 hover:from-red-700 hover:to-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang đăng nhập...
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </div>
            <div className="mt-4 flex flex-col items-center">
              <div id="google-login-btn" className="w-full flex justify-center"></div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 