
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Our Cookie Policy for using this website.',
};

export default function CookiePolicyPage() {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>
      <div className="space-y-6 text-foreground/80">
        
        <h2 className="text-xl font-bold pt-4">About {siteConfig.name} & Cookies</h2>
        <p>
            {siteConfig.name} is a free, open-source movie and TV show discovery platform that requires no user accounts or personal information. We use minimal cookies to ensure the website functions properly and to understand general usage patterns through privacy-focused analytics.
        </p>
        <p>
            <strong>No Tracking:</strong> We do not use tracking cookies, advertising cookies, or any cookies that identify individual users across sessions or websites.
        </p>

        <h2 className="text-xl font-bold pt-4">What Are Cookies?</h2>
        <p>
            Cookies are small text files stored on your device when you visit websites. They help websites remember information about your visit, such as your preferred settings or browsing session. Cookies cannot access other files on your device or install software.
        </p>

        <h2 className="text-xl font-bold pt-4">How {siteConfig.name} Uses Cookies</h2>
        <p>
            {siteConfig.name} uses cookies for essential functionality and privacy-focused analytics only:
        </p>
        <h3 className="font-semibold pt-2">Essential Cookies</h3>
        <ul className="list-disc list-inside space-y-2 pl-4">
            <li>Theme preferences (dark/light mode)</li>
            <li>Basic website functionality</li>
            <li>Security and error prevention</li>
            <li>Session management for browsing</li>
        </ul>
        <h3 className="font-semibold pt-2">Analytics Cookies</h3>
        <p>
            We use privacy-focused analytics services that:
        </p>
        <ul className="list-disc list-inside space-y-2 pl-4">
            <li>Collect anonymized usage statistics (page views, popular content)</li>
            <li>Do not track individual users or create user profiles</li>
            <li>Do not use persistent identifiers across sessions</li>
            <li>Help us understand which content is popular to improve recommendations</li>
        </ul>
        
        <h2 className="text-xl font-bold pt-4">What We DON'T Use</h2>
        <p>
            {siteConfig.name} explicitly does NOT use:
        </p>
        <ul className="list-disc list-inside space-y-2 pl-4">
            <li>Advertising Cookies: No ads means no advertising tracking</li>
            <li>Social Media Cookies: No social media integration or tracking</li>
            <li>User Profile Cookies: No user accounts means no profile tracking</li>
            <li>Cross-Site Tracking: We don't track you across other websites</li>
            <li>Persistent User IDs: No unique identifiers tied to individuals</li>
            <li>Marketing Cookies: No marketing or remarketing functionality</li>
        </ul>

        <h2 className="text-xl font-bold pt-4">External Website Cookies</h2>
        <p>
            <strong>Important:</strong> When you click to watch content, you'll be directed to external video players and streaming sites. These external sites:
        </p>
        <ul className="list-disc list-inside space-y-2 pl-4">
            <li>Have their own cookie policies and privacy practices</li>
            <li>May use advertising cookies and tracking technologies</li>
            <li>May collect personal information and create user profiles</li>
            <li>Are completely independent from {siteConfig.name}</li>
        </ul>
        <p>
            {siteConfig.name} has no control over cookies used by external streaming sites. Please review their individual cookie policies and privacy settings.
        </p>

        <h2 className="text-xl font-bold pt-4">Managing Your Cookie Preferences</h2>
        <h3 className="font-semibold pt-2">Browser Settings</h3>
        <p>
            You can control cookies through your browser settings.
        </p>

        <h2 className="text-xl font-bold pt-4">Updates to This Policy</h2>
        <p>
            We may update this Cookie Policy to reflect changes in our practices or legal requirements. Updates will be posted on this page.
        </p>
      </div>
    </div>
  );
}
