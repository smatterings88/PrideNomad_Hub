import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Hero from './components/Hero';
import Content from './components/Content';
import Footer from './components/Footer';
import EmailVerificationHandler from './components/auth/EmailVerificationHandler';
import BusinessDetails from './components/business/BusinessDetails';
import BusinessOnboarding from './components/business/BusinessOnboarding';
import EditBusiness from './components/business/EditBusiness';
import VerifyBusiness from './components/business/VerifyBusiness';
import DeleteBusiness from './components/business/DeleteBusiness';
import DeleteUnclaimed from './components/business/DeleteUnclaimed';
import ChangeOwner from './components/business/ChangeOwner';
import ViewClaimed from './components/business/ViewClaimed';
import UpdateCategories from './components/admin/UpdateCategories';
import SearchResults from './components/SearchResults';
import CategoryBusinesses from './components/CategoryBusinesses';
import PaymentProcessing from './components/business/PaymentProcessing';
import TierRules from './components/admin/TierRules';
import CSVImport from './components/admin/CSVImport';
import ManageAdmins from './components/admin/ManageAdmins';
import Privacy from './components/pages/Privacy';
import Terms from './components/pages/Terms';
import FavoriteListings from './components/pages/FavoriteListings';
import MyListings from './components/pages/MyListings';
import MyEvents from './components/pages/MyEvents';
import PendingClaims from './components/pages/PendingClaims';
import PaymentHistory from './components/pages/PaymentHistory';
import EventForm from './components/events/EventForm';
import EventDetails from './components/events/EventDetails';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { SkipLink } from './components/ui/SkipLink';
import { CookieConsent } from './components/CookieConsent';
import { OfflineNotice } from './components/ui/OfflineNotice';
import GoogleMapsProvider from './components/GoogleMapsProvider';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <GoogleMapsProvider>
          <SkipLink />
          <Routes>
          {/* Handle Firebase auth action URLs */}
          <Route path="/auth/action" element={<EmailVerificationHandler />} />
          
          {/* Search Results */}
          <Route
            path="/search"
            element={
              <>
                <Header />
                <main id="main-content">
                  <SearchResults />
                </main>
                <Footer />
              </>
            }
          />

          {/* My Listings - Protected Route */}
          <Route
            path="/my-listings"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <main id="main-content">
                    <MyListings />
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />

          {/* My Events - Protected Route */}
          <Route
            path="/my-events"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <main id="main-content">
                    <MyEvents />
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />

          {/* Event Form - Protected Route */}
          <Route
            path="/create-event"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <main id="main-content">
                    <EventForm />
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />

          {/* Event Details */}
          <Route
            path="/event/:id"
            element={
              <>
                <Header />
                <main id="main-content">
                  <EventDetails />
                </main>
                <Footer />
              </>
            }
          />

          {/* Favorite Listings - Protected Route */}
          <Route
            path="/favorite-listings"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <main id="main-content">
                    <FavoriteListings />
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />

          {/* Category Businesses */}
          <Route
            path="/category/:categoryName"
            element={
              <>
                <Header />
                <main id="main-content">
                  <CategoryBusinesses />
                </main>
                <Footer />
              </>
            }
          />
          
          {/* Payment Processing */}
          <Route
            path="/payment"
            element={
              <>
                <Header />
                <main id="main-content">
                  <PaymentProcessing />
                </main>
                <Footer />
              </>
            }
          />

          {/* Pending Claims - Protected Route */}
          <Route
            path="/pending-claims"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <main id="main-content">
                    <PendingClaims />
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />

          {/* Payment History - Protected Route */}
          <Route
            path="/payment-history"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <main id="main-content">
                    <PaymentHistory />
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />

          {/* Privacy Policy */}
          <Route
            path="/privacy"
            element={
              <>
                <Header />
                <main id="main-content">
                  <Privacy />
                </main>
                <Footer />
              </>
            }
          />

          {/* Terms of Service */}
          <Route
            path="/terms"
            element={
              <>
                <Header />
                <main id="main-content">
                  <Terms />
                </main>
                <Footer />
              </>
            }
          />
          
          {/* Business Management Routes - Protected */}
          <Route
            path="/list-business"
            element={
              <ProtectedRoute>
                <>
                  <Header />
                  <main id="main-content">
                    <BusinessOnboarding />
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-business"
            element={
              <ProtectedRoute allowedEmail="mgzobel@icloud.com">
                <>
                  <Header />
                  <main id="main-content">
                    <EditBusiness />
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-business/:id"
            element={
              <ProtectedRoute allowedEmail="mgzobel@icloud.com">
                <>
                  <Header />
                  <main id="main-content">
                    <EditBusiness />
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/verify-business"
            element={
              <ProtectedRoute allowedEmail="mgzobel@icloud.com">
                <>
                  <Header />
                  <main id="main-content">
                    <VerifyBusiness />
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/delete-business"
            element={
              <ProtectedRoute allowedEmail="mgzobel@icloud.com">
                <>
                  <Header />
                  <main id="main-content">
                    <DeleteBusiness />
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/delete-unclaimed"
            element={
              <ProtectedRoute allowedEmail="mgzobel@icloud.com">
                <>
                  <Header />
                  <main id="main-content">
                    <DeleteUnclaimed />
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/change-owner"
            element={
              <ProtectedRoute allowedEmail="mgzobel@icloud.com">
                <>
                  <Header />
                  <main id="main-content">
                    <ChangeOwner />
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/view-claimed"
            element={
              <ProtectedRoute allowedEmail="mgzobel@icloud.com">
                <>
                  <Header />
                  <main id="main-content">
                    <ViewClaimed />
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/update-categories"
            element={
              <ProtectedRoute allowedEmail="mgzobel@icloud.com">
                <>
                  <Header />
                  <main id="main-content">
                    <UpdateCategories />
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-admins"
            element={
              <ProtectedRoute allowedEmail="mgzobel@icloud.com">
                <>
                  <Header />
                  <main id="main-content">
                    <ManageAdmins />
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/tier-rules"
            element={
              <ProtectedRoute allowedEmail="mgzobel@icloud.com">
                <>
                  <Header />
                  <main id="main-content">
                    <TierRules />
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/csv-import"
            element={
              <ProtectedRoute allowedEmail="mgzobel@icloud.com">
                <>
                  <Header />
                  <main id="main-content">
                    <CSVImport />
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />
          
          {/* Business Details Page */}
          <Route
            path="/business/:id/:slug?"
            element={
              <>
                <Header />
                <main id="main-content">
                  <BusinessDetails />
                </main>
                <Footer />
              </>
            }
          />
          
          {/* Home Page */}
          <Route
            path="/"
            element={
              <div className="min-h-screen">
                <Header />
                <main id="main-content">
                  <Hero />
                  <Content />
                </main>
                <Footer />
              </div>
            }
          />
          
          {/* Catch all other routes and redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <CookieConsent />
          <OfflineNotice />
        </GoogleMapsProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;