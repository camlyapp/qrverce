
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl font-headline">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-lg max-w-none text-foreground">
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="font-headline">1. Information We Collect</h2>
          <p>
            We do not collect or store any personal information or data you enter to generate QR codes or barcodes. All data processing happens in your browser, and your information is not sent to our servers.
          </p>

          <h2 className="font-headline">2. How We Use Information</h2>
          <p>
            Since we do not collect any personal information, we do not use it for any purpose. We may collect anonymous usage statistics to improve our service, but this will not include any personal data.
          </p>

          <h2 className="font-headline">3. Data Storage</h2>
          <p>
            We do not store the QR codes, barcodes, or the data you encode within them. The generated assets are for you to download directly. We do not keep a copy.
          </p>
          
          <h2 className="font-headline">4. Third-Party Services</h2>
          <p>
            Our website may contain links to other websites. We are not responsible for the privacy practices of other websites. We encourage you to be aware when you leave our site and to read the privacy statements of each and every website that collects personally identifiable information.
          </p>
          
          <h2 className="font-headline">5. Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
          </p>
          
          <h2 className="font-headline">6. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us through the contact link in the footer.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
