
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  MessageCircle, 
  Package, 
  ShieldCheck, 
  Truck,
  Loader2,
  Tag,
  Info
} from 'lucide-react';
import { Product } from '../types';
import ProductService from '../services/productService';
import ContactService from '../services/contactService';
import { toast } from 'react-toastify';
import { getImageUrl } from '../utils/helpers';

interface ProductDetailProps {
  user?: any;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [inquiryLoading, setInquiryLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const result = await ProductService.getProductById(id);
      if (result.success) {
        setProduct(result.product);
      } else {
        toast.error('Product not found');
        navigate('/products');
      }
    } catch (err) {
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleInquiry = async () => {
    setInquiryLoading(true);
    // Simple inquiry logic - could open a modal or scroll to contact form
    toast.info('Opening inquiry form...');
    setTimeout(() => {
      setInquiryLoading(false);
      navigate('/contact', { state: { product: product?.name } });
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!product) return null;

  const images = product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls 
    : [product.imageUrl || ''];

  return (
    <div className="detail-page">
      {/* Breadcrumbs */}
      <div className="detail-breadcrumb">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center text-sm font-medium text-slate-500">
            <button onClick={() => navigate('/products')} className="hover:text-blue-600 transition-colors flex items-center">
               <ArrowLeft className="w-4 h-4 mr-2" /> All Products
            </button>
            <ChevronRight className="w-4 h-4 mx-3 opacity-30" />
            <span className="text-slate-400">{product.category}</span>
            <ChevronRight className="w-4 h-4 mx-3 opacity-30" />
            <span className="text-slate-900 font-bold">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="detail-container">
        <div className="detail-grid items-start">
          
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="detail-media-card relative aspect-square group">
              <img 
                src={getImageUrl(images[activeImage])} 
                alt={product.name} 
                className="w-full h-full object-cover transition-all duration-700" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = getImageUrl(null);
                }}
              />
              
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
            </div>

            <div className="grid grid-cols-5 gap-3">
              {images.map((img, i) => (
                <button 
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${i === activeImage ? 'border-blue-600 scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img 
                    src={getImageUrl(img)} 
                    alt={`${product.name} view ${i}`} 
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
          </div>

          {/* Product Info */}
          <div className="detail-panel flex flex-col">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="detail-chip bg-blue-50 text-blue-700 border border-blue-200">
                <Tag className="w-3 h-3 mr-2" /> {product.category}
              </span>
              <span className={`detail-chip ${product.stock > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                {product.stock > 0 ? <CheckCircle2 className="w-3 h-3 mr-2" /> : <Info className="w-3 h-3 mr-2" />}
                {product.stock > 0 ? 'Available for MP' : 'Out of Stock'}
              </span>
            </div>

            <h1 className="detail-title font-black">{product.name}</h1>
            
            <div className="flex items-baseline space-x-3 mb-7">
               <span className="text-4xl font-black text-blue-600">₹{product.price.toLocaleString()}</span>
               <span className="text-slate-400 text-sm font-medium">/ unit (Approx.)</span>
            </div>

            <div className="prose prose-slate max-w-none mb-8">
               <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center">
                 <Package className="w-5 h-5 mr-3 text-blue-600" />
                 Description
               </h3>
               <p className="detail-summary text-base font-medium">
                 {product.description}
               </p>
            </div>

            {/* Specifications Table */}
            <div className="detail-spec-card mb-8">
               <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center uppercase tracking-widest text-xs">
                 <Info className="w-5 h-5 mr-3 text-blue-600" />
                 Technical Specifications
               </h3>
               <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
                  {Object.entries(product.specifications).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex flex-col border-b border-white pb-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{key}</span>
                      <span className="text-slate-700 font-bold">{value}</span>
                    </div>
                  ))}
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
                   Request Quotation
                 </span>
                 <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
               </button>
               
               <button className="flex-1 bg-white border border-slate-200 text-slate-800 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95 shadow-sm">
                  Technical Sheet
               </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100">
               <div className="flex flex-col items-center text-center">
                 <div className="bg-blue-50 p-4 rounded-2xl mb-4">
                   <ShieldCheck className="w-6 h-6 text-blue-600" />
                 </div>
                 <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">BIS Certified</span>
               </div>
               <div className="flex flex-col items-center text-center">
                 <div className="bg-emerald-50 p-4 rounded-2xl mb-4">
                   <Truck className="w-6 h-6 text-emerald-600" />
                 </div>
                 <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Safe MP Delivery</span>
               </div>
               <div className="flex flex-col items-center text-center">
                 <div className="bg-amber-50 p-4 rounded-2xl mb-4">
                   <Package className="w-6 h-6 text-amber-600" />
                 </div>
                 <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Export Quality</span>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
