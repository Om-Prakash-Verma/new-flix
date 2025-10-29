
import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Our Terms of Service for using this website.',
};

export default function TermsOfServicePage() {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="space-y-6 text-foreground/80">

        <h2 className="text-xl font-bold pt-4">About {siteConfig.name}</h2>
        <p>
          {siteConfig.name} is a free, open-source movie and TV show discovery platform. We help you discover content and find information about where to watch it online. We do not host, store, or stream any video content. All video content is provided by external, independent streaming services and video players.
        </p>
        <p>
          {siteConfig.name} is released under the MIT License and is available on GitHub for anyone to review, use, or contribute to.
        </p>

        <h2 className="text-xl font-bold pt-4">Acceptance of Terms</h2>
        <p>
          By accessing and using {siteConfig.name}, you accept and agree to be bound by these terms and conditions. If you do not agree with these terms, please do not use this service. Since {siteConfig.name} requires no account registration, your continued use of the site constitutes acceptance of these terms.
        </p>

        <h2 className="text-xl font-bold pt-4">Service Description</h2>
        <p>
          {siteConfig.name} provides the following services:
        </p>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li><strong>Content Discovery:</strong> Browse and search for movies and TV shows using data from The Movie Database (TMDb)</li>
          <li><strong>Information Display:</strong> View details about movies and TV shows including cast, crew, ratings, and descriptions</li>
          <li><strong>External Links:</strong> Provide links to external video players and streaming services</li>
          <li><strong>Recommendations:</strong> Suggest similar content based on your browsing</li>
        </ul>
        <p>
          <strong>What we do NOT provide:</strong> Video hosting, content streaming, user accounts, paid subscriptions, or content downloads.
        </p>

        <h2 className="text-xl font-bold pt-4">Use License & Restrictions</h2>
        <p>
          Permission is granted to access {siteConfig.name} for personal, non-commercial use. Under this license you may not:
        </p>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>Use automated tools to scrape or download content from our site</li>
          <li>Attempt to reverse engineer or modify our software (though you can view the source code on GitHub)</li>
          <li>Use the service for any illegal activities</li>
          <li>Interfere with or disrupt the service or servers</li>
          <li>Remove copyright or attribution notices</li>
          <li>Use the service for commercial purposes without permission</li>
        </ul>

        <h2 className="text-xl font-bold pt-4">External Content & Third-Party Services</h2>
        <p className="font-bold">
          Important: {siteConfig.name} links to external video players and streaming services that are completely independent from us. When you click "Play" or similar buttons:
        </p>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>You will be directed to external websites.</li>
          <li>These external sites have their own terms of service and privacy policies.</li>
          <li>These external sites may show advertisements that we do not control.</li>
          <li>The quality, availability, and legality of content on external sites is not our responsibility.</li>
          <li>You use external sites at your own risk and subject to their terms.</li>
        </ul>
        <p>
          {siteConfig.name} is not responsible for the content, practices, or policies of external video players or streaming services.
        </p>

        <h2 className="text-xl font-bold pt-4">Content Information & Copyright</h2>
        <p>
          All movie and TV show information displayed on {siteConfig.name} is sourced from The Movie Database (TMDb).
        </p>
        <p>
          We respect copyright and intellectual property rights. If you believe any content infringes your rights, please see our <Link href="/legal/dmca" className="text-primary hover:underline" prefetch={false}>DMCA page</Link>.
        </p>

        <h2 className="text-xl font-bold pt-4">User Responsibilities</h2>
        <p>
          As a user of {siteConfig.name}, you are responsible for:
        </p>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>Ensuring your use complies with local laws and regulations</li>
          <li>Understanding that external streaming sites may have different legal requirements</li>
          <li>Using appropriate ad blockers and security tools when visiting external sites</li>
          <li>Not engaging in any activity that could harm or interfere with the service</li>
          <li>Respecting the intellectual property rights of content creators</li>
        </ul>

        <h2 className="text-xl font-bold pt-4">Disclaimer of Warranties</h2>
        <p>
          {siteConfig.name} is provided "as is" without any warranties, expressed or implied. We make no warranties regarding:
        </p>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>The accuracy or completeness of content information</li>
          <li>The availability or quality of external streaming services</li>
          <li>The security or safety of external websites</li>
          <li>Uninterrupted or error-free service</li>
          <li>The legality of content on external sites in your jurisdiction</li>
        </ul>

        <h2 className="text-xl font-bold pt-4">Limitation of Liability</h2>
        <p>
          {siteConfig.name} and its contributors shall not be liable for any damages arising from:
        </p>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>Use of external streaming services or video players</li>
          <li>Advertisements or malware from external sites</li>
          <li>Inaccurate or outdated content information</li>
          <li>Service interruptions or technical issues</li>
          <li>Any legal issues arising from your use of external streaming services</li>
        </ul>

        <h2 className="text-xl font-bold pt-4">Changes to Terms</h2>
        <p>
          We may update these terms of service as needed. Changes will be posted on this page. Your continued use of {siteConfig.name} after changes constitutes acceptance of the new terms.
        </p>
      </div>
    </div>
  );
}
