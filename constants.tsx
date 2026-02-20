
import React from 'react';
import { Shield, Hammer, Ruler, Settings } from 'lucide-react';
import { Product } from './types';

export const MP_CITIES = [
  'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa'
];

export const SERVICES = [
  {
    title: 'Precision Glass Cutting',
    description: 'Computerized cutting for 5mm to 19mm toughened glass with extreme accuracy.',
    icon: <Ruler className="w-8 h-8 text-blue-600" />
  },
  {
    title: 'Turnkey Installation',
    description: 'Professional fitting for hotels, showrooms, and luxury residences across MP.',
    icon: <Hammer className="w-8 h-8 text-blue-600" />
  },
  {
    title: 'Architectural Safety',
    description: 'BIS certified toughening processes ensuring maximum impact resistance.',
    icon: <Shield className="w-8 h-8 text-blue-600" />
  },
  {
    title: 'Hardware Solutions',
    description: 'Expert consultation on hydraulic fittings and architectural hardware selection.',
    icon: <Settings className="w-8 h-8 text-blue-600" />
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: '12mm Clear Toughened Glass',
    category: 'Glass',
    description: 'Ideal for frameless office partitions and glass doors. High thermal stability and mechanical strength.',
    price: 195,
    stock: 1200,
    imageUrl: 'https://images.unsplash.com/photo-1590732128864-4e470878e17b?auto=format&fit=crop&q=80&w=800',
    specifications: ['12mm Thickness', 'Polished Edges', 'Safety Grade A']
  },
  {
    id: '2',
    name: 'Heavy-Duty Hydraulic Floor Spring',
    category: 'Hardware',
    description: 'High-performance floor spring for high-traffic entrance doors. Double action with adjustable speed.',
    price: 4850,
    stock: 65,
    imageUrl: 'https://images.unsplash.com/photo-1517646331032-9e8563c520a1?auto=format&fit=crop&q=80&w=800',
    specifications: ['150kg Load Capacity', 'Stainless Steel 304 Finish', '500k Cycles']
  },
  {
    id: '3',
    name: 'Glass-to-Glass 90° Connector',
    category: 'Hardware',
    description: 'Sleek patch fittings for corner glass assemblies. Modern satin finish for premium aesthetics.',
    price: 1250,
    stock: 240,
    imageUrl: 'https://images.unsplash.com/photo-1595841696677-5f806969542a?auto=format&fit=crop&q=80&w=800',
    specifications: ['Zinc Alloy Body', 'Brushed Satin Finish', 'For 10-12mm Glass']
  },
  {
    id: '4',
    name: 'Frosted Privacy Glass',
    category: 'Glass',
    description: 'Chemical etched frosted glass for bathrooms and cabin privacy without losing light.',
    price: 240,
    stock: 450,
    imageUrl: 'https://images.unsplash.com/photo-1595844737410-6750059c258d?auto=format&fit=crop&q=80&w=800',
    specifications: ['8mm/10mm Options', 'Uniform Frosting', 'Easy Clean Surface']
  },
  {
    id: '5',
    name: 'Spider Fitting 4-Way',
    category: 'Hardware',
    description: 'Structural glass hardware for point-fixed curtain walls and large facades.',
    price: 3200,
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=800',
    specifications: ['SS 316 Marine Grade', 'Heavy Duty Support', 'Modern Design']
  }
];
