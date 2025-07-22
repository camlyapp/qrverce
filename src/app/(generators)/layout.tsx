
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { WandSparkles } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';


export default function GeneratorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [year, setYear] = useState<number | string>('');

  useEffect(() => {
    setYear(new Date().getFullYear());
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
                 <Tabs value={activeTab} onValueChange={handleTabChange} className="ml-4">
                    <TabsList>
                        <TabsTrigger value="qrcode">QR Code</TabsTrigger>
                        <TabsTrigger value="barcode">Barcode</TabsTrigger>
                    </TabsList>
                </Tabs>
              </div>
           </div>
      </header>
      <div className="flex-grow">{children}</div>
       <footer className="border-t bg-background p-4 text-center text-sm text-muted-foreground shrink-0">
        © {year} CodeMint. All rights reserved.
      </footer>
    </div>
  );
}
