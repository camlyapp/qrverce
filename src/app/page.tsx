
"use client";

import { useState, useEffect, useRef, type FC, useCallback } from "react";
import Image from "next/image";
import QRCodeStyling, { type Options as QRCodeStylingOptions, type FileExtension, type Gradient } from 'qr-code-styling';
import { Download, Palette, Settings2, Type, RotateCcw, Move, Trash2, PlusCircle, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Image as ImageIcon, Sparkles, Wand2 } from "lucide-react";

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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CANVAS_SIZE = 400;

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
        style={{ background: value }}
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

interface GradientState {
    type: 'linear' | 'radial';
    rotation: number;
    colorStops: { offset: number; color: string }[];
}

interface ColorOptions {
    type: 'solid' | 'gradient';
    solid: string;
    gradient: GradientState;
}

const initialColorOptions: ColorOptions = {
    type: 'solid',
    solid: '#000000',
    gradient: {
        type: 'linear',
        rotation: 0,
        colorStops: [
            { offset: 0, color: '#000000' },
            { offset: 1, color: '#ffffff' }
        ]
    }
};

const initialBgColorOptions: ColorOptions = {
    type: 'solid',
    solid: '#ffffff',
    gradient: {
        type: 'linear',
        rotation: 0,
        colorStops: [
            { offset: 0, color: '#ffffff' },
            { offset: 1, color: '#000000' }
        ]
    }
};

const ColorPicker: FC<{
    label: string;
    options: ColorOptions;
    onChange: (options: ColorOptions) => void;
}> = ({ label, options, onChange }) => (
    <div className="grid gap-4 rounded-lg border p-4">
        <h4 className="font-semibold text-base">{label}</h4>
        <Tabs value={options.type} onValueChange={(v) => onChange({ ...options, type: v as 'solid' | 'gradient' })}>
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="solid">Solid</TabsTrigger>
                <TabsTrigger value="gradient">Gradient</TabsTrigger>
            </TabsList>
            <TabsContent value="solid">
                <ColorInput label="Color" value={options.solid} onChange={(e) => onChange({ ...options, solid: e.target.value })} />
            </TabsContent>
            <TabsContent value="gradient">
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label>Type</Label>
                        <Select value={options.gradient.type} onValueChange={(v: 'linear' | 'radial') => onChange({ ...options, gradient: { ...options.gradient, type: v } })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="linear">Linear</SelectItem>
                                <SelectItem value="radial">Radial</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <ColorInput label="Color 1" value={options.gradient.colorStops[0].color} onChange={(e) => onChange({ ...options, gradient: { ...options.gradient, colorStops: [{ ...options.gradient.colorStops[0], color: e.target.value }, options.gradient.colorStops[1]] } })} />
                        <ColorInput label="Color 2" value={options.gradient.colorStops[1].color} onChange={(e) => onChange({ ...options, gradient: { ...options.gradient, colorStops: [options.gradient.colorStops[0], { ...options.gradient.colorStops[1], color: e.target.value }] } })} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Rotation</Label>
                        <Slider value={[options.gradient.rotation]} onValueChange={(v) => onChange({ ...options, gradient: { ...options.gradient, rotation: v[0] } })} min={0} max={360} step={1} />
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    </div>
);


interface TextOverlay {
  id: number;
  text: string;
  color: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
  rotation: number;
  position: { x: number; y: number };
  stroke: {
    enabled: boolean;
    color: string;
    width: number;
  },
  shadow: {
    enabled: boolean;
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  }
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
    { name: 'Sky', fg: '#0077b6', bg: '#ade8f4' },
    { name: 'Cherry', fg: '#780000', bg: '#f8ad9d' },
    { name: 'Gold', fg: '#ffd700', bg: '#212529' },
    { name: 'Lavender', fg: '#4a4e69', bg: '#e0b1cb' },
    { name: 'Olive', fg: '#556b2f', bg: '#f5f5dc' },
    { name: 'Cyber', fg: '#00f7ff', bg: '#101010' },
    { name: 'Peach', fg: '#e56b6f', bg: '#fff0f3' },
    { name: 'Earth', fg: '#a0522d', bg: '#f4a460' },
    { name: 'Slate', fg: '#f8f9fa', bg: '#343a40' },
    { name: 'Ruby', fg: '#e01e37', bg: '#f9d5d5' },
    { name: 'Teal', fg: '#20c997', bg: '#e9ecef' },
    { name: 'Indigo', fg: '#e0cffc', bg: '#3f007d' },
    { name: 'Coral', fg: '#ff7f50', bg: '#f0fff0' },
    { name: 'Grape', fg: '#6f2dbd', bg: '#dcd0ff' },
    { name: 'Lime', fg: '#a7d129', bg: '#3e4444' },
    { name: 'Aqua', fg: '#00ffff', bg: '#333333' },
    { name: 'Mustard', fg: '#ffdb58', bg: '#61412d' },
    { name: 'Plum', fg: '#ddbdfc', bg: '#2d004f' },
    { name: 'Steel', fg: '#b0c4de', bg: '#2f4f4f' },
    { name: 'Crimson', fg: '#f5f5f5', bg: '#dc143c' },
];

const getGradient = (options: ColorOptions): Gradient | undefined => {
    if (options.type === 'gradient') {
        return {
            type: options.gradient.type,
            rotation: options.gradient.rotation,
            colorStops: options.gradient.colorStops
        };
    }
    return undefined;
};


export default function Home() {
  const [text, setText] = useState("https://firebase.google.com/");
  const [downloadFormat, setDownloadFormat] = useState<FileExtension>("png");

  // QR Styling State
  const [qrOptions, setQrOptions] = useState<QRCodeStylingOptions>({
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      margin: 20,
      qrOptions: {
          errorCorrectionLevel: "M",
      },
      dotsOptions: {
          type: 'square',
          color: '#000000',
      },
      backgroundOptions: {
          color: '#ffffff',
      },
      cornersSquareOptions: {
          type: 'square',
          color: '#000000',
      },
      cornersDotOptions: {
          type: 'square',
          color: '#000000',
      },
      imageOptions: {
          crossOrigin: 'anonymous',
          margin: 10,
          hideBackgroundDots: true,
      }
  });
  const [logo, setLogo] = useState<string | null>(null);

  const [dotsColor, setDotsColor] = useState<ColorOptions>(initialColorOptions);
  const [bgColor, setBgColor] = useState<ColorOptions>(initialBgColorOptions);

  const qrCodeRef = useRef<QRCodeStyling | null>(null);
  const qrWrapperRef = useRef<HTMLDivElement>(null);
  
  // Text overlay state
  const [overlays, setOverlays] = useState<TextOverlay[]>([]);
  const [activeOverlayId, setActiveOverlayId] = useState<number | null>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const visibleCanvasRef = useRef<HTMLCanvasElement>(null);
  const dragCanvasRef = useRef<HTMLCanvasElement>(null);

  const activeOverlay = overlays.find(o => o.id === activeOverlayId);
  
  const updateQrOptions = (newOptions: Partial<QRCodeStylingOptions>) => {
    setQrOptions(prev => ({...prev, ...newOptions}));
  }

  const updateNestedQrOptions = (category: keyof QRCodeStylingOptions, newOptions: any) => {
      setQrOptions(prev => ({
          ...prev,
          [category]: {
              ...(prev[category] as any),
              ...newOptions
          }
      }));
  }

  const updateOverlay = (id: number, updates: Partial<TextOverlay>) => {
      setOverlays(overlays.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const updateNestedOverlay = (id: number, category: keyof TextOverlay, updates: any) => {
    setOverlays(overlays.map(o => {
        if (o.id === id) {
            return {
                ...o,
                [category]: {
                    ...(o[category] as any),
                    ...updates
                }
            };
        }
        return o;
    }));
  };
  
  const addOverlay = () => {
    const newId = Date.now();
    const newOverlay: TextOverlay = {
      id: newId,
      text: "New Text",
      color: "#000000",
      fontSize: 40,
      fontFamily: "Inter",
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'center',
      rotation: 0,
      position: { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 },
      stroke: {
        enabled: false,
        color: '#ffffff',
        width: 2,
      },
      shadow: {
        enabled: false,
        color: 'rgba(0,0,0,0.5)',
        blur: 5,
        offsetX: 5,
        offsetY: 5,
      }
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

  const drawOverlay = (ctx: CanvasRenderingContext2D, overlay: TextOverlay, clear = false) => {
      if (clear) {
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      }
      ctx.save();
      
      if (overlay.shadow.enabled) {
          ctx.shadowColor = overlay.shadow.color;
          ctx.shadowBlur = overlay.shadow.blur;
          ctx.shadowOffsetX = overlay.shadow.offsetX;
          ctx.shadowOffsetY = overlay.shadow.offsetY;
      }
      
      ctx.translate(overlay.position.x, overlay.position.y);
      ctx.rotate((overlay.rotation * Math.PI) / 180);
      
      ctx.font = `${overlay.fontStyle} ${overlay.fontWeight} ${overlay.fontSize}px "${overlay.fontFamily}"`;
      ctx.textAlign = overlay.textAlign;
      ctx.textBaseline = "middle";
      
      if (overlay.stroke.enabled) {
          ctx.strokeStyle = overlay.stroke.color;
          ctx.lineWidth = overlay.stroke.width;
          ctx.strokeText(overlay.text, 0, 0);
      }
      
      ctx.fillStyle = overlay.color;
      ctx.fillText(overlay.text, 0, 0);

      ctx.restore();
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogo(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };


  useEffect(() => {
    const finalQrOptions = {
        ...qrOptions,
        dotsOptions: {
            ...qrOptions.dotsOptions,
            color: dotsColor.type === 'solid' ? dotsColor.solid : undefined,
            gradient: getGradient(dotsColor),
        },
        backgroundOptions: {
            ...qrOptions.backgroundOptions,
            color: bgColor.type === 'solid' ? bgColor.solid : undefined,
            gradient: getGradient(bgColor),
        },
        cornersSquareOptions: {
            ...qrOptions.cornersSquareOptions,
            color: dotsColor.type === 'solid' ? dotsColor.solid : undefined,
            gradient: getGradient(dotsColor),
        },
        cornersDotOptions: {
            ...qrOptions.cornersDotOptions,
            color: dotsColor.type === 'solid' ? dotsColor.solid : undefined,
            gradient: getGradient(dotsColor),
        },
        data: text,
        image: logo ?? undefined,
    };

    if (!qrCodeRef.current) {
        qrCodeRef.current = new QRCodeStyling(finalQrOptions);
        if (qrWrapperRef.current) {
            qrCodeRef.current.append(qrWrapperRef.current);
        }
    } else {
        qrCodeRef.current.update(finalQrOptions);
    }
  }, [text, qrOptions, logo, dotsColor, bgColor]);

  const drawVisibleCanvas = useCallback(() => {
    const canvas = visibleCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    overlays.forEach(overlay => drawOverlay(ctx, overlay));
  }, [overlays]);


  useEffect(() => {
    drawVisibleCanvas();
  }, [drawVisibleCanvas]);


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
    const coords = getEventCoordinates(e);
    if (!coords) return;
    const { x: mouseX, y: mouseY } = coords;

    // Find which overlay was clicked
    const clickedOverlay = [...overlays].reverse().find(overlay => {
        const ctx = visibleCanvasRef.current?.getContext('2d');
        if (!ctx) return false;
        
        ctx.save();
        ctx.translate(overlay.position.x, overlay.position.y);
        ctx.rotate((overlay.rotation * Math.PI) / 180);
        
        ctx.font = `${overlay.fontStyle} ${overlay.fontWeight} ${overlay.fontSize}px "${overlay.fontFamily}"`;
        ctx.textAlign = overlay.textAlign;
        const textMetrics = ctx.measureText(overlay.text);
        ctx.restore();

        const hitBoxWidth = Math.max(textMetrics.width, 44);
        const hitBoxHeight = Math.max(overlay.fontSize, 44);
        
        // This is a simplified hit-detection that doesn't account for rotation.
        // For a more accurate solution, one would need to use rotated bounding box logic.
        return (
            Math.abs(mouseX - overlay.position.x) < hitBoxWidth / 2 &&
            Math.abs(mouseY - overlay.position.y) < hitBoxHeight / 2
        )
    });

    if (clickedOverlay) {
        if ('preventDefault' in e) e.preventDefault();
        setActiveOverlayId(clickedOverlay.id);
        setIsDragging(true);
        setDragStart({ x: mouseX - clickedOverlay.position.x, y: mouseY - clickedOverlay.position.y });
        
        const dragCtx = dragCanvasRef.current?.getContext('2d');
        if(dragCtx){
            drawOverlay(dragCtx, clickedOverlay, true);
        }
    }
  };

  const handleDragMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || !activeOverlay) return;
    if ('preventDefault' in e) e.preventDefault();
    
    const coords = getEventCoordinates(e);
    if (!coords) return;
    const { x: mouseX, y: mouseY } = coords;

    const newPosition = {
        x: mouseX - dragStart.x,
        y: mouseY - dragStart.y,
    };
    
    const dragCtx = dragCanvasRef.current?.getContext('2d');
    if(dragCtx){
        drawOverlay(dragCtx, {...activeOverlay, position: newPosition}, true);
    }
  };

  const handleDragEnd = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || !activeOverlay) return;
    
    const dragCtx = dragCanvasRef.current?.getContext('2d');
    
    // We need to calculate the final position as the mouse/touch might have moved.
    let finalPosition;
    const coords = getEventCoordinates(e as React.MouseEvent<HTMLCanvasElement>);
    
    // For touch end, coordinates might not be available, so we peek into the state being updated during move
    if(coords) {
      finalPosition = {
        x: coords.x - dragStart.x,
        y: coords.y - dragStart.y,
      };
    } else {
      const dragCanvas = dragCanvasRef.current;
      if (dragCanvas) {
         // This is a bit of a hack: if we don't have end coordinates, we assume the last drawn position on drag canvas is what we want.
         // This is complex to get right, so we'll re-calculate from the active overlay's current (pre-update) position.
         // A more robust implementation would use a state update during the move, but this prevents jumpiness on touch end.
         const lastOverlay = overlays.find(o => o.id === activeOverlayId);
         if (lastOverlay) {
           // We can't get coords from touchend, so we cannot calculate the final position accurately.
           // The state update will have to happen in handleDragMove.
           // To avoid a jump, we'll just commit the last known position from the active overlay.
         }
    }

    if (activeOverlay && finalPosition) {
        updateOverlay(activeOverlay.id, { position: finalPosition });
    }

    if (dragCtx) {
      dragCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }
    
    setIsDragging(false);
  };
  
  const handleDownload = async () => {
    if (!qrCodeRef.current) return;

    // Use a temporary canvas to merge QR code and overlays for download
    const downloadCanvas = document.createElement('canvas');
    downloadCanvas.width = CANVAS_SIZE;
    downloadCanvas.height = CANVAS_SIZE;
    const ctx = downloadCanvas.getContext('2d');
    if (!ctx) return;

    // qr-code-styling doesn't expose the canvas directly, so we have to get the raw image data.
     const finalQrOptions = {
      ...qrOptions,
      dotsOptions: {
          ...qrOptions.dotsOptions,
          color: dotsColor.type === 'solid' ? dotsColor.solid : undefined,
          gradient: getGradient(dotsColor),
      },
      backgroundOptions: {
          ...qrOptions.backgroundOptions,
          color: bgColor.type === 'solid' ? bgColor.solid : undefined,
          gradient: getGradient(bgColor),
      },
      cornersSquareOptions: {
          ...qrOptions.cornersSquareOptions,
          color: dotsColor.type === 'solid' ? dotsColor.solid : undefined,
          gradient: getGradient(dotsColor),
      },
      cornersDotOptions: {
          ...qrOptions.cornersDotOptions,
          color: dotsColor.type === 'solid' ? dotsColor.solid : undefined,
          gradient: getGradient(dotsColor),
      },
      data: text,
      image: logo ?? undefined,
    };

    const qrInstanceForDownload = new QRCodeStyling(finalQrOptions);
    const qrDataUrl = await qrInstanceForDownload.getDataUrl('png');
    const qrImage = await new Promise<HTMLImageElement>(resolve => {
        const img = new window.Image();
        img.onload = () => resolve(img);
        img.src = qrDataUrl;
    });

    // Draw QR code and overlays
    ctx.drawImage(qrImage, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    overlays.forEach(o => drawOverlay(ctx, o));

    const mimeType = downloadFormat === "jpeg" ? "image/jpeg" : "image/png";
    const downloadUrl = downloadCanvas.toDataURL(mimeType, 1.0);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `qrcode.${downloadFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handlePresetClick = (fg: string, bg: string) => {
    setDotsColor({type: 'solid', solid: fg, gradient: initialColorOptions.gradient});
    setBgColor({type: 'solid', solid: bg, gradient: initialBgColorOptions.gradient});
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

              <Accordion type="multiple" defaultValue={['style']} className="w-full">
                <AccordionItem value="style">
                    <AccordionTrigger className="text-lg font-semibold">
                      <div className="flex items-center">
                        <Sparkles className="mr-2 h-5 w-5 text-accent" />
                        QR Code Style
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Dots Style</Label>
                                <Select value={qrOptions.dotsOptions?.type} onValueChange={(v) => updateNestedQrOptions('dotsOptions', {type: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="square">Square</SelectItem>
                                        <SelectItem value="dots">Dots</SelectItem>
                                        <SelectItem value="rounded">Rounded</SelectItem>
                                        <SelectItem value="extra-rounded">Extra Rounded</SelectItem>
                                        <SelectItem value="classy">Classy</SelectItem>
                                        <SelectItem value="classy-rounded">Classy Rounded</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Corner Eye Style</Label>
                                <Select value={qrOptions.cornersSquareOptions?.type} onValueChange={(v) => updateNestedQrOptions('cornersSquareOptions', {type: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="square">Square</SelectItem>
                                        <SelectItem value="dot">Dot</SelectItem>
                                        <SelectItem value="extra-rounded">Extra Rounded</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Corner Dot Style</Label>
                                <Select value={qrOptions.cornersDotOptions?.type} onValueChange={(v) => updateNestedQrOptions('cornersDotOptions', {type: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="square">Square</SelectItem>
                                        <SelectItem value="dot">Dot</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Logo Image</Label>
                            <div className="flex items-center gap-2">
                                <Input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} className="flex-grow"/>
                                {logo && (
                                    <Button variant="ghost" size="icon" onClick={() => setLogo(null)}>
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                )}
                            </div>
                        </div>
                        {logo && (
                            <div className="flex items-center space-x-2">
                                <Switch id="hide-dots" checked={qrOptions.imageOptions?.hideBackgroundDots} onCheckedChange={(c) => updateNestedQrOptions('imageOptions', {hideBackgroundDots: c})} />
                                <Label htmlFor="hide-dots">Hide dots behind logo</Label>
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="colors">
                  <AccordionTrigger className="text-lg font-semibold">
                    <div className="flex items-center">
                      <Palette className="mr-2 h-5 w-5 text-accent" />
                      Customize Colors
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <ColorPicker label="Foreground" options={dotsColor} onChange={setDotsColor} />
                        <ColorPicker label="Background" options={bgColor} onChange={setBgColor} />
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="presets">
                         <AccordionTrigger className="text-base font-semibold">Color Presets</AccordionTrigger>
                         <AccordionContent className="pt-4">
                           <div className="flex flex-wrap gap-2">
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
                         </AccordionContent>
                      </AccordionItem>
                    </Accordion>
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
                          
                           <Accordion type="multiple" className="w-full -mx-3">
                              <AccordionItem value="font-style" className="border-x-0 border-t-0 px-3">
                                <AccordionTrigger className="py-2 text-base font-semibold">Font & Style</AccordionTrigger>
                                <AccordionContent className="pt-2 space-y-4">
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
                                  <div className="grid grid-cols-2 gap-4">
                                      <div className="grid gap-2">
                                        <Label>Style</Label>
                                        <ToggleGroup type="multiple" value={[activeOverlay.fontWeight, activeOverlay.fontStyle].filter(s => s !== 'normal')} onValueChange={(value) => {
                                          updateOverlay(activeOverlay.id, {
                                            fontWeight: value.includes('bold') ? 'bold' : 'normal',
                                            fontStyle: value.includes('italic') ? 'italic' : 'normal'
                                          });
                                        }}>
                                          <ToggleGroupItem value="bold" aria-label="Toggle bold"><Bold className="h-4 w-4" /></ToggleGroupItem>
                                          <ToggleGroupItem value="italic" aria-label="Toggle italic"><Italic className="h-4 w-4" /></ToggleGroupItem>
                                        </ToggleGroup>
                                      </div>
                                      <div className="grid gap-2">
                                        <Label>Alignment</Label>
                                        <ToggleGroup type="single" value={activeOverlay.textAlign} onValueChange={(value: TextOverlay['textAlign']) => value && updateOverlay(activeOverlay.id, {textAlign: value})}>
                                          <ToggleGroupItem value="left" aria-label="Align left"><AlignLeft className="h-4 w-4" /></ToggleGroupItem>
                                          <ToggleGroupItem value="center" aria-label="Align center"><AlignCenter className="h-4 w-4" /></ToggleGroupItem>
                                          <ToggleGroupItem value="right" aria-label="Align right"><AlignRight className="h-4 w-4" /></ToggleGroupItem>
                                        </ToggleGroup>
                                      </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              <AccordionItem value="position" className="border-x-0 px-3">
                                  <AccordionTrigger className="py-2 text-base font-semibold">Position & Rotation</AccordionTrigger>
                                  <AccordionContent className="pt-2 space-y-4">
                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between">
                                          <Label htmlFor="rotation-input">Rotation</Label>
                                          <Input
                                            id="rotation-input"
                                            type="number"
                                            className="w-20 h-8"
                                            value={activeOverlay.rotation}
                                            onChange={(e) => updateOverlay(activeOverlay.id, { rotation: parseInt(e.target.value, 10) || 0 })}
                                            min={-180}
                                            max={180}
                                            step={1}
                                          />
                                        </div>
                                        <Slider value={[activeOverlay.rotation]} onValueChange={(v) => updateOverlay(activeOverlay.id, {rotation: v[0]})} min={-180} max={180} step={1} />
                                    </div>
                                  </AccordionContent>
                              </AccordionItem>
                              <AccordionItem value="effects" className="border-x-0 border-b-0 px-3">
                                  <AccordionTrigger className="py-2 text-base font-semibold">Effects</AccordionTrigger>
                                  <AccordionContent className="pt-2 space-y-4">
                                    {/* Stroke */}
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <Label htmlFor="stroke-enabled" className="font-medium">Text Outline</Label>
                                        <Switch id="stroke-enabled" checked={activeOverlay.stroke.enabled} onCheckedChange={(c) => updateNestedOverlay(activeOverlay.id, 'stroke', { enabled: c })}/>
                                      </div>
                                      {activeOverlay.stroke.enabled && (
                                          <div className="grid grid-cols-2 gap-4 pl-2 border-l-2 ml-2">
                                              <ColorInput
                                                  label="Outline Color"
                                                  value={activeOverlay.stroke.color}
                                                  onChange={(e) => updateNestedOverlay(activeOverlay.id, 'stroke', { color: e.target.value })}
                                              />
                                              <div className="grid gap-2">
                                                  <Label>Outline Width</Label>
                                                  <Slider value={[activeOverlay.stroke.width]} onValueChange={(v) => updateNestedOverlay(activeOverlay.id, 'stroke', { width: v[0] })} min={1} max={10} step={0.5} />
                                              </div>
                                          </div>
                                      )}
                                    </div>
                                    <Separator/>
                                    {/* Shadow */}
                                     <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <Label htmlFor="shadow-enabled" className="font-medium">Text Shadow</Label>
                                        <Switch id="shadow-enabled" checked={activeOverlay.shadow.enabled} onCheckedChange={(c) => updateNestedOverlay(activeOverlay.id, 'shadow', { enabled: c })}/>
                                      </div>
                                      {activeOverlay.shadow.enabled && (
                                          <div className="space-y-4 pl-2 border-l-2 ml-2">
                                              <ColorInput
                                                  label="Shadow Color"
                                                  value={activeOverlay.shadow.color}
                                                  onChange={(e) => updateNestedOverlay(activeOverlay.id, 'shadow', { color: e.target.value })}
                                              />
                                              <div className="grid gap-2">
                                                  <Label>Blur: {activeOverlay.shadow.blur}px</Label>
                                                  <Slider value={[activeOverlay.shadow.blur]} onValueChange={(v) => updateNestedOverlay(activeOverlay.id, 'shadow', { blur: v[0] })} min={0} max={20} step={1} />
                                              </div>
                                              <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label>Offset X: {activeOverlay.shadow.offsetX}px</Label>
                                                    <Slider value={[activeOverlay.shadow.offsetX]} onValueChange={(v) => updateNestedOverlay(activeOverlay.id, 'shadow', { offsetX: v[0] })} min={-20} max={20} step={1} />
                                                </div>
                                                 <div className="grid gap-2">
                                                    <Label>Offset Y: {activeOverlay.shadow.offsetY}px</Label>
                                                    <Slider value={[activeOverlay.shadow.offsetY]} onValueChange={(v) => updateNestedOverlay(activeOverlay.id, 'shadow', { offsetY: v[0] })} min={-20} max={20} step={1} />
                                                </div>
                                              </div>
                                          </div>
                                      )}
                                    </div>
                                  </AccordionContent>
                              </AccordionItem>
                           </Accordion>
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
                        value={qrOptions.qrOptions?.errorCorrectionLevel}
                        onValueChange={(v) =>
                          updateNestedQrOptions('qrOptions', { errorCorrectionLevel: v })
                        }
                      >
                        <SelectTrigger id="error-correction" className="w-full">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="L">Low (Recovers ~7% of data)</SelectItem>
                          <SelectItem value="M">Medium (Recovers ~15% of data)</SelectItem>
                          <SelectItem value="Q">Quartile (Recovers ~25% of data)</SelectItem>
                          <SelectItem value="H">High (Recovers ~30% of data)</SelectItem>
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
                style={{touchAction: 'none'}}
              >
                 <div ref={qrWrapperRef} className="absolute inset-0" />
                 {/* This canvas is for interaction and drawing non-active overlays */}
                 <canvas
                    ref={visibleCanvasRef}
                    width={CANVAS_SIZE}
                    height={CANVAS_SIZE}
                    className="absolute top-0 left-0 rounded-lg w-full h-full"
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                    onMouseMove={handleDragMove}
                    onTouchMove={handleDragMove}
                    onMouseUp={handleDragEnd}
                    onMouseLeave={handleDragEnd}
                    onTouchEnd={handleDragEnd}
                 />
                 {/* This canvas is for showing the currently dragged overlay smoothly */}
                 <canvas
                    ref={dragCanvasRef}
                    width={CANVAS_SIZE}
                    height={CANVAS_SIZE}
                    className={cn(
                      "absolute top-0 left-0 rounded-lg w-full h-full pointer-events-none",
                      isDragging ? "cursor-grabbing" : "cursor-default"
                    )}
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
              onValueChange={(v) => setDownloadFormat(v as FileExtension)}
            >
              <SelectTrigger id="format-select" className="flex-grow sm:w-[120px]">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpeg">JPG</SelectItem>
                <SelectItem value="svg">SVG</SelectItem>
                <SelectItem value="webp">WEBP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleDownload}
            size="lg"
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-5 w-5" />
            Download QR Code
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
