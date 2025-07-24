
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { WandSparkles, Twitter, Github, Dribbble } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ModeToggle } from '@/components/mode-toggle';


export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [year, setYear] = useState<number | string>('');

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
       <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
           <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                 <WandSparkles className="h-6 w-6 text-primary" />
                 <h1 className="font-headline text-xl text-primary">
                   <Link href="/">CodeMint</Link>
                 </h1>
              </div>
              <ModeToggle />
           </div>
      </header>
      <div className="flex-grow bg-background">{children}</div>
       <footer className="border-t bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            © {year} Camly. All rights reserved.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <nav className="flex gap-4 sm:gap-6 text-sm">
              <Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms</Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy</Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link>
            </nav>
            <div className="hidden sm:block h-5 w-px bg-border" />
            <div className="flex gap-4">
              <Link href="#"><Twitter className="h-5 w-5 text-muted-foreground hover:text-foreground" /></Link>
              <Link href="#"><Github className="h-5 w-5 text-muted-foreground hover:text-foreground" /></Link>
              <Link href="#"><Dribbble className="h-5 w-5 text-muted-foreground hover:text-foreground" /></Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
