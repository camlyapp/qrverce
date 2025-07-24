
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { WandSparkles, Twitter, Github, Dribbble, Palette, Barcode, Wand2, Download } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ModeToggle } from '@/components/mode-toggle';


export default function GeneratorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [year, setYear] = useState<number | string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setYear(new Date().getFullYear());
    setIsClient(true);
  }, []);

  const activeTab = pathname.includes('/barcode') ? 'barcode' : 'qrcode';

  const handleTabChange = (value: string) => {
    router.push(`/${value}`);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
       <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
           <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                 <WandSparkles className="h-6 w-6 text-primary" />
                 <h1 className="font-headline text-xl text-primary">
                   CodeMint
                 </h1>
                {isClient && (
                 <Tabs value={activeTab} onValueChange={handleTabChange} className="ml-4">
                    <TabsList>
                        <TabsTrigger value="qrcode">QR Code</TabsTrigger>
                        <TabsTrigger value="barcode">Barcode</TabsTrigger>
                    </TabsList>
                </Tabs>
                )}
              </div>
              <ModeToggle />
           </div>
      </header>
      <main className="flex-grow">{children}</main>
      <section id="features" aria-labelledby="features-heading" className="bg-background py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 id="features-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
              Your All-in-One Code Generation Hub
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              CodeMint is a powerful, free online tool for creating custom QR codes and professional barcodes. Whether for business, marketing, or personal use, our generator provides advanced styling options to make your codes stand out.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm">
              <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
                <Palette className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Advanced Styling</h3>
              <p className="mt-2 text-muted-foreground">
                Customize colors, gradients, and shapes. Add your logo to create QR codes that match your brand identity perfectly.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm">
              <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
                <Barcode className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Versatile Barcodes</h3>
              <p className="mt-2 text-muted-foreground">
                Supports all major formats like EAN, UPC, and Code128. Control dimensions and text for retail and logistics.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm">
              <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
                 <Wand2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Magic Design AI</h3>
              <p className="mt-2 text-muted-foreground">
                Leverage AI to generate beautiful and scannable QR code designs from a simple text prompt, including logos.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm">
              <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
                <Download className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">High-Quality Export</h3>
              <p className="mt-2 text-muted-foreground">
                Download your final designs in PNG, JPG, SVG, or WEBP formats, ready for both print and digital use.
              </p>
            </div>
          </div>
        </div>
      </section>
       <footer className="border-t bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            © {year} Camly. All rights reserved.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <nav aria-label="Footer navigation" className="flex gap-4 sm:gap-6 text-sm">
              <Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms</Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy</Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link>
            </nav>
            <div className="hidden sm:block h-5 w-px bg-border" />
            <div className="flex gap-4">
              <Link href="#" aria-label="Twitter profile"><Twitter className="h-5 w-5 text-muted-foreground hover:text-foreground" /></Link>
              <Link href="#" aria-label="Github profile"><Github className="h-5 w-5 text-muted-foreground hover:text-foreground" /></Link>
              <Link href="#" aria-label="Dribbble profile"><Dribbble className="h-5 w-5 text-muted-foreground hover:text-foreground" /></Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
