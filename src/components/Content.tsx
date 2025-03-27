import React from 'react';
import Categories from './Categories';
import FeaturedBusinesses from './FeaturedBusinesses';
import EventListings from './EventListings';
import WhyChooseUs from './WhyChooseUs';
import { TickerTape } from './TickerTape';

export default function Content() {
  return (
    <div className="bg-gray-50">
      <Categories />
      <FeaturedBusinesses />
      <EventListings />
      <WhyChooseUs />
      <TickerTape />
    </div>
  );
}