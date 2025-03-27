import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Calendar, MapPin, Clock, Users, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  city: string;
  state: string;
  capacity: number;
  price: string;
  imageUrl: string;
  businessName: string;
  category: string;
}

export default function EventListings() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const eventsRef = collection(db, 'events');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const q = query(
          eventsRef,
          where('date', '>=', today.toISOString()),
          orderBy('date', 'asc')
        );

        const querySnapshot = await getDocs(q);
        const eventsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Event[];

        // Only take the first 3 upcoming events
        setEvents(eventsData.slice(0, 3));
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load upcoming events');
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 w-64 bg-surface-200 rounded animate-pulse mx-auto mb-4" />
            <div className="h-6 w-96 bg-surface-200 rounded animate-pulse mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={`skeleton-${i}`} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="h-48 bg-surface-200 animate-pulse" />
                <div className="p-6 space-y-4">
                  <div className="h-6 w-3/4 bg-surface-200 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-surface-200 rounded animate-pulse" />
                  <div className="h-16 bg-surface-200 rounded animate-pulse" />
                  <div className="h-4 w-1/3 bg-surface-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-surface-900 mb-4">
              Upcoming Events
            </h2>
            <p className="text-lg text-surface-600">
              No upcoming events at the moment. Check back soon!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-surface-900 mb-4">
            Upcoming Events
          </h2>
          <p className="text-lg text-surface-600">
            Join the community at these upcoming LGBTQ+ events and celebrations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <Link
              key={event.id}
              to={`/event/${event.id}`}
              className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={event.imageUrl || 'https://images.unsplash.com/photo-1561612217-e5147162fd31?auto=format&fit=crop&q=80&w=1920'}
                  alt={event.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1561612217-e5147162fd31?auto=format&fit=crop&q=80&w=1920';
                  }}
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-surface-900">
                    {event.price ? `$${parseFloat(event.price).toFixed(2)}` : 'Free'}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-500 text-white">
                    {event.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 text-primary-600 text-sm mb-3">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(event.date), 'MMMM d, yyyy')}</span>
                </div>

                <h3 className="text-xl font-semibold text-surface-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {event.title}
                </h3>

                <p className="text-surface-600 mb-4 line-clamp-2">
                  {event.description}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-surface-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{`${event.startTime} - ${event.endTime}`}</span>
                  </div>

                  <div className="flex items-center gap-2 text-surface-600">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{`${event.location}, ${event.city}, ${event.state}`}</span>
                  </div>

                  <div className="flex items-center gap-2 text-surface-600">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">
                      Capacity: {event.capacity}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-surface-500">
                    By {event.businessName}
                  </span>
                  <div className="flex items-center text-primary-600 group-hover:text-primary-700">
                    <span className="text-sm font-medium">View Details</span>
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}