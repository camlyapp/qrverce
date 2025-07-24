
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl font-headline">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-lg max-w-none text-foreground">
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="font-headline">1. Introduction</h2>
          <p>
            Welcome to CodeMint (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). These Terms of Service (&quot;Terms&quot;) govern your use of our website and the services we provide. By accessing or using our service, you agree to be bound by these Terms.
          </p>

          <h2 className="font-headline">2. Use of Our Service</h2>
          <p>
            You may use our service to generate QR codes and barcodes for personal or commercial use. You agree not to use the service for any unlawful purpose or in any way that could damage, disable, or impair the service.
          </p>

          <h2 className="font-headline">3. User-Generated Content</h2>
          <p>
            You are solely responsible for the content you encode in the QR codes and barcodes you generate. You warrant that you have all necessary rights to use such content and that it does not infringe on the rights of any third party or violate any laws. We do not store your generated codes or the data within them.
          </p>
          
          <h2 className="font-headline">4. Intellectual Property</h2>
          <p>
            The service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of CodeMint and its licensors.
          </p>
          
          <h2 className="font-headline">5. Disclaimers</h2>
          <p>
            Our service is provided &quot;as is&quot; and &quot;as available&quot; without any warranties of any kind, either express or implied. We do not warrant that the generated codes will be scannable or fit for a particular purpose. It is your responsibility to test the codes before use.
          </p>
          
          <h2 className="font-headline">6. Limitation of Liability</h2>
          <p>
            In no event shall CodeMint, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
          </p>
          
          <h2 className="font-headline">7. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page.
          </p>
          
          <h2 className="font-headline">8. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us through the contact link in the footer.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
