import React from 'react';
import { Mail } from 'lucide-react';
import Breadcrumb from '../ui/Breadcrumb';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-surface-100 pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: 'Privacy Policy' }
            ]}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 prose max-w-none">
          <h1 className="text-3xl font-bold text-surface-900 mb-2">PRIDENOMAD HUB PRIVACY POLICY</h1>
          <p className="text-surface-600 mb-8">Effective Date: February 2025</p>

          <div className="space-y-6">
            <p>
              This Privacy Policy governs the online information collection practices of <strong>PrideNomad Hub</strong> ("we" or "us"). 
              It outlines the types of information that we gather about you while you are using the <strong>PRIDENOMADHUB.COM</strong> website 
              (the "Site") and how we use this information.
            </p>

            <p>
              This Privacy Policy, including our children's privacy statement, does not apply to any information you may provide to us or 
              that we may collect offline and/or through other means (for example, at a live event, via telephone, or through the mail).
            </p>

            <h2 className="text-2xl font-bold text-surface-900 mt-8 mb-4">Please Read This Privacy Policy Carefully.</h2>
            <p>
              By visiting and using the Site, you agree that your use of our Site, and any dispute over privacy, is governed by this Privacy Policy. 
              As the Web is an evolving medium, we may need to update our Privacy Policy in the future. If we do so, we will post changes on this 
              page and update the Effective Date. By continuing to use the Site after such changes, you accept the modified Privacy Policy.
            </p>

            <h2 className="text-2xl font-bold text-surface-900 mt-8 mb-4">How We Collect and Use Information</h2>
            <p>
              We may collect and store personal or other information that you voluntarily provide while using the Site, such as signing up for 
              our newsletter, registering for events, or purchasing products. This information may include:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Name and email address for registration or opt-in purposes</li>
              <li>Name, postal address, and payment information for purchases or event registrations</li>
            </ul>

            <p>We may also collect data automatically as you navigate the Site, including:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>IP address and device details</li>
              <li>Browser cookies to track usage patterns and preferences</li>
              <li>Web beacons to analyze site traffic and effectiveness of email communications</li>
            </ul>

            <p>We use this information to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Improve user experience and website functionality</li>
              <li>Deliver targeted advertising and promotional materials</li>
              <li>Communicate with you via email or direct mail</li>
              <li>Share information with third-party service providers to enhance our services</li>
            </ul>

            <h2 className="text-2xl font-bold text-surface-900 mt-8 mb-4">Third-Party Advertisers and Links</h2>
            <p>
              Some advertisers and third-party service providers on our Site may use cookies, web beacons, and similar technologies to collect data. 
              Their data collection practices are governed by their respective privacy policies, which may differ from ours. If you have concerns 
              about third-party data collection, review their privacy policies or opt-out through their respective settings.
            </p>

            <h2 className="text-2xl font-bold text-surface-900 mt-8 mb-4">With Respect to SMS</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>We do not share mobile information with third parties for marketing/promotional purposes.</li>
              <li>SMS data is used solely for customer service and support.</li>
              <li>Text message opt-in data is not shared with any third parties.</li>
            </ul>

            <h2 className="text-2xl font-bold text-surface-900 mt-8 mb-4">Google Analytics and Facebook Advertising</h2>
            <p>We use <strong>Google Analytics</strong> features, including:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Remarketing with Google Analytics</li>
              <li>Google Display Network Impression Reporting</li>
              <li>DoubleClick integrations</li>
              <li>Demographics and Interest Reporting</li>
            </ul>

            <h2 className="text-2xl font-bold text-surface-900 mt-8 mb-4">Children's Privacy Statement</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>This Site is <strong>not directed to children under the age of 13</strong>.</li>
              <li>We do not knowingly collect or distribute personal data from children under 13.</li>
              <li>If we become aware of unauthorized data collection, we will delete the information immediately.</li>
            </ul>

            <h2 className="text-2xl font-bold text-surface-900 mt-8 mb-4">General Data Privacy Regulation (GDPR) Compliance</h2>
            <p>
              The <strong>GDPR</strong> protects data of <strong>European Union (EU) citizens</strong>. Although we do not specifically market 
              to the EU, if you access our Site from within the <strong>European Economic Area (EEA)</strong>, you may request:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Access to or correction of your data</li>
              <li>Deletion of your data ("Right to be Forgotten")</li>
              <li>Restriction or objection to processing of your data</li>
            </ul>

            <p>
              To make any of these requests, contact our GDPR representative at <strong>GDPR@pridenomadhub.com</strong>.
            </p>

            <h2 className="text-2xl font-bold text-surface-900 mt-8 mb-4">How We Store Your Information</h2>
            <p>
              Your data is stored securely and is only accessible to authorized personnel managing our email and content delivery. 
              You can unsubscribe from our mailing lists at any time by clicking the unsubscribe link in our emails.
            </p>

            <h2 className="text-2xl font-bold text-surface-900 mt-8 mb-4">Contact Information</h2>
            <div className="bg-surface-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">PrideNomad Hub</h3>
              <p>1771 Robson Street, Suite 1212<br />Vancouver, BC V6G 3B7 Canada</p>
              <div className="mt-4 flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary-600" />
                <a href="mailto:support@pridenomad.com" className="text-primary-600 hover:text-primary-700">
                  support@pridenomad.com
                </a>
              </div>
              <p className="mt-2">+1 604.210.0630</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}