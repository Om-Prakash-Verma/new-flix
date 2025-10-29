
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'DMCA Policy',
  description: 'Our Digital Millennium Copyright Act (DMCA) policy.',
};

export default function DMCA() {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-6">DMCA Policy</h1>
      <div className="space-y-6 text-foreground/80">

        <h2 className="text-xl font-bold pt-4">About {siteConfig.name} & Copyright</h2>
        <p>
            {siteConfig.name} is a free, open-source movie and TV show discovery platform. We do not host, store, upload, or distribute any copyrighted video content. We are purely an information aggregation service that helps users discover content and find information about movies and TV shows.
        </p>
        <p>
            All content information displayed on {siteConfig.name} comes from The Movie Database (TMDb), a legitimate, community-built database that provides publicly available metadata about movies and TV shows.
        </p>

        <h2 className="text-xl font-bold pt-4">What {siteConfig.name} Actually Does</h2>
        <p>To clarify our role in the content ecosystem:</p>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li><strong>Content Discovery:</strong> We display movie and TV show information from TMDb's public API</li>
          <li><strong>External Linking:</strong> We provide links to external video players and streaming services</li>
          <li><strong>Information Aggregation:</strong> We organize and present publicly available content metadata</li>
          <li><strong>No Content Hosting:</strong> We do not store, cache, or serve any video files</li>
          <li><strong>No Content Uploads:</strong> Users cannot upload content to our platform</li>
          <li><strong>No User Accounts:</strong> We have no user-generated content or user profiles</li>
        </ul>

        <h2 className="text-xl font-bold pt-4">DMCA Compliance Statement</h2>
        <p>
            {siteConfig.name} respects intellectual property rights and complies with the Digital Millennium Copyright Act (DMCA). However, since we do not host any copyrighted content, traditional DMCA takedown procedures may not apply directly to our service.
        </p>
        <p>
            If you believe that information displayed on our site infringes your copyright, we will investigate and take appropriate action, which may include removing information or links if warranted.
        </p>

        <h2 className="text-xl font-bold pt-4">External Content & Responsibility</h2>
        <p><strong>Important:</strong> When users click "Play" or similar buttons on {siteConfig.name}, they are directed to external, independent websites and video players. These external sites:</p>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>Are completely independent from {siteConfig.name}</li>
          <li>Host their own content or provide their own streaming services</li>
          <li>Have their own DMCA policies and copyright procedures</li>
          <li>Are responsible for the content they host or stream</li>
          <li>Should be contacted directly for copyright infringement claims</li>
        </ul>
        <p>
            {siteConfig.name} is not responsible for content hosted on external streaming sites. Copyright holders should contact the actual hosting services directly.
        </p>

        <h2 className="text-xl font-bold pt-4">How to File a Copyright Complaint</h2>
        <p>
            If you believe that information or images displayed on {siteConfig.name} infringe your copyright, please provide:
        </p>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>Identification of the copyrighted work claimed to be infringed</li>
          <li>Specific location of the allegedly infringing material on our site</li>
          <li>Your contact information (email, phone, address)</li>
          <li>A statement of good faith belief that the use is not authorized</li>
          <li>A statement that the information is accurate and you are authorized to act</li>
          <li>Your physical or electronic signature</li>
        </ul>
        <p>
            Please send your notice to our designated agent at{' '}
            <a href="mailto:dmca@example.com" className="text-primary underline">
                dmca@example.com
            </a>.
        </p>
        <p>
            <em>Note: Since we only display information and don't host video content, most copyright concerns should be directed to the actual hosting services.</em>
        </p>
        <p className="text-sm">
            Please note that under Section 512(f) of the DMCA, knowingly making false claims may result in liability for damages.
        </p>
        
        <h2 className="text-xl font-bold pt-4">Fair Use & Educational Purpose</h2>
        <p>{siteConfig.name} operates under fair use principles by:</p>
        <ul className="list-disc list-inside space-y-2 pl-4">
            <li>Providing factual information about movies and TV shows</li>
            <li>Using promotional images for identification and information purposes</li>
            <li>Enabling content discovery and education about entertainment media</li>
            <li>Not competing with or replacing the original content</li>
            <li>Operating as a non-commercial, open-source project</li>
        </ul>

      </div>
    </div>
  );
}
