import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, Settings, PenTool, Calendar } from 'lucide-react';
import ContentService from '../services/contentService';
import ServiceService from '../services/serviceService';
import { getImageUrl } from '../utils/helpers';

const ServicesPage = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState<any>(null);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [heroImage, setHeroImage] = useState('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000');
  const [heroTitle, setHeroTitle] = useState('Architectural Solutions');
  const [heroDescription, setHeroDescription] = useState('Elevating architectural standards across Central India with premium glass fabrication and hardware excellence.');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch static content (intro)
        const pageData = await ContentService.getContentPageByPageName('services');
        if (pageData) {
          setContent(pageData);
          if (pageData.title) setHeroTitle(pageData.title);
          if (pageData.metaDescription) setHeroDescription(pageData.metaDescription);
          const heroImageValue = Array.isArray(pageData?.images) && pageData.images.length > 0
            ? (pageData.images[0]?.imageUrl || pageData.images[0]?.image_url || pageData.images[0])
            : null;
          if (heroImageValue) {
            setHeroImage(getImageUrl(heroImageValue));
          }
        }

        // Fetch dynamic services
        const servicesResult = await ServiceService.getAllServices();
        if (servicesResult.success) {
            setServicesList(servicesResult.services.filter((s: any) => s.status === 'ACTIVE'));
        }
      } catch (err) {
        console.error('Error fetching services content:', err);
        setError('Failed to load services content');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  if (loading) {
    return (
      <div className="py-40 bg-[#fcfdfe] flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-6"></div>
          <p className="text-slate-500 font-medium">Loading premium services...</p>
        </div>
      </div>
    );
  }

  // Only show error if we have no services AND no content (both failed)
  if (error && servicesList.length === 0) {
    return (
      <div className="py-40 bg-[#fcfdfe] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-6">Services</h1>
          <p className="text-red-500 font-medium">Unable to load services. Please check your connection.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-24">
      {/* Hero Section */}
      <div className="relative h-[60vh] flex items-center overflow-hidden bg-slate-900 mb-24">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage}
            className="w-full h-full object-cover opacity-40 grayscale"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/60 to-slate-950"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 w-full pt-20">
          <div className="max-w-4xl">
            <span className="text-blue-500 font-black uppercase tracking-[0.4em] text-xs mb-6 block animate-fade-in">Precision Engineering</span>
            <h1 className="text-7xl font-black text-white mb-8 tracking-tight leading-none">
              {heroTitle}
            </h1>
            <p className="text-slate-400 text-xl leading-relaxed font-medium max-w-2xl">
              {heroDescription}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-20 mb-32 items-start">
          <div className="lg:col-span-2">
            {content?.content ? (
             <div 
              className="text-slate-500 text-xl leading-relaxed space-y-8 font-medium"
              dangerouslySetInnerHTML={{ __html: content.content }}
            />
            ) : (
              <div className="text-slate-500 text-xl leading-relaxed space-y-8 font-medium">
                <p>Welcome to Toffan Glass Solutions' Services page.</p>
                <p>We offer a wide range of glass and hardware solutions including installation, repair, and maintenance services.</p>
                <p>Explore our core specializations below:</p>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-slate-100 border border-slate-50 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-[5rem] -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
             <h3 className="text-2xl font-black text-slate-900 mb-8 relative">Service Highlights</h3>
             <ul className="space-y-6">
                {[
                  { label: "BIS Certified Process", icon: <ShieldCheck className="w-5 h-5 text-blue-600" /> },
                  { label: "Expert Installation Team", icon: <UserCheck className="w-5 h-5 text-blue-600" /> },
                  { label: "Premium Hardware Support", icon: <Settings className="w-5 h-5 text-blue-600" /> },
                  { label: "Custom Fabrication", icon: <PenTool className="w-5 h-5 text-blue-600" /> },
                  { label: "On-Site Consulting", icon: <Calendar className="w-5 h-5 text-blue-600" /> }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center text-slate-600 font-bold group/item">
                    <span className="bg-slate-50 p-3 rounded-2xl mr-4 group-hover/item:bg-blue-50 transition-colors">{item.icon}</span>
                    <span className="group-hover/item:text-blue-600 transition-colors">{item.label}</span>
                  </li>
                ))}
             </ul>
          </div>
        </div>

        {/* Dynamic Services Grid */}
        <div className="mb-20">
          <div className="flex items-end justify-between mb-16">
            <h2 className="text-5xl font-black text-slate-900 tracking-tight">Core <span className="text-blue-600">Specializations</span></h2>
            <p className="text-slate-400 font-bold max-w-xs text-right hidden md:block">Specialized solutions for corporate and luxury residential developments.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {servicesList.map((service, i) => {
              const imageUrl = service.images && service.images.length > 0 ? service.images[0].imageUrl : null;
              const title = service.title;
              const desc = service.shortDescription;

              return (
              <div 
                key={service.id || i} // Use ID if available
                className="group relative h-[320px] rounded-[2rem] overflow-hidden shadow-lg shadow-slate-200 border border-white cursor-pointer"
                onClick={() => navigate(`/services/${service.id}`)}
              >
                <img 
                  src={getImageUrl(imageUrl)} 
                  alt={title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = getImageUrl(null);
                  }}
                  />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-8">
                  <div className="transform transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                    <h3 className="text-xl font-black text-white mb-2 leading-tight">{title}</h3>
                    <p className="text-slate-300 text-xs leading-relaxed mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 line-clamp-2">
                      {desc}
                    </p>
                    <button className="px-6 py-2 rounded-lg bg-white text-slate-900 font-bold text-[10px] uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg">
                      Explore
                    </button>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
