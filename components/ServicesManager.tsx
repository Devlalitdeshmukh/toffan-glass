
import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Search, Package, Check, X, 
  ChevronLeft, ChevronRight, Upload, Loader2 
} from 'lucide-react';
import { toast } from 'react-toastify';
import ServiceService from '../services/serviceService';
import { getImageUrl } from '../utils/helpers';
import ConfirmationModal from './ConfirmationModal';

interface ServicesManagerProps {
  user?: any;
}

const ServicesManager: React.FC<ServicesManagerProps> = ({ user }) => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('list'); // list, add, edit
  const [currentService, setCurrentService] = useState<any>(null);
  
  // Sorting
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchServices();
  }, [currentPage, sortField, sortDirection, searchTerm]);

  const fetchServices = async () => {
    setLoading(true);
    const result = await ServiceService.getAllServices({
      page: currentPage,
      limit: itemsPerPage,
      sortField,
      sortDirection: sortDirection.toUpperCase(),
      search: searchTerm
    });
    if (result.success) {
      setServices(result.services);
      if (result.pagination) {
        setTotalPages(result.pagination.pages);
        setTotalItems(result.pagination.total);
      }
    } else {
      toast.error('Failed to fetch services');
    }
    setLoading(false);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);
  
  const handleDelete = async (id: number) => {
    setServiceToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (serviceToDelete !== null) {
      const result = await ServiceService.deleteService(serviceToDelete);
      if (result.success) {
        toast.success('Service deleted successfully');
        fetchServices();
      } else {
        toast.error(result.error);
      }
      setShowDeleteConfirm(false);
      setServiceToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setServiceToDelete(null);
  };

  // Note: Filtering is now handled by backend API
  const filteredServices = services;

  // Apply pagination to filtered results
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = Math.min(indexOfLastItem - itemsPerPage + 1, totalItems);
  const indexOfLastItemActual = Math.min(indexOfLastItem, totalItems);
  const currentItems = services; // Current page items are already paginated by backend
  // const totalPages = Math.ceil(totalItems / itemsPerPage); // Already declared as state variable

  const ServiceForm = ({ service = null, onSuccess, onCancel }: any) => {
    const [formData, setFormData] = useState({
      title: service?.title || '',
      shortDescription: service?.shortDescription || '',
      description: service?.description || '',
      status: service?.status || 'ACTIVE',
      icon: service?.icon || ''
    });
    const [images, setImages] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<any[]>(service?.images || []);
    const [submitting, setSubmitting] = useState(false);
    const [showImageDeleteConfirm, setShowImageDeleteConfirm] = useState(false);
    const [imageToDelete, setImageToDelete] = useState<number | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      
      const data = new FormData();
      data.append('title', formData.title);
      data.append('shortDescription', formData.shortDescription);
      data.append('description', formData.description);
      data.append('status', formData.status);
      data.append('icon', formData.icon);

      images.forEach((file) => {
        data.append('images', file);
      });

      let result;
      if (service) {
        result = await ServiceService.updateService(service.id, data);
      } else {
        result = await ServiceService.createService(data);
      }

      if (result.success) {
        toast.success(`Service ${service ? 'updated' : 'created'} successfully`);
        onSuccess();
      } else {
        toast.error(result.error);
      }
      setSubmitting(false);
    };

    const handleImageDelete = async (imageId: number) => {
      if (!service) return;
      setImageToDelete(imageId);
      setShowImageDeleteConfirm(true);
    };

    const confirmImageDelete = async () => {
      if (!service || imageToDelete === null) return;

      const result = await ServiceService.deleteServiceImage(service.id, imageToDelete);
      if (result.success) {
        setExistingImages((prev) => prev.filter((img) => img.id !== imageToDelete));
        toast.success('Image removed');
      } else {
        toast.error('Failed to remove image');
      }
      setImageToDelete(null);
    };

    const cancelImageDelete = () => {
      setShowImageDeleteConfirm(false);
      setImageToDelete(null);
    };

    return (
      <>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                {service ? 'Edit Service' : 'New Service'}
            </h2>
            <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Service Title</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Glass Partitioning"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Short Description</label>
            <textarea
              required
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.shortDescription}
              onChange={e => setFormData({...formData, shortDescription: e.target.value})}
              placeholder="Brief summary for list view..."
            />
             <p className="text-xs text-slate-400 mt-1 text-right">{formData.shortDescription.length}/500</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Full Description</label>
            <textarea
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Detailed service description..."
            />
          </div>

           <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Service Icon (Optional)</label>
            <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.icon}
                onChange={e => setFormData({...formData, icon: e.target.value})}
                placeholder="Lucide icon name (e.g. ShieldCheck)"
            />
          </div>

          <div>
             <label className="block text-sm font-bold text-slate-700 mb-4">Service Images</label>
             
             {/* Existing Images */}
             {existingImages.length > 0 && (
                 <div className="grid grid-cols-4 gap-4 mb-4">
                     {existingImages.map((img: any) => (
                         <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200">
                             <img
                               src={getImageUrl(img.imageUrl)}
                               alt="Service"
                               className="w-full h-full object-cover"
                               onError={(e) => {
                                 const target = e.target as HTMLImageElement;
                                 target.onerror = null;
                                 target.src = getImageUrl(null);
                               }}
                             />
                             <button
                                type="button"
                                onClick={() => handleImageDelete(img.id)}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                                 <Trash2 className="w-4 h-4" />
                             </button>
                             {img.isPrimary && <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Main</span>}
                         </div>
                     ))}
                 </div>
             )}

             <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:bg-slate-50 transition-colors relative">
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={e => {
                        if (e.target.files) {
                            setImages(Array.from(e.target.files));
                        }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                        <Upload className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-slate-900">Click to upload images</p>
                    <p className="text-sm text-slate-400 mt-1">{images.length > 0 ? `${images.length} files selected` : 'SVG, PNG, JPG or GIF (max. 5MB)'}</p>
                </div>
             </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-slate-50">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-900 transition-colors shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-70 flex items-center"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {service ? 'Update Service' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
      <ConfirmationModal
        isOpen={showImageDeleteConfirm}
        onClose={cancelImageDelete}
        onConfirm={confirmImageDelete}
        title="Remove Service Image"
        message="Are you sure you want to remove this image from the service?"
        confirmText="Yes, Remove"
        type="warning"
      />
      </>
    );
  };

  if (activeTab === 'add' || activeTab === 'edit') {
    return <ServiceForm 
        service={activeTab === 'edit' ? currentService : null} 
        onSuccess={() => {
            setActiveTab('list');
            fetchServices();
        }}
        onCancel={() => setActiveTab('list')}
    />;
  }

  return (
    <div>
      <div className="space-y-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Services Management</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Total {services.length} services available</p>
            </div>
            <button 
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl flex items-center font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
              onClick={() => {
                  setCurrentService(null);
                  setActiveTab('add');
              }}
            >
              <Plus className="w-5 h-5 mr-3" />
              Add New Service
            </button>
          </div>

          {/* Search */}
          <div className="mb-8 max-w-md relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
               <input
                  type="text"
                  placeholder="Search services..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
               />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-4 text-xs font-black text-slate-400 capitalize tracking-widest">Image</th>
                  <th 
                    className="pb-4 text-xs font-black text-slate-400 capitalize tracking-widest cursor-pointer hover:text-slate-600"
                    onClick={() => handleSort('title')}
                  >
                    Service Title
                    {sortField === 'title' && (
                      <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                    )}
                  </th>
                  <th className="pb-4 text-xs font-black text-slate-400 capitalize tracking-widest">Description</th>
                  <th 
                    className="pb-4 text-xs font-black text-slate-400 capitalize tracking-widest cursor-pointer hover:text-slate-600"
                    onClick={() => handleSort('status')}
                  >
                    Status
                    {sortField === 'status' && (
                      <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                    )}
                  </th>
                  <th 
                    className="pb-4 text-xs font-black text-slate-400 capitalize tracking-widest cursor-pointer hover:text-slate-600"
                    onClick={() => handleSort('createdAt')}
                  >
                    Created
                    {sortField === 'createdAt' && (
                      <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                    )}
                  </th>
                  <th className="pb-4 text-xs font-black text-slate-400 capitalize tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                    <tr>
                        <td colSpan={6} className="py-20 text-center">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                        </td>
                    </tr>
                ) : currentItems.length > 0 ? (
                  currentItems.map((service) => (
                    <tr key={service.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 pr-4">
                          <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                               <img
                                 src={getImageUrl(service.images && service.images.length > 0 ? service.images[0].imageUrl : null)}
                                 alt={service.title}
                                 className="w-full h-full object-cover"
                                 onError={(e) => {
                                   const target = e.target as HTMLImageElement;
                                   target.onerror = null;
                                   target.src = getImageUrl(null);
                                 }}
                               />
                          </div>
                      </td>
                      <td className="py-4 font-bold text-slate-900">{service.title}</td>
                      <td className="py-4 text-slate-500 text-sm max-w-xs truncate">{service.shortDescription}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          service.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {service.status}
                        </span>
                      </td>
                      <td className="py-4 text-slate-400 text-xs font-medium">
                          {new Date(service.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button 
                            className="bg-blue-50 text-blue-600 p-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                            onClick={() => {
                              setCurrentService(service);
                              setActiveTab('edit');
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="bg-rose-50 text-rose-600 p-2 rounded-xl hover:bg-rose-600 hover:text-white transition-all"
                            onClick={() => handleDelete(service.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-slate-400 font-medium italic">
                      No services found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Showing {indexOfFirstItem}-{indexOfLastItemActual} of {totalItems}
                  </p>
                  <div className="flex gap-2">
                      <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                      >
                          <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                      >
                          <ChevronRight className="w-4 h-4" />
                      </button>
                  </div>
              </div>
          )}
        </div>
      </div>
      
      {/* Custom Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 border border-slate-100">
            <div className="text-center">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">Confirm Deletion</h3>
              <p className="text-slate-500 font-medium mb-8">
                Are you sure you want to delete this service? This action cannot be undone.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={cancelDelete}
                  className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-3 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesManager;
