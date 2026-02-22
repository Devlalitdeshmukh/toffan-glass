import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import { UserRole } from '../types';
import { 
  BarChart3, 
  Map as MapIcon, 
  CreditCard, 
  Package, 
  User as UserIcon, 
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Loader2,
  MessageSquare,
  Eye,
  EyeOff,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Home,
  Settings,
  Users,
  Briefcase,
  Building2,
  Phone,
  Mail,
  Globe,
  Info,
  X,
  FileText,
  Download,
  Printer,
  ArrowLeft,
  Wallet,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  FolderKanban,
  Layers,
  UserCircle2,
  Palette,
  ImageUp,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
  LockKeyhole
} from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import ProductService from '../services/productService';
import UserService from '../services/userService';
import SiteService from '../services/siteService';
import InquiryService from '../services/inquiryService';
import PaymentService from '../services/paymentService';
import CityService from '../services/cityService';
import ContentService from '../services/contentService';
import ContactService, { Contact as ContactInfo } from '../services/contactService';
import ServiceService from '../services/serviceService';
import ServicesManager from '../components/ServicesManager';
import { formatDateForDisplay, formatDateForInput, formatStatus, getImageUrl } from '../utils/helpers';
import ThemeService, { ThemeMode } from '../services/themeService';

interface DashboardProps {
  user: any;
}

const MAX_CONTENT_IMAGE_BYTES = 20 * 1024 * 1024;

// Reusable Modal Component for Dashboard
const DashboardModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidthClass?: string;
  showHeader?: boolean;
}> = ({ isOpen, onClose, title, children, maxWidthClass = 'modal-md', showHeader = true }) => {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidthClass} overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300 flex flex-col max-h-[95vh] border border-slate-200`}>
        {showHeader ? (
          <div className="px-6 md:px-8 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <h3 className="text-[18px] font-black text-slate-900 tracking-tight uppercase leading-none">{title}</h3>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="absolute right-6 top-6 z-20 p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        )}
        
        {/* Scrollable Body */}
        <div className={`overflow-y-auto flex-grow ${showHeader ? 'p-5 md:p-6' : 'p-5 pt-12'}`}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

// Generic DataTable Component
const DataTable: React.FC<{
  headers: { label: string, key: string, sortable?: boolean }[];
  data: any[];
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onSort: (key: string) => void;
  sortConfig: { key: string, direction: 'asc' | 'desc' } | null;
  renderRow: (item: any) => React.ReactNode;
}> = ({ headers, data, itemsPerPage, currentPage, onPageChange, onSort, sortConfig, renderRow }) => {
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="table-responsive">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              {headers.map((header) => (
                <th 
                  key={header.key} 
                  className={`pb-4 text-xs font-black text-slate-400 capitalize tracking-widest ${header.sortable ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''}`}
                  onClick={() => header.sortable && onSort(header.key)}
                >
                  <div className="flex items-center">
                    {header.label}
                    {header.sortable && sortConfig?.key === header.key && (
                      <span className="ml-2">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedData.length > 0 ? (
              paginatedData.map(renderRow)
            ) : (
              <tr>
                <td colSpan={headers.length} className="py-20 text-center text-slate-400 font-medium italic">
                  No records found Matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, data.length)} of {data.length} results
          </p>
          <div className="flex space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-2 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex space-x-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => onPageChange(i + 1)}
                  className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${
                    currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'hover:bg-slate-50 text-slate-400'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="p-2 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const InvoiceView: React.FC<{
  payment: any;
  onDownloadPdf: () => void;
  onPrint: () => void;
  onRecordPayment: () => void;
  onBack: () => void;
}> = ({ payment, onDownloadPdf, onPrint, onRecordPayment, onBack }) => {
  const invoice = payment?.invoice || {};
  const summary = invoice?.summary || {};
  const paymentHistory = Array.isArray(invoice?.paymentHistory) ? invoice.paymentHistory : [];
  const lineItems = Array.isArray(invoice?.lineItems) ? invoice.lineItems : [];
  const paymentTotals = invoice?.paymentTotals || {};

  const money = (value: any) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(value || 0));
  const displayDate = (value: any) => {
    const raw = String(value || '').trim();
    if (!raw) return '-';
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;
    const dt = new Date(raw);
    if (Number.isNaN(dt.getTime())) return raw;
    const d = String(dt.getDate()).padStart(2, '0');
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const y = dt.getFullYear();
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="w-full space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-black tracking-[0.18em] uppercase text-blue-600">Toffan</p>
            <h2 className="text-2xl font-black text-slate-900">{invoice?.company?.name || 'Toffan Glass Solutions'}</h2>
            <p className="text-sm text-slate-600 mt-1">{invoice?.company?.address || '-'}</p>
            <p className="text-sm text-slate-600">GST: {invoice?.company?.gstNumber || '-'}</p>
            <p className="text-sm text-slate-600">Contact: {invoice?.company?.contact || '-'} | {invoice?.company?.email || '-'}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-700 mb-3">Bill To</h4>
            <div className="space-y-1.5 text-sm">
              <div><span className="font-black text-slate-500">Client:</span> <span className="font-semibold text-slate-900">{invoice?.billTo?.clientName || payment?.customerName || '-'}</span></div>
              <div><span className="font-black text-slate-500">Site:</span> <span className="font-semibold text-slate-900">{invoice?.billTo?.siteName || payment?.siteName || '-'}</span></div>
              <div><span className="font-black text-slate-500">Contact:</span> <span className="font-semibold text-slate-900">{invoice?.billTo?.contactPerson || '-'}</span></div>
              <div><span className="font-black text-slate-500">Mobile:</span> <span className="font-semibold text-slate-900">{invoice?.billTo?.mobile || payment?.customerMobile || '-'}</span></div>
              <div><span className="font-black text-slate-500">GST:</span> <span className="font-semibold text-slate-900">{invoice?.billTo?.gstNumber || '-'}</span></div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 p-4 min-w-[280px]">
            <h3 className="text-lg font-black text-slate-900 mb-3">Invoice</h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="font-bold text-slate-500">Invoice No</span><span className="font-semibold text-slate-900 text-right">{invoice?.invoice?.invoiceNo || payment?.billNumber || '-'}</span>
              <span className="font-bold text-slate-500">Invoice Date</span><span className="font-semibold text-slate-900 text-right">{displayDate(invoice?.invoice?.invoiceDate)}</span>
              <span className="font-bold text-slate-500">Due Date</span><span className="font-semibold text-slate-900 text-right">{displayDate(invoice?.invoice?.dueDate)}</span>
              <span className="font-bold text-slate-500">Status</span><span className="font-black text-right text-blue-700">{formatStatus(invoice?.invoice?.status || payment?.status || 'UNPAID')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 overflow-x-auto">
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-700 mb-3 px-2">Invoice Items</h4>
        <table className="w-full text-xs border-collapse min-w-[1240px]">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              {['Sr', 'Type', 'Item Name', 'Qty', 'Unit', 'Rate', 'Subtotal', 'Discount', 'Taxable', 'VAT %', 'VAT Amount', 'Delivery', 'Total'].map((head) => (
                <th key={head} className="border border-slate-300 px-2 py-2 text-left font-black uppercase tracking-wider">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(lineItems.length ? lineItems : []).map((item: any, idx: number) => (
              <tr key={`invoice-item-${idx}`} className="odd:bg-white even:bg-slate-50">
                <td className="border border-slate-300 px-2 py-2">{item.srNo || idx + 1}</td>
                <td className="border border-slate-300 px-2 py-2">{item.type || '-'}</td>
                <td className="border border-slate-300 px-2 py-2 font-semibold">{item.itemName || '-'}</td>
                <td className="border border-slate-300 px-2 py-2">{item.qty ?? 0}</td>
                <td className="border border-slate-300 px-2 py-2">{item.unit || '-'}</td>
                <td className="border border-slate-300 px-2 py-2">{money(item.rate)}</td>
                <td className="border border-slate-300 px-2 py-2">{money(item.subtotal)}</td>
                <td className="border border-slate-300 px-2 py-2">{money(item.discount)}</td>
                <td className="border border-slate-300 px-2 py-2">{money(item.taxableAmount)}</td>
                <td className="border border-slate-300 px-2 py-2">{Number(item.vatPercent || 0).toFixed(2)}%</td>
                <td className="border border-slate-300 px-2 py-2">{money(item.vatAmount)}</td>
                <td className="border border-slate-300 px-2 py-2">{money(item.delivery)}</td>
                <td className="border border-slate-300 px-2 py-2 font-black text-blue-700">{money(item.total)}</td>
              </tr>
            ))}
            {!lineItems.length && (
              <tr>
                <td colSpan={13} className="border border-slate-300 px-3 py-6 text-center text-slate-500 font-semibold">No line items available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-4 overflow-x-auto">
          <h4 className="text-sm font-black uppercase tracking-widest text-slate-700 mb-3">Payment Details</h4>
          <table className="w-full text-xs min-w-[760px] border-collapse">
            <thead>
              <tr className="bg-slate-100">
                {['Payment Date', 'Payment Mode', 'Reference No', 'Amount Paid'].map((head) => (
                  <th key={head} className="border border-slate-300 px-2 py-2 text-left font-black uppercase tracking-wider">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((row: any, idx: number) => (
                <tr key={`payment-history-${idx}`} className="odd:bg-white even:bg-slate-50">
                  <td className="border border-slate-300 px-2 py-2">{displayDate(row.paymentDate)}</td>
                  <td className="border border-slate-300 px-2 py-2">{row.paymentMode || '-'}</td>
                  <td className="border border-slate-300 px-2 py-2">{row.referenceNo || '-'}</td>
                  <td className="border border-slate-300 px-2 py-2 font-bold text-slate-900">{money(row.amountPaid)}</td>
                </tr>
              ))}
              {!paymentHistory.length && (
                <tr>
                  <td colSpan={4} className="border border-slate-300 px-3 py-6 text-center text-slate-500 font-semibold">No payment history</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="mt-3 flex flex-wrap gap-5 text-sm">
            <div><span className="font-black text-slate-700">Total Paid:</span> <span className="font-black text-blue-700">{money(paymentTotals.totalPaid || payment?.paidAmount)}</span></div>
            <div><span className="font-black text-slate-700">Balance Remaining:</span> <span className="font-black text-rose-700">{money(paymentTotals.balanceRemaining || payment?.balanceAmount)}</span></div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h4 className="text-sm font-black uppercase tracking-widest text-slate-700 mb-3">Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="font-semibold text-slate-600">Subtotal</span><span className="font-bold text-slate-800">{money(summary.subtotal || payment?.amount)}</span></div>
            <div className="flex justify-between"><span className="font-semibold text-slate-600">Total Discount</span><span className="font-bold text-slate-800">{money(summary.discount)}</span></div>
            <div className="flex justify-between"><span className="font-semibold text-slate-600">Total VAT</span><span className="font-bold text-slate-800">{money(summary.vat)}</span></div>
            <div className="flex justify-between"><span className="font-semibold text-slate-600">Delivery Charges</span><span className="font-bold text-slate-800">{money(summary.delivery)}</span></div>
            <div className="flex justify-between border-t border-slate-200 pt-2"><span className="font-black text-slate-900">Grand Total</span><span className="font-black text-blue-700">{money(summary.grandTotal || payment?.amount)}</span></div>
            <div className="flex justify-between"><span className="font-black text-slate-900">Amount Paid</span><span className="font-black text-emerald-700">{money(summary.paidAmount || payment?.paidAmount)}</span></div>
            <div className="flex justify-between"><span className="font-black text-slate-900">Balance Due</span><span className="font-black text-rose-700">{money(summary.balanceDue || payment?.balanceAmount)}</span></div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-wrap gap-3">
        <button onClick={onDownloadPdf} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-blue-700 transition-all"><Download className="w-4 h-4" />Download PDF</button>
        <button onClick={onPrint} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-slate-100 transition-all"><Printer className="w-4 h-4" />Print Invoice</button>
        <button onClick={onRecordPayment} className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-emerald-700 hover:bg-emerald-100 transition-all"><Wallet className="w-4 h-4" />Record Payment</button>
        <button onClick={onBack} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-slate-100 transition-all"><ArrowLeft className="w-4 h-4" />Back</button>
      </div>
    </div>
  );
};

const AnimatedCount: React.FC<{ value: number }> = ({ value }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 900;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(value * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{display.toLocaleString()}</>;
};

const StatCard: React.FC<{ item: any }> = ({ item }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
    <div className="flex items-start justify-between">
      <div className={`w-11 h-11 rounded-xl ${item.color} text-white flex items-center justify-center`}>
        {item.icon}
      </div>
      <span className={`text-xs font-bold ${item.trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
        {item.trend >= 0 ? '+' : ''}{item.trend}%
      </span>
    </div>
    <p className="mt-4 text-xs font-black uppercase tracking-wider text-slate-500">{item.label}</p>
    <p className="mt-1 text-3xl font-black text-slate-900"><AnimatedCount value={Number(item.val || 0)} /></p>
  </div>
);

const MiniBarChart: React.FC<{ data: Array<{ label: string; value: number }> }> = ({ data }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="h-64 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChartIcon className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">Monthly Payments</h3>
      </div>
      <div className="h-[210px] flex items-end gap-2">
        {data.map((item) => (
          <div key={item.label} className="flex-1 flex flex-col items-center justify-end gap-2">
            <div
              className="w-full rounded-t-md bg-blue-500/85 hover:bg-blue-600 transition-colors"
              style={{ height: `${Math.max(8, (item.value / max) * 150)}px` }}
              title={`${item.label}: ₹${Math.round(item.value).toLocaleString()}`}
            />
            <span className="text-[10px] font-bold text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const MiniLineChart: React.FC<{ title: string; icon?: React.ReactNode; data: Array<{ label: string; value: number }> }> = ({ title, icon, data }) => {
  const width = 520;
  const height = 210;
  const padding = 24;
  const max = Math.max(...data.map(d => d.value), 1);
  const min = Math.min(...data.map(d => d.value), 0);
  const range = max - min || 1;
  const points = data.map((d, i) => {
    const x = padding + (i * (width - padding * 2)) / Math.max(1, data.length - 1);
    const y = height - padding - ((d.value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="h-64 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">{title}</h3>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[200px]">
        <polyline points={points} fill="none" stroke="#2563eb" strokeWidth="3" />
        {data.map((d, i) => {
          const x = padding + (i * (width - padding * 2)) / Math.max(1, data.length - 1);
          const y = height - padding - ((d.value - min) / range) * (height - padding * 2);
          return <circle key={d.label} cx={x} cy={y} r="4" fill="#1d4ed8"><title>{`${d.label}: ${d.value}`}</title></circle>;
        })}
      </svg>
    </div>
  );
};

const MiniPieChart: React.FC<{ data: Array<{ label: string; value: number; color: string }> }> = ({ data }) => {
  const total = data.reduce((acc, cur) => acc + cur.value, 0) || 1;
  let current = 0;
  const radius = 70;
  const center = 95;

  const segments = data.map((item) => {
    const start = (current / total) * Math.PI * 2;
    current += item.value;
    const end = (current / total) * Math.PI * 2;
    const x1 = center + radius * Math.cos(start);
    const y1 = center + radius * Math.sin(start);
    const x2 = center + radius * Math.cos(end);
    const y2 = center + radius * Math.sin(end);
    const largeArc = end - start > Math.PI ? 1 : 0;
    return { ...item, path: `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z` };
  });

  return (
    <div className="h-64 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <PieChartIcon className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">Projects Status</h3>
      </div>
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 190 190" className="h-[170px] w-[170px]">
          {segments.map((seg) => (
            <path key={seg.label} d={seg.path} fill={seg.color} stroke="#fff" strokeWidth="2">
              <title>{`${seg.label}: ${seg.value}`}</title>
            </path>
          ))}
          <circle cx={center} cy={center} r="34" fill="#ffffff" />
        </svg>
        <div className="space-y-2">
          {data.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label} ({item.value})
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productFormMode, setProductFormMode] = useState<'list' | 'add' | 'edit'>('list');
  const [userFormMode, setUserFormMode] = useState<'list' | 'add' | 'edit'>('list');
  const [siteFormMode, setSiteFormMode] = useState<'list' | 'add' | 'edit'>('list');
  const [showAddInquiryModal, setShowAddInquiryModal] = useState(false);
  const [paymentFormMode, setPaymentFormMode] = useState<'list' | 'add' | 'edit'>('list');
  const [showViewPaymentModal, setShowViewPaymentModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentSite, setCurrentSite] = useState<any>(null);
  const [loadingSiteDetails, setLoadingSiteDetails] = useState<number | null>(null);
  const [currentInquiry, setCurrentInquiry] = useState<any>(null);
  const [currentPayment, setCurrentPayment] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    products: true,
    projects: true,
    payments: true,
    content: true,
  });
  const [themeMode, setThemeMode] = useState<ThemeMode>(ThemeService.getTheme());
  
  // Confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  // Pagination and Sorting states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const displayTabName = (tab: string) => {
    if (tab === 'Sites') return 'Projects';
    return tab;
  };

  // Reset page when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, filterStatus]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [activeTab]);

  useEffect(() => {
    ThemeService.applyTheme(themeMode);
  }, [themeMode]);

  useEffect(() => {
    setProductFormMode('list');
    setUserFormMode('list');
    setSiteFormMode('list');
    setPaymentFormMode('list');
  }, [activeTab]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch all data
        const [
          productsResult,
          servicesResult,
          usersResult,
          sitesResult,
          inquiriesResult,
          paymentsResult,
          citiesResult
        ] = await Promise.all([
          ProductService.getAllProducts(),
          ServiceService.getAllServices({ page: 1, limit: 500 }),
          UserService.getAllUsers(),
          SiteService.getAllSites(),
          InquiryService.getAllInquiries(),
          PaymentService.getAllPayments(),
          CityService.getAllCities()
        ]);

        if (productsResult.success) setProducts(productsResult.products);
        if (servicesResult.success) setServices(servicesResult.services || []);
        if (usersResult.success) setUsers(usersResult.users);
        if (sitesResult.success) setSites(sitesResult.sites);
        if (inquiriesResult.success) setInquiries(inquiriesResult.inquiries);
        if (paymentsResult.success) setPayments(paymentsResult.payments);
        if (citiesResult.success) setCities(citiesResult.cities);

        // Calculate stats
        const calculatedStats = [
          {
            label: 'Total Products',
            val: productsResult.success ? productsResult.products.length : 0,
            icon: <Package className="w-5 h-5" />,
            color: 'bg-blue-600',
            trend: 8
          },
          {
            label: 'Total Projects',
            val: sitesResult.success ? sitesResult.sites.length : 0,
            icon: <FolderKanban className="w-5 h-5" />,
            color: 'bg-indigo-600',
            trend: 6
          },
          {
            label: 'Total Services',
            val: servicesResult.success ? (servicesResult.services || []).length : 0,
            icon: <Layers className="w-5 h-5" />,
            color: 'bg-cyan-600',
            trend: 4
          },
          {
            label: 'Total Users',
            val: usersResult.success ? usersResult.users.length : 0,
            icon: <Users className="w-5 h-5" />,
            color: 'bg-emerald-600',
            trend: 5
          },
          {
            label: 'Total Payments',
            val: paymentsResult.success ? paymentsResult.payments.length : 0,
            icon: <Wallet className="w-5 h-5" />,
            color: 'bg-violet-600',
            trend: 9
          },
          {
            label: 'Total Inquiries',
            val: inquiriesResult.success ? inquiriesResult.inquiries.length : 0,
            icon: <MessageSquare className="w-5 h-5" />,
            color: 'bg-amber-600',
            trend: 3
          }
        ];
        setStats(calculatedStats);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle adding a new product
  const handleAddProduct = async (productData: any) => {
    const result = await ProductService.createProduct(productData);
    if (result.success) {
      toast.success('Product added successfully!');
      const productsResult = await ProductService.getAllProducts();
      if (productsResult.success) setProducts(productsResult.products);
      setProductFormMode('list');
    } else {
      toast.error(result.error || 'Failed to add product');
    }
  };

  // Handle updating a product
  const handleUpdateProduct = async (productId: number, productData: any) => {
    const result = await ProductService.updateProduct(productId, productData);
    if (result.success) {
      toast.success('Product updated successfully!');
      const productsResult = await ProductService.getAllProducts();
      if (productsResult.success) setProducts(productsResult.products);
      setProductFormMode('list');
      setCurrentProduct(null);
    } else {
      toast.error(result.error || 'Failed to update product');
    }
  };

  // Handle deleting a product
  const handleDeleteProduct = (productId: number) => {
    setConfirmMessage('Are you sure you want to delete this product?');
    setConfirmAction(() => async () => {
      const result = await ProductService.deleteProduct(productId);
      if (result.success) {
        setProducts(products.filter(p => p.id !== productId));
        toast.success('Product deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete product');
      }
    });
    setShowConfirmModal(true);
  };

  // Handle adding a new user
  const handleAddUser = async (userData: any) => {
    const result = await UserService.createUser(userData);
    if (result.success) {
      toast.success('User created successfully!');
      const usersResult = await UserService.getAllUsers();
      if (usersResult.success) setUsers(usersResult.users);
      setUserFormMode('list');
    } else {
      toast.error(result.error || 'Failed to add user');
    }
  };

  // Handle updating a user
  const handleUpdateUser = async (userId: number, userData: any) => {
    const result = await UserService.updateUser(userId.toString(), userData);
    if (result.success) {
      toast.success('User updated successfully!');
      const usersResult = await UserService.getAllUsers();
      if (usersResult.success) setUsers(usersResult.users);
      setUserFormMode('list');
      setCurrentUser(null);
    } else {
      toast.error(result.error || 'Failed to update user');
    }
  };

  // Handle deleting a user
  const handleDeleteUser = (userId: number) => {
    setConfirmMessage('Are you sure you want to delete this user?');
    setConfirmAction(() => async () => {
      const result = await UserService.deleteUser(userId.toString());
      if (result.success) {
        setUsers(users.filter(u => u.id !== userId));
        toast.success('User deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete user');
      }
    });
    setShowConfirmModal(true);
  };

  // Handle adding a new site
  const handleAddSite = async (siteData: any) => {
    const result = await SiteService.createSite(siteData);
    if (result.success) {
      toast.success('Site created successfully!');
      // Refresh sites list
      const sitesResult = await SiteService.getAllSites();
      if (sitesResult.success) setSites(sitesResult.sites);
      setSiteFormMode('list');
    } else {
      toast.error(result.error || 'Failed to add site');
    }
  };

  // Handle updating a site
  const handleUpdateSite = async (siteId: number, siteData: any) => {
    const result = await SiteService.updateSite(siteId, siteData);
    if (result.success) {
      toast.success('Site updated successfully!');
      // Refresh sites list to get updated data with city name
      const sitesResult = await SiteService.getAllSites();
      if (sitesResult.success) setSites(sitesResult.sites);
      setSiteFormMode('list');
      setCurrentSite(null);
    } else {
      toast.error(result.error || 'Failed to update site');
    }
  };

  // Handle deleting a site
  const handleDeleteSite = (siteId: number) => {
    setConfirmMessage('Are you sure you want to delete this site?');
    setConfirmAction(() => async () => {
      const result = await SiteService.deleteSite(siteId);
      if (result.success) {
        setSites(sites.filter(s => s.id !== siteId));
        toast.success('Site deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete site');
      }
    });
    setShowConfirmModal(true);
  };

  const openEditSiteModal = async (site: any) => {
    setLoadingSiteDetails(site.id);
    try {
      const result = await SiteService.getSiteById(site.id);
      if (result.success && result.site) {
        const withImages = await SiteService.getSitesWithImages();
        if (withImages.success) {
          const full = (withImages.sites || []).find((s: any) => String(s.id) === String(site.id));
          setCurrentSite(full ? { ...result.site, images: full.images || [] } : result.site);
        } else {
          setCurrentSite(result.site);
        }
      } else {
        setCurrentSite(site);
      }
      setSiteFormMode('edit');
    } finally {
      setLoadingSiteDetails(null);
    }
  };

  // Handle updating inquiry status
  const handleUpdateInquiryStatus = async (inquiryId: number, status: string) => {
    const result = await InquiryService.updateInquiryStatus(inquiryId, status);
    if (result.success) {
      toast.success('Inquiry status updated!');
      const inquiriesResult = await InquiryService.getAllInquiries();
      if (inquiriesResult.success) setInquiries(inquiriesResult.inquiries);
    } else {
      toast.error(result.error || 'Failed to update inquiry status');
    }
  };

  const refreshPayments = async () => {
    const paymentsResult = await PaymentService.getAllPayments();
    if (paymentsResult.success) setPayments(paymentsResult.payments);
  };

  const handleAddPayment = async (paymentData: any) => {
    const result = await PaymentService.createPayment(paymentData);
    if (result.success) {
      toast.success('Payment added successfully');
      await refreshPayments();
      setPaymentFormMode('list');
    } else {
      toast.error(result.error || 'Failed to add payment');
    }
  };

  const handleUpdatePayment = async (paymentId: number, paymentData: any) => {
    const result = await PaymentService.updatePayment(paymentId, paymentData);
    if (result.success) {
      toast.success('Payment updated successfully');
      await refreshPayments();
      setPaymentFormMode('list');
      setCurrentPayment(null);
    } else {
      toast.error(result.error || 'Failed to update payment');
    }
  };

  const handleGenerateBill = async (paymentId: number) => {
    const result = await PaymentService.generateBill(paymentId);
    if (result.success) {
      setCurrentPayment(result.bill);
      setShowViewPaymentModal(true);
    } else {
      toast.error(result.error || 'Failed to generate bill');
    }
  };

  const handleDownloadBillPdf = async (paymentId: number) => {
    const result = await PaymentService.downloadBillPdf(paymentId);
    if (result.success) {
      toast.success('Bill downloaded as PDF');
    } else {
      toast.error(result.error || 'Failed to download bill');
    }
  };

  // Filter data based on search term and filters
  const filteredProducts = products.filter(product => 
    (product?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (product?.category?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user => 
    (user?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user?.role?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const filteredSites = sites.filter(site => 
    (site?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (site?.cityName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = (inquiry?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (inquiry?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (inquiry?.message?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || (inquiry?.status?.toLowerCase() || '') === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const paymentCustomers = users.filter((u: any) => u?.role === 'CUSTOMER');

  // Handle sorting
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (data: any[]) => {
    if (!sortConfig) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Can manage based on role
  const canManageProducts = user?.role === 'ADMIN' || user?.role === 'STAFF';
  const canManageUsers = user?.role === 'ADMIN';
  const canManageSites = user?.role === 'ADMIN' || user?.role === 'STAFF';
  const canManageInquiries = user?.role === 'ADMIN' || user?.role === 'STAFF';
  const canManagePayments = user?.role === 'ADMIN' || user?.role === 'STAFF';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {sidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu overlay"
        />
      )}
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200 p-4 transition-all duration-300 lg:static lg:translate-x-0 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarCollapsed ? 'lg:w-20 w-72' : 'lg:w-64 w-72'}`}
      >
        <div className="flex items-center space-x-3 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
            {user?.name?.[0] || 'T'}
          </div>
          <div className={sidebarCollapsed ? 'lg:hidden' : ''}>
            <p className="font-bold text-slate-900">{user?.name || 'Admin User'}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role?.toLowerCase() || 'Admin'}</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto">
          <button
            onClick={() => { setActiveTab('Overview'); setSidebarOpen(false); }}
            className={`w-full text-left px-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${activeTab === 'Overview' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <span className={`flex items-center gap-2 ${sidebarCollapsed ? 'lg:hidden' : ''}`}><BarChart3 className="w-4 h-4" />Overview</span>
            {activeTab === 'Overview' && <ChevronRight className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setExpandedMenus((prev) => ({ ...prev, products: !prev.products }))}
            className={`w-full text-left px-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${['Products', 'Products Reports'].includes(activeTab) ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <span className={`flex items-center gap-2 ${sidebarCollapsed ? 'lg:hidden' : ''}`}><Package className="w-4 h-4" />Products</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${expandedMenus.products ? 'rotate-90' : ''}`} />
          </button>
          {expandedMenus.products && (
            <>
              <button
                onClick={() => { setActiveTab('Products'); setSidebarOpen(false); }}
                className={`ml-6 w-[calc(100%-1.5rem)] text-left px-3 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'Products' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                Products
              </button>
              <button
                onClick={() => { setActiveTab('Products Reports'); setSidebarOpen(false); }}
                className={`ml-6 w-[calc(100%-1.5rem)] text-left px-3 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'Products Reports' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                Products Reports
              </button>
            </>
          )}

          <button
            onClick={() => setExpandedMenus((prev) => ({ ...prev, projects: !prev.projects }))}
            className={`w-full text-left px-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${['Sites', 'Project Reports'].includes(activeTab) ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <span className={`flex items-center gap-2 ${sidebarCollapsed ? 'lg:hidden' : ''}`}><FolderKanban className="w-4 h-4" />Projects</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${expandedMenus.projects ? 'rotate-90' : ''}`} />
          </button>
          {expandedMenus.projects && (
            <>
              <button
                onClick={() => { setActiveTab('Sites'); setSidebarOpen(false); }}
                className={`ml-6 w-[calc(100%-1.5rem)] text-left px-3 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'Sites' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                Projects
              </button>
              <button
                onClick={() => { setActiveTab('Project Reports'); setSidebarOpen(false); }}
                className={`ml-6 w-[calc(100%-1.5rem)] text-left px-3 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'Project Reports' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                Project Reports
              </button>
            </>
          )}

          <button
            onClick={() => { setActiveTab('Services'); setSidebarOpen(false); }}
            className={`w-full text-left px-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${activeTab === 'Services' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <span className={`flex items-center gap-2 ${sidebarCollapsed ? 'lg:hidden' : ''}`}><Layers className="w-4 h-4" />Services</span>
            {activeTab === 'Services' && <ChevronRight className="w-4 h-4" />}
          </button>

          <button
            onClick={() => { setActiveTab('Users'); setSidebarOpen(false); }}
            className={`w-full text-left px-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${activeTab === 'Users' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <span className={`flex items-center gap-2 ${sidebarCollapsed ? 'lg:hidden' : ''}`}><Users className="w-4 h-4" />Users</span>
            {activeTab === 'Users' && <ChevronRight className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setExpandedMenus((prev) => ({ ...prev, payments: !prev.payments }))}
            className={`w-full text-left px-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${['Payments', 'Payments Reports'].includes(activeTab) ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <span className={`flex items-center gap-2 ${sidebarCollapsed ? 'lg:hidden' : ''}`}><Wallet className="w-4 h-4" />Payments</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${expandedMenus.payments ? 'rotate-90' : ''}`} />
          </button>
          {expandedMenus.payments && (
            <>
              <button
                onClick={() => { setActiveTab('Payments'); setSidebarOpen(false); }}
                className={`ml-6 w-[calc(100%-1.5rem)] text-left px-3 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'Payments' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                Payments
              </button>
              <button
                onClick={() => { setActiveTab('Payments Reports'); setSidebarOpen(false); }}
                className={`ml-6 w-[calc(100%-1.5rem)] text-left px-3 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'Payments Reports' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                Payments Reports
              </button>
            </>
          )}

          <button
            onClick={() => { setActiveTab('Inquiries'); setSidebarOpen(false); }}
            className={`w-full text-left px-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${activeTab === 'Inquiries' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <span className={`flex items-center gap-2 ${sidebarCollapsed ? 'lg:hidden' : ''}`}><MessageSquare className="w-4 h-4" />Inquiries</span>
            {activeTab === 'Inquiries' && <ChevronRight className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setExpandedMenus((prev) => ({ ...prev, content: !prev.content }))}
            className={`w-full text-left px-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${['Home Page', 'Products Page', 'Services Page', 'Projects Page', 'About Page', 'Contact Page', 'Contact Directory', 'Privacy Policy'].includes(activeTab) ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <span className={`flex items-center gap-2 ${sidebarCollapsed ? 'lg:hidden' : ''}`}><FileText className="w-4 h-4" />Content</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${expandedMenus.content ? 'rotate-90' : ''}`} />
          </button>
          {expandedMenus.content && (
            <>
              <button onClick={() => { setActiveTab('Home Page'); setSidebarOpen(false); }} className={`ml-6 w-[calc(100%-1.5rem)] text-left px-3 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'Home Page' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>Home Page</button>
              <button onClick={() => { setActiveTab('Products Page'); setSidebarOpen(false); }} className={`ml-6 w-[calc(100%-1.5rem)] text-left px-3 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'Products Page' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>Products Page</button>
              <button onClick={() => { setActiveTab('Services Page'); setSidebarOpen(false); }} className={`ml-6 w-[calc(100%-1.5rem)] text-left px-3 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'Services Page' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>Services Page</button>
              <button onClick={() => { setActiveTab('Projects Page'); setSidebarOpen(false); }} className={`ml-6 w-[calc(100%-1.5rem)] text-left px-3 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'Projects Page' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>Projects Page</button>
              <button onClick={() => { setActiveTab('About Page'); setSidebarOpen(false); }} className={`ml-6 w-[calc(100%-1.5rem)] text-left px-3 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'About Page' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>About Page</button>
              <button onClick={() => { setActiveTab('Contact Page'); setSidebarOpen(false); }} className={`ml-6 w-[calc(100%-1.5rem)] text-left px-3 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'Contact Page' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>Contact Page</button>
              <button onClick={() => { setActiveTab('Contact Directory'); setSidebarOpen(false); }} className={`ml-6 w-[calc(100%-1.5rem)] text-left px-3 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'Contact Directory' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>Contact Directory</button>
              <button onClick={() => { setActiveTab('Privacy Policy'); setSidebarOpen(false); }} className={`ml-6 w-[calc(100%-1.5rem)] text-left px-3 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'Privacy Policy' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>Privacy Policy</button>
            </>
          )}
        </nav>

        <div className="border-t border-slate-200 pt-3 mt-3 space-y-2">
          <button
            onClick={() => { setActiveTab('Profile'); setSidebarOpen(false); }}
            className={`w-full text-left px-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'Profile' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <UserCircle2 className="w-4 h-4" />
            <span className={sidebarCollapsed ? 'lg:hidden' : ''}>Profile</span>
          </button>
          <button
            onClick={() => { setActiveTab('Settings'); setSidebarOpen(false); }}
            className={`w-full text-left px-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'Settings' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Settings className="w-4 h-4" />
            <span className={sidebarCollapsed ? 'lg:hidden' : ''}>Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow w-full p-4 lg:p-6 max-w-none">
        {loading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Loading dashboard data...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <p className="text-red-600 font-medium">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-red-700 hover:text-red-800 font-medium text-sm"
            >
              Retry
            </button>
          </div>
        )}
        
        {!loading && !error && (
          <>
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  className="lg:hidden inline-flex items-center justify-center border border-slate-200 bg-white text-slate-700 px-3"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open sidebar"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <button
                  className="hidden lg:inline-flex items-center justify-center border border-slate-200 bg-white text-slate-700 px-3"
                  onClick={() => setSidebarCollapsed((prev) => !prev)}
                  aria-label="Toggle sidebar width"
                >
                  {sidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
                </button>
              <div>
                <h1 className="font-bold text-slate-900">{displayTabName(activeTab)} Dashboard</h1>
                <p className="text-slate-500">Manage your {displayTabName(activeTab).toLowerCase()} here.</p>
              </div>
              </div>
              <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 text-sm font-medium text-slate-700 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                System Live - MP Region
              </div>
            </header>

            {/* Search and Filters */}
            {(activeTab === 'Products' || activeTab === 'Users' || activeTab === 'Sites' || activeTab === 'Inquiries') && (
              <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab.toLowerCase()}...`}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {activeTab === 'Inquiries' && (
                  <select
                    className="px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                )}
              </div>
            )}

            {/* Overview Tab */}
            {activeTab === 'Overview' && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-6">
                  {stats.map((stat, index) => (
                    <StatCard key={index} item={stat} />
                  ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
                  <MiniBarChart
                    data={(() => {
                      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                      const now = new Date();
                      return months.map((_, idx) => {
                        const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
                        const label = d.toLocaleString('en-US', { month: 'short' });
                        const value = payments
                          .filter((p: any) => {
                            const dt = new Date(p.paymentDate || p.createdAt || p.created_at);
                            return dt.getMonth() === d.getMonth() && dt.getFullYear() === d.getFullYear();
                          })
                          .reduce((sum: number, p: any) => sum + Number(p.paidAmount || p.amount || 0), 0);
                        return { label, value };
                      });
                    })()}
                  />
                  <MiniPieChart
                    data={[
                      { label: 'Completed', value: sites.filter((s: any) => s.status === 'COMPLETED').length, color: '#10b981' },
                      { label: 'Working', value: sites.filter((s: any) => s.status === 'WORKING').length, color: '#3b82f6' },
                      { label: 'Pending', value: sites.filter((s: any) => s.status === 'COMING_SOON').length, color: '#f59e0b' },
                    ]}
                  />
                  <MiniLineChart
                    title="Revenue Trend"
                    icon={<LineChartIcon className="w-4 h-4 text-blue-600" />}
                    data={(() => {
                      const now = new Date();
                      return Array.from({ length: 6 }).map((_, idx) => {
                        const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
                        const label = d.toLocaleString('en-US', { month: 'short' });
                        const value = payments
                          .filter((p: any) => {
                            const dt = new Date(p.paymentDate || p.createdAt || p.created_at);
                            return dt.getMonth() === d.getMonth() && dt.getFullYear() === d.getFullYear();
                          })
                          .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
                        return { label, value };
                      });
                    })()}
                  />
                  <MiniLineChart
                    title="Inquiries Trend"
                    icon={<LineChartIcon className="w-4 h-4 text-blue-600" />}
                    data={(() => {
                      const now = new Date();
                      return Array.from({ length: 6 }).map((_, idx) => {
                        const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
                        const label = d.toLocaleString('en-US', { month: 'short' });
                        const value = inquiries.filter((i: any) => {
                          const dt = new Date(i.createdAt || i.created_at);
                          return dt.getMonth() === d.getMonth() && dt.getFullYear() === d.getFullYear();
                        }).length;
                        return { label, value };
                      });
                    })()}
                  />
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Recent Products */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Recent Products</h2>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Latest additions to catalog</p>
                      </div>
                      <button 
                        className="bg-slate-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                        onClick={() => setActiveTab('Products')}
                      >
                        Explore All
                      </button>
                    </div>
                    <div className="space-y-4">
                      {products.slice(0, 4).map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-5 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:shadow-slate-100 border border-transparent hover:border-slate-100 rounded-[1.5rem] transition-all group">
                          <div className="flex items-center">
                             <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-100 mr-4 group-hover:scale-110 transition-transform">
                               <Package className="w-5 h-5 text-blue-500" />
                             </div>
                             <div>
                               <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase text-sm tracking-tight">{product.name}</h4>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{product.category}</p>
                             </div>
                          </div>
                          <span className="text-sm font-black text-slate-700">₹{product.price?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Inquiries */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                       <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Active Inquiries</h2>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Requiring immediate attention</p>
                      </div>
                      <button 
                        className="bg-slate-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                        onClick={() => setActiveTab('Inquiries')}
                      >
                        Manage
                      </button>
                    </div>
                    <div className="space-y-4">
                      {inquiries.slice(0, 4).map((inquiry) => (
                        <div key={inquiry.id} className="p-6 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:shadow-slate-100 border border-transparent hover:border-slate-100 rounded-[1.5rem] transition-all group">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-sm uppercase tracking-tight">{inquiry.name}</h4>
                            <span className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest ${
                              inquiry.status === 'NEW' ? 'bg-blue-50 text-blue-600' : 
                              inquiry.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-600' :
                              inquiry.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600' :
                              'bg-slate-100 text-slate-400'
                            }`}>
                              {formatStatus(inquiry.status)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1 italic">“{inquiry.message}”</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'Products Reports' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Products Reports</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 mb-6">Inventory, valuation and category split</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="rounded-xl border border-slate-200 p-4"><p className="text-xs text-slate-500 uppercase font-bold">Total Products</p><p className="text-2xl font-black text-slate-900">{products.length}</p></div>
                  <div className="rounded-xl border border-slate-200 p-4"><p className="text-xs text-slate-500 uppercase font-bold">Total Stock Units</p><p className="text-2xl font-black text-slate-900">{products.reduce((a: number, b: any) => a + Number(b.stock || 0), 0)}</p></div>
                  <div className="rounded-xl border border-slate-200 p-4"><p className="text-xs text-slate-500 uppercase font-bold">Inventory Value</p><p className="text-2xl font-black text-slate-900">₹{products.reduce((a: number, b: any) => a + (Number(b.price || 0) * Number(b.stock || 0)), 0).toLocaleString()}</p></div>
                </div>
                <MiniLineChart
                  title="Category Trend (Top Categories by Count)"
                  icon={<LineChartIcon className="w-4 h-4 text-blue-600" />}
                  data={Object.entries(products.reduce((acc: Record<string, number>, p: any) => {
                    const key = p.category || 'Uncategorized';
                    acc[key] = (acc[key] || 0) + 1;
                    return acc;
                  }, {})).slice(0, 6).map(([label, value]) => ({ label: String(label).slice(0, 3), value: Number(value) }))}
                />
              </div>
            )}

            {activeTab === 'Project Reports' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Project Reports</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 mb-6">Status and execution insights</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="rounded-xl border border-slate-200 p-4"><p className="text-xs text-slate-500 uppercase font-bold">Total Projects</p><p className="text-2xl font-black text-slate-900">{sites.length}</p></div>
                  <div className="rounded-xl border border-slate-200 p-4"><p className="text-xs text-slate-500 uppercase font-bold">Working</p><p className="text-2xl font-black text-blue-700">{sites.filter((s: any) => s.status === 'WORKING').length}</p></div>
                  <div className="rounded-xl border border-slate-200 p-4"><p className="text-xs text-slate-500 uppercase font-bold">Completed</p><p className="text-2xl font-black text-emerald-700">{sites.filter((s: any) => s.status === 'COMPLETED').length}</p></div>
                </div>
                <MiniPieChart
                  data={[
                    { label: 'Completed', value: sites.filter((s: any) => s.status === 'COMPLETED').length, color: '#10b981' },
                    { label: 'Working', value: sites.filter((s: any) => s.status === 'WORKING').length, color: '#3b82f6' },
                    { label: 'Pending', value: sites.filter((s: any) => s.status === 'COMING_SOON').length, color: '#f59e0b' },
                  ]}
                />
              </div>
            )}

            {activeTab === 'Payments Reports' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Payments Reports</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 mb-6">Collections, balance and status distribution</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="rounded-xl border border-slate-200 p-4"><p className="text-xs text-slate-500 uppercase font-bold">Total Records</p><p className="text-2xl font-black text-slate-900">{payments.length}</p></div>
                  <div className="rounded-xl border border-slate-200 p-4"><p className="text-xs text-slate-500 uppercase font-bold">Paid Amount</p><p className="text-2xl font-black text-emerald-700">₹{payments.reduce((a: number, p: any) => a + Number(p.paidAmount || 0), 0).toLocaleString()}</p></div>
                  <div className="rounded-xl border border-slate-200 p-4"><p className="text-xs text-slate-500 uppercase font-bold">Balance Due</p><p className="text-2xl font-black text-rose-700">₹{payments.reduce((a: number, p: any) => a + Number(p.balanceAmount || 0), 0).toLocaleString()}</p></div>
                </div>
                <MiniBarChart
                  data={Array.from({ length: 6 }).map((_, idx) => {
                    const now = new Date();
                    const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
                    const label = d.toLocaleString('en-US', { month: 'short' });
                    const value = payments
                      .filter((p: any) => {
                        const dt = new Date(p.paymentDate || p.createdAt || p.created_at);
                        return dt.getMonth() === d.getMonth() && dt.getFullYear() === d.getFullYear();
                      })
                      .reduce((sum: number, p: any) => sum + Number(p.paidAmount || p.amount || 0), 0);
                    return { label, value };
                  })}
                />
              </div>
            )}

            {activeTab === 'Products' && canManageProducts && productFormMode === 'list' && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Products Catalog</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Total {filteredProducts.length} items found</p>
                  </div>
                  <button 
                    className="bg-blue-600 text-white px-8 py-4 rounded-2xl flex items-center font-bold hover:bg-slate-900 transition-all shadow-xl shadow-blue-100 hover:shadow-slate-200 active:scale-95"
                    onClick={() => {
                      setCurrentProduct(null);
                      setProductFormMode('add');
                    }}
                  >
                    <Plus className="w-5 h-5 mr-3" />
                    Create Product
                  </button>
                </div>
                
                <DataTable
                  headers={[
                    { label: 'Name', key: 'name', sortable: true },
                    { label: 'Category', key: 'category', sortable: true },
                    { label: 'Price', key: 'price', sortable: true },
                    { label: 'Stock', key: 'stock', sortable: true },
                    { label: 'Actions', key: 'actions' }
                  ]}
                  data={getSortedData(filteredProducts)}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  onSort={handleSort}
                  sortConfig={sortConfig}
                  renderRow={(product) => (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-6 font-bold text-slate-900">{product?.name || 'N/A'}</td>
                      <td className="py-6">
                         <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                           {product?.category || 'N/A'}
                         </span>
                      </td>
                      <td className="py-6 font-black text-blue-600">₹{product?.price?.toLocaleString() || 0}</td>
                      <td className="py-6">
                        <span className={`font-bold ${product?.stock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {product?.stock || 0} Units
                        </span>
                      </td>
                      <td className="py-6">
                        <div className="flex space-x-2  group-hover:opacity-100 transition-opacity">
                          <button 
                            className="bg-blue-50 text-blue-600 p-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                            onClick={() => {
                              setCurrentProduct(product);
                              setProductFormMode('edit');
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="bg-rose-50 text-rose-600 p-2 rounded-xl hover:bg-rose-600 hover:text-white transition-all"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                />
              </div>
            )}

            {activeTab === 'Users' && canManageUsers && userFormMode === 'list' && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">User Directory</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Total {filteredUsers.length} registered members</p>
                  </div>
                  <button 
                    className="bg-slate-950 text-white px-8 py-4 rounded-2xl flex items-center font-bold hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
                    onClick={() => {
                      setCurrentUser(null);
                      setUserFormMode('add');
                    }}
                  >
                    <Plus className="w-5 h-5 mr-3" />
                    Register User
                  </button>
                </div>
                
                <DataTable
                  headers={[
                    { label: 'Name', key: 'name', sortable: true },
                    { label: 'Role', key: 'role', sortable: true },
                    { label: 'Email', key: 'email', sortable: true },
                    { label: 'City', key: 'city', sortable: true },
                    { label: 'Actions', key: 'actions' }
                  ]}
                  data={getSortedData(filteredUsers)}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  onSort={handleSort}
                  sortConfig={sortConfig}
                  renderRow={(userRow) => (
                    <tr key={userRow.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-6 font-bold text-slate-900">{userRow?.name || 'N/A'}</td>
                      <td className="py-6">
                        <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                          userRow?.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-600' : 
                          userRow?.role === 'STAFF' ? 'bg-cyan-50 text-cyan-600' :
                          'bg-slate-50 text-slate-500'
                        }`}>
                          {userRow?.role || 'CUSTOMER'}
                        </span>
                      </td>
                      <td className="py-6 text-slate-500 text-sm font-medium">{userRow?.email || 'N/A'}</td>
                      <td className="py-6 text-slate-600 font-bold">{userRow?.city || 'N/A'}</td>
                      <td className="py-6">
                        <div className="flex space-x-2  group-hover:opacity-100 transition-opacity">
                          <button 
                            className="bg-blue-50 text-blue-600 p-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                            onClick={() => {
                              setCurrentUser(userRow);
                              setUserFormMode('edit');
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="bg-rose-50 text-rose-600 p-2 rounded-xl hover:bg-rose-600 hover:text-white transition-all"
                            onClick={() => handleDeleteUser(userRow.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                />
              </div>
            )}

            {activeTab === 'Sites' && canManageSites && siteFormMode === 'list' && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Project Infrastructure</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Managing {filteredSites.length} active projects</p>
                  </div>
                  <button 
                    className="bg-blue-600 text-white px-8 py-4 rounded-2xl flex items-center font-bold hover:bg-slate-900 transition-all shadow-xl shadow-blue-100"
                    onClick={() => {
                      setCurrentSite(null);
                      setSiteFormMode('add');
                    }}
                  >
                    <Plus className="w-5 h-5 mr-3" />
                    New Project
                  </button>
                </div>
                
                <DataTable
                  headers={[
                    { label: 'Name', key: 'name', sortable: true },
                    { label: 'Region/City', key: 'cityName', sortable: true },
                    { label: 'Status', key: 'status', sortable: true },
                    { label: 'Initiation', key: 'startDate', sortable: true },
                    { label: 'Target', key: 'completionDate', sortable: true },
                    { label: 'Actions', key: 'actions' }
                  ]}
                  data={getSortedData(filteredSites)}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  onSort={handleSort}
                  sortConfig={sortConfig}
                  renderRow={(site) => (
                    <tr key={site.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-6">
                        <div className="font-bold text-slate-900">{site?.name || 'N/A'}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 truncate max-w-[200px]">{site?.address}</div>
                      </td>
                      <td className="py-6 text-slate-600 font-medium">{site?.cityName || site?.city || 'N/A'}</td>
                      <td className="py-6">
                        <span className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest ${
                          site?.status === 'COMING_SOON' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                          site?.status === 'WORKING' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                          'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                          {formatStatus(site?.status)}
                        </span>
                      </td>
                      <td className="py-6 text-slate-500 text-sm font-bold">{formatDateForDisplay(site?.startDate)}</td>
                      <td className="py-6 text-slate-500 text-sm font-bold">{formatDateForDisplay(site?.completionDate)}</td>
                      <td className="py-6">
                        <div className="flex space-x-2  group-hover:opacity-100 transition-opacity">
                          <button 
                            className="bg-blue-50 text-blue-600 p-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all font-bold text-xs"
                            onClick={() => openEditSiteModal(site)}
                            disabled={loadingSiteDetails === site.id}
                          >
                            {loadingSiteDetails === site.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit className="w-4 h-4" />}
                          </button>
                          <button 
                            className="bg-rose-50 text-rose-600 p-2 rounded-xl hover:bg-rose-600 hover:text-white transition-all font-bold text-xs"
                            onClick={() => handleDeleteSite(site.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                />
              </div>
            )}

            {activeTab === 'Inquiries' && canManageInquiries && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Customer Inquiries</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">{filteredInquiries.length} requests pending review</p>
                  </div>
                </div>
                
                <DataTable
                  headers={[
                    { label: 'Customer', key: 'name', sortable: true },
                    { label: 'Contact', key: 'email', sortable: true },
                    { label: 'Message', key: 'message' },
                    { label: 'Status', key: 'status', sortable: true },
                    { label: 'Actions', key: 'actions' }
                  ]}
                  data={getSortedData(filteredInquiries)}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  onSort={handleSort}
                  sortConfig={sortConfig}
                  renderRow={(inquiry) => (
                    <tr key={inquiry.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-6 font-bold text-slate-900">{inquiry?.name || 'N/A'}</td>
                      <td className="py-6">
                        <div className="text-slate-600 font-medium text-sm">{inquiry?.email || 'N/A'}</div>
                        <div className="text-slate-400 text-[10px] font-bold mt-1 tracking-widest">{inquiry?.mobile || 'No Mobile'}</div>
                      </td>
                      <td className="py-6 text-slate-500 text-sm max-w-xs font-medium italic">
                        “{inquiry?.message || 'N/A'}”
                      </td>
                      <td className="py-6">
                        <span className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest ${
                          inquiry?.status === 'NEW' ? 'bg-blue-50 text-blue-600' : 
                          inquiry?.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-600' :
                          inquiry?.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600' :
                          'bg-slate-50 text-slate-400'
                        }`}>
                          {formatStatus(inquiry?.status)}
                        </span>
                      </td>
                      <td className="py-6">
                        <select
                          className="text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 border border-slate-100 bg-slate-50 focus:bg-white outline-none cursor-pointer"
                          value={inquiry?.status || 'NEW'}
                          onChange={(e) => handleUpdateInquiryStatus(inquiry.id, e.target.value)}
                        >
                          <option value="NEW">New</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </td>
                    </tr>
                  )}
                />
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'Payments' && canManagePayments && paymentFormMode === 'list' && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Revenue Tracker</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Transaction history for MP Region</p>
                  </div>
                  <button
                    className="bg-blue-600 text-white px-8 py-4 rounded-2xl flex items-center font-bold hover:bg-slate-900 transition-all shadow-xl shadow-blue-100"
                    onClick={() => {
                      setCurrentPayment(null);
                      setPaymentFormMode('add');
                    }}
                  >
                    <Plus className="w-5 h-5 mr-3" />
                    Add Payment
                  </button>
                </div>
                
                <DataTable
                  headers={[
                    { label: 'Customer', key: 'customerName', sortable: true },
                    { label: 'Site Project', key: 'siteName', sortable: true },
                    { label: 'Product', key: 'productName', sortable: true },
                    { label: 'Transaction Value', key: 'amount', sortable: true },
                    { label: 'Paid', key: 'paidAmount', sortable: true },
                    { label: 'Balance', key: 'balanceAmount', sortable: true },
                    { label: 'Date', key: 'paymentDate', sortable: true },
                    { label: 'Status', key: 'status', sortable: true },
                    { label: 'Method', key: 'paymentMethod', sortable: true },
                    { label: 'Actions', key: 'actions' }
                  ]}
                  data={getSortedData(payments)}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  onSort={handleSort}
                  sortConfig={sortConfig}
                  renderRow={(payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-6">
                        <div className="font-bold text-slate-900">{payment?.customerName || 'N/A'}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{payment?.customerMobile || 'No Mobile'}</div>
                      </td>
                      <td className="py-6 font-bold text-slate-900">{payment?.siteName || 'N/A'}</td>
                      <td className="py-6 text-slate-600 font-medium">{payment?.productName || 'N/A'}</td>
                      <td className="py-6 font-black text-blue-600">₹{payment?.amount?.toLocaleString() || 0}</td>
                      <td className="py-6 font-black text-emerald-600">₹{payment?.paidAmount?.toLocaleString() || 0}</td>
                      <td className="py-6 font-black text-rose-600">₹{payment?.balanceAmount?.toLocaleString() || 0}</td>
                      <td className="py-6 text-slate-500 text-sm font-bold">{formatDateForDisplay(payment?.paymentDate)}</td>
                      <td className="py-6">
                        <span className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest ${
                          payment?.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 
                          payment?.status === 'UNPAID' ? 'bg-rose-50 text-rose-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {formatStatus(payment?.status)}
                        </span>
                      </td>
                      <td className="py-6">
                         <div className="text-slate-600 text-[10px] font-black uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg inline-block">
                           {payment?.paymentMethod || 'N/A'}
                         </div>
                      </td>
                      <td className="py-6">
                        <div className="flex space-x-2">
                          <button
                            className="bg-slate-100 text-slate-700 p-2 rounded-xl hover:bg-slate-900 hover:text-white transition-all"
                            onClick={() => handleGenerateBill(payment.id)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="bg-blue-50 text-blue-600 p-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                            onClick={() => {
                              setCurrentPayment(payment);
                              setPaymentFormMode('edit');
                            }}
                            title="Edit Payment"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="bg-amber-50 text-amber-600 p-2 rounded-xl hover:bg-amber-600 hover:text-white transition-all"
                            onClick={() => handleGenerateBill(payment.id)}
                            title="Generate Bill"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            className="bg-emerald-50 text-emerald-600 p-2 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                            onClick={() => handleDownloadBillPdf(payment.id)}
                            title="Download Bill PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                />
              </div>
            )}

            {activeTab === 'Products' && canManageProducts && productFormMode !== 'list' && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <ProductForm
                  product={productFormMode === 'edit' ? currentProduct : undefined}
                  onSubmit={(data) => (
                    productFormMode === 'edit' && currentProduct
                      ? handleUpdateProduct(currentProduct.id, data)
                      : handleAddProduct(data)
                  )}
                  onCancel={() => {
                    setProductFormMode('list');
                    setCurrentProduct(null);
                  }}
                  cities={cities}
                />
              </div>
            )}

            {activeTab === 'Users' && canManageUsers && userFormMode !== 'list' && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <UserForm
                  user={userFormMode === 'edit' ? currentUser : undefined}
                  onSubmit={(data) => (
                    userFormMode === 'edit' && currentUser
                      ? handleUpdateUser(currentUser.id, data)
                      : handleAddUser(data)
                  )}
                  onCancel={() => {
                    setUserFormMode('list');
                    setCurrentUser(null);
                  }}
                  cities={cities}
                />
              </div>
            )}

            {activeTab === 'Sites' && canManageSites && siteFormMode !== 'list' && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <SiteForm
                  site={siteFormMode === 'edit' ? currentSite : undefined}
                  onSubmit={(data) => (
                    siteFormMode === 'edit' && currentSite
                      ? handleUpdateSite(currentSite.id, data)
                      : handleAddSite(data)
                  )}
                  onCancel={() => {
                    setSiteFormMode('list');
                    setCurrentSite(null);
                  }}
                  cities={cities}
                  customers={paymentCustomers}
                  products={products}
                  services={services}
                />
              </div>
            )}

            {activeTab === 'Payments' && canManagePayments && paymentFormMode !== 'list' && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <PaymentForm
                  payment={paymentFormMode === 'edit' ? currentPayment : undefined}
                  users={paymentCustomers}
                  onSubmit={(data) => (
                    paymentFormMode === 'edit' && currentPayment
                      ? handleUpdatePayment(currentPayment.id, data)
                      : handleAddPayment(data)
                  )}
                  onCancel={() => {
                    setPaymentFormMode('list');
                    setCurrentPayment(null);
                  }}
                />
              </div>
            )}

            {activeTab === 'Profile' && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 to-blue-900 p-8 text-white shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-2xl font-black">
                        {String(user?.name || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-200">Admin / Staff Profile</p>
                        <h2 className="text-2xl font-black tracking-tight">{user?.name || 'N/A'}</h2>
                        <p className="text-sm text-slate-200 mt-1">{user?.email || 'N/A'}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest">
                      {user?.role || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Display Name</p>
                    <p className="text-base font-bold text-slate-900">{user?.name || 'N/A'}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Email</p>
                    <p className="text-base font-bold text-slate-900 break-all">{user?.email || 'N/A'}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Role</p>
                    <p className="text-base font-bold text-slate-900">{user?.role || 'N/A'}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Mobile</p>
                    <p className="text-base font-bold text-slate-900">{user?.mobile || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Settings' && (
              <SettingsSection
                themeMode={themeMode}
                onThemeChange={(mode: ThemeMode) => {
                  setThemeMode(mode);
                  ThemeService.setTheme(mode);
                }}
              />
            )}

            {/* Dynamic content tabs */}
            {(activeTab === 'Services' ||
              activeTab === 'Home Page' ||
              activeTab === 'Products Page' ||
              activeTab === 'Services Page' ||
              activeTab === 'Projects Page' ||
              activeTab === 'About Page' ||
              activeTab === 'Contact Page' ||
              activeTab === 'Contact Directory' ||
              activeTab === 'Privacy Policy') && (
              <ContentManagementSection activeTab={activeTab} user={user} />
            )}

            <DashboardModal
              isOpen={showViewPaymentModal && !!currentPayment}
              onClose={() => {
                setShowViewPaymentModal(false);
                setCurrentPayment(null);
              }}
              title="Invoice"
              maxWidthClass="modal-xl"
            >
              {currentPayment && (
                <InvoiceView
                  payment={currentPayment}
                  onDownloadPdf={() => handleDownloadBillPdf(currentPayment.id)}
                  onPrint={() => window.print()}
                  onRecordPayment={() => {
                    setShowViewPaymentModal(false);
                    setPaymentFormMode('edit');
                  }}
                  onBack={() => {
                    setShowViewPaymentModal(false);
                    setCurrentPayment(null);
                  }}
                />
              )}
            </DashboardModal>
          </>
        )}
      </main>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        title="Confirm Action"
        message={confirmMessage}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        onConfirm={() => {
          if (confirmAction) confirmAction();
        }}
        confirmText="Proceed"
      />
    </div>
  );
};

// Product Form Component
const ProductForm: React.FC<{
  onSubmit: (data: any) => void;
  onCancel: () => void;
  product?: any;
  cities: any[];
}> = ({ onSubmit, onCancel, product, cities }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || '',
    description: product?.description || '',
    price: product?.price || '',
    stock: product?.stock || 0,
    specifications: product?.specifications || {},
    images: product?.imageUrls || []  // Array to hold multiple images
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Separate existing images (strings) from new files
    const existingImages = (formData.images || []).filter((img: any) => typeof img === 'string');
    const newImageFiles = (formData.images || []).filter((img: any) => img instanceof File);
    
    // Prepare data for submission
    const submitData = { 
      ...formData,
      existingImages: existingImages, // The backend needs this to know what to keep
      images: newImageFiles // The service will handle these as multi-part
    };
    
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="form-standard space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-slate-900 font-black">{product ? 'Update Product' : 'Add Product'}</h3>
          <p className="text-slate-500 text-sm">Use the same clean format as inquiry form.</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-slate-300 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close form"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-xs font-black text-slate-400 capitalize tracking-widest mb-3">Product Name</label>
          <input
            type="text"
            required
            className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-900"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-xs font-black text-slate-400 capitalize tracking-widest mb-3">Category</label>
          <input
            type="text"
            required
            className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-900"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-black text-slate-400 capitalize tracking-widest mb-3">Description</label>
          <textarea
            rows={4}
            className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-900 leading-relaxed"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-xs font-black text-slate-400 capitalize tracking-widest mb-3">Price (₹)</label>
          <input
            type="number"
            required
            className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-900"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-xs font-black text-slate-400 capitalize tracking-widest mb-3">Stock Units</label>
          <input
            type="number"
            required
            className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-900"
            value={formData.stock}
            onChange={(e) => setFormData({...formData, stock: e.target.value})}
          />
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-black text-slate-400 capitalize tracking-widest mb-3">Technical Specs (JSON Format)</label>
        <textarea
          rows={3}
          className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-mono text-xs font-bold text-slate-600"
          placeholder='{"key": "value"}'
          value={typeof formData.specifications === 'object' ? JSON.stringify(formData.specifications, null, 2) : formData.specifications}
          onChange={(e) => {
            try {
              const specs = JSON.parse(e.target.value);
              setFormData({...formData, specifications: specs});
            } catch {
              setFormData({...formData, specifications: e.target.value});
            }
          }}
        />
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-xs font-black text-slate-400 capitalize tracking-widest">Media Assets</label>
          {formData.images && formData.images.length > 0 && (
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {formData.images.length} {formData.images.length === 1 ? 'Image' : 'Images'}
            </span>
          )}
        </div>
        <div className="space-y-4">
          {/* Image Previews Grid */}
          {formData.images && formData.images.length > 0 && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Selected Images</span>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {formData.images.map((img: any, index: number) => (
                  <div key={index} className="relative group aspect-square">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent rounded-xl z-10"></div>
                    <img 
                      src={img instanceof File ? URL.createObjectURL(img) : getImageUrl(img)} 
                      alt={`Product ${index + 1}`} 
                      className="w-full h-full object-cover rounded-xl border border-slate-200 shadow-sm group-hover:shadow-lg transition-all"
                    />
                    <div className="absolute bottom-2 left-2 z-20">
                      <span className="text-[10px] font-bold text-white bg-slate-900/70 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        {index + 1}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = [...formData.images];
                        newImages.splice(index, 1);
                        setFormData({...formData, images: newImages});
                      }}
                      className="absolute -top-2 -right-2 z-20 bg-rose-500 hover:bg-rose-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-lg transform hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Upload Area */}
          <div className="relative group">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  const newFiles = Array.from(e.target.files);
                  setFormData({...formData, images: [...(formData.images || []), ...newFiles]});
                }
              }}
              className="absolute inset-0 w-full h-full cursor-pointer z-20 opacity-0"
            />
            <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50 rounded-2xl p-8 text-center transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-100/50">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                <Plus className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-sm font-bold text-slate-700 mb-1">Click to upload product images</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">SVG, PNG, JPG or GIF (max. 5MB)</p>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span>Supports multiple selections</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="form-actions">
        <button
          type="submit"
          className="btn-primary flex-1"
        >
          {product ? 'Commit Changes' : 'Initialize Product'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Discard
        </button>
      </div>
    </form>
  );
};

// User Form Component
const UserForm: React.FC<{
  onSubmit: (data: any) => void;
  onCancel: () => void;
  user?: any;
  cities: any[];
}> = ({ onSubmit, onCancel, user, cities }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'CUSTOMER',
    city: user?.city || '',
    mobile: user?.mobile || '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="form-standard space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-slate-900 font-black">{user ? 'Edit User' : 'Add User'}</h3>
          <p className="text-slate-500 text-sm">Consistent, clear and readable user details form.</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-slate-300 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close form"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-xs font-black text-slate-400 capitalize tracking-widest mb-3">Full Name</label>
          <input
            type="text"
            required
            className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-900"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-xs font-black text-slate-400 capitalize tracking-widest mb-3">Email Address</label>
          <input
            type="email"
            required
            className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-900"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-xs font-black text-slate-400 capitalize tracking-widest mb-3">Mobile Number</label>
          <input
            type="tel"
            required
            className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-900"
            value={formData.mobile}
            onChange={(e) => setFormData({...formData, mobile: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-xs font-black text-slate-400 capitalize tracking-widest mb-3">Access Tier</label>
          <select
            className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-900 appearance-none cursor-pointer"
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
          >
            <option value="ADMIN">Administrator</option>
            <option value="STAFF">Execution Staff</option>
            <option value="CUSTOMER">Client / Partner</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-black text-slate-400 capitalize tracking-widest mb-3">Primary City (MP)</label>
          <select
            className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-900 appearance-none cursor-pointer"
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
          >
            <option value="">Select Region</option>
            {cities.map(city => (
              <option key={city.name} value={city.name}>{city.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      {!user && (
        <div>
          <label className="block text-xs font-black text-slate-400 capitalize tracking-widest mb-3">Security Credential</label>
          <input
            type="password"
            required
            className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-900"
            placeholder="Set initial password"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>
      )}
      
      <div className="form-actions">
        <button
          type="submit"
          className="btn-primary flex-1"
        >
          {user ? 'Commit Profile' : 'Authorize User'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Discard
        </button>
      </div>
    </form>
  );
};

// Site Form Component
const SiteForm: React.FC<{
  onSubmit: (data: any) => void;
  onCancel: () => void;
  site?: any;
  cities: any[];
  customers: any[];
  products: any[];
  services: any[];
}> = ({ onSubmit, onCancel, site, cities, customers, products, services }) => {
  const getDefaultLineItem = () => ({
    rowKey: `row-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: 'PRODUCT',
    itemName: '',
    description: '',
    quantity: 1,
    unit: 'Nos',
    price: 0,
    discountType: 'PERCENT',
    discountValue: 0,
    vatPercent: 0,
    deliveryCharge: 0
  });

  const parseSiteDescription = (description: string) => {
    if (!description || typeof description !== 'string') {
      return { notes: '', metadata: null as any };
    }

    try {
      const parsed = JSON.parse(description);
      if (parsed && typeof parsed === 'object' && parsed.__siteFormMeta === true) {
        return {
          notes: parsed.notes || '',
          metadata: parsed
        };
      }
    } catch {
      // Keep legacy plain text descriptions intact.
    }

    return { notes: description, metadata: null as any };
  };

  const initialParsed = parseSiteDescription(site?.description || '');

  const [customerProducts, setCustomerProducts] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    userId: String(site?.userId || site?.customerId || ''),
    siteName: site?.name || '',
    clientName: initialParsed.metadata?.siteInfo?.clientName || '',
    contactPerson: initialParsed.metadata?.siteInfo?.contactPerson || '',
    mobileNumber: initialParsed.metadata?.siteInfo?.mobileNumber || '',
    email: initialParsed.metadata?.siteInfo?.email || '',
    siteAddress: site?.address || '',
    cityId: String(site?.cityId || ''),
    state: initialParsed.metadata?.siteInfo?.state || '',
    gstNumber: initialParsed.metadata?.siteInfo?.gstNumber || '',
    siteStartDate: formatDateForInput(site?.startDate),
    siteEndDate: formatDateForInput(site?.completionDate),
    status: site?.status === 'WORKING' || site?.status === 'COMPLETED' ? 'ACTIVE' : 'INACTIVE',
    notes: initialParsed.notes || '',
    images: site?.images || [],
    lineItems: Array.isArray(initialParsed.metadata?.lineItems) && initialParsed.metadata.lineItems.length > 0
      ? initialParsed.metadata.lineItems.map((item: any, index: number) => ({
          ...getDefaultLineItem(),
          ...item,
          rowKey: item?.rowKey || `row-${index}-${Date.now()}`
        }))
      : [getDefaultLineItem()]
  });

  useEffect(() => {
    const loadCustomerProducts = async () => {
      if (!formData.userId) {
        setCustomerProducts([]);
        return;
      }

      const result = await PaymentService.getCustomerProducts(formData.userId);
      setCustomerProducts(result.success ? (result.products || []) : []);
    };

    loadCustomerProducts();
  }, [formData.userId]);

  const availableItemOptions = customerProducts.length > 0
    ? customerProducts.map((entry: any) => ({
        name: entry.productName || entry.name || '',
        description: entry.description || '',
        type: entry.type || 'PRODUCT'
      }))
    : [
        ...products.map((product: any) => ({
          name: product.name,
          description: product.description || '',
          type: 'PRODUCT'
        })),
        ...services.map((service: any) => ({
          name: service.title || service.name || '',
          description: service.shortDescription || service.description || '',
          type: 'SERVICE'
        }))
      ].filter((item: any) => item.name);

  const normalizeNumber = (value: any) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value || 0);

  const calculateRow = (row: any) => {
    const quantity = normalizeNumber(row.quantity);
    const price = normalizeNumber(row.price);
    const discountValue = normalizeNumber(row.discountValue);
    const vatPercent = normalizeNumber(row.vatPercent);
    const deliveryCharge = normalizeNumber(row.deliveryCharge);

    const subtotal = quantity * price;
    const discountAmount = row.discountType === 'AMOUNT'
      ? Math.min(discountValue, subtotal)
      : Math.min((subtotal * discountValue) / 100, subtotal);
    const afterDiscount = subtotal - discountAmount;
    const vatAmount = (afterDiscount * vatPercent) / 100;
    const total = afterDiscount + vatAmount + deliveryCharge;

    return {
      subtotal,
      discountAmount,
      vatAmount,
      deliveryCharge,
      total
    };
  };

  const totals = formData.lineItems.reduce(
    (acc: any, row: any) => {
      const calc = calculateRow(row);
      acc.subtotal += calc.subtotal;
      acc.discount += calc.discountAmount;
      acc.vat += calc.vatAmount;
      acc.delivery += calc.deliveryCharge;
      acc.grandTotal += calc.total;
      return acc;
    },
    { subtotal: 0, discount: 0, vat: 0, delivery: 0, grandTotal: 0 }
  );

  const filteredCustomers = customers;

  const setField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const setRowField = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const nextRows = [...prev.lineItems];
      nextRows[index] = { ...nextRows[index], [field]: value };
      return { ...prev, lineItems: nextRows };
    });
    setErrors((prev) => ({ ...prev, [`lineItems.${index}.${field}`]: '' }));
  };

  const addRow = () => {
    setFormData((prev) => ({ ...prev, lineItems: [...prev.lineItems, getDefaultLineItem()] }));
  };

  const removeRow = (index: number) => {
    setFormData((prev) => {
      if (prev.lineItems.length === 1) return prev;
      const nextRows = prev.lineItems.filter((_: any, i: number) => i !== index);
      return { ...prev, lineItems: nextRows };
    });
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.siteName.trim()) nextErrors.siteName = 'Site Name is required';
    if (!formData.userId) nextErrors.userId = 'Client Name is required';
    if (!formData.contactPerson.trim()) nextErrors.contactPerson = 'Contact Person is required';
    if (!formData.mobileNumber.trim()) nextErrors.mobileNumber = 'Mobile Number is required';
    if (!formData.siteAddress.trim()) nextErrors.siteAddress = 'Site Address is required';
    if (!formData.cityId) nextErrors.cityId = 'City is required';
    if (!formData.siteStartDate) nextErrors.siteStartDate = 'Site Start Date is required';
    if (!formData.siteEndDate) nextErrors.siteEndDate = 'Site End Date is required';

    if (formData.siteStartDate && formData.siteEndDate && formData.siteStartDate > formData.siteEndDate) {
      nextErrors.siteEndDate = 'End date must be after start date';
    }

    formData.lineItems.forEach((row: any, index: number) => {
      if (!row.itemName?.trim()) {
        nextErrors[`lineItems.${index}.itemName`] = 'Product / Service Name is required';
      }
      if (normalizeNumber(row.quantity) <= 0) {
        nextErrors[`lineItems.${index}.quantity`] = 'Quantity must be greater than 0';
      }
      if (normalizeNumber(row.discountValue) < 0) {
        nextErrors[`lineItems.${index}.discountValue`] = 'Discount cannot be negative';
      }
      if (normalizeNumber(row.vatPercent) < 0 || normalizeNumber(row.vatPercent) > 100) {
        nextErrors[`lineItems.${index}.vatPercent`] = 'VAT must be between 0 and 100';
      }
      if (normalizeNumber(row.price) < 0) {
        nextErrors[`lineItems.${index}.price`] = 'Price cannot be negative';
      }
    });

    if (!formData.lineItems || formData.lineItems.length === 0) {
      nextErrors.lineItems = 'At least one product/service row is required';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const selectedClient = customers.find((customer: any) => String(customer.id) === String(formData.userId));
    const metadata = {
      __siteFormMeta: true,
      siteInfo: {
        clientName: formData.clientName || selectedClient?.name || '',
        contactPerson: formData.contactPerson,
        mobileNumber: formData.mobileNumber,
        email: formData.email,
        state: formData.state,
        gstNumber: formData.gstNumber
      },
      lineItems: formData.lineItems.map((row: any) => {
        const calc = calculateRow(row);
        return {
          type: row.type,
          itemName: row.itemName,
          description: row.description,
          quantity: normalizeNumber(row.quantity),
          unit: row.unit,
          price: normalizeNumber(row.price),
          discountType: row.discountType,
          discountValue: normalizeNumber(row.discountValue),
          vatPercent: normalizeNumber(row.vatPercent),
          deliveryCharge: normalizeNumber(row.deliveryCharge),
          total: calc.total
        };
      }),
      totals,
      customerProducts,
      notes: formData.notes
    };

    const existingImages = (formData.images || [])
      .map((img: any) => {
        if (typeof img === 'string') return img;
        if (img && typeof img === 'object' && typeof img.imageUrl === 'string') return img.imageUrl;
        return null;
      })
      .filter(Boolean);
    const newImageFiles = formData.images.filter((img: any) => img instanceof File);

    onSubmit({
      userId: formData.userId,
      name: formData.siteName,
      address: formData.siteAddress,
      cityId: formData.cityId,
      status: formData.status === 'ACTIVE' ? 'WORKING' : 'COMING_SOON',
      startDate: formData.siteStartDate,
      completionDate: formData.siteEndDate,
      description: JSON.stringify(metadata),
      productName: formData.lineItems[0]?.itemName || '',
      existingImages,
      images: newImageFiles
    });
  };

  const renderError = (key: string) =>
    errors[key] ? <p className="mt-1 text-xs font-semibold text-rose-600">{errors[key]}</p> : null;

  const SummaryRow = ({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) => (
    <div className={`flex items-center justify-between py-2 ${highlight ? 'border-t border-blue-200 mt-2 pt-4' : ''}`}>
      <span className={`text-sm ${highlight ? 'font-black text-slate-900' : 'font-semibold text-slate-500'}`}>{label}</span>
      <span className={`text-sm ${highlight ? 'font-black text-blue-700 text-lg' : 'font-bold text-slate-700'}`}>
        {formatCurrency(value)}
      </span>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="form-standard w-full space-y-4">
      <div className="rounded-3xl border border-blue-100 bg-gradient-to-r from-sky-50 via-white to-cyan-50 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Site Entry</p>
            <h4 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
              {site ? 'Update Site' : 'Add Site'}
            </h4>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Professional ERP-style site setup with line-level product and service billing.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-slate-300 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-9">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
              <h5 className="text-sm font-black uppercase tracking-widest text-slate-700">Section 1: Site Information</h5>
              <Building2 className="h-5 w-5 text-slate-400" />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">Site Name *</label>
                <input
                  type="text"
                  value={formData.siteName}
                  onChange={(e) => setField('siteName', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
                {renderError('siteName')}
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">Client Name *</label>
                <select
                  value={formData.userId}
                  onChange={(e) => {
                    const selected = customers.find((customer: any) => String(customer.id) === e.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      userId: e.target.value,
                      clientName: selected?.name || '',
                      mobileNumber: selected?.mobile || '',
                      email: selected?.email || '',
                      lineItems: [getDefaultLineItem()]
                    }));
                    setErrors((prev) => ({ ...prev, userId: '' }));
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="">Select Client</option>
                  {filteredCustomers.map((customer: any) => (
                    <option key={customer.id} value={String(customer.id)}>
                      {customer.name}{customer.mobile ? ` (${customer.mobile})` : ''}
                    </option>
                  ))}
                </select>
                {renderError('userId')}
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">Contact Person *</label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setField('contactPerson', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
                {renderError('contactPerson')}
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">Mobile Number *</label>
                <input
                  type="text"
                  value={formData.mobileNumber}
                  onChange={(e) => setField('mobileNumber', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
                {renderError('mobileNumber')}
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setField('email', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">Site Address *</label>
                <textarea
                  rows={3}
                  value={formData.siteAddress}
                  onChange={(e) => setField('siteAddress', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
                {renderError('siteAddress')}
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">City *</label>
                <select
                  value={formData.cityId}
                  onChange={(e) => setField('cityId', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="">Select City</option>
                  {cities.map((city: any) => (
                    <option key={city.id} value={String(city.id)}>{city.name}</option>
                  ))}
                </select>
                {renderError('cityId')}
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setField('state', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">GST Number</label>
                <input
                  type="text"
                  value={formData.gstNumber}
                  onChange={(e) => setField('gstNumber', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">Site Start Date *</label>
                <input
                  type="date"
                  value={formData.siteStartDate}
                  onChange={(e) => setField('siteStartDate', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
                {renderError('siteStartDate')}
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">Site End Date *</label>
                <input
                  type="date"
                  value={formData.siteEndDate}
                  onChange={(e) => setField('siteEndDate', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
                {renderError('siteEndDate')}
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setField('status', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
              <h5 className="text-sm font-black uppercase tracking-widest text-slate-700">Section 2: Products & Services</h5>
              <button
                type="button"
                onClick={addRow}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-black uppercase tracking-wider text-white transition-all hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Row
              </button>
            </div>

            <div className="space-y-4">
              {formData.lineItems.map((row: any, index: number) => {
                const rowCalc = calculateRow(row);
                const itemOptions = availableItemOptions.filter((item: any) => {
                  const itemType = String(item?.type || "PRODUCT").toUpperCase();
                  return row.type === "SERVICE" ? itemType === "SERVICE" : itemType !== "SERVICE";
                });

                return (
                  <div key={row.rowKey} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-500">Row {index + 1}</p>
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2 py-1 text-xs font-bold text-rose-600 transition-all hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={formData.lineItems.length === 1}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                      <div>
                        <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-slate-500">Type</label>
                        <select
                          value={row.type}
                          onChange={(e) => setRowField(index, 'type', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        >
                          <option value="PRODUCT">Product</option>
                          <option value="SERVICE">Service</option>
                        </select>
                      </div>

                      <div className="xl:col-span-2">
                        <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-slate-500">Product / Service Name *</label>
                        <select
                          value={row.itemName}
                          onChange={(e) => {
                            const selected = itemOptions.find((item: any) => item.name === e.target.value);
                            setFormData((prev) => {
                              const nextRows = [...prev.lineItems];
                              nextRows[index] = {
                                ...nextRows[index],
                                itemName: e.target.value,
                                type: selected?.type ? String(selected.type).toUpperCase() : nextRows[index].type,
                                description: nextRows[index].description || selected?.description || ''
                              };
                              return { ...prev, lineItems: nextRows };
                            });
                            setErrors((prev) => ({ ...prev, [`lineItems.${index}.itemName`]: '' }));
                          }}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        >
                          <option value="">{itemOptions.length ? 'Select item' : `No ${row.type.toLowerCase()} found`}</option>
                          {itemOptions.map((item: any) => (
                            <option key={`${item.type}-${item.name}`} value={item.name}>{item.name}</option>
                          ))}
                        </select>
                        {renderError(`lineItems.${index}.itemName`)}
                      </div>

                      <div className="xl:col-span-2">
                        <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-slate-500">Description</label>
                        <input
                          type="text"
                          value={row.description}
                          onChange={(e) => setRowField(index, 'description', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-slate-500">Quantity</label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={row.quantity}
                          onChange={(e) => setRowField(index, 'quantity', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        />
                        {renderError(`lineItems.${index}.quantity`)}
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-slate-500">Unit</label>
                        <input
                          type="text"
                          value={row.unit}
                          onChange={(e) => setRowField(index, 'unit', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-slate-500">Approx Price</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.price}
                          onChange={(e) => setRowField(index, 'price', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        />
                        {renderError(`lineItems.${index}.price`)}
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-slate-500">Discount Type</label>
                        <select
                          value={row.discountType}
                          onChange={(e) => setRowField(index, 'discountType', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        >
                          <option value="PERCENT">%</option>
                          <option value="AMOUNT">Amount</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-slate-500">Discount Value</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.discountValue}
                          onChange={(e) => setRowField(index, 'discountValue', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        />
                        {renderError(`lineItems.${index}.discountValue`)}
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-slate-500">VAT / Tax %</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={row.vatPercent}
                          onChange={(e) => setRowField(index, 'vatPercent', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        />
                        {renderError(`lineItems.${index}.vatPercent`)}
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-slate-500">Delivery Charge</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.deliveryCharge}
                          onChange={(e) => setRowField(index, 'deliveryCharge', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        />
                      </div>

                      <div className="xl:col-span-5">
                        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                          <p className="text-xs font-black uppercase tracking-widest text-blue-600">Row Total</p>
                          <p className="mt-1 text-lg font-black text-blue-800">{formatCurrency(rowCalc.total)}</p>
                          <p className="text-[11px] font-semibold text-blue-700">
                            Subtotal {rowCalc.subtotal.toFixed(2)} | Discount {rowCalc.discountAmount.toFixed(2)} | VAT {rowCalc.vatAmount.toFixed(2)} | Delivery {rowCalc.deliveryCharge.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
              <h5 className="text-sm font-black uppercase tracking-widest text-slate-700">Notes & Media</h5>
              <Info className="h-5 w-5 text-slate-400" />
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">Internal Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setField('notes', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">Site Images</label>
                <div className="space-y-4">
                  {formData.images && formData.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 md:grid-cols-5 xl:grid-cols-7">
                      {formData.images.map((img: any, index: number) => (
                        <div key={index} className="group relative aspect-square">
                          {(() => {
                            const previewPath = img instanceof File ? URL.createObjectURL(img) : (typeof img === 'string' ? img : img?.imageUrl || null);
                            return (
                              <img
                                src={getImageUrl(previewPath)}
                                alt={`Site ${index + 1}`}
                                className="h-full w-full rounded-xl border border-slate-200 object-cover"
                              />
                            );
                          })()}
                          <button
                            type="button"
                            onClick={() => {
                              const nextImages = [...formData.images];
                              nextImages.splice(index, 1);
                              setField('images', nextImages);
                            }}
                            className="absolute -right-2 -top-2 rounded-full bg-rose-500 p-1 text-white opacity-80 transition-all hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-7 text-center transition-all hover:border-blue-300 hover:bg-blue-50">
                    <Plus className="mx-auto h-6 w-6 text-blue-500" />
                    <p className="mt-1 text-sm font-bold text-slate-600">Upload Site Photos</p>
                    <p className="text-xs font-medium text-slate-500">Multiple image selection supported</p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const newFiles = Array.from(e.target.files);
                          setField('images', [...(formData.images || []), ...newFiles]);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="xl:col-span-3">
          <div className="sticky top-3 space-y-3 rounded-3xl border border-blue-100 bg-white p-4 shadow-[0_8px_40px_-20px_rgba(37,99,235,0.35)]">
            <div className="border-b border-slate-100 pb-3">
              <h5 className="text-sm font-black uppercase tracking-widest text-slate-700">Section 3: Summary</h5>
              <p className="mt-1 text-xs font-semibold text-slate-500">Auto-updates for every line item change</p>
            </div>
            <SummaryRow label="Subtotal" value={totals.subtotal} />
            <SummaryRow label="Total Discount" value={totals.discount} />
            <SummaryRow label="Total VAT" value={totals.vat} />
            <SummaryRow label="Delivery Charges" value={totals.delivery} />
            <SummaryRow label="Grand Total" value={totals.grandTotal} highlight />
          </div>
        </aside>
      </div>

      <div className="sticky bottom-0 z-10 -mx-10 border-t border-slate-200 bg-white/95 px-10 py-4 backdrop-blur">
        <div className="form-actions border-0 p-0">
          <button
            type="submit"
            className="btn-primary"
          >
            {site ? 'Update Site' : 'Save Site'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
};

// Payment Form Component
const PaymentForm: React.FC<{
  onSubmit: (data: any) => void;
  onCancel: () => void;
  payment?: any;
  users: any[];
}> = ({ onSubmit, onCancel, payment, users }) => {
  const [siteOptions, setSiteOptions] = useState<any[]>([]);
  const [siteProducts, setSiteProducts] = useState<any[]>([]);
  const [loadingRelations, setLoadingRelations] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const getDefaultLine = () => ({
    rowKey: `pay-row-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: 'PRODUCT',
    itemName: '',
    description: '',
    quantity: 1,
    unit: 'Nos',
    price: 0,
    discountType: 'PERCENT',
    discountValue: 0,
    vatPercent: 0,
    deliveryCharge: 0
  });

  const parsedPaymentMeta = (() => {
    try {
      const obj = payment?.notes ? JSON.parse(payment.notes) : null;
      return obj && obj.__paymentMeta ? obj : null;
    } catch {
      return null;
    }
  })();

  const [formData, setFormData] = useState({
    customerId: payment?.customerId || '',
    customerMobile: payment?.customerMobile || '',
    siteId: payment?.siteId || '',
    paidAmount: payment?.paidAmount || 0,
    paymentDate: formatDateForInput(payment?.paymentDate),
    paymentMethod: payment?.paymentMethod || '',
    transactionId: payment?.transactionId || '',
    existingReceiptUrl: payment?.receiptUrl || '',
    paymentReceipt: null as File | null,
    notes: parsedPaymentMeta?.notes || (payment?.notes || ''),
    lineItems: Array.isArray(parsedPaymentMeta?.lineItems) && parsedPaymentMeta.lineItems.length > 0
      ? parsedPaymentMeta.lineItems.map((row: any, index: number) => ({ ...getDefaultLine(), ...row, rowKey: row?.rowKey || `pay-row-${index}` }))
      : [{
          ...getDefaultLine(),
          itemName: payment?.productName || '',
          total: payment?.amount || 0
        }]
  });

  const normalizeNumber = (value: any) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value || 0);

  const calculateLine = (line: any) => {
    const quantity = normalizeNumber(line.quantity);
    const price = normalizeNumber(line.price);
    const discountValue = normalizeNumber(line.discountValue);
    const vatPercent = normalizeNumber(line.vatPercent);
    const deliveryCharge = normalizeNumber(line.deliveryCharge);
    const subtotal = quantity * price;
    const discountAmount = line.discountType === 'AMOUNT'
      ? Math.min(discountValue, subtotal)
      : Math.min((subtotal * discountValue) / 100, subtotal);
    const afterDiscount = subtotal - discountAmount;
    const vatAmount = (afterDiscount * vatPercent) / 100;
    const total = afterDiscount + vatAmount + deliveryCharge;
    return { subtotal, discountAmount, vatAmount, deliveryCharge, total };
  };

  const totals = (formData.lineItems || []).reduce(
    (acc: any, line: any) => {
      const c = calculateLine(line);
      acc.subtotal += c.subtotal;
      acc.discount += c.discountAmount;
      acc.vat += c.vatAmount;
      acc.delivery += c.deliveryCharge;
      acc.grandTotal += c.total;
      return acc;
    },
    { subtotal: 0, discount: 0, vat: 0, delivery: 0, grandTotal: 0 }
  );

  const computedBalance = Math.max(0, Number(totals.grandTotal || 0) - Number(formData.paidAmount || 0));
  const computedStatus =
    Number(formData.paidAmount || 0) >= Number(totals.grandTotal || 0) && Number(totals.grandTotal || 0) > 0
      ? 'PAID'
      : Number(formData.paidAmount || 0) > 0
        ? 'PARTIALLY_PAID'
        : 'UNPAID';

  useEffect(() => {
    const selected = users.find((u: any) => String(u.id) === String(formData.customerId));
    setFormData((prev) => ({
      ...prev,
      customerMobile: selected?.mobile || ''
    }));
  }, [formData.customerId, users]);

  useEffect(() => {
    const loadCustomerRelations = async () => {
      if (!formData.customerId) {
        setSiteOptions([]);
        setSiteProducts([]);
        return;
      }

      setLoadingRelations(true);
      try {
        const sitesResult = await PaymentService.getCustomerSites(formData.customerId);
        setSiteOptions(sitesResult.success ? (sitesResult.sites || []) : []);
      } finally {
        setLoadingRelations(false);
      }
    };

    loadCustomerRelations();
  }, [formData.customerId]);

  useEffect(() => {
    const loadProductsBySite = async () => {
      if (!formData.siteId) {
        setSiteProducts([]);
        return;
      }

      setLoadingRelations(true);
      try {
        const siteResult = await SiteService.getSiteById(formData.siteId);
        const options = siteResult.success ? (siteResult.site?.siteProducts || []) : [];
        setSiteProducts(options);
      } finally {
        setLoadingRelations(false);
      }
    };

    loadProductsBySite();
  }, [formData.siteId]);

  const addLine = () => {
    setFormData((prev) => ({ ...prev, lineItems: [...(prev.lineItems || []), getDefaultLine()] }));
  };

  const removeLine = (idx: number) => {
    setFormData((prev) => {
      const rows = [...(prev.lineItems || [])];
      if (rows.length <= 1) return prev;
      rows.splice(idx, 1);
      return { ...prev, lineItems: rows };
    });
  };

  const setLineField = (idx: number, field: string, value: any) => {
    setFormData((prev) => {
      const rows = [...(prev.lineItems || [])];
      rows[idx] = { ...rows[idx], [field]: value };
      return { ...prev, lineItems: rows };
    });
  };

  const selectLineItem = (idx: number, itemName: string) => {
    const selected = siteProducts.find((sp: any) => String(sp.itemName) === String(itemName));
    setFormData((prev) => {
      const rows = [...(prev.lineItems || [])];
      rows[idx] = {
        ...rows[idx],
        itemName,
        type: String(selected?.type || rows[idx].type || 'PRODUCT').toUpperCase(),
        description: selected?.description || rows[idx].description || '',
        quantity: normalizeNumber((selected?.quantity ?? rows[idx].quantity) || 1),
        unit: selected?.unit || rows[idx].unit || 'Nos',
        price: normalizeNumber(selected?.price ?? rows[idx].price),
        discountType: String(selected?.discountType || rows[idx].discountType || 'PERCENT').toUpperCase(),
        discountValue: normalizeNumber(selected?.discountValue ?? rows[idx].discountValue),
        vatPercent: normalizeNumber(selected?.vatPercent ?? rows[idx].vatPercent),
        deliveryCharge: normalizeNumber(selected?.deliveryCharge ?? rows[idx].deliveryCharge),
      };
      return { ...prev, lineItems: rows };
    });
    setErrors((prev) => ({ ...prev, [`lineItems.${idx}.itemName`]: '', [`lineItems.${idx}.quantity`]: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || !formData.siteId) return;
    const validRows = (formData.lineItems || []).filter((row: any) => row.itemName && normalizeNumber(row.quantity) > 0);
    if (validRows.length === 0) return;
    const nextErrors: Record<string, string> = {};
    const selectedNames = new Set<string>();
    (formData.lineItems || []).forEach((line: any, index: number) => {
      const itemName = String(line.itemName || '').trim();
      if (!itemName) {
        nextErrors[`lineItems.${index}.itemName`] = 'Product / Service is required';
        return;
      }
      if (selectedNames.has(itemName)) {
        nextErrors[`lineItems.${index}.itemName`] = 'Same item cannot be selected more than once';
      } else {
        selectedNames.add(itemName);
      }

      const selectedProduct = (siteProducts || []).find((sp: any) => String(sp.itemName) === itemName);
      const inputQty = normalizeNumber(line.quantity);
      const allottedQty = normalizeNumber(selectedProduct?.quantity);
      if (inputQty <= 0) {
        nextErrors[`lineItems.${index}.quantity`] = 'Quantity should be greater than 0';
      } else if (allottedQty > 0 && inputQty > allottedQty) {
        nextErrors[`lineItems.${index}.quantity`] = `Quantity cannot exceed site allotted qty (${allottedQty})`;
      }
    });

    const isOnlineMode = ['ONLINE', 'UPI'].includes(String(formData.paymentMethod || '').toUpperCase());
    if (!formData.paymentMethod) nextErrors.paymentMethod = 'Payment method is required';
    if (isOnlineMode && !String(formData.transactionId || '').trim()) {
      nextErrors.transactionId = 'Transaction Id / UTR is required for Online/UPI';
    }
    if (Number(formData.paidAmount || 0) > Number(totals.grandTotal || 0)) {
      nextErrors.paidAmount = 'Paid amount cannot exceed total amount';
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const notesPayload = {
      __paymentMeta: true,
      notes: formData.notes || '',
      lineItems: validRows.map((line: any) => ({
        ...line,
        quantity: normalizeNumber(line.quantity),
        price: normalizeNumber(line.price),
        discountValue: normalizeNumber(line.discountValue),
        vatPercent: normalizeNumber(line.vatPercent),
        deliveryCharge: normalizeNumber(line.deliveryCharge),
        total: calculateLine(line).total
      })),
      totals
    };

    onSubmit({
      customerId: formData.customerId,
      siteId: formData.siteId,
      productName: validRows.length === 1 ? validRows[0].itemName : 'Multiple Items',
      amount: Number(totals.grandTotal || 0),
      paidAmount: Number(formData.paidAmount || 0),
      paymentDate: formData.paymentDate,
      paymentMethod: String(formData.paymentMethod || '').toUpperCase(),
      transactionId: formData.transactionId,
      notes: JSON.stringify(notesPayload),
      paymentReceipt: formData.paymentReceipt,
      existingReceiptUrl: formData.existingReceiptUrl
    });
  };

  return (
    <form onSubmit={handleSubmit} className="form-standard space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-slate-900 font-black">{payment ? 'Edit Payment' : 'Add Payment'}</h3>
          <p className="text-slate-500 text-sm">Keep entries neat, readable and consistent.</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-slate-300 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close form"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-black text-slate-400 capitalize tracking-widest mb-3">Customer Name</label>
          <select
            required
            className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-900 appearance-none cursor-pointer"
            value={formData.customerId}
            onChange={(e) => setFormData({ ...formData, customerId: e.target.value, siteId: '', lineItems: [getDefaultLine()] })}
          >
            <option value="">Select Customer</option>
            {users.map((u: any) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-400 capitalize tracking-widest mb-3">Customer Mobile</label>
          <input
            type="text"
            readOnly
            className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-100 outline-none font-bold text-slate-700"
            value={formData.customerMobile || ''}
          />
        </div>

        <div>
          <label className="block text-xs font-black text-slate-400 capitalize tracking-widest mb-3">Site Name</label>
          <select
            required
            disabled={!formData.customerId || loadingRelations}
            className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 disabled:bg-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-900 appearance-none cursor-pointer"
            value={formData.siteId}
            onChange={(e) => setFormData({ ...formData, siteId: e.target.value, lineItems: [getDefaultLine()] })}
          >
            <option value="">Select Site</option>
            {siteOptions.map((site) => (
              <option key={site.id} value={site.id}>{site.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black uppercase tracking-widest text-slate-700">Payment Items</h4>
          <button
            type="button"
            onClick={addLine}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-blue-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Row
          </button>
        </div>

        {(formData.lineItems || []).map((line: any, idx: number) => {
          const selectedNames = new Set(
            (formData.lineItems || [])
              .map((row: any, rowIdx: number) => rowIdx !== idx ? row.itemName : '')
              .filter(Boolean)
          );
          const filteredByType = (siteProducts || []).filter((sp: any) => {
            const type = String(sp.type || 'PRODUCT').toUpperCase();
            const typeMatch = line.type === 'SERVICE' ? type === 'SERVICE' : type !== 'SERVICE';
            return typeMatch && !selectedNames.has(sp.itemName);
          });
          const calc = calculateLine(line);
          return (
            <div key={line.rowKey} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 flex justify-between items-center">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Item {idx + 1}</p>
                <button
                  type="button"
                  onClick={() => removeLine(idx)}
                  disabled={(formData.lineItems || []).length === 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2 py-1 text-xs font-bold text-rose-600 disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
              <div className="grid md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Type</label>
                  <select
                    value={line.type}
                    onChange={(e) => {
                      const nextType = e.target.value;
                      setFormData((prev) => {
                        const rows = [...(prev.lineItems || [])];
                        rows[idx] = {
                          ...rows[idx],
                          type: nextType,
                          itemName: '',
                          description: '',
                          quantity: 1,
                          unit: 'Nos',
                          price: 0,
                          discountType: 'PERCENT',
                          discountValue: 0,
                          vatPercent: 0,
                          deliveryCharge: 0
                        };
                        return { ...prev, lineItems: rows };
                      });
                      setErrors((prev) => ({ ...prev, [`lineItems.${idx}.itemName`]: '', [`lineItems.${idx}.quantity`]: '' }));
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
                  >
                    <option value="PRODUCT">Product</option>
                    <option value="SERVICE">Service</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Product / Service</label>
                  <select
                    value={line.itemName}
                    onChange={(e) => selectLineItem(idx, e.target.value)}
                    disabled={!formData.siteId || loadingRelations}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold disabled:bg-slate-100"
                  >
                    <option value="">{filteredByType.length ? 'Select item' : `No ${line.type.toLowerCase()} available`}</option>
                    {filteredByType.map((sp: any, ix: number) => (
                      <option key={`${sp.itemName}-${ix}`} value={sp.itemName}>{sp.itemName}</option>
                    ))}
                  </select>
                  {errors[`lineItems.${idx}.itemName`] && (
                    <p className="mt-1 text-[11px] font-semibold text-rose-600">{errors[`lineItems.${idx}.itemName`]}</p>
                  )}
                </div>
                <div>
                  {(() => {
                    const selectedProduct = (siteProducts || []).find((sp: any) => String(sp.itemName) === String(line.itemName || ''));
                    const allowedQty = normalizeNumber(selectedProduct?.quantity);
                    return (
                      <>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Qty</label>
                  <input
                    type="number"
                    min="0"
                    max={allowedQty > 0 ? allowedQty : undefined}
                    step="any"
                    value={line.quantity}
                    onChange={(e) => {
                      setLineField(idx, 'quantity', e.target.value);
                      setErrors((prev) => ({ ...prev, [`lineItems.${idx}.quantity`]: '' }));
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
                  />
                  {allowedQty > 0 && (
                    <p className="mt-1 text-[11px] font-semibold text-slate-500">Allotted: {allowedQty}</p>
                  )}
                  {errors[`lineItems.${idx}.quantity`] && (
                    <p className="mt-1 text-[11px] font-semibold text-rose-600">{errors[`lineItems.${idx}.quantity`]}</p>
                  )}
                      </>
                    );
                  })()}
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Unit</label>
                  <input
                    type="text"
                    value={line.unit}
                    onChange={(e) => setLineField(idx, 'unit', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
                  />
                </div>
                <div className="md:col-span-5">
                  <input
                    type="text"
                    value={line.description || ''}
                    onChange={(e) => setLineField(idx, 'description', e.target.value)}
                    placeholder="Description"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Rate</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.price}
                    onChange={(e) => setLineField(idx, 'price', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Discount Type</label>
                  <select
                    value={line.discountType}
                    onChange={(e) => setLineField(idx, 'discountType', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
                  >
                    <option value="PERCENT">%</option>
                    <option value="AMOUNT">Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Discount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.discountValue}
                    onChange={(e) => setLineField(idx, 'discountValue', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">VAT %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={line.vatPercent}
                    onChange={(e) => setLineField(idx, 'vatPercent', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Delivery</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.deliveryCharge}
                    onChange={(e) => setLineField(idx, 'deliveryCharge', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
                  />
                </div>
                <div className="md:col-span-5 text-right text-sm font-black text-blue-700">
                  Row Total: {formatCurrency(calc.total)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="md:max-w-[260px]">
          <label className="block text-xs font-black text-slate-400 capitalize tracking-widest mb-3">Total Amount</label>
          <input
            type="text"
            readOnly
            className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-100 outline-none font-bold text-slate-700"
            value={formatCurrency(totals.grandTotal)}
          />
        </div>

        <div className="md:max-w-[260px]">
          <label className="block text-xs font-black text-slate-400 capitalize tracking-widest mb-3">Paid Amount</label>
          <input
            type="number"
            min="0"
            max={Number(totals.grandTotal || 0)}
            step="0.01"
            required
            className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-900"
            value={formData.paidAmount}
            onChange={(e) => {
              setFormData({ ...formData, paidAmount: e.target.value });
              setErrors((prev) => ({ ...prev, paidAmount: '' }));
            }}
          />
          {errors.paidAmount && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.paidAmount}</p>}
        </div>

        <div className="md:max-w-[260px]">
          <label className="block text-xs font-black text-slate-400 capitalize tracking-widest mb-3">Amount Paid Date</label>
          <input
            type="date"
            required
            className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-900"
            value={formData.paymentDate}
            onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
          />
        </div>

        <div className="md:max-w-[260px]">
          <label className="block text-xs font-black text-slate-400 capitalize tracking-widest mb-3">Balance Amount</label>
          <input
            type="text"
            readOnly
            className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-100 outline-none font-bold text-slate-700"
            value={formatCurrency(computedBalance)}
          />
        </div>

        <div className="md:col-span-2 md:max-w-[360px]">
          <label className="block text-xs font-black text-slate-400 capitalize tracking-widest mb-3">Payment Status</label>
          <input
            type="text"
            readOnly
            className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-100 outline-none font-bold text-slate-700"
            value={computedStatus}
          />
        </div>

        <div className="md:col-span-2 md:max-w-[360px]">
          <label className="block text-xs font-black text-slate-400 capitalize tracking-widest mb-3">Payment Method</label>
          <select
            required
            className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-900 appearance-none cursor-pointer"
            value={formData.paymentMethod}
            onChange={(e) => {
              setFormData({ ...formData, paymentMethod: e.target.value });
              setErrors((prev) => ({ ...prev, paymentMethod: '' }));
            }}
          >
            <option value="">Select Method</option>
            <option value="CASH">Cash</option>
            <option value="ONLINE">Online</option>
            <option value="UPI">UPI Payment</option>
          </select>
          {errors.paymentMethod && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.paymentMethod}</p>}
        </div>

        {['ONLINE', 'UPI'].includes(String(formData.paymentMethod || '').toUpperCase()) && (
          <>
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-400 capitalize tracking-widest mb-3">Online Transaction Id / UTR *</label>
              <input
                type="text"
                required
                className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-900"
                value={formData.transactionId}
                onChange={(e) => {
                  setFormData({ ...formData, transactionId: e.target.value });
                  setErrors((prev) => ({ ...prev, transactionId: '' }));
                }}
              />
              {errors.transactionId && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.transactionId}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-400 capitalize tracking-widest mb-3">Payment Receipt / Screenshot</label>
              <input
                type="file"
                accept="image/*,.pdf"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700"
                onChange={(e) => {
                  const file = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
                  setFormData((prev) => ({ ...prev, paymentReceipt: file }));
                }}
              />
              {formData.existingReceiptUrl && !formData.paymentReceipt && (
                <a
                  href={formData.existingReceiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-xs font-semibold text-blue-600 underline"
                >
                  View existing receipt
                </a>
              )}
            </div>
          </>
        )}

        <div className="md:col-span-4">
          <label className="block text-xs font-black text-slate-400 capitalize tracking-widest mb-3">Notes</label>
          <textarea
            rows={3}
            className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-900 leading-relaxed"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm">
        <div className="flex justify-between"><span className="font-semibold text-slate-600">Subtotal</span><span className="font-bold text-slate-800">{formatCurrency(totals.subtotal)}</span></div>
        <div className="flex justify-between"><span className="font-semibold text-slate-600">Discount</span><span className="font-bold text-slate-800">{formatCurrency(totals.discount)}</span></div>
        <div className="flex justify-between"><span className="font-semibold text-slate-600">VAT</span><span className="font-bold text-slate-800">{formatCurrency(totals.vat)}</span></div>
        <div className="flex justify-between"><span className="font-semibold text-slate-600">Delivery</span><span className="font-bold text-slate-800">{formatCurrency(totals.delivery)}</span></div>
        <div className="flex justify-between border-t border-blue-200 mt-2 pt-2"><span className="font-black text-slate-900">Grand Total</span><span className="font-black text-blue-700">{formatCurrency(totals.grandTotal)}</span></div>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn-primary flex-1"
        >
          {payment ? 'Update Payment' : 'Add Payment'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

// Content Management Section Component
const SettingsSection: React.FC<{
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
}> = ({ themeMode, onThemeChange }) => {
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPassword, setSavingPassword] = useState(false);
  const [heroFiles, setHeroFiles] = useState<Record<string, File | null>>({
    home: null,
    about_us: null,
    other: null,
  });
  const [heroPreviews, setHeroPreviews] = useState<Record<string, string>>({});
  const [heroExisting, setHeroExisting] = useState<Record<string, string | null>>({});
  const [savingHero, setSavingHero] = useState(false);

  useEffect(() => {
    const loadCurrent = async () => {
      const keys = ['home', 'about_us', 'products_page'];
      const next: Record<string, string | null> = {};
      for (const key of keys) {
        try {
          const page = await ContentService.getContentPageByPageName(key);
          const image = Array.isArray(page?.images) && page.images.length > 0
            ? (page.images[0]?.imageUrl || page.images[0]?.image_url || page.images[0])
            : null;
          const normalizedKey = key === 'products_page' ? 'other' : key;
          next[normalizedKey] = image ? getImageUrl(image) : null;
        } catch {
          const normalizedKey = key === 'products_page' ? 'other' : key;
          next[normalizedKey] = null;
        }
      }
      setHeroExisting(next);
    };
    loadCurrent();
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('Please fill all password fields');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }
    setSavingPassword(true);
    try {
      const token = localStorage.getItem('token');
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      const response = await fetch(`${apiBaseUrl}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        toast.error('Change password API not available in backend yet');
        return;
      }

      toast.success('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Failed to update password:', error);
      toast.error('Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleHeroFileChange = (key: string, file: File | null) => {
    if (file && file.size > MAX_CONTENT_IMAGE_BYTES) {
      toast.error('Image exceeds 20MB limit. Please upload a smaller file.');
      return;
    }
    setHeroFiles((prev) => ({ ...prev, [key]: file }));
    if (file) {
      setHeroPreviews((prev) => ({ ...prev, [key]: URL.createObjectURL(file) }));
    } else {
      setHeroPreviews((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const saveHeroSettings = async () => {
    setSavingHero(true);
    const mappings = [
      { pageName: 'home', title: 'Home Page', content: 'Home page content' },
      { pageName: 'about_us', title: 'About Page', content: 'About page content' },
    ];

    try {
      for (const map of mappings) {
        const file = heroFiles[map.pageName];
        if (!file) continue;
        const existing = await ContentService.getContentPageByPageName(map.pageName);
        if (existing) {
          await ContentService.updateContentPage(
            map.pageName,
            { title: existing.title || map.title, content: existing.content || map.content, metaDescription: existing.metaDescription || map.title, isActive: true },
            [file],
            []
          );
        } else {
          await ContentService.createContentPage(
            { pageName: map.pageName as any, title: map.title, content: map.content, metaDescription: map.title, isActive: true },
            [file]
          );
        }
      }

      if (heroFiles.other) {
        const otherTargets = [
          { pageName: 'products_page', title: 'Products Page' },
          { pageName: 'services', title: 'Services Page' },
          { pageName: 'projects_page', title: 'Projects Page' },
          { pageName: 'contact_us', title: 'Contact Page' },
        ];

        for (const target of otherTargets) {
          const existing = await ContentService.getContentPageByPageName(target.pageName);
          if (existing) {
            await ContentService.updateContentPage(
              target.pageName,
              {
                title: existing.title || target.title,
                content: existing.content || `${target.title} content`,
                metaDescription: existing.metaDescription || '',
                isActive: true
              },
              [heroFiles.other],
              []
            );
          } else {
            await ContentService.createContentPage(
              {
                pageName: target.pageName as any,
                title: target.title,
                content: `${target.title} content`,
                metaDescription: '',
                isActive: true
              },
              [heroFiles.other]
            );
          }
        }
      }

      toast.success('Hero image settings updated');
      window.dispatchEvent(new CustomEvent('hero:updated'));
    } catch (error) {
      console.error('Failed to save hero settings:', error);
      toast.error('Failed to save hero image settings');
    } finally {
      setSavingHero(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-6">Settings</h2>
        <div className="grid lg:grid-cols-2 gap-6">
          <form onSubmit={handlePasswordSubmit} className="rounded-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-700 flex items-center gap-2"><LockKeyhole className="w-4 h-4" />Change Password</h3>
            <input type="password" placeholder="Current Password" className="w-full px-4 py-3 border border-slate-200 rounded-xl" value={passwordData.currentPassword} onChange={(e) => setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))} />
            <input type="password" placeholder="New Password" className="w-full px-4 py-3 border border-slate-200 rounded-xl" value={passwordData.newPassword} onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: e.target.value }))} />
            <input type="password" placeholder="Confirm New Password" className="w-full px-4 py-3 border border-slate-200 rounded-xl" value={passwordData.confirmPassword} onChange={(e) => setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))} />
            <button type="submit" disabled={savingPassword} className="bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-60">
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>

          <div className="rounded-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-700 flex items-center gap-2"><Palette className="w-4 h-4" />Theme Mode</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Light Mode', value: 'light' as ThemeMode },
                { label: 'Dark Mode', value: 'dark' as ThemeMode },
                { label: 'Orange Theme', value: 'orange' as ThemeMode },
              ].map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => onThemeChange(mode.value)}
                  className={`px-4 py-3 rounded-xl text-sm font-bold border transition-colors ${themeMode === mode.value ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-700 flex items-center gap-2 mb-5"><ImageUp className="w-4 h-4" />Frontend Hero Image Settings</h3>
        <div className="grid lg:grid-cols-3 gap-5">
          {[
            { key: 'home', label: 'Home Page Hero Image' },
            { key: 'about_us', label: 'About Page Hero Image' },
            { key: 'other', label: 'Other Page Hero Images' },
          ].map((item) => (
            <div key={item.key} className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3">{item.label}</p>
              <div className="mb-3 h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                {(heroPreviews[item.key] || heroExisting[item.key]) ? (
                  <img src={heroPreviews[item.key] || (heroExisting[item.key] as string)} alt={item.label} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">No image</div>
                )}
              </div>
              <input type="file" accept="image/*" onChange={(e) => handleHeroFileChange(item.key, e.target.files?.[0] || null)} className="w-full text-xs" />
            </div>
          ))}
        </div>
        <button
          type="button"
          disabled={savingHero}
          onClick={saveHeroSettings}
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {savingHero ? 'Saving...' : 'Save Hero Image Settings'}
        </button>
      </div>
    </div>
  );
};

const ContentManagementSection = ({ activeTab, user = null }) => {
  const [content, setContent] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [contentText, setContentText] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImagesToKeep, setExistingImagesToKeep] = useState<string[]>([]);
  
  // Contact info management
  const [contactType, setContactType] = useState('phone');
  const [contactValue, setContactValue] = useState('');
  const [contactLabel, setContactLabel] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [orderPriority, setOrderPriority] = useState(0);
  const [allContacts, setAllContacts] = useState<any[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  
  const pageNameMap = {
    'Home Page': 'home',
    'Products Page': 'products_page',
    'Services Page': 'services',
    'Projects Page': 'projects_page',
    'About Page': 'about_us',
    'Contact Page': 'contact_us',
    'About Us': 'about_us',
    'Contact Us': 'contact_us',
    'Services': 'services',
    'Privacy Policy': 'privacy_policy'
  };
  
  const currentPageName = pageNameMap[activeTab];
  
  useEffect(() => {
    if (activeTab === 'Contact Directory') {
      fetchContactInfo();
    } else {
      fetchContent();
    }
  }, [activeTab]);
  
  const fetchContent = async () => {
    try {
      setLoading(true);
      setError('');
      setContent(null);
      const contentData = await ContentService.getContentPageByPageName(currentPageName);
      if (contentData) {
        setContent(contentData);
        setTitle(contentData.title);
        setContentText(contentData.content);
        setMetaDescription(contentData.metaDescription || '');
        setIsActive(contentData.isActive);
        
        if (contentData.images) {
          setExistingImagesToKeep(contentData.images.map((img: any) => img.imageUrl || img.image_url || img));
        } else {
          setExistingImagesToKeep([]);
        }
      } else {
        // Set defaults if no content exists
        setContent(null);
        setTitle(activeTab);
        setContentText('');
        setMetaDescription('');
        setIsActive(true);
        setExistingImagesToKeep([]);
      }
    } catch (err) {
      console.error('Error fetching content:', err);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchContactInfo = async () => {
    try {
      setLoadingContacts(true);
      setError('');
      const phoneContacts = await ContactService.getContactsByType('phone');
      const emailContacts = await ContactService.getContactsByType('email');
      const addressContacts = await ContactService.getContactsByType('address');
      
      // Combine all contacts
      const all = [
        ...phoneContacts.map((c: any) => ({...c, typeLabel: 'Phone'})),
        ...emailContacts.map((c: any) => ({...c, typeLabel: 'Email'})),
        ...addressContacts.map((c: any) => ({...c, typeLabel: 'Address'}))
      ];
      
      setAllContacts(all);
    } catch (err) {
      console.error('Error fetching contact info:', err);
      setError('Failed to load contact information');
    } finally {
      setLoadingContacts(false);
    }
  };
  
  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      
      if (activeTab === 'Contact Directory') {
        // For Contact Us tab, just refresh the contact info
        await fetchContactInfo();
        toast.success(`${activeTab} information refreshed successfully!`);
      } else {
        const contentPageData = {
          title,
          content: (contentText || metaDescription || title || activeTab).trim(),
          metaDescription,
          isActive
        };
        
        if (content) {
          // Update existing content
          if (activeTab !== 'Contact Directory') {
            try {
              await ContentService.updateContentPage(currentPageName, contentPageData, imageFiles, existingImagesToKeep);
            } catch (updateErr: any) {
              // Fallback: if record was deleted or missing, create it instead.
              const msg = String(updateErr?.message || '').toLowerCase();
              if (msg.includes('not found')) {
                await ContentService.createContentPage({ ...contentPageData, pageName: currentPageName }, imageFiles.length ? imageFiles : undefined);
              } else {
                throw updateErr;
              }
            }
          }
        } else {
          // Create new content
          if (activeTab !== 'Contact Directory') {
            if (imageFiles.length > 0) {
              await ContentService.createContentPage({ ...contentPageData, pageName: currentPageName }, imageFiles);
            } else {
              await ContentService.createContentPage({ ...contentPageData, pageName: currentPageName });
            }
          }
        }
        
        // Refresh content
        await fetchContent();
        
        // Clear image files after successful save
        setImageFiles([]);
        setImagePreviews([]);
      }
      
      toast.success(`${activeTab} saved successfully!`);
    } catch (err) {
      console.error('Error saving content:', err);
      setError('Failed to save content');
    } finally {
      setSaving(false);
    }
  };
  
  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ContactService.createContact({
        type: contactType,
        contactValue,
        label: contactLabel,
        isPrimary,
        orderPriority,
        isActive: true
      });
      
      // Refresh the contact list
      await fetchContactInfo();
      
      // Reset form
      setContactValue('');
      setContactLabel('');
      setIsPrimary(false);
      setOrderPriority(0);
      
      toast.success('Contact information added successfully!');
    } catch (err) {
      console.error('Error adding contact:', err);
      setError('Failed to add contact information');
    }
  };
  
  const handleDeleteContact = async (id: number) => {
    setConfirmMessage('Are you sure you want to delete this contact?');
    setConfirmAction(() => async () => {
      try {
        await ContactService.deleteContact(id);
        await fetchContactInfo();
        toast.success('Contact information deleted successfully!');
      } catch (err) {
        console.error('Error deleting contact:', err);
        setError('Failed to delete contact information');
      }
    });
    setShowConfirmModal(true);
  };
  
  const handleSetPrimaryContact = async (id: number) => {
    try {
      await ContactService.setContactAsPrimary(id);
      await fetchContactInfo();
      toast.success('Contact set as primary successfully!');
    } catch (err) {
      console.error('Error setting primary contact:', err);
      setError('Failed to set contact as primary');
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <h2 className="text-lg font-bold mb-8">{activeTab} Management</h2>
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
      <h2 className="text-lg font-bold mb-8">{activeTab} Management</h2>
      
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}
      
      {activeTab === 'Services' ? (
        <ServicesManager user={user} />
      ) : activeTab === 'Contact Directory' ? (
        // Contact management UI
        <div className="space-y-6">
          <div className="mb-8">
            <h3 className="text-md font-semibold mb-4">Add New Contact</h3>
            <form onSubmit={handleAddContact} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                  <select
                    value={contactType}
                    onChange={(e) => setContactType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="phone">Phone</option>
                    <option value="email">Email</option>
                    <option value="address">Address</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Label</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={contactLabel}
                    onChange={(e) => setContactLabel(e.target.value)}
                    placeholder="e.g., Office Phone, Support Email"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Value</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  placeholder="Enter contact value"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isPrimary" className="ml-2 text-sm font-medium text-slate-700">
                    Set as Primary
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Order Priority</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={orderPriority}
                    onChange={(e) => setOrderPriority(parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                Add Contact
              </button>
            </form>
          </div>
          
          <div>
            <h3 className="text-md font-semibold mb-4">Existing Contacts</h3>
            {loadingContacts ? (
              <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : allContacts.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No contacts found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Label</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Primary</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {allContacts.map((contact: any) => (
                      <tr key={contact.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{contact.typeLabel}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{contact.label}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{contact.contactValue}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {contact.isPrimary ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {!contact.isPrimary && (
                            <button
                              onClick={() => handleSetPrimaryContact(contact.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Set Primary
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteContact(contact.id)}
                            className="text-red-600 hover:text-red-900 ml-2"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Content management UI for dynamic page content
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`${activeTab} Title`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
            <textarea
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              placeholder={`Enter ${activeTab.toLowerCase()} content`}
            />
          </div>
          
          <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Hero Image (Drag & Drop Supported)</label>
              <div className="space-y-3">
                {/* Display existing images */}
                {existingImagesToKeep.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-2">Current Images:</p>
                    <div className="flex flex-wrap gap-2">
                      {existingImagesToKeep.map((img: any, index: number) => (
                        <div key={`existing-${index}`} className="relative group">
                          <img 
                            src={getImageUrl(img)} 
                            alt={`Service ${index + 1}`} 
                            className="w-16 h-16 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setExistingImagesToKeep(prev => prev.filter((_, i) => i !== index));
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs  group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Display newly selected images */}
                {imagePreviews.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-2">Newly Selected Images:</p>
                    <div className="flex flex-wrap gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={`preview-${index}`} className="relative group">
                          <img 
                            src={preview} 
                            alt={`Preview ${index + 1}`} 
                            className="w-16 h-16 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              // Remove from preview and files
                              setImagePreviews(prev => prev.filter((_, i) => i !== index));
                              setImageFiles(prev => prev.filter((_, i) => i !== index));
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs  group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                  onDragLeave={() => setIsDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragActive(false);
                    const dropped = Array.from(e.dataTransfer.files || [])
                      .filter((f) => f.type.startsWith('image/'))
                      .filter((f) => {
                        if (f.size > MAX_CONTENT_IMAGE_BYTES) {
                          toast.error(`${f.name} exceeds 20MB limit and was skipped.`);
                          return false;
                        }
                        return true;
                      });
                    if (dropped.length > 0) {
                      setImageFiles(prev => [...prev, ...dropped]);
                      const newPreviews = dropped.map(file => URL.createObjectURL(file));
                      setImagePreviews(prev => [...prev, ...newPreviews]);
                    }
                  }}
                  className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'}`}
                >
                  <p className="text-sm font-semibold text-slate-700">Drop hero images here</p>
                  <p className="text-xs text-slate-500 mt-1">or choose from your device</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const newFiles = Array.from(e.target.files).filter((f) => {
                          if (f.size > MAX_CONTENT_IMAGE_BYTES) {
                            toast.error(`${f.name} exceeds 20MB limit and was skipped.`);
                            return false;
                          }
                          return true;
                        });
                        if (newFiles.length === 0) return;
                        setImageFiles(prev => [...prev, ...newFiles]);
                        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
                        setImagePreviews(prev => [...prev, ...newPreviews]);
                      }
                    }}
                    className="mt-3 w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <p className="text-xs text-slate-500">Upload one or more hero images for this page.</p>
              </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Short Description</label>
            <textarea
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Meta description for SEO"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="ml-2 text-sm font-medium text-slate-700">
              Active
            </label>
          </div>
          
          <div className="flex space-x-4 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Content'}
            </button>
            <button
              onClick={fetchContent}
              className="border border-slate-300 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        title="Confirm Action"
        message={confirmMessage}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        onConfirm={() => {
          if (confirmAction) confirmAction();
        }}
        confirmText="Proceed"
      />
    </div>
  );
};

export default Dashboard;
