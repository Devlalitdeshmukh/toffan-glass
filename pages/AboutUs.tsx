import { useState, useEffect } from 'react';
import ContentService from '../services/contentService';
import { Sparkles, Building2 } from 'lucide-react';
import { getImageUrl } from '../utils/helpers';

const AboutUs = () => {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [heroImage, setHeroImage] = useState('https://images.unsplash.com/photo-1543269664-76bc3997d9ea?auto=format&fit=crop&q=80&w=2000');
  const [heroTitle, setHeroTitle] = useState('A Legacy of Precision');
  const [heroDescription, setHeroDescription] = useState('From Indore\'s industrial heart to the skyline of Central India, our heritage is built on safety, quality, and aesthetic perfection.');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const data = await ContentService.getContentPageByPageName('about_us');
        if (data) {
          setContent(data);
          if (data.title) setHeroTitle(data.title);
          if (data.metaDescription) setHeroDescription(data.metaDescription);
          const hero = Array.isArray(data?.images) && data.images.length > 0
            ? (data.images[0]?.imageUrl || data.images[0]?.image_url || data.images[0])
            : null;
          if (hero) {
            setHeroImage(getImageUrl(hero));
          }
        } else {
          // Default content if not found in DB
          setContent({
            title: 'About Us',
            content: '<p>Toffan Glass Solutions emerged from Indore\'s rising industrial demand for safety glass that didn\'t compromise on aesthetic vision.</p><p>Today, we operate state-of-the-art toughening plants that serve builders from Bhopal to Jabalpur, ensuring every pane of glass meets IS 2553 standards.</p>',
            id: 'default'
          });
        }
      } catch (err) {
        console.error('Error fetching about us content:', err);
        setError('Failed to load about us content');
        // Set default content
        setContent({
          title: 'About Us',
          content: '<p>Toffan Glass Solutions emerged from Indore\'s rising industrial demand for safety glass that didn\'t compromise on aesthetic vision.</p><p>Today, we operate state-of-the-art toughening plants that serve builders from Bhopal to Jabalpur, ensuring every pane of glass meets IS 2553 standards.</p>',
          id: 'default'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="py-24 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-slate-600">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-6">About Us</h1>
          <p className="text-red-600">Failed to load content. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Hero Section */}
      <div className="relative h-[60vh] flex items-center overflow-hidden bg-slate-900 mb-24">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage}
            className="w-full h-full object-cover opacity-40 grayscale"
            alt="About Background"
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
            <span className="text-blue-500 font-black uppercase tracking-[0.4em] text-xs mb-6 block animate-fade-in">Established Excellence</span>
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
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h1 className="text-5xl font-extrabold mb-10 tracking-tight leading-tight">
              Decades of Toughened <br /> 
              <span className="text-blue-600">Glass Heritage.</span>
            </h1>
            <div 
              className="space-y-8 text-lg text-slate-500 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content.content }}
            />
            <div className="grid grid-cols-2 gap-10 pt-8 border-t border-slate-100">
              <div>
                <p className="text-4xl font-black text-slate-900 mb-1">12+</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Years Experience</p>
              </div>
              <div>
                <p className="text-4xl font-black text-slate-900 mb-1">2.5M+</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sq. Ft Processed</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
            <img 
              src="https://images.unsplash.com/photo-1543269664-76bc3997d9ea?auto=format&fit=crop&q=80&w=800" 
              className="rounded-[3rem] shadow-2xl relative z-10 w-full"
              alt="Glass Factory"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = getImageUrl(null);
              }}
            />
            <div className="absolute -bottom-10 -right-10 bg-white p-10 rounded-[2rem] shadow-2xl z-20 border border-slate-50 max-w-[250px]">
              <Sparkles className="text-blue-600 w-10 h-10 mb-4" />
              <p className="font-bold text-slate-900 leading-tight">Voted Most Trusted Supplier MP 2024</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
