"use client";

import { useState, useEffect, useRef, type FC, useCallback } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { Download, Palette, Settings2, Type, RotateCcw, Move } from "lucide-react";

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

export default function Home() {
  const [text, setText] = useState("https://firebase.google.com/");
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<QRCode.QRCodeErrorCorrectionLevel>("medium");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [downloadFormat, setDownloadFormat] = useState("png");

  // Text overlay state
  const [overlayText, setOverlayText] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(40);
  const [fontFamily, setFontFamily] = useState("Inter");
  const [textRotation, setTextRotation] = useState(0);
  const [textPosition, setTextPosition] = useState({ x: 150, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visibleCanvasRef = useRef<HTMLCanvasElement>(null);

  const drawCanvas = useCallback(async () => {
    const canvas = visibleCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw QR Code from hidden canvas if text is valid
    if (text.trim() && canvasRef.current) {
        try {
            const options: QRCode.QRCodeToCanvasOptions = {
                errorCorrectionLevel,
                margin: 2,
                width: 300,
                color: {
                    dark: foregroundColor,
                    light: backgroundColor,
                },
            };
            await QRCode.toCanvas(canvasRef.current, text, options);
            ctx.drawImage(canvasRef.current, 0, 0);
        } catch (err) {
            console.error("Failed to generate QR code:", err);
            // Optionally draw a placeholder or error message on the visible canvas
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    } else {
        // Draw background if no QR code
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }


    // Draw overlay text
    if (overlayText) {
      ctx.save();
      ctx.translate(textPosition.x, textPosition.y);
      ctx.rotate((textRotation * Math.PI) / 180);
      ctx.fillStyle = textColor;
      ctx.font = `${fontSize}px "${fontFamily}"`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(overlayText, 0, 0);
      ctx.restore();
    }
    
    setQrCodeDataUrl(canvas.toDataURL("image/png"));

  }, [text, foregroundColor, backgroundColor, errorCorrectionLevel, overlayText, textColor, fontSize, fontFamily, textRotation, textPosition]);

  useEffect(() => {
    const timeoutId = setTimeout(drawCanvas, 300);
    return () => clearTimeout(timeoutId);
  }, [drawCanvas]);


  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = visibleCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // A simple hit test for the text
    const textWidth = visibleCanvasRef.current?.getContext('2d')?.measureText(overlayText).width ?? 0;
    if (
      overlayText &&
      Math.abs(mouseX - textPosition.x) < textWidth / 2 &&
      Math.abs(mouseY - textPosition.y) < fontSize / 2
    ) {
      setIsDragging(true);
      setDragStart({ x: mouseX - textPosition.x, y: mouseY - textPosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !visibleCanvasRef.current) return;
    const rect = visibleCanvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    setTextPosition({
      x: mouseX - dragStart.x,
      y: mouseY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleMouseLeave = () => {
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

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-4xl overflow-hidden rounded-xl shadow-2xl">
        <CardHeader className="bg-card/50">
          <CardTitle className="font-headline text-3xl font-bold tracking-tight text-primary md:text-4xl">
            QRCodeMint
          </CardTitle>
          <CardDescription>
            Create, customize, and download your QR codes with ease.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="text-input" className="font-medium">
                  URL or Text to Encode
                </Label>
                <Input
                  id="text-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g., https://example.com"
                  className="text-base"
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
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="text-overlay">
                  <AccordionTrigger className="text-lg font-semibold">
                    <div className="flex items-center">
                      <Type className="mr-2 h-5 w-5 text-accent" />
                      Text Overlay
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="grid gap-4">
                        <Input
                            placeholder="Your text here..."
                            value={overlayText}
                            onChange={(e) => setOverlayText(e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <ColorInput
                            label="Text Color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                          />
                           <div className="grid gap-2">
                             <Label>Font</Label>
                             <Select value={fontFamily} onValueChange={setFontFamily}>
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
                            <Label>Font Size: {fontSize}px</Label>
                            <Slider value={[fontSize]} onValueChange={(v) => setFontSize(v[0])} min={10} max={80} step={1} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Rotation: {textRotation}°</Label>
                            <Slider value={[textRotation]} onValueChange={(v) => setTextRotation(v[0])} min={-180} max={180} step={1} />
                        </div>
                    </div>
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

            <div className="flex flex-col items-center justify-center gap-4">
              <div
                className="relative flex aspect-square w-full max-w-[300px] items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 shadow-inner"
              >
                <canvas
                    ref={visibleCanvasRef}
                    width={300}
                    height={300}
                    className={cn("rounded-lg", isDragging && "cursor-grabbing")}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    style={{backgroundColor: backgroundColor}}
                 />
              </div>
              {overlayText && (
                 <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Button variant="ghost" size="sm" onClick={() => setTextPosition({x:150, y:150})}>
                        <Move className="mr-2 h-4 w-4" /> Reset Position
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setTextRotation(0)}>
                        <RotateCcw className="mr-2 h-4 w-4" /> Reset Rotation
                    </Button>
                 </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-4 border-t bg-card/50 p-6 sm:flex-row sm:justify-end">
          <div className="flex items-center gap-4">
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
      <canvas ref={canvasRef} width="300" height="300" style={{ display: "none" }} />
    </main>
  );
}
