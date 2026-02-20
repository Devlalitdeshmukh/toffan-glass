import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, CheckCircle2, Users, BriefcaseBusiness, Sparkles } from 'lucide-react';
import SiteService from '../services/siteService';
import ServiceService from '../services/serviceService';
import ProductService from '../services/productService';
import ContentService from '../services/contentService';
import { SERVICES } from '../constants';
import { formatStatus, getImageUrl } from '../utils/helpers';

const buttonPrimaryClass =
  'inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold tracking-wide transition-all duration-300 bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25';

const buttonSecondaryClass =
  'inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold tracking-wide transition-all duration-300 border border-slate-300 text-slate-800 bg-white hover:bg-slate-100 hover:border-slate-400';

const sectionTitleClass = 'text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900';
const sectionWrapClass = 'py-20 md:py-24';

const extractImage = (entry: any) => {
  if (!entry?.images || !Array.isArray(entry.images) || entry.images.length === 0) return null;
  const first = entry.images[0];
  if (typeof first === 'string') return first;
  if (first && typeof first.imageUrl === 'string') return first.imageUrl;
  if (first && typeof first.image_url === 'string') return first.image_url;
  return null;
};

const extractSiteCity = (site: any) => {
  if (typeof site?.cityName === 'string' && site.cityName.trim()) return site.cityName;
  if (typeof site?.city === 'string' && site.city.trim()) return site.city;
  if (site?.city && typeof site.city === 'object' && typeof site.city.name === 'string') return site.city.name;
  return 'Unknown';
};

const extractSiteExcerpt = (site: any) => {
  if (!site?.description || typeof site.description !== 'string') {
    return 'Premium execution with engineered glass and hardware for modern commercial spaces.';
  }
  return site.description.replace(/<[^>]+>/g, '').trim() || 'Premium execution with engineered glass and hardware for modern commercial spaces.';
};

const CounterNumber: React.FC<{ value: number; active: boolean; suffix?: string }> = ({ value, active, suffix = '' }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const duration = 1400;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(value * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, value]);

  return <span>{display.toLocaleString()}{suffix}</span>;
};

const ServiceCard: React.FC<{ service: any }> = ({ service }) => {
  const title = service.title || 'Service';
  const description =
    (service.shortDescription || service.description || 'Professional architectural glass and hardware service delivery.').slice(0, 140);
  const image = getImageUrl(extractImage(service));

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="h-52 overflow-hidden">
        <img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{description}</p>
        <Link to={`/services/${service.id}`} className={`${buttonSecondaryClass} mt-6 w-fit`}>
          Read More <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </article>
  );
};

const ProductCard: React.FC<{ product: any }> = ({ product }) => {
  const image = getImageUrl(product.imageUrl || (Array.isArray(product.imageUrls) ? product.imageUrls[0] : null));
  const description = (product.description || 'Premium-quality product engineered for reliability and performance.').slice(0, 140);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="h-52 overflow-hidden">
        <img src={image} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-bold text-slate-900">{product.name}</h3>
        <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{description}</p>
        <Link to={`/products/${product.id}`} className={`${buttonSecondaryClass} mt-6 w-fit`}>
          View Details <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </article>
  );
};

const ProjectCard: React.FC<{ site: any }> = ({ site }) => {
  const image = getImageUrl(extractImage(site));
  const city = extractSiteCity(site);

  return (
    <Link to={`/projects/${site.id}`} className="group relative block h-[320px] overflow-hidden rounded-2xl border border-slate-200">
      <img src={image} alt={site.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <span className="mb-3 inline-flex w-fit rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-800">
          {city} · {formatStatus(site.status)}
        </span>
        <h3 className="text-xl font-extrabold text-white">{site.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-slate-200">{extractSiteExcerpt(site)}</p>
      </div>
    </Link>
  );
};

const Home: React.FC = () => {
  const [sites, setSites] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroImage, setHeroImage] = useState('/upload/photo-1486406146926-c627a92ad1ab.jpeg');
  const [heroTitle, setHeroTitle] = useState('Precision Glass Solutions For Modern Architecture');
  const [heroDescription, setHeroDescription] = useState('We design, fabricate, and install premium glass and hardware systems for commercial, residential, and industrial projects with uncompromising quality standards.');
  const statsRef = useRef<HTMLElement | null>(null);
  const [statsActive, setStatsActive] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const homeContent = await ContentService.getContentPageByPageName('home');
        if (homeContent?.title) setHeroTitle(homeContent.title);
        if (homeContent?.metaDescription) setHeroDescription(homeContent.metaDescription);

        const [siteRes, serviceRes, productRes] = await Promise.all([
          SiteService.getSitesWithImages(),
          ServiceService.getAllServices({ page: 1, limit: 6 }),
          ProductService.getAllProducts(),
        ]);

        if (siteRes.success && Array.isArray(siteRes.sites)) {
          setSites(siteRes.sites);
        } else {
          const fallbackSites = await SiteService.getAllSites();
          setSites(fallbackSites.success && Array.isArray(fallbackSites.sites) ? fallbackSites.sites : []);
        }

        if (serviceRes.success && Array.isArray(serviceRes.services) && serviceRes.services.length > 0) {
          setServices(serviceRes.services.filter((s: any) => s.status === 'ACTIVE').slice(0, 6));
        } else {
          setServices(
            SERVICES.map((s, idx) => ({
              id: `fallback-${idx}`,
              title: s.title,
              shortDescription: s.description,
              description: s.description,
              images: [{ imageUrl: '/upload/photo-1497366754035-f200968a6e72.jpeg' }],
            }))
          );
        }

        if (productRes.success && Array.isArray(productRes.products)) {
          setProducts(productRes.products.slice(0, 6));
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Failed to load home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const loadHeroImage = async () => {
      try {
        const hero = await ContentService.getContentPageByPageName('home');
        const firstImage = Array.isArray(hero?.images) && hero.images.length > 0
          ? (hero.images[0]?.imageUrl || hero.images[0]?.image_url || hero.images[0])
          : null;
        if (firstImage) {
          setHeroImage(getImageUrl(firstImage));
        }
      } catch (error) {
        console.error('Failed to load home hero image:', error);
      }
    };

    loadHeroImage();
  }, []);

  useEffect(() => {
    setHeroVisible(true);
  }, []);

  useEffect(() => {
    const node = statsRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const latestProjects = useMemo(() => {
    return [...sites]
      .sort((a, b) => new Date(b.createdAt || b.created_at || 0).getTime() - new Date(a.createdAt || a.created_at || 0).getTime())
      .slice(0, 6);
  }, [sites]);

  return (
    <div className="flex min-h-screen flex-col">
      <section className="relative flex min-h-[88vh] items-center overflow-hidden bg-slate-900 pt-20">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Architectural Glass"
            className="h-full w-full object-cover opacity-70 contrast-110 brightness-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/upload/photo-1497366754035-f200968a6e72.jpeg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/58 via-slate-900/35 to-slate-900/18" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/26 via-transparent to-slate-900/8" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`mx-auto max-w-4xl text-center transition-all duration-700 md:mx-0 md:text-left ${heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {heroTitle}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-100 md:mx-0 md:text-lg">
              {heroDescription}
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center md:justify-start">
              <Link to="/services" className={buttonPrimaryClass}>
                Explore Services <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link to="/contact" className={buttonSecondaryClass}>
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={`${sectionWrapClass} bg-white`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className={sectionTitleClass}>Our Featured Services</h2>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
              Specialized glass installation, architectural fitting, and custom fabrication services delivered by trained professionals for high-performance projects.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      <section className={`${sectionWrapClass} bg-slate-50`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className={sectionTitleClass}>Our Products</h2>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
              Discover our curated range of premium glass systems and architectural hardware designed for durability, safety, and contemporary design.
            </p>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm font-semibold text-slate-500">Loading products...</div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section ref={statsRef} className={`${sectionWrapClass} bg-slate-900`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 text-center sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Happy Customers', value: 2466, icon: Users },
              { label: 'Completed Projects', value: 1283, icon: CheckCircle2 },
              { label: 'Years of Experience', value: 18, icon: Sparkles },
              { label: 'Expert Team Members', value: 64, icon: BriefcaseBusiness },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-700/70 bg-slate-800/60 p-8">
                <item.icon className="mx-auto mb-4 h-7 w-7 text-blue-300" />
                <p className="text-4xl font-extrabold text-white">
                  <CounterNumber value={item.value} active={statsActive} suffix="+" />
                </p>
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-300">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${sectionWrapClass} bg-white`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className={sectionTitleClass}>Latest Projects</h2>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
              A snapshot of our recently delivered and ongoing sites across Madhya Pradesh, showcasing reliable execution and design excellence.
            </p>
          </div>

          {latestProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center text-sm font-semibold text-slate-500">
              No projects available yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {latestProjects.map((site) => (
                <ProjectCard key={site.id} site={site} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
