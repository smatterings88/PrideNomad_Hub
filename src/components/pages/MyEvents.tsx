import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { Calendar, MapPin, Clock, Users, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import Breadcrumb from '../ui/Breadcrumb';

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
}

export default function MyEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyEvents = async () => {
      if (!auth.currentUser) return;

      try {
        const eventsRef = collection(db, 'events');
        const q = query(
          eventsRef,
          where('userId', '==', auth.currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const eventsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Event[];

        // Sort events by date
        eventsData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setEvents(eventsData);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load your events');
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-100 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="h-48 bg-surface-200" />
                <div className="p-6 space-y-4">
                  <div className="h-6 w-3/4 bg-surface-200 rounded" />
                  <div className="h-4 w-1/2 bg-surface-200 rounded" />
                  <div className="h-16 bg-surface-200 rounded" />
                  <div className="h-4 w-1/3 bg-surface-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-100 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: 'My Events' }
            ]}
          />
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-surface-900">My Events</h1>
            <p className="text-surface-600 mt-2">
              {events.length === 0 
                ? 'You haven\'t created any events yet.'
                : `You have ${events.length} event${events.length === 1 ? '' : 's'}`
              }
            </p>
          </div>
          <Link
            to="/create-event"
            className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
          >
            Create New Event
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Calendar className="h-12 w-12 text-surface-400 mx-auto mb-4" />
            <p className="text-surface-600 mb-4">
              Start by creating your first event to engage with the community.
            </p>
            <Link 
              to="/create-event" 
              className="inline-block bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              Create Event
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {events.map((event) => (
              <Link
                key={event.id}
                to={`/event/${event.id}`}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-64 h-48 md:h-auto">
                    <img
                      src={event.imageUrl || 'https://images.unsplash.com/photo-1561612217-e5147162fd31?auto=format&fit=crop&q=80&w=1920'}
                      alt={event.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1561612217-e5147162fd31?auto=format&fit=crop&q=80&w=1920';
                      }}
                    />
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex flex-col h-full">
                      <div className="mb-4">
                        <div className="flex items-center gap-2 text-primary-600 text-sm mb-2">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(event.date), 'MMMM d, yyyy')}</span>
                        </div>
                        <h2 className="text-xl font-semibold text-surface-900 mb-2">
                          {event.title}
                        </h2>
                        <p className="text-surface-600 line-clamp-2 mb-4">
                          {event.description}
                        </p>
                      </div>
                      <div className="mt-auto space-y-2">
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
                          <span className="text-sm">Capacity: {event.capacity}</span>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-lg font-semibold text-surface-900">
                            {event.price ? `$${parseFloat(event.price).toFixed(2)}` : 'Free'}
                          </span>
                          <div className="flex items-center text-primary-600 group-hover:text-primary-700">
                            <span className="text-sm font-medium">View Details</span>
                            <ExternalLink className="h-4 w-4 ml-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}