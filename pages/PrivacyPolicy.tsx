import { useEffect, useState } from 'react';
import ContentService from '../services/contentService';
import { getImageUrl } from '../utils/helpers';

const fallbackPolicy = `
<p>Your privacy is important to us. This policy explains how Toffan Glass Solutions collects, uses, and protects customer information.</p>
<p>We collect only the data required for order processing, project execution, invoicing, and customer support. We do not sell personal data to third parties.</p>
<p>For data correction or deletion requests, please contact our support team through the Contact page.</p>
`;

const PrivacyPolicy = () => {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [heroImage, setHeroImage] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await ContentService.getContentPageByPageName('privacy_policy');
        setContent(data);
        const firstImage = Array.isArray(data?.images) && data.images.length > 0
          ? (data.images[0]?.imageUrl || data.images[0]?.image_url || data.images[0])
          : null;
        if (firstImage) {
          setHeroImage(getImageUrl(firstImage));
        }
      } catch (error) {
        console.error('Failed to load privacy policy:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-24">
      <section className="relative h-[48vh] min-h-[300px] flex items-center overflow-hidden bg-slate-900">
        <img
          src={heroImage || 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=2000'}
          alt="Privacy Policy"
          className="absolute inset-0 w-full h-full object-cover opacity-65"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=2000';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/35 via-slate-900/50 to-slate-950/70" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 w-full">
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-blue-300 mb-4">Legal & Compliance</p>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            {content?.title || 'Privacy Policy'}
          </h1>
          <p className="mt-4 text-slate-200 max-w-3xl text-sm md:text-base font-medium">
            We are committed to safeguarding your data and maintaining transparency in how your information is used.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 mt-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10 shadow-sm">
          <div
            className="prose prose-slate max-w-none text-sm md:text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: loading ? '<p>Loading policy...</p>' : content?.content || fallbackPolicy }}
          />
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
