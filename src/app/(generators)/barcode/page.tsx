
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BarcodePage() {
  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 grid md:grid-cols-12 gap-px bg-border md:h-[calc(100vh-129px)]">
        <div className="md:col-span-7 lg:col-span-8 bg-background flex flex-col p-4 sm:p-6 items-center justify-center">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Barcode Generator</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Barcode generation functionality will be implemented here.
                    </p>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-5 lg:col-span-4 bg-background flex flex-col md:h-[calc(100vh-129px)]">
            {/* Barcode options will go here */}
        </div>
      </div>
    </div>
  );
}
