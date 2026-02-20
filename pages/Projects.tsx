import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Loader2 } from 'lucide-react';
import SiteService from '../services/siteService';
import { formatStatus, getImageUrl } from '../utils/helpers';
import ContentService from '../services/contentService';

const buttonClass =
  'inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold tracking-wide transition-all duration-300 border border-slate-300 text-slate-800 bg-white hover:bg-slate-100 hover:border-slate-400';

const getSiteImage = (site: any) => {
  if (!Array.isArray(site?.images) || site.images.length === 0) return null;
  const first = site.images[0];
  if (typeof first === 'string') return first;
  if (first && typeof first.imageUrl === 'string') return first.imageUrl;
  if (first && typeof first.image_url === 'string') return first.image_url;
  return null;
};

const getSiteCity = (site: any) => {
  if (typeof site?.cityName === 'string' && site.cityName.trim()) return site.cityName;
  if (typeof site?.city === 'string' && site.city.trim()) return site.city;
  return 'Unknown';
};

const getSiteDescription = (site: any) => {
  if (!site?.description || typeof site.description !== 'string') {
    return 'Professional project delivery with premium glass and hardware systems.';
  }
  return site.description.replace(/<[^>]+>/g, '').trim() || 'Professional project delivery with premium glass and hardware systems.';
};

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroImage, setHeroImage] = useState('/upload/photo-1497366754035-f200968a6e72.jpeg');
  const [heroTitle, setHeroTitle] = useState('Projects');
  const [heroDescription, setHeroDescription] = useState('Explore our executed and ongoing sites featuring modern glass installations, precision hardware integration, and reliable project delivery.');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const withImages = await SiteService.getSitesWithImages();
        if (withImages.success && Array.isArray(withImages.sites)) {
          setProjects(withImages.sites);
          return;
        }

        const fallback = await SiteService.getAllSites();
        setProjects(fallback.success && Array.isArray(fallback.sites) ? fallback.sites : []);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const loadHeroImage = async () => {
      try {
        const pageContent = await ContentService.getContentPageByPageName('projects_page');
        if (pageContent?.title) setHeroTitle(pageContent.title);
        if (pageContent?.metaDescription) setHeroDescription(pageContent.metaDescription);
        const firstImage = Array.isArray(pageContent?.images) && pageContent.images.length > 0
          ? (pageContent.images[0]?.imageUrl || pageContent.images[0]?.image_url || pageContent.images[0])
          : null;
        if (firstImage) {
          setHeroImage(getImageUrl(firstImage));
        }
      } catch (error) {
        console.error('Failed to load projects hero image:', error);
      }
    };

    loadHeroImage();
  }, []);

  const orderedProjects = useMemo(() => {
    return [...projects].sort(
      (a, b) => new Date(b.createdAt || b.created_at || 0).getTime() - new Date(a.createdAt || a.created_at || 0).getTime()
    );
  }, [projects]);

  return (
    <div className="bg-[#fcfdfe] min-h-screen pb-24">
      <section className="relative h-[54vh] flex items-center overflow-hidden bg-slate-900 mb-16 pt-20">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Projects"
            className="h-full w-full object-cover opacity-70 brightness-110 contrast-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getImageUrl(null);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-slate-900/35 to-slate-900/20" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center md:text-left">
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight">{heroTitle}</h1>
          <p className="text-slate-100 text-base md:text-lg mt-5 max-w-3xl mx-auto md:mx-0">
            {heroDescription}
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
            <p className="text-sm text-slate-500 mt-4 font-semibold">Loading projects...</p>
          </div>
        ) : orderedProjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm font-semibold text-slate-500">
            No projects found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {orderedProjects.map((project) => (
              <article key={project.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={getImageUrl(getSiteImage(project))}
                    alt={project.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getImageUrl(null);
                    }}
                  />
                  <div className="absolute top-4 left-4 inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-800">
                    <MapPin className="w-3 h-3 mr-1.5 text-blue-600" />
                    {getSiteCity(project)}
                  </div>
                  <div className="absolute top-4 right-4 rounded-full bg-slate-900/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    {formatStatus(project.status)}
                  </div>
                </div>

                <div className="flex h-[250px] flex-col p-6">
                  <h3 className="text-xl font-extrabold text-slate-900">{project.name}</h3>
                  <p className="text-sm text-slate-600 leading-6 mt-3 line-clamp-3 flex-1">{getSiteDescription(project)}</p>
                  <Link to={`/projects/${project.id}`} className={`${buttonClass} mt-6 w-fit`}>
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Projects;
