
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
  Info,
  Layers
} from 'lucide-react';
import ServiceService from '../services/serviceService';
import { toast } from 'react-toastify';
import { formatDateForDisplay, formatStatus, getImageUrl } from '../utils/helpers';
import * as LucideIcons from 'lucide-react';

interface ServiceDetailProps {
  user?: any;
}

const ServiceDetail: React.FC<ServiceDetailProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [inquiryLoading, setInquiryLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchService();
    }
  }, [id]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const result = await ServiceService.getServiceById(id!);
      if (result.success) {
        setService(result.service);
      } else {
        toast.error('Service not found');
        navigate('/services');
      }
    } catch (err) {
      toast.error('Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  const handleInquiry = async () => {
    setInquiryLoading(true);
    toast.info('Opening inquiry form...');
    setTimeout(() => {
      setInquiryLoading(false);
      navigate('/contact', { state: { service: service?.title } });
    }, 1000);
  };

  // Helper to get icon component dynamically
  const getIcon = (iconName: string) => {
    // @ts-ignore
    const IconComponent = LucideIcons[iconName];
    return IconComponent ? <IconComponent className="w-5 h-5 mr-3 text-blue-600" /> : <Layers className="w-5 h-5 mr-3 text-blue-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!service) return null;

  const images = service.images && service.images.length > 0
    ? service.images.map((img: any) => img.imageUrl)
    : [''];

  return (
    <div className="detail-page">
      {/* Breadcrumbs */}
      <div className="detail-breadcrumb">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center text-sm font-medium text-slate-500">
            <button onClick={() => navigate('/services')} className="hover:text-blue-600 transition-colors flex items-center">
               <ArrowLeft className="w-4 h-4 mr-2" /> Our Services
            </button>
            <ChevronRight className="w-4 h-4 mx-3 opacity-30" />
            <span className="text-slate-400">Detail</span>
            <ChevronRight className="w-4 h-4 mx-3 opacity-30" />
            <span className="text-slate-900 font-bold">{service.title}</span>
          </nav>
        </div>
      </div>

      <div className="detail-container">
        <div className="detail-grid items-start">
          
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="detail-media-card relative aspect-[4/3] group">
              <img 
                src={getImageUrl(images[activeImage] && images[activeImage] !== '/placeholder.jpg' ? images[activeImage] : null)} 
                alt={service.title} 
                className="w-full h-full object-cover transition-all duration-700" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = getImageUrl(null);
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
                    {images.map((_: any, i: number) => (
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
                 {images.map((img: string, i: number) => (
                   <button 
                     key={i}
                     onClick={() => setActiveImage(i)}
                     className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${i === activeImage ? 'border-blue-600 scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                   >
                     <img 
                       src={getImageUrl(img && img !== '/placeholder.jpg' ? img : null)} 
                       alt={`${service.title} view ${i}`} 
                       className="w-full h-full object-cover" 
                       onError={(e) => {
                         const target = e.target as HTMLImageElement;
                         target.onerror = null;
                         target.src = getImageUrl(null);
                       }}
                     />
                   </button>
                 ))}
               </div>
            )}
          </div>

          {/* Service Info */}
          <div className="detail-panel flex flex-col">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="detail-chip bg-blue-50 text-blue-700 border border-blue-200">
                {service.icon ? getIcon(service.icon) : <Layers className="w-3 h-3 mr-2" />} 
                Service Detail
              </span>
              <span className={`detail-chip ${
                service.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {service.status === 'ACTIVE' ? <CheckCircle2 className="w-3 h-3 mr-2" /> : <Info className="w-3 h-3 mr-2" />}
                {formatStatus(service.status)}
              </span>
            </div>

            <h1 className="detail-title font-black">{service.title}</h1>
            
            <p className="detail-summary text-base font-medium mb-7 border-l-4 border-blue-500 pl-4">{service.shortDescription}</p>

            <div className="prose prose-slate max-w-none mb-8">
               <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center">
                 <Building2 className="w-5 h-5 mr-3 text-blue-600" />
                 Full Description
               </h3>
               <p className="detail-summary text-base font-medium whitespace-pre-line">
                 {service.description || 'No detailed description available for this service.'}
               </p>
            </div>

            {/* Service Details Table */}
            <div className="detail-spec-card mb-8">
               <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center uppercase tracking-widest text-xs">
                 <Info className="w-5 h-5 mr-3 text-blue-600" />
                 Service Information
               </h3>
               <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
                  <div className="flex flex-col border-b border-white pb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Added On</span>
                    <span className="text-slate-700 font-bold flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                      {formatDateForDisplay(service.createdAt)}
                    </span>
                  </div>
                  <div className="flex flex-col border-b border-white pb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Updated</span>
                    <span className="text-slate-700 font-bold flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-slate-400" />
                      {formatDateForDisplay(service.updatedAt)}
                    </span>
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
                   Request Service
                 </span>
                 <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
               </button>
               
               <button 
                  onClick={() => navigate('/contact')}
                  className="flex-1 bg-white border border-slate-200 text-slate-800 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95 shadow-sm"
               >
                  Contact Us
               </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
