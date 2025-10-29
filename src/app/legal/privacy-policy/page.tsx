
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Our Privacy Policy for using this website.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="space-y-6 text-foreground/80">
        <h2 className="text-xl font-bold pt-4">About {siteConfig.name}</h2>
        <p>
          {siteConfig.name} is a free, open-source movie and TV show discovery platform. We help you discover content and find where to watch it online. We do not host any video content ourselves - we simply provide information about movies and TV shows using The Movie Database (TMDb) API and link to external streaming sources.
        </p>
        <p>
          <strong>No Account Required:</strong> {siteConfig.name} does not require user registration, login, or any personal account creation. You can browse and discover content completely anonymously.
        </p>

        <h2 className="text-xl font-bold pt-4">Information We Collect</h2>
        <p>
          Since {siteConfig.name} has no user accounts or registration system, we collect minimal information:
        </p>
        <ul className="list-disc list-inside space-y-2 pl-4">
            <li><strong>Basic Analytics:</strong> We use privacy-focused analytics to understand general usage patterns like page views and popular content. This data is anonymized and does not identify individual users.</li>
            <li><strong>Technical Data:</strong> Standard web server logs including IP addresses, browser type, and timestamps for security and performance monitoring.</li>
            <li><strong>Cookies:</strong> Essential cookies for basic website functionality and analytics. No tracking or advertising cookies.</li>
        </ul>
        <p>
          We do NOT collect: Names, email addresses, passwords, payment information, personal profiles, or any personally identifiable information.
        </p>

        <h2 className="text-xl font-bold pt-4">How We Use Information</h2>
        <p>
          The limited information we collect is used solely to:
        </p>
        <ul className="list-disc list-inside space-y-2 pl-4">
            <li>Maintain and improve website performance</li>
            <li>Understand which content is popular to improve recommendations</li>
            <li>Detect and prevent technical issues or abuse</li>
            <li>Comply with legal requirements if necessary</li>
        </ul>

        <h2 className="text-xl font-bold pt-4">Third-Party Services & External Content</h2>
        <p>
          {siteConfig.name} integrates with several external services:
        </p>
        <h3 className="font-semibold pt-2">Content Information</h3>
        <ul className="list-disc list-inside space-y-2 pl-4">
            <li><strong>The Movie Database (TMDb):</strong> We fetch all movie and TV show information from TMDb's public API. Review their privacy policy at themoviedb.org.</li>
        </ul>
        <h3 className="font-semibold pt-2">External Video Players</h3>
        <p>
          When you choose to watch content, you'll be directed to external video players and streaming sites. These external sites:
        </p>
        <ul className="list-disc list-inside space-y-2 pl-4">
            <li>Have their own privacy policies and terms of service</li>
            <li>May show advertisements (we have no control over these ads)</li>
            <li>May collect their own analytics and user data</li>
            <li>Are completely independent from {siteConfig.name}</li>
        </ul>
        <p>
          <strong>Important:</strong> {siteConfig.name} is not responsible for the privacy practices of external video players or streaming sites.
        </p>
        
        <h2 className="text-xl font-bold pt-4">Data Sharing</h2>
        <p>
          We do not sell, trade, or share any user data with third parties. The only data sharing that occurs is:
        </p>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>Anonymized analytics data processed by our analytics provider</li>
          <li>Standard web requests to TMDb API for content information</li>
          <li>Legal compliance if required by law enforcement</li>
        </ul>

        <h2 className="text-xl font-bold pt-4">Data Security & Retention</h2>
        <p>
          Since we don't collect personal data, security risks are minimal. However, we:
        </p>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>Use HTTPS encryption for all connections</li>
          <li>Regularly update our systems and dependencies</li>
          <li>Store minimal data for the shortest time necessary</li>
          <li>Delete server logs after a reasonable period</li>
        </ul>
        
        <h2 className="text-xl font-bold pt-4">Your Rights & Control</h2>
        <p>
          Since {siteConfig.name} doesn't require accounts or collect personal information, there's minimal data to control. However:
        </p>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li><strong>Cookies:</strong> You can disable cookies in your browser settings (may affect functionality)</li>
          <li><strong>Analytics:</strong> You can opt out of analytics by using ad blockers or privacy tools</li>
          <li><strong>Access:</strong> You can browse completely anonymously without creating any account</li>
          <li><strong>Data Deletion:</strong> Since we don't store personal data, there's nothing to delete</li>
        </ul>

        <h2 className="text-xl font-bold pt-4">Advertising</h2>
        <p>
          {siteConfig.name} itself is completely ad-free. However, when you visit external video players or streaming sites that we link to, those sites may display their own advertisements. We have no control over these external ads and are not responsible for their content or privacy practices.
        </p>

        <h2 className="text-xl font-bold pt-4">Children's Privacy</h2>
        <p>
          Since {siteConfig.name} doesn't collect personal information from anyone, including children under 13, we are inherently compliant with children's privacy requirements. Parents should supervise their children's use of external streaming sites that we link to.
        </p>

        <h2 className="text-xl font-bold pt-4">Changes to Privacy Policy</h2>
        <p>
          We may update this privacy policy to reflect changes in our practices or legal requirements. Updates will be posted on this page.
        </p>
      </div>
    </div>
  );
}
