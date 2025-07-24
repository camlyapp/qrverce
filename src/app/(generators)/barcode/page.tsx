
'use client';

import { useState, useEffect, useRef, type FC } from 'react';
import JsBarcode from 'jsbarcode';
import { Download, Palette, Settings2, Type, Move, Trash2, PlusCircle, Bold, Italic, AlignLeft, AlignCenter, AlignRight, BarChart, Loader, ImagePlus } from 'lucide-react';
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

interface ImageOverlay {
  id: number;
  src: string;
  name: string;
  htmlImage: HTMLImageElement;
  width: number;
  height: number;
  rotation: number;
  position: { x: number; y: number };
}

type DragMode = 'move' | 'resize-br' | 'rotate';

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
    const barcodeCanvasRef = useRef<HTMLCanvasElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
    const [scale, setScale] = useState(2);
    
    const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
    const [downloadFormat, setDownloadFormat] = useState<"png" | "jpeg" | "webp">("png");
    const [downloadQuality, setDownloadQuality] = useState(4); // 1-8 scale, corresponds to quality presets

    const [imageOverlays, setImageOverlays] = useState<ImageOverlay[]>([]);
    const [activeOverlayId, setActiveOverlayId] = useState<number | null>(null);
    const [activeOverlayType, setActiveOverlayType] = useState<'image' | null>(null);

    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [dragMode, setDragMode] = useState<DragMode>('move');

    const activeImageOverlay = activeOverlayType === 'image' ? imageOverlays.find(o => o.id === activeOverlayId) : undefined;


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

    const drawBarcode = (canvas: HTMLCanvasElement, currentOpts: BarcodeOptions, currentData: string, currentScale: number) => {
        try {
            const scaledOptions = {
                ...currentOpts,
                width: currentOpts.width * currentScale,
                height: currentOpts.height * currentScale,
                textMargin: currentOpts.textMargin * currentScale,
                fontSize: currentOpts.fontSize * currentScale,
                margin: currentOpts.margin * currentScale,
            };
            JsBarcode(canvas, currentData, {
                ...scaledOptions,
                valid: (valid: boolean) => setIsValid(valid)
            });
        } catch (error) {
            setIsValid(false);
        }
    }
    
    const drawImageOverlay = (ctx: CanvasRenderingContext2D, overlay: ImageOverlay) => {
      ctx.save();
      ctx.translate(overlay.position.x, overlay.position.y);
      ctx.rotate((overlay.rotation * Math.PI) / 180);
      ctx.drawImage(overlay.htmlImage, -overlay.width / 2, -overlay.height / 2, overlay.width, overlay.height);

      if (activeOverlayId === overlay.id && activeOverlayType === 'image') {
        ctx.strokeStyle = '#09f';
        ctx.lineWidth = 2; // Keep handles consistent regardless of scale
        ctx.strokeRect(-overlay.width / 2, -overlay.height / 2, overlay.width, overlay.height);

        // Draw resize handle
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(overlay.width / 2, overlay.height / 2, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Draw rotation handle
        ctx.beginPath();
        ctx.moveTo(0, -overlay.height/2);
        ctx.lineTo(0, -overlay.height/2 - 20);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, -overlay.height/2 - 20, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    const drawOverlays = () => {
        const overlayCanvas = overlayCanvasRef.current;
        const barcodeCanvas = barcodeCanvasRef.current;
        if (!overlayCanvas || !barcodeCanvas) return;

        const overlayCtx = overlayCanvas.getContext('2d');
        if (!overlayCtx) return;

        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        imageOverlays.forEach(o => drawImageOverlay(overlayCtx, o));
    };


    useEffect(() => {
        const barcodeCanvas = barcodeCanvasRef.current;
        const overlayCanvas = overlayCanvasRef.current;
        if (barcodeCanvas && overlayCanvas) {
            drawBarcode(barcodeCanvas, options, barcodeData, scale);
            // Sync overlay canvas size
            overlayCanvas.width = barcodeCanvas.width;
            overlayCanvas.height = barcodeCanvas.height;
            drawOverlays();
        }
    }, [barcodeData, options, scale]);
    
    useEffect(() => {
        drawOverlays();
    }, [imageOverlays, activeOverlayId]);


    const handleDownload = () => {
        setDownloadDialogOpen(false);
        const barcodeCanvas = barcodeCanvasRef.current;
        if (!barcodeCanvas) return;

        const downloadScale = downloadQuality;

        const tempBarcodeCanvas = document.createElement('canvas');
        drawBarcode(tempBarcodeCanvas, options, barcodeData, downloadScale);
        
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = tempBarcodeCanvas.width;
        finalCanvas.height = tempBarcodeCanvas.height;
        const finalCtx = finalCanvas.getContext('2d');
        if (!finalCtx) return;
        
        finalCtx.drawImage(tempBarcodeCanvas, 0, 0);

        const overlayScaleFactor = tempBarcodeCanvas.width / barcodeCanvas.width;

        imageOverlays.forEach(o => {
            const scaledOverlay = {
                ...o,
                position: {
                    x: o.position.x * overlayScaleFactor,
                    y: o.position.y * overlayScaleFactor
                },
                width: o.width * overlayScaleFactor,
                height: o.height * overlayScaleFactor,
                fontSize: (o as any).fontSize ? (o as any).fontSize * overlayScaleFactor : undefined
            };
            drawImageOverlay(finalCtx, scaledOverlay);
        });
        
        const mimeType = `image/${downloadFormat}`;
        const url = finalCanvas.toDataURL(mimeType, 1.0);
        const link = document.createElement("a");
        link.href = url;
        link.download = `barcode.${downloadFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const fontStyles = options.fontOptions.split(' ');
    
    const updateImageOverlay = (id: number, updates: Partial<ImageOverlay>) => {
        setImageOverlays(overlays => overlays.map(o => o.id === id ? { ...o, ...updates } : o));
    };

    const addImageOverlay = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const overlayCanvas = overlayCanvasRef.current;
        if (file && overlayCanvas) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new window.Image();
            img.onload = () => {
              const newId = Date.now();
              const newOverlay: ImageOverlay = {
                id: newId,
                src: img.src,
                name: file.name,
                htmlImage: img,
                width: 100,
                height: (img.height / img.width) * 100,
                rotation: 0,
                position: { x: overlayCanvas.width / 2, y: overlayCanvas.height / 2 },
              };
              setImageOverlays(overlays => [...overlays, newOverlay]);
              setActiveOverlayId(newId);
              setActiveOverlayType('image');
            };
            img.src = event.target?.result as string;
          };
          reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const deleteImageOverlay = (id: number) => {
        setImageOverlays(overlays => overlays.filter(o => o.id !== id));
        if (activeOverlayId === id) {
          setActiveOverlayId(null);
          setActiveOverlayType(null);
        }
    };
    
    const handleInteractionStart = (clientX: number, clientY: number) => {
        const canvas = overlayCanvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = (clientX - rect.left) * (canvas.width / rect.width);
        const y = (clientY - rect.top) * (canvas.height / rect.height);

        const clickedImageOverlay = [...imageOverlays].reverse().find(overlay => {
            const cx = overlay.position.x;
            const cy = overlay.position.y;
            const angle = overlay.rotation * (Math.PI / 180);
            
            const dx = x - cx;
            const dy = y - cy;
            const rotatedX = dx * Math.cos(-angle) - dy * Math.sin(-angle);
            const rotatedY = dx * Math.sin(-angle) + dy * Math.cos(-angle);
            
            const handleSize = 8;
            const resizeHandleX = overlay.width / 2;
            const resizeHandleY = overlay.height / 2;
            if (Math.sqrt((rotatedX - resizeHandleX)**2 + (rotatedY - resizeHandleY)**2) < handleSize) {
              setDragMode('resize-br');
              return true;
            }

            const rotationHandleY = -overlay.height / 2 - 20;
            if (Math.sqrt(rotatedX**2 + (rotatedY - rotationHandleY)**2) < handleSize) {
              setDragMode('rotate');
              return true;
            }

            if (rotatedX >= -overlay.width / 2 && rotatedX <= overlay.width / 2 && rotatedY >= -overlay.height / 2 && rotatedY <= overlay.height / 2) {
              setDragMode('move');
              return true;
            }

            return false;
        });

        if (clickedImageOverlay) {
          setActiveOverlayId(clickedImageOverlay.id);
          setActiveOverlayType('image');
          setIsDragging(true);
          if (dragMode === 'move') {
            setDragStart({ x: x - clickedImageOverlay.position.x, y: y - clickedImageOverlay.position.y });
          } else {
            setDragStart({ x, y });
          }
          return;
        }

        setActiveOverlayId(null);
        setActiveOverlayType(null);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      handleInteractionStart(e.clientX, e.clientY);
    };
    
    const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (e.touches.length > 0) {
        handleInteractionStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    useEffect(() => {
      let animationFrameId: number;
      const handleMove = (clientX: number, clientY: number) => {
        if (!isDragging || !activeOverlayId || !activeImageOverlay) return;
        
        animationFrameId = requestAnimationFrame(() => {
          const canvas = overlayCanvasRef.current;
          if (!canvas) return;
          const rect = canvas.getBoundingClientRect();
          const x = (clientX - rect.left) * (canvas.width / rect.width);
          const y = (clientY - rect.top) * (canvas.height / rect.height);
          
          if (dragMode === 'move') {
              updateImageOverlay(activeOverlayId, {
                position: { x: x - dragStart.x, y: y - dragStart.y },
              });
          } else if (dragMode === 'rotate') {
              const dx = x - activeImageOverlay.position.x;
              const dy = y - activeImageOverlay.position.y;
              const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
              updateImageOverlay(activeOverlayId, { rotation: angle });
          } else if (dragMode === 'resize-br') {
              const dx = x - activeImageOverlay.position.x;
              const dy = y - activeImageOverlay.position.y;
              const angle = activeImageOverlay.rotation * (Math.PI / 180);

              const rotatedDx = dx * Math.cos(-angle) - dy * Math.sin(-angle);

              const originalAspectRatio = activeImageOverlay.htmlImage.height / activeImageOverlay.htmlImage.width;
              const newWidth = Math.abs(rotatedDx * 2);
              const newHeight = newWidth * originalAspectRatio;

              updateImageOverlay(activeOverlayId, { width: newWidth, height: newHeight });
          }
        });
      };

      const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
      const handleTouchMove = (e: TouchEvent) => {
         if (isDragging && e.touches.length > 0) {
           e.preventDefault();
           handleMove(e.touches[0].clientX, e.touches[0].clientY);
         }
      };

      const handleInteractionEnd = () => setIsDragging(false);

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("mouseup", handleInteractionEnd);
      window.addEventListener("touchend", handleInteractionEnd);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("mouseup", handleInteractionEnd);
        window.removeEventListener("touchend", handleInteractionEnd);
        cancelAnimationFrame(animationFrameId);
      };
    }, [isDragging, activeOverlayId, activeImageOverlay, dragStart, dragMode]);

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
                     <div className="w-full p-4 rounded-md flex items-center justify-center bg-white border shadow-inner min-h-[150px] relative">
                        {barcodeData ? (
                            <>
                              <canvas ref={barcodeCanvasRef} className="max-w-full h-auto" />
                              <canvas 
                                  ref={overlayCanvasRef} 
                                  className={cn("absolute top-0 left-0 max-w-full h-auto", isDragging ? 'cursor-grabbing' : 'cursor-grab')} 
                                  onMouseDown={handleMouseDown}
                                  onTouchStart={handleTouchStart}
                              />
                            </>
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
                    <AccordionItem value="image-overlay" className="border-b-0">
                        <AccordionTrigger className="px-4 sm:px-6 py-4 text-base font-semibold hover:no-underline">
                          <div className="flex items-center">
                            <ImagePlus className="mr-2 h-5 w-5 text-accent" />
                            Image Overlays
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 sm:px-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="grid gap-2">
                                    <Label>Overlays</Label>
                                    <Select 
                                        value={activeOverlayType === 'image' && activeOverlayId ? activeOverlayId.toString() : ""} 
                                        onValueChange={(id) => {
                                        setActiveOverlayId(Number(id));
                                        setActiveOverlayType('image');
                                        }}
                                    >
                                        <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Select an image..."/></SelectTrigger>
                                        <SelectContent>
                                        {imageOverlays.map(o => <SelectItem key={o.id} value={o.id.toString()}>{o.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button asChild size="sm">
                                    <label htmlFor="image-overlay-upload">
                                    <PlusCircle className="mr-2 h-4 w-4"/>Add Image
                                    <input id="image-overlay-upload" type="file" accept="image/*" className="sr-only" onChange={addImageOverlay} />
                                    </label>
                                </Button>
                            </div>
                            {activeImageOverlay ? (
                                <div className="grid gap-4 border-t pt-4">
                                    <div className="flex items-end gap-2">
                                    <div className="grid gap-2 flex-grow">
                                        <Label>Selected Image</Label>
                                        <div className="p-2 border rounded-md bg-muted text-sm truncate">{activeImageOverlay.name}</div>
                                    </div>
                                    <Button variant="destructive" size="icon" onClick={() => deleteImageOverlay(activeImageOverlay.id)}>
                                        <Trash2 className="h-4 w-4"/>
                                        <span className="sr-only">Delete image overlay</span>
                                    </Button>
                                    </div>
                                    <div className="grid gap-2">
                                    <Label>Size: {Math.round(activeImageOverlay.width)}px</Label>
                                    <Slider 
                                        value={[activeImageOverlay.width]} 
                                        onValueChange={(v) => {
                                            const newWidth = v[0];
                                            const originalAspectRatio = activeImageOverlay.htmlImage.height / activeImageOverlay.htmlImage.width;
                                            updateImageOverlay(activeImageOverlay.id, { width: newWidth, height: newWidth * originalAspectRatio });
                                        }}
                                        min={10} max={barcodeCanvasRef.current?.width ?? 300} step={1}
                                    />
                                    </div>
                                    <div className="grid gap-2">
                                    <Label>Rotation: {Math.round(activeImageOverlay.rotation)}°</Label>
                                    <Slider 
                                        value={[activeImageOverlay.rotation]} 
                                        onValueChange={(v) => updateImageOverlay(activeImageOverlay.id, {rotation: v[0]})} 
                                        min={-180} max={180} step={1}
                                    />
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground p-4 border-t">
                                    <p>No image overlay selected.</p>
                                    <p>Add a new one to get started.</p>
                                </div>
                            )}
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

    