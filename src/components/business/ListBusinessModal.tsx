import React from 'react';
import { X, ArrowRight } from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';

interface ListBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGetStarted: () => void;
}

export default function ListBusinessModal({ isOpen, onClose }: ListBusinessModalProps) {
  const { city } = useGeolocation();
  
  if (!isOpen) return null;

  const handleGetStarted = () => {
    window.location.href = 'https://pridenomad.com/hub-waitlist';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full relative mx-4 my-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-surface-500 hover:text-surface-700 z-10"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-24 h-24 mx-auto mb-4">
                <img
                  src="https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/67a3752a97e2556e95064cac.png"
                  alt="Pride Heart"
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-3xl font-bold text-surface-900 mb-4">
                🌈 Want More LGBTQ+ Customers?
              </h2>
              <p className="text-lg text-surface-600">
                (Of course you do... that's why you're here)
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-surface-50 p-6 rounded-lg">
                <p className="text-surface-700 whitespace-pre-line">
                  Look, we could bore you with a bunch of corporate bullet points...<br/><br/>

                  But here's what you ACTUALLY need to know:<br/><br/>

                  Right this second, LGBTQ+ folks are desperately searching for "LGBTQ+ friendly businesses" in {city || 'your city'}.<br/><br/>

                  And finding nothing but dead links and random Reddit threads.<br/><br/>

                   <strong>That's about to change.</strong>
                </p>
              </div>

              <div className="bg-surface-50 p-6 rounded-lg">
                <p className="text-surface-700 whitespace-pre-line">
                  PrideNomad Hub is becoming THE platform where LGBTQ+ customers find their next favorite business.<br/><br/>

                  (Think Yelp... but for businesses who actually GET IT.)<br/><br/>

                  And right now?<br/><br/>

                  You can <strong>claim your spot</strong> before your competition even knows we exist.<br/><br/>

                  Ready to get <strong>found by customers</strong> who are ACTIVELY searching for you?
                </p>
              </div>
            </div>

            <div className="text-center space-y-4">
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Get Listed (FREE)
                <ArrowRight className="h-5 w-5" />
              </button>
              
              <p className="text-surface-600 italic">
                P.S. Not your average business directory. But you'll see that once you're in. 😉
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}