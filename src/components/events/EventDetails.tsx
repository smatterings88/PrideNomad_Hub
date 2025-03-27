import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Calendar, MapPin, Clock, Users, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import BusinessComments from '../business/components/BusinessComments';
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
  businessId: string;
  category: string;
}

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      try {
        const eventRef = doc(db, 'events', id);
        const eventDoc = await getDoc(eventRef);

        if (eventDoc.exists()) {
          setEvent({
            id: eventDoc.id,
            ...eventDoc.data()
          } as Event);
        } else {
          setError('Event not found');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-100 pt-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-surface-200 rounded" />
            <div className="h-64 bg-surface-200 rounded" />
            <div className="h-8 w-3/4 bg-surface-200 rounded" />
            <div className="h-4 w-1/2 bg-surface-200 rounded" />
            <div className="h-32 bg-surface-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-surface-100 pt-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-surface-900 mb-2">
            {error || 'Event not found'}
          </h2>
          <p className="text-surface-600">
            The event you're looking for might have been removed or is temporarily unavailable.
          </p>
          <Link to="/" className="mt-4 inline-block text-primary-600 hover:text-primary-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-100 pt-24">
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: 'Events', href: '/' },
              { label: event.title }
            ]}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="relative h-96">
            <img
              src={event.imageUrl || 'https://images.unsplash.com/photo-1561612217-e5147162fd31?auto=format&fit=crop&q=80&w=1920'}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1561612217-e5147162fd31?auto=format&fit=crop&q=80&w=1920';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-center gap-2 text-white/80 mb-2">
                <Calendar className="h-5 w-5" />
                <span>{format(new Date(event.date), 'MMMM d, yyyy')}</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">{event.title}</h1>
              <div className="flex items-center gap-4 text-white/90">
                <span className="px-3 py-1 rounded-full text-sm bg-primary-500">
                  {event.category}
                </span>
                <span className="text-lg">
                  {event.price ? `$${parseFloat(event.price).toFixed(2)}` : 'Free'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h2 className="text-2xl font-semibold text-surface-900 mb-4">About This Event</h2>
                <p className="text-surface-600 whitespace-pre-line mb-6">
                  {event.description}
                </p>

                <Link 
                  to={`/business/${event.businessId}`}
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
                >
                  <Building2 className="h-5 w-5" />
                  <span>Hosted by {event.businessName}</span>
                </Link>
              </div>

              <div className="space-y-6">
                <div className="bg-surface-50 rounded-lg p-6">
                  <h3 className="font-semibold text-surface-900 mb-4">Event Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-surface-600">
                      <Calendar className="h-5 w-5" />
                      <span>{format(new Date(event.date), 'MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-surface-600">
                      <Clock className="h-5 w-5" />
                      <span>{`${event.startTime} - ${event.endTime}`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-surface-600">
                      <MapPin className="h-5 w-5" />
                      <span>{`${event.location}, ${event.city}, ${event.state}`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-surface-600">
                      <Users className="h-5 w-5" />
                      <span>Capacity: {event.capacity}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <BusinessComments businessId={event.id} />
        </div>
      </div>
    </div>
  );
}