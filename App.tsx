
import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard.tsx';
import ServicesPage from './pages/ServicesPage';
import AboutUs from './pages/AboutUs';
import ProductDetail from './pages/ProductDetail';
import SiteDetail from './pages/SiteDetail';
import ServiceDetail from './pages/ServiceDetail';
import Projects from './pages/Projects';
import PrivacyPolicy from './pages/PrivacyPolicy';
import { User, UserRole } from './types';
import AuthService from './services/authService';
import { ShieldCheck, Mail, Lock, User as UserIcon, Phone, MapPin, Loader2, Sparkles, Building2, Facebook, Linkedin, Instagram } from 'lucide-react';
import ContentService from './services/contentService';
import ContactService from './services/contactService';
import ProductService from './services/productService';
import ThemeService from './services/themeService';

const stripHtml = (value: string = '') => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const normalizeBrandText = (value: string = '') =>
  value
    .replace(/vishesh glasses private limited/gi, 'Toffan Glass Solutions')
    .replace(/vishvesh glasses private limited/gi, 'Toffan Glass Solutions')
    .replace(/vishesh glasses/gi, 'Toffan Glass Solutions')
    .replace(/vishvesh glasses/gi, 'Toffan Glass Solutions');

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [footerData, setFooterData] = useState<any>({
    about: null,
    contacts: [],
    products: []
  });

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      if (AuthService.isAuthenticated()) {
        const result = await AuthService.getProfile();
        if (result.success) {
          setUser(result.user);
        } else {
          AuthService.logout();
        }
      }
      setLoading(false);
    };
    
    checkAuth();
    fetchFooterData();
    ThemeService.applyTheme(ThemeService.getTheme());
  }, []);

  const fetchFooterData = async () => {
    try {
      const [aboutRes, contactsRes, productsRes] = await Promise.all([
        ContentService.getContentPageByPageName('about_us'),
        ContactService.getAllContacts(),
        ProductService.getAllProducts()
      ]);

      const categories = productsRes.success 
        ? Array.from(new Set(productsRes.products.map((p: any) => p.category))).slice(0, 4)
        : ['Toughened Glass', 'Architectural Hardware', 'Glass Fittings'];

      setFooterData({
        about: aboutRes,
        contacts: contactsRes,
        products: categories
      });
    } catch (error) {
      console.error('Error fetching footer data:', error);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    const result = await AuthService.login(email, password);
    if (result.success) {
      setUser(result.user);
      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  };

  const handleSignup = async (userData: any) => {
    const result = await AuthService.register(userData);
    if (result.success) {
      setUser(result.user);
      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
  };

  const footerAboutExcerpt = (() => {
    const raw = typeof footerData.about?.content === 'string' ? footerData.about.content : '';
    const cleaned = normalizeBrandText(stripHtml(raw));
    if (!cleaned) {
      return 'Leading supplier of premium toughened glass and architectural hardware in MP. Precision engineering since 2012.';
    }
    return cleaned.length > 150 ? `${cleaned.substring(0, 150)}...` : cleaned;
  })();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Navbar user={user} onLogout={handleLogout} />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail user={user} />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<SiteDetail user={user} />} />
            <Route path="/sites/:id" element={<SiteDetail user={user} />} />
            <Route path="/contact" element={<Contact user={user} />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:id" element={<ServiceDetail user={user} />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            
            <Route path="/login" element={
              user ? (
                (user.role === UserRole.ADMIN || user.role === UserRole.STAFF) ? <Navigate to="/dashboard" /> : <Navigate to="/" />
              ) : <LoginPage onLogin={handleLogin} />
            } />
            <Route path="/signup" element={
              user ? (
                (user.role === UserRole.ADMIN || user.role === UserRole.STAFF) ? <Navigate to="/dashboard" /> : <Navigate to="/" />
              ) : <SignupPage onSignup={handleSignup} />
            } />

            <Route path="/dashboard" element={
              user && (user.role === UserRole.ADMIN || user.role === UserRole.STAFF) ? <Dashboard user={user} /> : user ? <Navigate to="/" /> : <Navigate to="/login" />
            } />
            <Route path="/admin" element={
              user?.role === UserRole.ADMIN ? <Dashboard user={user} /> : user ? <Navigate to="/" /> : <Navigate to="/login" />
            } />
            <Route path="/staff" element={
              user?.role === UserRole.STAFF ? <Dashboard user={user} /> : user ? <Navigate to="/" /> : <Navigate to="/login" />
            } />
          </Routes>
        </main>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        
        <footer className="bg-slate-900 text-slate-400 py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
              <div className="space-y-6">
                <div className="flex items-center space-x-5">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full translate-y-2"></div>
                    <img src="/logo.png" alt="Toffan Glass" className="w-14 h-14 object-contain relative z-10 filter brightness-110" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-white tracking-tighter uppercase leading-none">TOFFAN</span>
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em] mt-1.5 flex items-center">
                      <span className="w-4 h-px bg-blue-500/30 mr-2"></span>
                      GLASS SOLUTIONS
                    </span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-slate-400">
                  {footerAboutExcerpt}
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                    <Linkedin className="text-white w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                    <Facebook className="text-white w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                    <Instagram className="text-white w-5 h-5" />
                  </a>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-extrabold mb-8 uppercase tracking-widest text-xs">Solutions</h4>
                <ul className="space-y-4 text-sm font-medium">
                  {footerData.products.length > 0 ? footerData.products.map((cat: string) => (
                    <li key={cat}><a href="/#/products" className="hover:text-blue-400 transition-colors">{cat}</a></li>
                  )) : (
                    <>
                      <li><a href="/#/products" className="hover:text-blue-400 transition-colors">Toughened Glass</a></li>
                      <li><a href="/#/products" className="hover:text-blue-400 transition-colors">Floor Springs</a></li>
                      <li><a href="/#/products" className="hover:text-blue-400 transition-colors">Patch Fittings</a></li>
                      <li><a href="/#/products" className="hover:text-blue-400 transition-colors">Spider Fittings</a></li>
                    </>
                  )}
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-extrabold mb-8 uppercase tracking-widest text-xs">Explore</h4>
                <ul className="space-y-4 text-sm font-medium">
                  <li><a href="/#/services" className="hover:text-blue-400 transition-colors">Our Services</a></li>
                  <li><a href="/#/about" className="hover:text-blue-400 transition-colors">About Company</a></li>
                  <li><a href="/#/contact" className="hover:text-blue-400 transition-colors">Contact Support</a></li>
                  <li><a href="/#/privacy-policy" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-extrabold mb-8 uppercase tracking-widest text-xs">Contact Information</h4>
                <div className="space-y-4 text-sm">
                  {footerData.contacts.filter((c: any) => c.type === 'address').slice(0, 1).map((c: any) => (
                    <p key={c.id} className="flex items-start">
                      <MapPin className="w-4 h-4 mr-3 text-blue-500 flex-shrink-0" />
                      {c.contactValue}
                    </p>
                  ))}
                  {footerData.contacts.length === 0 && (
                    <p className="flex items-start">
                      <MapPin className="w-4 h-4 mr-3 text-blue-500 flex-shrink-0" />
                      123-B Industrial Estate, Sanwer Road, Indore, MP 452015
                    </p>
                  )}
                  
                  {footerData.contacts.filter((c: any) => c.type === 'phone').slice(0, 1).map((c: any) => (
                    <p key={c.id} className="flex items-start">
                      <Phone className="w-4 h-4 mr-3 text-blue-500 flex-shrink-0" />
                      {c.contactValue} ({c.label})
                    </p>
                  ))}
                  {footerData.contacts.length === 0 && (
                     <p className="flex items-start">
                      <Phone className="w-4 h-4 mr-3 text-blue-500 flex-shrink-0" />
                      +91 731 2345 6789
                    </p>
                  )}

                  {footerData.contacts.filter((c: any) => c.type === 'email').slice(0, 1).map((c: any) => (
                    <p key={c.id} className="flex items-start">
                      <Mail className="w-4 h-4 mr-3 text-blue-500 flex-shrink-0" />
                      {c.contactValue}
                    </p>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} Toffan Glass Solutions. All Rights Reserved.</p>
              <div className="flex items-center space-x-2 bg-slate-800/50 px-4 py-1.5 rounded-full border border-slate-700/50">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ISO 9001:2015 Certified</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

// Removed inline component definitions - using imported components from separate files
// See ServicesPage.tsx and AboutUs.tsx

const LoginPage = ({ onLogin }: { onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: any }> }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const result = await onLogin(email, password);
    if (!result.success) {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-20 px-4">
      <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200 w-full max-w-md border border-white">
        <div className="text-center mb-10">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200 mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-2">Login</h2>
          <p className="text-slate-400 font-medium">Access your projects & inventory</p>
        </div>
        


        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
            <input 
              type="email" 
              placeholder="Email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              required 
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              required 
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}
          
          <button 
            disabled={isLoading}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Sign In'}
          </button>
          
          <p className="text-center text-sm text-slate-400 font-medium">
            Don't have an account? <a href="/#/signup" className="text-blue-600 font-bold hover:underline">Sign up now</a>
          </p>
        </form>
      </div>
    </div>
  );
};

const SignupPage = ({ onSignup }: { onSignup: (userData: any) => Promise<{ success: boolean; error?: any }> }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [city, setCity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const userData = {
      name,
      email,
      password,
      mobile,
      city
    };
    
    const result = await onSignup(userData);
    if (!result.success) {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-slate-50 py-20 px-4">
      <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200 w-full max-w-xl border border-white">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-slate-900 mb-2">Register</h2>
          <p className="text-slate-400 font-medium">Join the premium glass network of MP</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Full Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none" 
                required 
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
              <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none" 
                required 
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
              <input 
                type="tel" 
                placeholder="Mobile" 
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none" 
                required 
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
              <select 
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none appearance-none cursor-pointer"
              >
                <option value="">Select City (MP)</option>
                <option value="Indore">Indore</option>
                <option value="Bhopal">Bhopal</option>
                <option value="Jabalpur">Jabalpur</option>
                <option value="Gwalior">Gwalior</option>
                <option value="Ujjain">Ujjain</option>
              </select>
            </div>
          </div>
          
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
            <input 
              type="password" 
              placeholder="Create Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none" 
              required 
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}
          
          <button 
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;
