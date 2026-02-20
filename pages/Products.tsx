import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowRight, Tag, Loader2, Box, Layers } from 'lucide-react';
import { Product } from '../types';
import ProductService from '../services/productService';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/helpers';
import ContentService from '../services/contentService';

const Products: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [heroImage, setHeroImage] = useState('https://images.unsplash.com/photo-1554232456-8727aae0cfa4?auto=format&fit=crop&q=80&w=2000');
  const [heroTitle, setHeroTitle] = useState('Premium Inventory');
  const [heroDescription, setHeroDescription] = useState('Architectural-grade materials for high-end developments across Madhya Pradesh. BIS certified solutions since 2012.');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const loadHeroImage = async () => {
      try {
        const pageContent = await ContentService.getContentPageByPageName('products_page');
        if (pageContent?.title) setHeroTitle(pageContent.title);
        if (pageContent?.metaDescription) setHeroDescription(pageContent.metaDescription);
        const firstImage = Array.isArray(pageContent?.images) && pageContent.images.length > 0
          ? (pageContent.images[0]?.imageUrl || pageContent.images[0]?.image_url || pageContent.images[0])
          : null;
        if (firstImage) {
          setHeroImage(getImageUrl(firstImage));
        }
      } catch (error) {
        console.error('Failed to load products hero image:', error);
      }
    };

    loadHeroImage();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const result = await ProductService.getAllProducts();
      if (result.success) {
        setProducts(result.products);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    (category === 'All' || p.category === category) &&
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  if (loading) {
    return (
      <div className="bg-[#fcfdfe] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-6" />
          <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Accessing Inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfdfe] min-h-screen pb-24">
      {/* Hero Section */}
      <div className="relative h-[60vh] flex items-center overflow-hidden bg-slate-900 mb-20">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage}
            className="w-full h-full object-cover opacity-40 grayscale"
            alt="Products Background"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = getImageUrl(null);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/60 to-slate-950"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 w-full pt-20">
          <div className="max-w-4xl">
            <span className="text-blue-500 font-black uppercase tracking-[0.4em] text-xs mb-6 block">Industrial Grade Quality</span>
            <h1 className="text-7xl font-black text-white mb-8 tracking-tight leading-none">
              {heroTitle}
            </h1>
            <p className="text-slate-400 text-xl leading-relaxed font-medium max-w-2xl">
              {heroDescription}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 p-6 md:p-8 bg-white rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-100">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center space-x-2 mb-4">
                <span className="bg-blue-600 p-1.5 rounded-lg">
                  <Box className="text-white w-4 h-4" />
                </span>
                <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px]">Filtering Options</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Refine Your Selection</h2>
              <p className="text-sm text-slate-500 mt-3 font-medium">Find the right product quickly with search and category filters.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-grow sm:flex-grow-0 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-blue-600" />
                <input
                  type="text"
                  placeholder="Search inventory..."
                  className="pl-14 pr-8 h-14 border border-slate-200 bg-slate-50/70 hover:bg-white focus:bg-white rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none w-full sm:w-96 transition-all font-medium text-slate-800"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <select
                  className="px-6 h-14 border border-slate-200 bg-slate-50/70 hover:bg-white focus:bg-white rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-bold text-slate-700 transition-all appearance-none cursor-pointer pr-14 w-full sm:w-auto min-w-[220px]"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                  ))}
                </select>
                <Filter className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 mb-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider border border-blue-100">
                <Layers className="w-3 h-3" />
                {filteredProducts.length} Item{filteredProducts.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                  category === cat
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                {cat === 'All' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 text-sm font-semibold">
            {error}
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="py-32 text-center bg-white rounded-[3rem] shadow-xl shadow-slate-50 border border-slate-50">
             <Search className="w-16 h-16 text-slate-200 mx-auto mb-6" />
             <h3 className="text-2xl font-black text-slate-900 mb-2">No items found</h3>
             <p className="text-slate-400">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10">
            {filteredProducts.map((product) => (
              <Link
                to={`/products/${product.id}`}
                key={product.id}
                className="relative bg-white rounded-[2rem] shadow-lg shadow-slate-100 hover:shadow-2xl hover:shadow-blue-100/40 transition-all duration-500 overflow-hidden border border-slate-100 flex flex-col group hover:-translate-y-1"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="relative h-64 overflow-hidden">
                  <img
                    src={getImageUrl(product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : product.imageUrl)}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = getImageUrl(null);
                    }}
                  />
                  <div className="absolute top-5 left-5">
                    <span className="bg-white/95 backdrop-blur-md text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow flex items-center">
                      <Tag className="w-3 h-3 mr-2 text-blue-600" />
                      {product.category}
                    </span>
                  </div>
                  <div className="absolute top-5 right-5">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                      product.stock > 100 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {product.stock > 100 ? 'Ready Stock' : 'Low Stock'}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute inset-x-6 bottom-6 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500">
                    <div className="w-full bg-white/95 text-slate-900 py-3 rounded-xl font-bold text-sm flex items-center justify-center">
                      View Product <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </div>
                
                <div className="p-7 flex-grow">
                  <h3 className="text-[2rem] font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2 mb-4">
                    {product.name}
                  </h3>
                  <p className="text-slate-500 text-base mb-6 leading-relaxed line-clamp-2 font-medium">{product.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(product.specifications || {}).slice(0, 3).map(([key, value]: [string, any], i) => (
                      <div key={i} className="bg-slate-50 px-3 py-2 rounded-xl text-[11px] font-bold text-slate-600 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
                        <span className="text-slate-400">{key}:</span> {String(value)}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="px-7 pb-7 mt-auto">
                  <div className="h-px w-full bg-slate-100 mb-5"></div>
                  <div className="flex items-end justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Premium Rate</span>
                      <span className="text-3xl font-black text-slate-950">₹{product.price.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1">Available Qty</p>
                      <p className="text-lg font-black text-slate-800">{product.stock}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
