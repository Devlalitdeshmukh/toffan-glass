
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Phone, Mail, MapPin, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import InquiryService from '../services/inquiryService';
import CityService from '../services/cityService';
import ContactService, { Contact as ContactInfo } from '../services/contactService';
import { User } from '../types';
import { getImageUrl } from '../utils/helpers';
import ContentService from '../services/contentService';
import { toast } from 'react-toastify';

interface ContactProps {
  user?: User | null;
}

const Contact: React.FC<ContactProps> = ({ user }) => {
  const location = useLocation();
  const productFromState = location.state?.product;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    subject: '',
    city: '',
    message: productFromState ? `I'm interested in inquiring about ${productFromState}.` : ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [cities, setCities] = useState<any[]>([]);
  const [heroTitle, setHeroTitle] = useState('Reach Out');
  const [heroDescription, setHeroDescription] = useState('Connect with our expert technical advisors for project estimates, site measurements, and custom glass solutions.');
  const [heroImage, setHeroImage] = useState('https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&q=80&w=2000');

  // Autofill if user is logged in
  useEffect(() => {
    if (user && cities.length > 0) {
      // Find city ID from user.city name
      const userCity = cities.find(c => c.name.toLowerCase() === user.city?.toLowerCase());
      
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        mobile: user.mobile || prev.mobile,
        city: userCity ? userCity.id : prev.city
      }));
    }
  }, [user, cities]);
  const [contactInfo, setContactInfo] = useState<{ phones: ContactInfo[], emails: ContactInfo[], addresses: ContactInfo[] }>({ 
    phones: [], 
    emails: [], 
    addresses: [] 
  });
  const [loadingContactInfo, setLoadingContactInfo] = useState(true);

  // Fetch cities and contact information on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch cities
        const cityResult = await CityService.getAllCities();
        if (cityResult.success) {
          setCities(cityResult.cities);
        }
        
        // Fetch contact information
        const phoneContacts = await ContactService.getContactsByType('phone');
        const emailContacts = await ContactService.getContactsByType('email');
        const addressContacts = await ContactService.getContactsByType('address');
        
        setContactInfo({
          phones: phoneContacts,
          emails: emailContacts,
          addresses: addressContacts
        });

        const contactPage = await ContentService.getContentPageByPageName('contact_us');
        if (contactPage?.title) setHeroTitle(contactPage.title);
        if (contactPage?.metaDescription) setHeroDescription(contactPage.metaDescription);
        const heroImg = Array.isArray(contactPage?.images) && contactPage.images.length > 0
          ? (contactPage.images[0]?.imageUrl || contactPage.images[0]?.image_url || contactPage.images[0])
          : null;
        if (heroImg) setHeroImage(getImageUrl(heroImg));
        
        setLoadingContactInfo(false);
      } catch (error) {
        console.error('Failed to fetch contact information:', error);
        setLoadingContactInfo(false);
      }
    };
    
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.mobile || !formData.city || !formData.message) {
      setSubmitError('Please fill all required fields.');
      toast.error('Please fill all required fields.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setSubmitError('Please enter a valid email address.');
      toast.error('Please enter a valid email address.');
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.mobile)) {
      setSubmitError('Mobile number must be exactly 10 digits.');
      toast.error('Mobile number must be exactly 10 digits.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);
    
    const result = await InquiryService.createInquiry({
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      subject: formData.subject || 'General Inquiry',
      cityId: formData.city,
      message: formData.message
    });
    
    if (result.success) {
      setSubmitSuccess(true);
      toast.success('Inquiry submitted successfully. Our team will contact you soon.');
      setFormData({
        name: '',
        email: '',
        mobile: '',
        subject: '',
        city: '',
        message: ''
      });
    } else {
      setSubmitError(result.error);
      toast.error(result.error || 'Failed to submit inquiry.');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="bg-[#fcfdfe] min-h-screen pb-24">
      {/* Hero Section */}
      <div className="relative h-[60vh] flex items-center overflow-hidden bg-slate-900 mb-20">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage}
            className="w-full h-full object-cover opacity-70 brightness-110 contrast-110"
            alt="Contact Background"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = getImageUrl(null);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/58 via-slate-900/35 to-slate-900/18"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/26 via-transparent to-slate-900/8"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 w-full pt-20">
          <div className="max-w-4xl">
            <span className="text-blue-500 font-black uppercase tracking-[0.4em] text-xs mb-6 block">Direct Consultation</span>
            <h1 className="text-7xl font-black text-white mb-8 tracking-tight leading-none">
              {heroTitle}
            </h1>
            <p className="text-slate-100 text-xl leading-relaxed font-medium max-w-2xl">
              {heroDescription}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-20">
          {/* Info Side */}
          <div className="space-y-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="bg-blue-600 p-1.5 rounded-lg">
                  <Phone className="text-white w-4 h-4" />
                </span>
                <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px]">Contact Channels</span>
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Regional Network</h2>
              <p className="text-slate-500 text-lg leading-relaxed font-medium">
                Whether it's a new commercial building in Indore or a home renovation in Bhopal, 
                our team is ready to support your vision.
              </p>
            </div>

            <div className="space-y-6">
              {loadingContactInfo ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-slate-600">Loading contact information...</span>
                </div>
              ) : (
                <>
                  {/* Phone Numbers */}
                  {contactInfo.phones.length > 0 && (
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-3 rounded-xl mr-4">
                        <Phone className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Call Us</h3>
                        {contactInfo.phones.map((phone, index) => (
                          <p key={index} className="text-slate-600">{phone.contactValue}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Email Addresses */}
                  {contactInfo.emails.length > 0 && (
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-3 rounded-xl mr-4">
                        <Mail className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Email</h3>
                        {contactInfo.emails.map((email, index) => (
                          <p key={index} className="text-slate-600">{email.contactValue}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Addresses */}
                  {contactInfo.addresses.length > 0 && (
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-3 rounded-xl mr-4">
                        <MapPin className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Address</h3>
                        {contactInfo.addresses.map((address, index) => (
                          <p key={index} className="text-slate-600">{address.contactValue}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Form Side */}
          <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 relative overflow-hidden">
            <h2 className="text-2xl font-bold mb-8">Send Inquiry</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    required
                    type="email"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Mobile</label>
                <input
                  required
                  type="tel"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.mobile}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="Enter inquiry subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                <select
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                >
                  <option value="">Select City</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>
                      {city.name}, {city.state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Tell us about your project requirements..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>

              <button
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center hover:bg-blue-700 transition-all disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Send Inquiry <Send className="ml-2 w-5 h-5" /></>}
              </button>
            </form>

            {/* Success/Error Messages */}
            {submitSuccess && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-700 font-medium">Inquiry submitted successfully! Our team will contact you soon.</span>
              </div>
            )}
            
            {submitError && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-700 font-medium">{submitError}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
