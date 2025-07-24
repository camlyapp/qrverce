
'use client';

import { useState, useEffect, useRef, type FC } from 'react';
import JsBarcode from 'jsbarcode';
import { Download, Palette, Settings2, Type, Move, Trash2, PlusCircle, Bold, Italic, AlignLeft, AlignCenter, AlignRight, BarChart, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const PRESET_COLORS = [
    "#000000", "#FFFFFF", "#FF5733", "#33FF57", "#3357FF", "#FF33A1",
    "#A133FF", "#33FFA1", "#FFC300", "#C70039", "#900C3F", "#581845"
];

const SUPPORTED_FORMATS = [
    "CODE128", "CODE128A", "CODE128B", "CODE128C",
    "EAN13", "EAN8", "EAN5", "EAN2",
    "UPC", "UPCE",
    "CODE39", "ITF", "ITF14",
    "MSI", "MSI10", "MSI11", "MSI1010", "MSI1110",
    "pharmacode", "codabar"
];

const FORMAT_EXAMPLES: { [key: string]: string } = {
    "CODE128": "Example 1234",
    "CODE128A": "EXAMPLE",
    "CODE128B": "Example 1234",
    "CODE128C": "12345678",
    "EAN13": "978020137962",
    "EAN8": "1234567",
    "EAN5": "12345",
    "EAN2": "12",
    "UPC": "01234567890",
    "UPCE": "0123456",
    "CODE39": "CODE39 EXAMPLE",
    "ITF": "123456",
    "ITF14": "1234567890123",
    "MSI": "123456789",
    "MSI10": "123456789",
    "MSI11": "123456789",
    "MSI1010": "123456789",
    "MSI1110": "123456789",
    "pharmacode": "1234",
    "codabar": "A123456789B"
};


interface ColorInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | string) => void;
  className?: string;
}

const ColorInput: FC<ColorInputProps> = ({ label, value, onChange, className }) => (
  <div className={cn("grid gap-2", className)}>
    <Label htmlFor={`color-input-${label.toLowerCase()}`}>{label}</Label>
    <div className="flex items-center gap-2">
      <div className="relative h-10 w-16">
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-md border"
          style={{ background: value }}
        >
        </div>
        <Input
          id={`color-input-${label.toLowerCase()}`}
          type="color"
          value={value}
          onChange={onChange}
          className="h-full w-full cursor-pointer opacity-0"
        />
      </div>
      <Input
        type="text"
        value={value}
        onChange={onChange}
        className="flex-grow"
        placeholder="#000000"
      />
    </div>
     <div className="flex flex-wrap gap-2 mt-2">
      {PRESET_COLORS.map(color => (
        <button
          key={color}
          type="button"
          className={cn(
            "h-6 w-6 rounded-full border-2",
            value.toLowerCase() === color.toLowerCase() ? "border-ring" : "border-transparent"
          )}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
        />
      ))}
    </div>
  </div>
);


interface BarcodeOptions {
    format: string;
    width: number;
    height: number;
    displayValue: boolean;
    text: string;
    textAlign: 'left' | 'center' | 'right';
    textPosition: 'bottom' | 'top';
    textMargin: number;
    fontSize: number;
    background: string;
    lineColor: string;
    margin: number;
    font: string;
    fontOptions: string;
}

const defaultBarcodeOptions: BarcodeOptions = {
    format: 'CODE128',
    width: 2,
    height: 100,
    displayValue: true,
    text: '',
    textAlign: 'center',
    textPosition: 'bottom',
    textMargin: 2,
    fontSize: 20,
    background: '#ffffff',
    lineColor: '#000000',
    margin: 10,
    font: 'monospace',
    fontOptions: ''
};

export default function BarcodePage() {
    const { toast } = useToast();
    const [barcodeData, setBarcodeData] = useState("Example 1234");
    const [options, setOptions] = useState<BarcodeOptions>(defaultBarcodeOptions);
    const [isValid, setIsValid] = useState(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [scale, setScale] = useState(2);
    
    const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
    const [downloadFormat, setDownloadFormat] = useState<"png" | "jpeg" | "webp">("png");
    const [downloadQuality, setDownloadQuality] = useState(3); // 1-4 scale, corresponds to quality presets


    useEffect(() => {
        const currentScale = window.devicePixelRatio || 2;
        setScale(currentScale);
    }, []);

    const updateOption = (key: keyof BarcodeOptions, value: any) => {
        setOptions(prev => ({...prev, [key]: value}));
    }

    const handleFormatChange = (newFormat: string) => {
        updateOption('format', newFormat);
        if (FORMAT_EXAMPLES[newFormat]) {
            setBarcodeData(FORMAT_EXAMPLES[newFormat]);
        }
    };

     const handleColorChange = (updater: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement> | string) => {
        const value = typeof e === 'string' ? e : e.target.value;
        updater(value);
    }

    useEffect(() => {
        if (canvasRef.current) {
            try {
                 const scaledOptions = {
                    ...options,
                    width: options.width * scale,
                    height: options.height * scale,
                    textMargin: options.textMargin * scale,
                    fontSize: options.fontSize * scale,
                    margin: options.margin * scale,
                };
                JsBarcode(canvasRef.current, barcodeData, {
                    ...scaledOptions,
                    valid: (valid: boolean) => setIsValid(valid)
                });
            } catch (error) {
                setIsValid(false);
            }
        }
    }, [barcodeData, options, scale]);

    const handleDownload = () => {
        setDownloadDialogOpen(false);
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Determine download scale based on quality setting
        const downloadScale = downloadQuality;

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        const scaledOptions = {
            ...options,
            width: options.width * downloadScale,
            height: options.height * downloadScale,
            textMargin: options.textMargin * downloadScale,
            fontSize: options.fontSize * downloadScale,
            margin: options.margin * downloadScale,
        };

        // JsBarcode will set canvas width/height automatically
        JsBarcode(tempCanvas, barcodeData, scaledOptions);
        
        const mimeType = `image/${downloadFormat}`;
        const url = tempCanvas.toDataURL(mimeType, 1.0);
        const link = document.createElement("a");
        link.href = url;
        link.download = `barcode.${downloadFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const fontStyles = options.fontOptions.split(' ');

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 grid md:grid-cols-12 gap-px bg-border md:h-[calc(100vh-129px)]">
        <div className="md:col-span-7 lg:col-span-8 bg-background flex flex-col p-4 sm:p-6 items-center justify-center relative">
            <div className="absolute top-4 right-4 flex items-center gap-2 sm:gap-4">
                <Dialog open={downloadDialogOpen} onOpenChange={setDownloadDialogOpen}>
                  <DialogTrigger asChild>
                     <Button className="w-full sm:w-auto" size="sm" disabled={!isValid}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                     </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[340px]">
                    <DialogHeader>
                      <DialogTitle>Download Barcode</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                          <Label htmlFor="quality-select">Quality</Label>
                          <Select
                            value={downloadQuality.toString()}
                            onValueChange={(v) => setDownloadQuality(Number(v))}
                          >
                            <SelectTrigger id="quality-select" className="w-full">
                              <SelectValue placeholder="Select quality..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Low (1x)</SelectItem>
                              <SelectItem value="2">Medium (2x)</SelectItem>
                              <SelectItem value="4">HD (4x)</SelectItem>
                              <SelectItem value="8">4K (8x)</SelectItem>
                            </SelectContent>
                          </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="format-select">Format</Label>
                        <Select
                          value={downloadFormat}
                          onValueChange={(v) => setDownloadFormat(v as "png" | "jpeg" | "webp")}
                        >
                          <SelectTrigger id="format-select" className="w-full">
                            <SelectValue placeholder="Format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="png">PNG</SelectItem>
                            <SelectItem value="jpeg">JPG</SelectItem>
                            <SelectItem value="webp">WEBP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Confirm
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
            </div>
            <Card className="w-full max-w-2xl shadow-lg">
                <CardHeader>
                    <CardTitle>Barcode Generator</CardTitle>
                    <CardDescription>Create and customize your professional barcode.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="grid gap-2 mb-6">
                        <Label htmlFor="barcode-data" className="font-medium">Data to Encode</Label>
                        <Textarea
                            id="barcode-data"
                            value={barcodeData}
                            onChange={(e) => setBarcodeData(e.target.value)}
                            placeholder="Enter the data for the barcode"
                            className="text-lg"
                        />
                     </div>
                     <div className="w-full p-4 rounded-md flex items-center justify-center bg-white border shadow-inner min-h-[150px]">
                        {barcodeData ? (
                            <canvas ref={canvasRef} className="max-w-full h-auto" />
                        ) : (
                            <p className="text-muted-foreground">Enter data to generate barcode</p>
                        )}
                     </div>
                     {!isValid && barcodeData && (
                        <p className="text-sm text-destructive mt-2">Invalid data for the selected barcode format. Please check the format requirements.</p>
                     )}
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-5 lg:col-span-4 bg-background flex flex-col md:h-[calc(100vh-129px)]">
            <ScrollArea className="flex-grow">
               <Accordion type="single" defaultValue="format" collapsible className="w-full">
                    <AccordionItem value="format" className="border-b-0">
                        <AccordionTrigger className="px-4 sm:px-6 py-4 text-base font-semibold hover:no-underline">
                          <div className="flex items-center">
                            <BarChart className="mr-2 h-5 w-5 text-accent" />
                            Format
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 sm:px-6 space-y-4">
                            <div className="grid gap-2">
                                <Label>Symbology</Label>
                                <Select value={options.format} onValueChange={handleFormatChange}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        {SUPPORTED_FORMATS.map(format => (
                                            <SelectItem key={format} value={format}>{format}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="styling" className="border-b-0">
                        <AccordionTrigger className="px-4 sm:px-6 py-4 text-base font-semibold hover:no-underline">
                          <div className="flex items-center">
                            <Palette className="mr-2 h-5 w-5 text-accent" />
                            Styling
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 sm:px-6 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <ColorInput label="Bar Color" value={options.lineColor} onChange={handleColorChange(v => updateOption('lineColor', v))} />
                                <ColorInput label="Background" value={options.background} onChange={handleColorChange(v => updateOption('background', v))} />
                            </div>
                            <Separator/>
                             <div className="grid gap-4">
                                <div className="grid gap-2">
                                  <Label>Bar Width: {options.width}px</Label>
                                  <Slider value={[options.width]} onValueChange={(v) => updateOption('width', v[0])} min={1} max={4} step={1} />
                                </div>
                                <div className="grid gap-2">
                                  <Label>Height: {options.height}px</Label>
                                  <Slider value={[options.height]} onValueChange={(v) => updateOption('height', v[0])} min={20} max={200} step={5} />
                                </div>
                             </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="text" className="border-b-0">
                        <AccordionTrigger className="px-4 sm:px-6 py-4 text-base font-semibold hover:no-underline">
                           <div className="flex items-center"><Type className="mr-2 h-5 w-5 text-accent"/>Text Options</div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 sm:px-6 space-y-4">
                            <div className="flex items-center space-x-2">
                                <Switch id="display-value" checked={options.displayValue} onCheckedChange={(c) => updateOption('displayValue', c)} />
                                <Label htmlFor="display-value">Display Value</Label>
                            </div>
                            {options.displayValue && (
                                <div className="space-y-4 border-t pt-4">
                                     <div className="grid gap-2">
                                      <Label>Font</Label>
                                      <Select value={options.font} onValueChange={(v) => updateOption('font', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="monospace">Monospace</SelectItem>
                                          <SelectItem value="sans-serif">Sans-Serif</SelectItem>
                                          <SelectItem value="serif">Serif</SelectItem>
                                          <SelectItem value="fantasy">Fantasy</SelectItem>
                                          <SelectItem value="cursive">Cursive</SelectItem>
                                          <SelectItem value="Roboto">Roboto</SelectItem>
                                          <SelectItem value="Open Sans">Open Sans</SelectItem>
                                          <SelectItem value="Lato">Lato</SelectItem>
                                          <SelectItem value="Montserrat">Montserrat</SelectItem>
                                          <SelectItem value="Oswald">Oswald</SelectItem>
                                          <SelectItem value="Raleway">Raleway</SelectItem>
                                          <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                                          <SelectItem value="Dancing Script">Dancing Script</SelectItem>
                                          <SelectItem value="Pacifico">Pacifico</SelectItem>
                                          <SelectItem value="Lobster">Lobster</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Text Align</Label>
                                        <ToggleGroup type="single" value={options.textAlign} onValueChange={(v: 'left' | 'center' | 'right') => v && updateOption('textAlign', v)}>
                                         <ToggleGroupItem value="left" aria-label="Align left"><AlignLeft className="h-4 w-4" /></ToggleGroupItem>
                                         <ToggleGroupItem value="center" aria-label="Align center"><AlignCenter className="h-4 w-4" /></ToggleGroupItem>
                                         <ToggleGroupItem value="right" aria-label="Align right"><AlignRight className="h-4 w-4" /></ToggleGroupItem>
                                       </ToggleGroup>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Text Position</Label>
                                        <Select value={options.textPosition} onValueChange={(v: 'bottom' | 'top') => updateOption('textPosition', v)}>
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="bottom">Bottom</SelectItem>
                                                <SelectItem value="top">Top</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Font Style</Label>
                                       <ToggleGroup type="multiple" value={fontStyles} onValueChange={(v) => updateOption('fontOptions', v.join(' '))}>
                                         <ToggleGroupItem value="bold" aria-label="Toggle bold"><Bold className="h-4 w-4" /></ToggleGroupItem>
                                         <ToggleGroupItem value="italic" aria-label="Toggle italic"><Italic className="h-4 w-4" /></ToggleGroupItem>
                                       </ToggleGroup>
                                    </div>
                                     <div className="grid gap-2">
                                      <Label>Font Size: {options.fontSize}px</Label>
                                      <Slider value={[options.fontSize]} onValueChange={(v) => updateOption('fontSize', v[0])} min={8} max={36} step={1} />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label>Text Margin: {options.textMargin}px</Label>
                                      <Slider value={[options.textMargin]} onValueChange={(v) => updateOption('textMargin', v[0])} min={-10} max={20} step={1} />
                                    </div>
                                </div>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="layout" className="border-b-0">
                        <AccordionTrigger className="px-4 sm:px-6 py-4 text-base font-semibold hover:no-underline">
                           <div className="flex items-center"><Settings2 className="mr-2 h-5 w-5 text-accent"/>Layout</div>
                        </AccordionTrigger>
                         <AccordionContent className="px-4 sm:px-6 space-y-4">
                            <div className="grid gap-2">
                              <Label>Margin: {options.margin}px</Label>
                              <Slider value={[options.margin]} onValueChange={(v) => updateOption('margin', v[0])} min={0} max={100} step={5} />
                            </div>
                         </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </ScrollArea>
        </div>
      </div>
    </div>
  );
}
