import React from 'react';
import { Mail } from 'lucide-react';
import Breadcrumb from '../ui/Breadcrumb';

export default function Terms() {
  return (
    <div className="min-h-screen bg-surface-100 pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: 'Terms of Service' }
            ]}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 prose max-w-none">
          <h1 className="text-3xl font-bold text-surface-900 mb-2">PRIDENOMAD HUB TERMS OF SERVICE</h1>
          <p className="text-surface-600 mb-8">Effective Date: February 2025</p>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900">General</h2>
            <p>
              This website (the "Site") is owned and operated by <strong>PrideNomad Hub</strong> ("COMPANY" "we" or "us"). 
              By using the Site, you agree to be bound by these Terms of Service and to use the Site in accordance with these 
              Terms of Service, our Privacy Policy, our Refund Policy, and any additional terms and conditions that may apply 
              to specific sections of the Site or to products and services available through the Site. Accessing the Site, in 
              any manner, whether automated or otherwise, constitutes use of the Site and your agreement to be bound by these 
              Terms of Service.
            </p>

            <p>
              We reserve the right to change these Terms of Service or to impose new conditions on the use of the Site at any time. 
              If changes are made, we will post the revised Terms of Service on this website. By continuing to use the Site after 
              such changes, you accept the Terms of Service as modified.
            </p>

            <h2 className="text-2xl font-bold text-surface-900 mt-8">Intellectual Property Rights</h2>
            
            <h3 className="text-xl font-bold text-surface-900">Our Limited License to You</h3>
            <p>
              The Site and all materials available on the Site are the property of <strong>PrideNomad Hub</strong> and/or our 
              affiliates or licensors and are protected by copyright, trademark, and other intellectual property laws. The Site 
              is provided solely for your personal, non-commercial use. You may not use the Site or materials available on it in 
              any way that constitutes infringement of our rights without explicit authorization.
            </p>

            <p>
              You may download and/or print one copy of individual pages of the Site for your personal, non-commercial use, 
              provided you keep all copyright and proprietary notices intact.
            </p>

            <h3 className="text-xl font-bold text-surface-900">Your License to Us</h3>
            <p>
              By posting or submitting any material (e.g., comments, blog entries, social media posts, photos, and videos) 
              to <strong>PrideNomad Hub</strong>, you affirm:
            </p>
            <ol className="list-decimal pl-6 mb-4">
              <li>You are the owner of the material or have explicit consent from the owner.</li>
              <li>You are at least thirteen years of age.</li>
            </ol>

            <h2 className="text-2xl font-bold text-surface-900 mt-8">Limitations on Linking and Framing</h2>
            <p>
              You may link to our Site as long as the link does not imply any sponsorship or endorsement by us. However, 
              you may not frame or inline link any of the content from the Site or incorporate our materials into another 
              service without written permission.
            </p>

            <h2 className="text-2xl font-bold text-surface-900 mt-8">Disclaimer</h2>
            <p>
              We may provide links to third-party sites. These links do not imply endorsement, and we do not control or 
              guarantee the accuracy of information provided by third parties. All opinions, advice, statements, services, 
              and offers from third parties are their own and not those of <strong>PrideNomad Hub</strong>.
            </p>

            <p className="font-bold">
              THE SITE AND ITS CONTENT ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
            </p>

            <h2 className="text-2xl font-bold text-surface-900 mt-8">General Earnings Disclaimer</h2>
            <p>
              We may provide income-related information, but no assurances are made regarding potential earnings. Any 
              statements or examples of earnings are estimates only. Individual results vary and depend on numerous factors, 
              including personal effort and market conditions.
            </p>

            <h2 className="text-2xl font-bold text-surface-900 mt-8">Online Commerce</h2>
            <p>
              Some sections of the Site may offer products and services provided by third parties. We are not responsible 
              for the quality, accuracy, or reliability of these third-party offerings. When making purchases through 
              third-party vendors, you are subject to their terms and privacy policies.
            </p>

            <h2 className="text-2xl font-bold text-surface-900 mt-8">Interactive Features</h2>
            <p>
              The Site may include features like blogs, chat rooms, and bulletin boards, allowing users to interact. 
              You are solely responsible for your postings, and we do not guarantee the accuracy of any user-generated content.
            </p>

            <p>Prohibited uses include:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Impersonating another individual or entity</li>
              <li>Posting harmful, obscene, or defamatory content</li>
              <li>Using the Site for commercial promotions without permission</li>
              <li>Gaining unauthorized access to systems or data</li>
            </ul>

            <h2 className="text-2xl font-bold text-surface-900 mt-8">Registration and Security</h2>
            <p>
              To access certain features, you may be required to provide personal information. You agree to provide accurate 
              information and maintain the confidentiality of your account credentials. If unauthorized use of your account 
              occurs, you must notify us immediately.
            </p>

            <h2 className="text-2xl font-bold text-surface-900 mt-8">Refund Policy</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Membership fees are <strong>non-refundable</strong>.</li>
              <li>Software and other products may have a <strong>30-day refund policy</strong>, unless otherwise stated at the time of purchase.</li>
            </ul>

            <h2 className="text-2xl font-bold text-surface-900 mt-8">Dispute Resolution & Class Action Waiver</h2>
            <p>
              These Terms shall be governed by the laws of <strong>British Columbia, Canada</strong>. Any disputes shall be 
              subject to <strong>binding arbitration in Vancouver, BC</strong>.
            </p>

            <p>
              You agree to resolve disputes individually and waive the right to participate in class actions.
            </p>

            <h2 className="text-2xl font-bold text-surface-900 mt-8">Contact Information</h2>
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