import React, { useState } from 'react';
import { Shield, Lock, FileText, UserCheck, AlertTriangle, HelpCircle, ArrowLeft, Mail, MapPin, Clock, ExternalLink } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onNavigateHome: () => void;
  onOpenPrivacyRequest?: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigateHome, onOpenPrivacyRequest }) => {
  const [activeTab, setActiveTab] = useState<'notice' | 'inventory' | 'rights' | 'grievance'>('notice');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top Breadcrumb & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </button>
          
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Shield className="w-4 h-4 text-emerald-600" /> Privacy & Data Protection Notice (Version 1.0)
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold tracking-wider uppercase">
              Privacy Notice & Data Protection Policy
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              NEXRA 3D Privacy Compliance Statement
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              In accordance with the Digital Personal Data Protection Act, 2023 (DPDP Act) and the Digital Personal Data Protection Rules, 2025 of India, this notice informs you of how NEXRA 3D ("Data Fiduciary") collects, uses, processes, stores, and protects your personal data.
            </p>
            <div className="pt-2 text-xs text-slate-400">
              <strong>Last Updated:</strong> August 2025 | <strong>Notice Version:</strong> v1.0
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          {[
            { id: 'notice', label: '1. Privacy Notice', icon: FileText },
            { id: 'inventory', label: '2. Data Processing & Inventory', icon: Lock },
            { id: 'rights', label: '3. Data Principal Rights', icon: UserCheck },
            { id: 'grievance', label: '4. Grievance Redressal', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
          
          {/* TAB 1: PRIVACY NOTICE */}
          {activeTab === 'notice' && (
            <div className="space-y-6 text-slate-700 leading-relaxed text-sm sm:text-base">
              <div className="border-l-4 border-indigo-600 pl-4 py-1">
                <h2 className="text-xl font-bold text-slate-900">1. Data Fiduciary Identity & Overview</h2>
                <p className="text-xs text-slate-500">Under Section 5 of the DPDP Act, 2023</p>
              </div>

              <p>
                <strong>NEXRA 3D</strong> ("we", "us", "our") operates as the <strong>Data Fiduciary</strong> responsible for processing personal data provided by customers, visitors, and users ("Data Principals") on the NEXRA 3D platform.
              </p>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3 text-sm">
                <h3 className="font-bold text-slate-900">Data Fiduciary Credentials:</h3>
                <ul className="space-y-2 text-slate-600">
                  <li><strong>Legal Name:</strong> NEXRA 3D High Precision Manufacturing Solutions</li>
                  <li><strong>Registered Lab & Facility Address:</strong> NEXRA 3D Lab, Plot 42, HITECH City Phase 2, Hyderabad, Telangana - 500032, India</li>
                  <li><strong>Primary Privacy Contact Email:</strong> <a href="mailto:privacy@nexra3d.in" className="text-indigo-600 hover:underline">privacy@nexra3d.in</a></li>
                  <li><strong>Official Grievance Officer Email:</strong> <a href="mailto:grievance@nexra3d.in" className="text-indigo-600 hover:underline">grievance@nexra3d.in</a></li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Purpose of Data Collection</h3>
                <p>
                  We collect personal data strictly for specified, lawful, and explicit purposes related to 3D printing e-commerce, custom fabrication, lithophane personalization, delivery logistics, and account management:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To verify user identity and create/manage customer accounts.</li>
                  <li>To process e-commerce orders, customized 3D lithophanes, and payment transactions via secure payment partners (Razorpay).</li>
                  <li>To arrange courier shipping and store pickup dispatch via automated courier partners (Delhivery, NimbusPost).</li>
                  <li>To send transactional notifications, order updates, invoice PDFs, and verification codes (OTP).</li>
                  <li>To respond to custom 3D printing quote requests and engineering consultations.</li>
                  <li>To provide customer support and handle privacy grievances.</li>
                </ul>
              </div>

              <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 space-y-3 text-sm text-amber-900">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Children's Data Protection Policy (Users under 18 Years)
                </div>
                <p>
                  Under Section 9 of the DPDP Act 2023, processing of personal data of children requires verifiable consent from a parent or lawful guardian. NEXRA 3D does not knowingly collect or process personal data of individuals under 18 years without parental consent. Furthermore, we do not engage in behavioral tracking, targeted advertising, or processing that may cause harm to children.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: DATA PROCESSING & INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 text-slate-700 leading-relaxed text-sm sm:text-base">
              <div className="border-l-4 border-indigo-600 pl-4 py-1">
                <h2 className="text-xl font-bold text-slate-900">2. Data Inventory & Data Mapping</h2>
                <p className="text-xs text-slate-500">Comprehensive map of data elements processed by NEXRA 3D</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-900 font-bold uppercase text-xs">
                    <tr>
                      <th className="p-3 border-b">Data Category</th>
                      <th className="p-3 border-b">Data Elements</th>
                      <th className="p-3 border-b">Legal Basis / Purpose</th>
                      <th className="p-3 border-b">Retention Period</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Account Identity</td>
                      <td className="p-3">Name, Email, Password Hash, Phone, Role</td>
                      <td className="p-3">Consent & Order Contract Fulfillment</td>
                      <td className="p-3">Account Duration (Anonymized on deletion request)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Shipping & Billing</td>
                      <td className="p-3">Street Address, City, State, Pincode, Phone, Company, GSTIN</td>
                      <td className="p-3">Order Delivery & Tax/GST Compliance</td>
                      <td className="p-3">7 Years (Mandatory Tax Law Compliance)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Financial / Payments</td>
                      <td className="p-3">Razorpay Order ID, Payment ID, Payment Method (Card/UPI type)</td>
                      <td className="p-3">Payment Settlement & Refund Processing</td>
                      <td className="p-3">7 Years (Razorpay / Banking Compliance)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Custom Uploads (Lithophanes)</td>
                      <td className="p-3">Personal Photographs, 3D CAD Models, Custom Text</td>
                      <td className="p-3">3D Printing Personalization & Rendering</td>
                      <td className="p-3">180 Days Post-Fulfillment (Auto-purged)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Technical & Cookies</td>
                      <td className="p-3">IP Address, User-Agent, Session Tokens, Cookie Preferences</td>
                      <td className="p-3">Platform Security & Fraud Prevention</td>
                      <td className="p-3">30 to 365 Days</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-200 space-y-3">
                <h3 className="font-bold text-indigo-950">Special Privacy Guarantee for Lithophane & Photo Uploads</h3>
                <p className="text-indigo-900 text-sm">
                  Personal photographs uploaded for custom 3D Lithophane lamps or customized products are strictly isolated. NEXRA 3D guarantees:
                </p>
                <ul className="list-disc pl-5 text-indigo-900 text-sm space-y-1">
                  <li>Your uploaded photos are used <strong>exclusively</strong> for producing your specific 3D order.</li>
                  <li>Uploaded photos are <strong>never sold, licensed, or shared</strong> with third parties for marketing or AI training.</li>
                  <li>Photos are stored in encrypted Cloudinary buckets and automatically purged after the retention window.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: DATA PRINCIPAL RIGHTS */}
          {activeTab === 'rights' && (
            <div className="space-y-6 text-slate-700 leading-relaxed text-sm sm:text-base">
              <div className="border-l-4 border-indigo-600 pl-4 py-1">
                <h2 className="text-xl font-bold text-slate-900">3. Rights of the Data Principal</h2>
                <p className="text-xs text-slate-500">Your rights under Sections 11, 12, 13 & 14 of the DPDP Act 2023</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" /> Right to Access Information
                  </h3>
                  <p className="text-xs text-slate-600">
                    You have the right to request a summary of personal data being processed by us, including the identities of all third parties with whom data was shared.
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-indigo-600" /> Right to Correction & Erasure
                  </h3>
                  <p className="text-xs text-slate-600">
                    You have the right to correct inaccurate data, update incomplete details, or request total erasure/anonymization of your profile.
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-indigo-600" /> Right to Withdraw Consent
                  </h3>
                  <p className="text-xs text-slate-600">
                    You may withdraw your consent for non-essential processing (such as marketing emails or analytics) at any time through your Account Privacy Center.
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-indigo-600" /> Right of Grievance Redressal
                  </h3>
                  <p className="text-xs text-slate-600">
                    You have the right to readily available grievance redressal mechanisms regarding any act or omission by NEXRA 3D in relation to your personal data.
                  </p>
                </div>
              </div>

              <div className="bg-slate-100 rounded-xl p-5 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-900">Want to exercise your privacy rights now?</h4>
                  <p className="text-xs text-slate-600">You can download your data archive or submit a formal request directly from your dashboard.</p>
                </div>
                {onOpenPrivacyRequest && (
                  <button
                    onClick={onOpenPrivacyRequest}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Open Account Privacy Center
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: GRIEVANCE REDRESSAL */}
          {activeTab === 'grievance' && (
            <div className="space-y-6 text-slate-700 leading-relaxed text-sm sm:text-base">
              <div className="border-l-4 border-indigo-600 pl-4 py-1">
                <h2 className="text-xl font-bold text-slate-900">4. Grievance Redressal Mechanism & Resolution SLA</h2>
                <p className="text-xs text-slate-500">As mandated under DPDP Rules 2025</p>
              </div>

              <p>
                If you have any questions, concerns, or complaints regarding the processing of your personal data or wish to report a privacy incident, please contact our designated Grievance Officer:
              </p>

              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                    GO
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Grievance Officer — Privacy Desk</h3>
                    <p className="text-xs text-indigo-800">NEXRA 3D High Precision Manufacturing Solutions</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-sm">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Email:</strong> <br />
                      <a href="mailto:grievance@nexra3d.in" className="text-indigo-600 font-semibold hover:underline">grievance@nexra3d.in</a> / <a href="mailto:privacy@nexra3d.in" className="text-indigo-600 font-semibold hover:underline">privacy@nexra3d.in</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Resolution SLA:</strong> <br />
                      Acknowledgement within <strong>24 Hours</strong>. Resolution within <strong>30 Days</strong> max.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:col-span-2">
                    <MapPin className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Office Address:</strong> <br />
                      NEXRA 3D Lab, Plot 42, HITECH City Phase 2, Hyderabad, Telangana - 500032, India
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="text-lg font-bold text-slate-900">Escalation to Data Protection Board of India</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  If your grievance is not resolved by our Grievance Officer within 30 days or if you are dissatisfied with the resolution provided, you have the statutory right under Section 13(4) of the DPDP Act 2023 to register a complaint with the <strong>Data Protection Board of India (DPBI)</strong>.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
