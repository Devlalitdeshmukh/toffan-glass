import { useState, FC } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, LogOut, LayoutDashboard, Building2 } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

interface NavbarProps {
  user: any;
  onLogout: () => void;
}

const Navbar: FC<NavbarProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Services', path: '/services' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    setShowConfirmModal(true);
  };

  const confirmLogout = () => {
    onLogout();
    setShowConfirmModal(false);
  };

  const cancelLogout = () => {
    setShowConfirmModal(false);
  };

  return (
    <>
      <nav className="glass-nav sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <div className="mr-5 relative">
                <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full group-hover:bg-blue-400/30 transition-all duration-500"></div>
                <img 
                  src="/logo.png" 
                  alt="Toffan Glass" 
                  className="w-16 h-16 object-contain relative z-10 drop-shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=TG';
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-[1000] tracking-tighter leading-none flex items-center">
                  <span className="text-slate-900">TOFFAN</span>
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-400 bg-clip-text text-transparent ml-1">GLASS</span>
                </span>
                <div className="flex items-center space-x-2 mt-1.5">
                  <div className="h-0.5 w-6 bg-blue-500/30 rounded-full"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                    Premium Solutions
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  isActive(link.path) 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="h-6 w-px bg-slate-200 mx-4"></div>

            {user ? (
              <div className="flex items-center space-x-3">
                {(user.role === 'ADMIN' || user.role === 'STAFF') && (
                  <Link
                    to={user.role === 'ADMIN' ? '/admin' : '/staff'}
                    className="flex items-center bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-sm"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-blue-600 text-sm font-bold px-4 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 absolute w-full shadow-2xl">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-bold transition-all ${
                  isActive(link.path) ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-100">
              {user ? (
                <div className="space-y-2">
                  {(user.role === 'ADMIN' || user.role === 'STAFF') && (
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 rounded-xl bg-slate-900 text-white font-bold text-center"
                    >
                      Go to Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="w-full px-4 py-3 rounded-xl bg-red-50 text-red-600 font-bold"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3 rounded-xl bg-blue-600 text-white font-bold text-center"
                  >
                    Signup
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      </nav>
      <ConfirmationModal 
        isOpen={showConfirmModal}
        title="Confirm Logout"
        message="Are you sure you want to log out? You'll need to sign in again to access your account."
        onClose={cancelLogout}
        onConfirm={confirmLogout}
        confirmText="Yes, Log Out"
        type="warning"
      />
    </>
  );
};

export default Navbar;