import { FaTint, FaUserPlus, FaExclamationTriangle, FaChartLine, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';

const Dashboard = () => {
  // Mock data for demonstration
  const stats = {
    totalDonors: 1250,
    activeDonors: 850,
    totalDonations: 3500,
    bloodInventory: {
      'A+': 150,
      'A-': 45,
      'B+': 180,
      'B-': 50,
      'AB+': 80,
      'AB-': 25,
      'O+': 200,
      'O-': 60,
    },
    emergencyRequests: 12,
    upcomingDonations: 25,
  };

  const recentDonations = [
    {
      id: 1,
      donorName: 'Nguyễn Văn A',
      bloodType: 'A+',
      date: '2024-03-15',
      location: 'Bệnh viện Chợ Rẫy',
      status: 'completed',
    },
    {
      id: 2,
      donorName: 'Trần Thị B',
      bloodType: 'O+',
      date: '2024-03-14',
      location: 'Bệnh viện Nhân dân 115',
      status: 'completed',
    },
    {
      id: 3,
      donorName: 'Lê Văn C',
      bloodType: 'B+',
      date: '2024-03-16',
      location: 'Bệnh viện Đại học Y Dược',
      status: 'scheduled',
    },
  ];

  const emergencyRequests = [
    {
      id: 1,
      patientName: 'Phạm Thị D',
      bloodType: 'AB+',
      units: 2,
      hospital: 'Bệnh viện Chợ Rẫy',
      deadline: '2024-03-17',
      status: 'pending',
    },
    {
      id: 2,
      patientName: 'Hoàng Văn E',
      bloodType: 'O-',
      units: 1,
      hospital: 'Bệnh viện Nhân dân 115',
      deadline: '2024-03-18',
      status: 'fulfilled',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 text-primary-600">
              <FaTint size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Tổng số đơn vị máu</p>
              <p className="text-2xl font-semibold">{stats.totalDonations}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaUserPlus size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Người hiến máu</p>
              <p className="text-2xl font-semibold">{stats.totalDonors}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <FaExclamationTriangle size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Yêu cầu cấp cứu</p>
              <p className="text-2xl font-semibold">{stats.emergencyRequests}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FaCalendarAlt size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Lịch hiến máu sắp tới</p>
              <p className="text-2xl font-semibold">{stats.upcomingDonations}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Blood Inventory */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Tồn kho máu</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats.bloodInventory).map(([type, amount]) => (
            <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-primary-600">{type}</p>
              <p className="text-gray-600">{amount} đơn vị</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Donations and Emergency Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Donations */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Hiến máu gần đây</h2>
          <div className="space-y-4">
            {recentDonations.map((donation) => (
              <div key={donation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{donation.donorName}</p>
                  <div className="flex items-center text-gray-600 text-sm">
                    <FaTint className="mr-2" />
                    <span>{donation.bloodType}</span>
                    <FaMapMarkerAlt className="ml-4 mr-2" />
                    <span>{donation.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{donation.date}</p>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      donation.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {donation.status === 'completed' ? 'Hoàn thành' : 'Đã lên lịch'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Requests */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Yêu cầu cấp cứu</h2>
          <div className="space-y-4">
            {emergencyRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{request.patientName}</p>
                  <div className="flex items-center text-gray-600 text-sm">
                    <FaTint className="mr-2" />
                    <span>{request.bloodType}</span>
                    <FaMapMarkerAlt className="ml-4 mr-2" />
                    <span>{request.hospital}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Hạn: {request.deadline}</p>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      request.status === 'fulfilled'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {request.status === 'fulfilled' ? 'Đã đáp ứng' : 'Đang chờ'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 