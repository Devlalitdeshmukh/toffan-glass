import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, Zap, MapPin } from 'lucide-react';
import { SERVICES } from '../constants';
import SiteService from '../services/siteService';
import { formatStatus, getImageUrl } from '../utils/helpers';

const Home: React.FC = () => {
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('All');

  const getCityName = (site: any): string => {
    if (typeof site?.city === 'string' && site.city.trim()) return site.city;
    if (typeof site?.cityName === 'string' && site.cityName.trim()) return site.cityName;
    if (site?.city && typeof site.city === 'object' && typeof site.city.name === 'string' && site.city.name.trim()) {
      return site.city.name;
    }
    return 'Unknown';
  };

  const getSiteImage = (site: any): string | null => {
    if (!site?.images || !Array.isArray(site.images) || site.images.length === 0) return null;
    const firstImage = site.images[0];
    if (typeof firstImage === 'string') return firstImage;
    if (firstImage && typeof firstImage === 'object' && typeof firstImage.imageUrl === 'string') {
      return firstImage.imageUrl;
    }
    return null;
  };

  const getSiteExcerpt = (site: any): string => {
    const raw = site?.description;
    if (!raw || typeof raw !== 'string') return 'Premium project delivered with precision glass and hardware solutions.';

    try {
      const parsed = JSON.parse(raw);
      const lineItems = Array.isArray(parsed?.lineItems) ? parsed.lineItems : [];
      const notes = typeof parsed?.notes === 'string' ? parsed.notes.trim() : '';

      if (notes) return notes;
      if (lineItems.length > 0) {
        return `${lineItems.length} line item${lineItems.length > 1 ? 's' : ''} configured for this site.`;
      }
    } catch {
      // Keep original plain text descriptions.
    }

    return raw;
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const withImagesResult = await SiteService.getSitesWithImages();
      if (withImagesResult.success) {
        setSites(withImagesResult.sites);
        return;
      }

      const result = await SiteService.getAllSites();
      if (result.success && Array.isArray(result.sites)) {
        setSites(result.sites);
      }
    } catch (error) {
      console.error('Failed to fetch sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const cityOptions = ['All', ...Array.from(new Set(sites.map(getCityName)))];

  const filteredSites = sites.filter((site) => 
    selectedCity === 'All' || getCityName(site) === selectedCity
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-slate-900">
        <div className="absolute -top-24 -left-20 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-cyan-400/10 blur-3xl animate-pulse"></div>
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000"
            alt="Glass Architecture"
            className="w-full h-full object-cover opacity-40 grayscale"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getImageUrl(null);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full mb-8 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">Madhya Pradesh's #1 Choice</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-white mb-8 leading-[1.1] tracking-tight">
              Smarter Glass <br />
              <span className="text-blue-500">Stronger Spaces.</span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-12 max-w-xl leading-relaxed">
              Premium toughened glass and architectural hardware engineered for excellence. Serving Indore, Bhopal, and all of Madhya Pradesh with precision.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <Link
                to="/products"
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-bold flex items-center justify-center transition-all shadow-xl shadow-blue-600/20 hover:scale-105"
              >
                Browse Catalog <ArrowRight className="ml-3 w-5 h-5" />
              </Link>
              <Link
                to="/contact"
                className="bg-white/5 hover:bg-white/10 text-white px-10 py-5 rounded-2xl font-bold flex items-center justify-center border border-white/10 backdrop-blur-md transition-all"
              >
                Get Quick Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: <ShieldCheck className="w-8 h-8" />, title: 'Certified Safety', desc: 'All glass products undergo rigorous stress testing for maximum safety.' },
              { icon: <Truck className="w-8 h-8" />, title: 'Regional Logistics', desc: 'Direct delivery and support across the heart of Madhya Pradesh.' },
              { icon: <Zap className="w-8 h-8" />, title: 'Expert Fitting', desc: 'Certified installation teams ensure every millimetre is perfect.' }
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center p-8 rounded-3xl bg-slate-50 hover:bg-white hover:shadow-2xl hover:shadow-slate-200 transition-all border border-transparent hover:border-slate-100">
                <div className="bg-blue-600 p-4 rounded-2xl text-white mb-6 shadow-lg shadow-blue-100">
                  {f.icon}
                </div>
                <h3 className="text-xl font-extrabold mb-4">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Services Display */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold mb-4">Engineering Excellence</h2>
            <p className="text-slate-500 text-lg">Specialized glass solutions for residential and commercial architecture.</p>
          </div>
          <div className="grid lg:grid-cols-4 gap-8">
            {SERVICES.map((service, i) => (
              <div key={i} className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
                <div className="mb-6 transform group-hover:-translate-y-2 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Serving All Districts of MP - Dynamic Sites */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Regional Footprint</span>
            <h2 className="text-5xl font-black text-slate-900 tracking-tight">Serving All <span className="text-blue-600">Districts</span> of MP</h2>
          </div>

          {/* Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {cityOptions.map((city) => (
              <button 
                key={city} 
                onClick={() => setSelectedCity(city)}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all border ${selectedCity === city ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-900 hover:text-slate-900'}`}
              >
                {city}
              </button>
            ))}
          </div>

          {filteredSites.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No project sites found in this region yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSites.map((site, index) => (
                <Link
                  key={site.id}
                  to={`/sites/${site.id}`}
                  className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-100/40 transition-all duration-500 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={getImageUrl(getSiteImage(site))} 
                      alt={site.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getImageUrl(null);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute top-6 left-6">
                      <span className="bg-white/95 backdrop-blur-md text-slate-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center">
                        <MapPin className="w-3 h-3 mr-2 text-blue-600" />
                        {getCityName(site)}
                      </span>
                    </div>
                    <div className="absolute top-6 right-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${site.status === 'COMPLETED' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                        {formatStatus(site.status)}
                      </span>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{site.name}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2 font-medium">{getSiteExcerpt(site)}</p>
                    <div className="flex items-center text-xs font-black text-slate-400 uppercase tracking-widest">
                       Learn More <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
