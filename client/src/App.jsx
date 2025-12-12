import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UserPage from './pages/UserPage';
import AdminPage from './pages/AdminPage';
import FuckYouPage from './pages/FuckYouPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
        <Routes>
          <Route path="/" element={<UserPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/fuckyou" element={<FuckYouPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;