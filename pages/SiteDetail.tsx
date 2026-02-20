
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  MessageCircle, 
  MapPin, 
  Calendar,
  Clock,
  Loader2,
  Building2,
  Info
} from 'lucide-react';
import { Site } from '../types';
import SiteService from '../services/siteService';
import { toast } from 'react-toastify';
import { formatDateForDisplay, formatStatus, getImageUrl } from '../utils/helpers';

interface SiteDetailProps {
  user?: any;
}

const SiteDetail: React.FC<SiteDetailProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [inquiryLoading, setInquiryLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSite();
    }
  }, [id]);

  const fetchSite = async () => {
    try {
      setLoading(true);
      const withImagesResult = await SiteService.getSitesWithImages();
      if (withImagesResult.success && Array.isArray(withImagesResult.sites)) {
        const matched = withImagesResult.sites.find((s: any) => String(s.id) === String(id));
        if (matched) {
          setSite(matched);
          return;
        }
      }

      const result = await SiteService.getSiteById(id);
      if (result.success && result.site) {
        setSite(result.site);
        return;
      }

      toast.error('Site not found');
      navigate('/');
    } catch (err) {
      toast.error('Failed to load site details');
    } finally {
      setLoading(false);
    }
  };

  const handleInquiry = async () => {
    setInquiryLoading(true);
    toast.info('Opening inquiry form...');
    setTimeout(() => {
      setInquiryLoading(false);
      navigate('/contact', { state: { site: site?.name } });
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!site) return null;

  const parseSiteMeta = () => {
    if (!site?.description || typeof site.description !== 'string') return null;
    try {
      const parsed = JSON.parse(site.description);
      if (parsed?.__siteFormMeta) return parsed;
      return null;
    } catch {
      return null;
    }
  };

  const siteMeta = parseSiteMeta();
  const siteInfo = siteMeta?.siteInfo || {};

  const overviewText = (() => {
    if (siteMeta?.notes && typeof siteMeta.notes === 'string' && siteMeta.notes.trim()) {
      return siteMeta.notes.trim();
    }
    if (siteMeta?.lineItems && Array.isArray(siteMeta.lineItems) && siteMeta.lineItems.length > 0) {
      return `${siteMeta.lineItems.length} product/service line item${siteMeta.lineItems.length > 1 ? 's' : ''} configured for this site.`;
    }
    if (site?.description && typeof site.description === 'string') return site.description;
    return 'No description available for this project site.';
  })();

  const images = Array.isArray(site.images)
    ? site.images
        .map((img: any) => (typeof img === 'string' ? img : img?.imageUrl || null))
        .filter(Boolean)
    : [];

  return (
    <div className="detail-page">
      {/* Breadcrumbs */}
      <div className="detail-breadcrumb">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center text-sm font-medium text-slate-500">
            <button onClick={() => navigate('/')} className="hover:text-blue-600 transition-colors flex items-center">
               <ArrowLeft className="w-4 h-4 mr-2" /> Home
            </button>
            <ChevronRight className="w-4 h-4 mx-3 opacity-30" />
            <span className="text-slate-400">Projects</span>
            <ChevronRight className="w-4 h-4 mx-3 opacity-30" />
            <span className="text-slate-900 font-bold">{site.name}</span>
          </nav>
        </div>
      </div>

      <div className="detail-container">
        <div className="detail-grid items-start">
          
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="detail-media-card relative aspect-[4/3] group">
              <img 
                src={getImageUrl(images[activeImage])} 
                alt={site.name} 
                className="w-full h-full object-cover transition-all duration-700" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getImageUrl(null);
                }}
              />
              
              {images.length > 1 && (
                <>
                  <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setActiveImage(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                      className="bg-white/90 backdrop-blur-md p-4 rounded-full shadow-xl hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={() => setActiveImage(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                      className="bg-white/90 backdrop-blur-md p-4 rounded-full shadow-xl hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                    {images.map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-2 h-2 rounded-full transition-all ${i === activeImage ? 'bg-white w-6' : 'bg-white/40'}`} 
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {images.map((img, i) => (
                  <button 
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${i === activeImage ? 'border-blue-600 scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img 
                      src={getImageUrl(img)} 
                      alt={`${site.name} view ${i}`} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getImageUrl(null);
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Site Info */}
          <div className="detail-panel flex flex-col">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="detail-chip bg-blue-50 text-blue-700 border border-blue-200">
                <MapPin className="w-3 h-3 mr-2" /> {site.cityName || 'Madhya Pradesh'}
              </span>
              <span className={`detail-chip ${
                site.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                site.status === 'WORKING' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {site.status === 'COMPLETED' ? <CheckCircle2 className="w-3 h-3 mr-2" /> : <Clock className="w-3 h-3 mr-2" />}
                {formatStatus(site.status)}
              </span>
            </div>

            <h1 className="detail-title font-black">{site.name}</h1>
            
            <div className="flex items-center space-x-2 text-slate-500 mb-7 font-medium">
               <MapPin className="w-5 h-5 text-blue-600" />
               <span>{site.address}</span>
            </div>

            <div className="prose prose-slate max-w-none mb-8">
               <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center">
                 <Building2 className="w-5 h-5 mr-3 text-blue-600" />
                 Project Overview
               </h3>
               <p className="detail-summary text-base font-medium">
                 {overviewText}
               </p>
            </div>

            {/* Site Details Table */}
            <div className="detail-spec-card mb-8">
               <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center uppercase tracking-widest text-xs">
                 <Info className="w-5 h-5 mr-3 text-blue-600" />
                 Project Specifications
               </h3>
               <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
                  <div className="flex flex-col border-b border-white pb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Initiation Date</span>
                    <span className="text-slate-700 font-bold flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                      {formatDateForDisplay(site.startDate)}
                    </span>
                  </div>
                  <div className="flex flex-col border-b border-white pb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Completion</span>
                    <span className="text-slate-700 font-bold flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-slate-400" />
                      {formatDateForDisplay(site.completionDate)}
                    </span>
                  </div>
                  <div className="flex flex-col border-b border-white pb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Region</span>
                    <span className="text-slate-700 font-bold">{site.cityName}</span>
                  </div>
                  <div className="flex flex-col border-b border-white pb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Project Status</span>
                    <span className="text-slate-700 font-bold">{formatStatus(site.status)}</span>
                  </div>
                  <div className="flex flex-col border-b border-white pb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Client Name</span>
                    <span className="text-slate-700 font-bold">{siteInfo.clientName || site.customerName || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col border-b border-white pb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Person</span>
                    <span className="text-slate-700 font-bold">{siteInfo.contactPerson || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col border-b border-white pb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mobile Number</span>
                    <span className="text-slate-700 font-bold">{siteInfo.mobileNumber || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col border-b border-white pb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Items Count</span>
                    <span className="text-slate-700 font-bold">{Array.isArray((site as any)?.siteProducts) ? (site as any).siteProducts.length : 0}</span>
                  </div>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
               <button 
                onClick={handleInquiry}
                disabled={inquiryLoading}
                className="flex-1 bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center hover:bg-blue-600 transition-all shadow-lg shadow-blue-100 group relative overflow-hidden active:scale-95 disabled:opacity-70"
               >
                 <span className="relative z-10 flex items-center">
                   {inquiryLoading ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <MessageCircle className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />}
                   Inquire About Project
                 </span>
                 <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
               </button>
               
               <button 
                  onClick={() => navigate('/contact')}
                  className="flex-1 bg-white border border-slate-200 text-slate-800 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95 shadow-sm"
               >
                  Contact Branch
               </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteDetail;
