import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>

          <div className="text-gray-300">
            <p className="text-xl mb-4">Welcome, {user?.username}!</p>
            <div className="space-y-2">
              <p><strong>Email:</strong> {user?.email}</p>
              {user?.learningContext && (
                <p><strong>Learning Context:</strong> {user.learningContext}</p>
              )}
              {user?.major && (
                <p><strong>Major:</strong> {user.major}</p>
              )}
            </div>

            <div className="mt-6 p-4 bg-gray-700 rounded">
              <p className="text-sm">
                You're logged in. This is a placeholder dashboard.
                <br />
                Week 2 will add community and channel features here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;