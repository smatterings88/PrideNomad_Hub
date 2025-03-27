import React from 'react';
import { GiftIcon, Home, Heart, Globe } from 'lucide-react';

export default function WhyChooseUs() {
  return (
    <section className="pt-8 pb-24 bg-surface-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-surface-900 mb-8">
            Why List With Us?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="p-6">
              <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <GiftIcon className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-surface-900">Always Free. Always Fabulous.</h3>
              <p className="text-surface-600">Basic listings won't cost you a dime. Because visibility shouldn't come with a price tag</p>
            </div>
            <div className="p-6">
              <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-surface-900">Safe Spaces Matter</h3>
              <p className="text-surface-600">Join businesses committed to creating welcoming environments for our community</p>
            </div>
            <div className="p-6">
              <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-surface-900">Proudly LGBTQ+ Owned</h3>
              <p className="text-surface-600">A directory built by us, for us. Because representation matters.</p>
            </div>
            <div className="p-6">
              <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-surface-900">From Local Love to Global Nomads</h3>
              <p className="text-surface-600">Connect with proud allies, travelers, and neighbors who want to support businesses like yours</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}