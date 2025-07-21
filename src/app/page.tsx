"use client";

import { useState, useEffect, useRef, type FC, useCallback } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { Download, Palette, Settings2, Type, RotateCcw, Move, Trash2, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

const CANVAS_SIZE = 400;
const QR_CODE_SIZE = 300;
const QR_CODE_OFFSET = (CANVAS_SIZE - QR_CODE_SIZE) / 2;

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const ColorInput: FC<ColorInputProps> = ({ label, value, onChange, className }) => (
  <div className={cn("grid gap-2", className)}>
    <Label htmlFor={`color-input-${label.toLowerCase()}`}>{label}</Label>
    <div className="relative h-10 w-full">
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-md border"
        style={{ backgroundColor: value }}
      >
        <span className="font-mono text-sm mix-blend-difference text-white">
          {value.toUpperCase()}
        </span>
      </div>
      <Input
        id={`color-input-${label.toLowerCase()}`}
        type="color"
        value={value}
        onChange={onChange}
        className="h-full w-full cursor-pointer opacity-0"
      />
    </div>
  </div>
);

interface TextOverlay {
  id: number;
  text: string;
  color: string;
  fontSize: number;
  fontFamily: string;
  rotation: number;
  position: { x: number; y: number };
}

const colorPresets = [
    { name: 'Classic', fg: '#000000', bg: '#ffffff' },
    { name: 'Inverted', fg: '#ffffff', bg: '#000000' },
    { name: 'Ocean', fg: '#023047', bg: '#8ecae6' },
    { name: 'Sunset', fg: '#d90429', bg: '#ffc300' },
    { name: 'Forest', fg: '#283618', bg: '#a3b18a' },
    { name: 'Royal', fg: '#f0e68c', bg: '#4b0082' },
    { name: 'Mint', fg: '#004d40', bg: '#b2dfdb' },
    { name: 'Rose', fg: '#831843', bg: '#fecdd3' },
];

export default function Home() {
  const [text, setText] = useState("https://firebase.google.com/");
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<QRCode.QRCodeErrorCorrectionLevel>("medium");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [downloadFormat, setDownloadFormat] = useState("png");

  // Text overlay state
  const [overlays, setOverlays] = useState<TextOverlay[]>([]);
  const [activeOverlayId, setActiveOverlayId] = useState<number | null>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const visibleCanvasRef = useRef<HTMLCanvasElement>(null);

  const activeOverlay = overlays.find(o => o.id === activeOverlayId);
  
  const updateOverlay = (id: number, updates: Partial<TextOverlay>) => {
      setOverlays(overlays.map(o => o.id === id ? { ...o, ...updates } : o));
  };
  
  const addOverlay = () => {
    const newId = Date.now();
    const newOverlay: TextOverlay = {
      id: newId,
      text: "New Text",
      color: "#000000",
      fontSize: 40,
      fontFamily: "Inter",
      rotation: 0,
      position: { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 },
    };
    setOverlays([...overlays, newOverlay]);
    setActiveOverlayId(newId);
  };
  
  const deleteOverlay = (id: number) => {
    setOverlays(overlays.filter(o => o.id !== id));
    if (activeOverlayId === id) {
      setActiveOverlayId(overlays.length > 1 ? overlays.find(o => o.id !== id)!.id : null);
    }
  };


  const drawCanvas = useCallback(async () => {
    const canvas = visibleCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Clear canvas with background color
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw QR Code from hidden canvas if text is valid
    if (text.trim() && qrCanvasRef.current) {
        try {
            const options: QRCode.QRCodeToCanvasOptions = {
                errorCorrectionLevel,
                margin: 2,
                width: QR_CODE_SIZE,
                color: {
                    dark: foregroundColor,
                    light: "#00000000", // Transparent light color for the QR code itself
                },
            };
            await QRCode.toCanvas(qrCanvasRef.current, text, options);
            ctx.drawImage(qrCanvasRef.current, QR_CODE_OFFSET, QR_CODE_OFFSET);
        } catch (err) {
            console.error("Failed to generate QR code:", err);
        }
    }

    // Draw all overlays
    overlays.forEach(overlay => {
      ctx.save();
      ctx.translate(overlay.position.x, overlay.position.y);
      ctx.rotate((overlay.rotation * Math.PI) / 180);
      ctx.fillStyle = overlay.color;
      ctx.font = `${overlay.fontSize}px "${overlay.fontFamily}"`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(overlay.text, 0, 0);
      ctx.restore();
    });
    
    setQrCodeDataUrl(canvas.toDataURL("image/png"));

  }, [text, foregroundColor, backgroundColor, errorCorrectionLevel, overlays]);

  useEffect(() => {
    const timeoutId = setTimeout(drawCanvas, 300);
    return () => clearTimeout(timeoutId);
  }, [drawCanvas]);


  const getEventCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = visibleCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handleDragStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!activeOverlay) return;
    
    const coords = getEventCoordinates(e);
    if (!coords) return;
    
    const { x: mouseX, y: mouseY } = coords;

    const ctx = visibleCanvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    ctx.font = `${activeOverlay.fontSize}px "${activeOverlay.fontFamily}"`;
    const textWidth = ctx.measureText(activeOverlay.text).width;
    
    // A bit more generous hit area
    const hitBoxWidth = Math.max(textWidth, 44);
    const hitBoxHeight = Math.max(activeOverlay.fontSize, 44);


    if (
      Math.abs(mouseX - activeOverlay.position.x) < hitBoxWidth / 2 &&
      Math.abs(mouseY - activeOverlay.position.y) < hitBoxHeight / 2
    ) {
      if ('preventDefault' in e) e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: mouseX - activeOverlay.position.x, y: mouseY - activeOverlay.position.y });
    }
  };

  const handleDragMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || !activeOverlay) return;
    if ('preventDefault' in e) e.preventDefault();
    
    const coords = getEventCoordinates(e);
    if (!coords) return;
    const { x: mouseX, y: mouseY } = coords;
    
    updateOverlay(activeOverlay.id, {
        position: {
            x: mouseX - dragStart.x,
            y: mouseY - dragStart.y,
        }
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  const handleDownload = () => {
    if (!visibleCanvasRef.current) return;
    const mimeType = downloadFormat === "jpeg" ? "image/jpeg" : "image/png";
    const downloadUrl = visibleCanvasRef.current.toDataURL(mimeType, 1.0);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `qrcode.${downloadFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handlePresetClick = (fg: string, bg: string) => {
    setForegroundColor(fg);
    setBackgroundColor(bg);
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-5xl overflow-hidden rounded-xl shadow-2xl">
        <CardHeader className="bg-card/50">
          <CardTitle className="font-headline text-3xl font-bold tracking-tight text-primary md:text-4xl">
            QRCodeMint
          </CardTitle>
          <CardDescription>
            Create, customize, and download your QR codes with ease.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
            <div className="flex flex-col gap-6 lg:col-span-2">
              <div className="grid gap-2">
                <Label htmlFor="text-input" className="font-medium">
                  URL or Text to Encode
                </Label>
                <Input
                  id="text-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g., https://example.com"
                />
              </div>

              <Accordion type="multiple" defaultValue={['colors', 'text-overlay']} className="w-full">
                <AccordionItem value="colors">
                  <AccordionTrigger className="text-lg font-semibold">
                    <div className="flex items-center">
                      <Palette className="mr-2 h-5 w-5 text-accent" />
                      Customize Colors
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <ColorInput
                        label="Foreground"
                        value={foregroundColor}
                        onChange={(e) => setForegroundColor(e.target.value)}
                      />
                      <ColorInput
                        label="Background"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                      />
                    </div>
                     <Separator className="my-4" />
                      <div className="grid gap-3">
                        <Label>Color Presets</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {colorPresets.map((preset) => (
                                <button
                                    key={preset.name}
                                    title={preset.name}
                                    onClick={() => handlePresetClick(preset.fg, preset.bg)}
                                    className="flex flex-col items-center justify-center gap-1.5 rounded-md border p-2 transition-all hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <div className="flex -space-x-2">
                                        <div className="h-6 w-6 rounded-full border-2 border-white dark:border-black" style={{ backgroundColor: preset.fg }} />
                                        <div className="h-6 w-6 rounded-full border-2 border-white dark:border-black" style={{ backgroundColor: preset.bg }} />
                                    </div>
                                    <span className="text-xs text-muted-foreground">{preset.name}</span>
                                </button>
                            ))}
                        </div>
                      </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="text-overlay">
                   <AccordionTrigger className="text-lg font-semibold">
                     <div className="flex items-center">
                       <Type className="mr-2 h-5 w-5 text-accent" />
                       Text Overlays
                     </div>
                   </AccordionTrigger>
                   <AccordionContent className="pt-4">
                     <div className="flex items-center justify-between mb-4">
                        <div className="grid gap-2">
                            <Label>Overlays</Label>
                             <Select value={activeOverlayId?.toString() ?? ""} onValueChange={(id) => setActiveOverlayId(Number(id))}>
                               <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Select an overlay..."/></SelectTrigger>
                               <SelectContent>
                                {overlays.map(o => <SelectItem key={o.id} value={o.id.toString()}>{o.text.substring(0, 20)}</SelectItem>)}
                               </SelectContent>
                             </Select>
                        </div>
                       <Button onClick={addOverlay} size="sm"><PlusCircle className="mr-2 h-4 w-4"/>Add Text</Button>
                     </div>

                     {activeOverlay ? (
                       <div className="grid gap-4 border-t pt-4">
                           <div className="flex items-end gap-2">
                             <div className="grid gap-2 flex-grow">
                                <Label>Text</Label>
                                <Input
                                    placeholder="Your text here..."
                                    value={activeOverlay.text}
                                    onChange={(e) => updateOverlay(activeOverlay.id, {text: e.target.value})}
                                />
                             </div>
                             <Button variant="destructive" size="icon" onClick={() => deleteOverlay(activeOverlay.id)}>
                                 <Trash2 className="h-4 w-4"/>
                                 <span className="sr-only">Delete overlay</span>
                             </Button>
                           </div>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <ColorInput
                               label="Text Color"
                               value={activeOverlay.color}
                               onChange={(e) => updateOverlay(activeOverlay.id, {color: e.target.value})}
                             />
                              <div className="grid gap-2">
                                <Label>Font</Label>
                                <Select value={activeOverlay.fontFamily} onValueChange={(v) => updateOverlay(activeOverlay.id, {fontFamily: v})}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Inter">Inter</SelectItem>
                                    <SelectItem value="Space Grotesk">Space Grotesk</SelectItem>
                                    <SelectItem value="Arial">Arial</SelectItem>
                                    <SelectItem value="Courier New">Courier New</SelectItem>
                                    <SelectItem value="Verdana">Verdana</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                           </div>
                            <div className="grid gap-2">
                               <Label>Font Size: {activeOverlay.fontSize}px</Label>
                               <Slider value={[activeOverlay.fontSize]} onValueChange={(v) => updateOverlay(activeOverlay.id, {fontSize: v[0]})} min={10} max={80} step={1} />
                           </div>
                           <div className="grid gap-2">
                               <Label>Rotation: {activeOverlay.rotation}°</Label>
                               <Slider value={[activeOverlay.rotation]} onValueChange={(v) => updateOverlay(activeOverlay.id, {rotation: v[0]})} min={-180} max={180} step={1} />
                           </div>
                       </div>
                     ) : (
                        <div className="text-center text-muted-foreground p-4 border-t">
                            <p>No text overlay selected.</p>
                            <p>Add a new one to get started.</p>
                        </div>
                     )}
                   </AccordionContent>
                 </AccordionItem>

                <AccordionItem value="advanced">
                  <AccordionTrigger className="text-lg font-semibold">
                    <div className="flex items-center">
                      <Settings2 className="mr-2 h-5 w-5 text-accent" />
                      Advanced Settings
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="grid gap-2">
                      <Label htmlFor="error-correction" className="font-medium">
                        Error Correction Level
                      </Label>
                      <Select
                        value={errorCorrectionLevel}
                        onValueChange={(v) =>
                          setErrorCorrectionLevel(v as QRCode.QRCodeErrorCorrectionLevel)
                        }
                      >
                        <SelectTrigger id="error-correction" className="w-full">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (Recovers ~7% of data)</SelectItem>
                          <SelectItem value="medium">Medium (Recovers ~15% of data)</SelectItem>
                          <SelectItem value="quartile">Quartile (Recovers ~25% of data)</SelectItem>
                          <SelectItem value="high">High (Recovers ~30% of data)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 lg:col-span-3">
              <div
                className="relative flex w-full max-w-[400px] items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 shadow-inner aspect-square"
              >
                <canvas
                    ref={visibleCanvasRef}
                    width={CANVAS_SIZE}
                    height={CANVAS_SIZE}
                    className={cn("rounded-lg w-full h-full", isDragging && "cursor-grabbing")}
                    onMouseDown={handleDragStart}
                    onMouseMove={handleDragMove}
                    onMouseUp={handleDragEnd}
                    onMouseLeave={handleDragEnd}
                    onTouchStart={handleDragStart}
                    onTouchMove={handleDragMove}
                    onTouchEnd={handleDragEnd}
                    style={{backgroundColor: backgroundColor, touchAction: 'none'}}
                 />
              </div>
              {activeOverlay && (
                 <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground sm:gap-4">
                    <Button variant="ghost" size="sm" onClick={() => updateOverlay(activeOverlay.id, {position:{x:CANVAS_SIZE/2, y:CANVAS_SIZE/2}})}>
                        <Move className="mr-2 h-4 w-4" /> Reset Position
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => updateOverlay(activeOverlay.id, {rotation: 0})}>
                        <RotateCcw className="mr-2 h-4 w-4" /> Reset Rotation
                    </Button>
                 </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-4 border-t bg-card/50 p-4 sm:flex-row sm:justify-end md:p-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <Label htmlFor="format-select" className="flex-shrink-0">
              Format:
            </Label>
            <Select
              value={downloadFormat}
              onValueChange={setDownloadFormat}
            >
              <SelectTrigger id="format-select" className="flex-grow sm:w-[120px]">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpeg">JPG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleDownload}
            disabled={!qrCodeDataUrl}
            size="lg"
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-5 w-5" />
            Download QR Code
          </Button>
        </CardFooter>
      </Card>
      <canvas ref={qrCanvasRef} width={QR_CODE_SIZE} height={QR_CODE_SIZE} style={{ display: "none" }} />
    </main>
  );
}
