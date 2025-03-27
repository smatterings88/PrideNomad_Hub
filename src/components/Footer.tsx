import React from 'react';
import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-surface-900 text-surface-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4 flex items-center">
              <img 
                src="https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/677fafb9f30fd15d312fcafd.png" 
                alt="Logo"
                className="h-8 w-auto"
              />
              <span className="ml-2 text-white text-xs px-2 py-1 bg-primary-600 rounded-md">Beta</span>
            </div>
            <p className="text-sm text-surface-400">
              Connecting businesses and opportunities worldwide
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-primary-400">Home</Link></li>
              <li><Link to="/#categories" className="hover:text-primary-400">Categories</Link></li>
              <li><Link to="/search" className="hover:text-primary-400">Search</Link></li>
              <li><Link to="/privacy" className="hover:text-primary-400">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary-400">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
            <ul className="space-y-2">
              <li><Link to="/category/accommodations" className="hover:text-primary-400">Accommodations</Link></li>
              <li><Link to="/category/dining-and-leisure" className="hover:text-primary-400">Dining & Leisure</Link></li>
              <li><Link to="/category/professional-services" className="hover:text-primary-400">Professional Services</Link></li>
              <li><Link to="/category/health-and-wellness" className="hover:text-primary-400">Health & Wellness</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-primary-400" />
                <a href="mailto:support@pridenomad.com" className="hover:text-primary-400">
                  support@pridenomad.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-surface-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-surface-400">
            <p>&copy; {new Date().getFullYear()} PrideNomad Hub. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="hover:text-primary-400">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary-400">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}