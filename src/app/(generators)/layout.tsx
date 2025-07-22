
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Wand2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function GeneratorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = pathname.includes('/barcode') ? 'barcode' : 'qrcode';

  const handleTabChange = (value: string) => {
    router.push(`/${value}`);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
       <header className="sticky top-0 z-30 flex h-auto flex-col items-start gap-4 border-b bg-background px-4 pt-2 sm:px-6">
           <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                 <Wand2 className="h-6 w-6 text-primary" />
                 <h1 className="font-headline text-xl font-bold tracking-tight text-primary">
                   QRCodeMint
                 </h1>
              </div>
           </div>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:w-auto">
                    <TabsTrigger value="qrcode">QR Code</TabsTrigger>
                    <TabsTrigger value="barcode">Barcode</TabsTrigger>
                </TabsList>
            </Tabs>
      </header>
      <div className="flex-grow">{children}</div>
       <footer className="border-t bg-background p-4 text-center text-sm text-muted-foreground shrink-0">
        © {new Date().getFullYear()} QRCodeMint. All rights reserved.
      </footer>
    </div>
  );
}
