
"use client";

import { useState, useEffect, useRef, type FC } from "react";
import Image from "next/image";
import QRCodeStyling, { type Options as QRCodeStylingOptions, type FileExtension } from 'qr-code-styling';
import { Download, Palette, Settings2, Type, RotateCcw, Move, Trash2, PlusCircle, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Contact, Wifi, Phone, MessageSquare, Mail, MapPin, Calendar as CalendarIcon, Link as LinkIcon, Edit, User, MessageCircle, Video, DollarSign, Bitcoin, Twitter, Facebook, Instagram, FileText, Upload, ImageIcon, Square, Dot, Contrast, RotateCw, Wand2, Loader, LayoutTemplate, Building, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateDesign, type GenerateDesignOutput } from "@/ai/flows/generate-design-flow";

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
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

const PRESET_COLORS = [
    "#000000", "#FFFFFF", "#FF5733", "#33FF57", "#3357FF", "#FF33A1",
    "#A133FF", "#33FFA1", "#FFC300", "#C70039", "#900C3F", "#581845"
];

const PRESET_DESIGNS: { name: string, design: GenerateDesignOutput }[] = [
    {
        name: "Classic Business",
        design: {
            colors: { background: '#FFFFFF', dots: '#000000', corner: '#000000' },
            shapes: { dots: 'square', corners: 'square' },
        },
    },
    {
        name: "Modern Tech",
        design: {
            colors: { background: '#F0F8FF', dots: '#0A74DA', corner: '#053B6D' },
            shapes: { dots: 'rounded', corners: 'dot' },
        },
    },
    {
        name: "Elegant Wedding",
        design: {
            colors: { background: '#FFF7F7', dots: '#8B5757', corner: '#6D4444' },
            shapes: { dots: 'classy-rounded', corners: 'extra-rounded' },
        },
    },
    {
        name: "Playful & Bright",
        design: {
            colors: { background: '#FFFDE7', dots: '#FF6F61', corner: '#FFC107' },
            shapes: { dots: 'dots', corners: 'dot' },
        },
    },
    {
        name: "Eco Green",
        design: {
            colors: { background: '#F0FFF4', dots: '#2E7D32', corner: '#1B5E20' },
            shapes: { dots: 'classy', corners: 'square' },
        },
    },
    {
        name: "Minimalist Gray",
        design: {
            colors: { background: '#F5F5F5', dots: '#424242', corner: '#212121' },
            shapes: { dots: 'square', corners: 'square' },
        }
    }
];

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
}

const vCardInitialState = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  company: '',
  jobTitle: '',
  website: '',
  address: ''
};

const meCardInitialState = {
  name: '',
  phone: '',
  email: '',
  website: '',
};

const wifiInitialState = {
  ssid: '',
  password: '',
  encryption: 'WPA',
  hidden: false,
};

const phoneInitialState = {
  phone: '',
};

const smsInitialState = {
  phone: '',
  message: '',
};

const emailInitialState = {
  email: '',
  subject: '',
  body: '',
};

const geoInitialState = {
  latitude: '',
  longitude: '',
};

const eventInitialState = {
  summary: '',
  location: '',
  description: '',
  startDate: new Date(),
  endDate: new Date(new Date().getTime() + 60 * 60 * 1000),
};

const whatsappInitialState = {
  phone: '',
  message: '',
};

const skypeInitialState = {
  username: '',
  action: 'chat',
};

const zoomInitialState = {
  meetingId: '',
  password: '',
};

const paypalInitialState = {
  email: '',
  itemName: '',
  amount: '',
  currency: 'USD',
};

const bitcoinInitialState = {
  address: '',
  amount: '',
};

const socialInitialState = {
  username: '',
};

const plainTextInitialState = {
  text: '',
};


const generateVCardString = (vCardData: typeof vCardInitialState): string => {
  const parts = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${vCardData.lastName};${vCardData.firstName};;;`,
    `FN:${vCardData.firstName} ${vCardData.lastName}`,
    vCardData.phone ? `TEL;TYPE=CELL:${vCardData.phone}` : '',
    vCardData.email ? `EMAIL:${vCardData.email}` : '',
    vCardData.company ? `ORG:${vCardData.company}` : '',
    vCardData.jobTitle ? `TITLE:${vCardData.jobTitle}` : '',
    vCardData.website ? `URL:${vCardData.website}` : '',
    vCardData.address ? `ADR;TYPE=HOME:;;${vCardData.address.replace(/\n/g, ';')}` : '',
    'END:VCARD'
  ];
  return parts.filter(Boolean).join('\n');
};

const generateMeCardString = (meCardData: typeof meCardInitialState): string => {
  const parts = [
    'MECARD:',
    meCardData.name ? `N:${meCardData.name};` : '',
    meCardData.phone ? `TEL:${meCardData.phone};` : '',
    meCardData.email ? `EMAIL:${meCardData.email};` : '',
    meCardData.website ? `URL:${meCardData.website};` : '',
    ';'
  ];
  return parts.join('');
};

const generateWifiString = (wifiData: typeof wifiInitialState): string => {
  const passwordPart = wifiData.password ? `P:${wifiData.password};` : '';
  const hiddenPart = wifiData.hidden ? 'H:true;' : '';
  return `WIFI:T:${wifiData.encryption};S:${wifiData.ssid};${passwordPart}${hiddenPart};`;
};

const generatePhoneString = (phoneData: typeof phoneInitialState): string => `tel:${phoneData.phone}`;
const generateSmsString = (smsData: typeof smsInitialState): string => `SMSTO:${smsData.phone}:${smsData.message}`;
const generateEmailString = (emailData: typeof emailInitialState): string => {
  const subject = encodeURIComponent(emailData.subject);
  const body = encodeURIComponent(emailData.body);
  return `mailto:${emailData.email}?subject=${subject}&body=${body}`;
};
const generateGeoString = (geoData: typeof geoInitialState): string => `geo:${geoData.latitude},${geoData.longitude}`;

const formatEventDate = (date: Date) => {
  return format(date, "yyyyMMdd'T'HHmmss'Z'").replace(/[-:]/g, '');
};

const generateEventString = (eventData: typeof eventInitialState): string => {
  const parts = [
    'BEGIN:VEVENT',
    `SUMMARY:${eventData.summary}`,
    `LOCATION:${eventData.location}`,
    `DESCRIPTION:${eventData.description}`,
    `DTSTART:${formatEventDate(eventData.startDate)}`,
    `DTEND:${formatEventDate(eventData.endDate)}`,
    'END:VEVENT'
  ];
  return `BEGIN:VCALENDAR\nVERSION:2.0\n${parts.join('\n')}\nEND:VCALENDAR`;
};

const generateWhatsappString = (data: typeof whatsappInitialState) => `https://wa.me/${data.phone}?text=${encodeURIComponent(data.message)}`;
const generateSkypeString = (data: typeof skypeInitialState) => `skype:${data.username}?${data.action}`;
const generateZoomString = (data: typeof zoomInitialState) => `https://zoom.us/j/${data.meetingId}${data.password ? `?pwd=${data.password}` : ''}`;
const generatePaypalString = (data: typeof paypalInitialState) => `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(data.email)}&item_name=${encodeURIComponent(data.itemName)}&amount=${data.amount}&currency_code=${data.currency}`;
const generateBitcoinString = (data: typeof bitcoinInitialState) => `bitcoin:${data.address}${data.amount ? `?amount=${data.amount}` : ''}`;
const generateTwitterString = (data: typeof socialInitialState) => `https://twitter.com/${data.username}`;
const generateFacebookString = (data: typeof socialInitialState) => `https://facebook.com/${data.username}`;
const generateInstagramString = (data: typeof socialInitialState) => `https://instagram.com/${data.username}`;

const defaultQrOptions: Omit<QRCodeStylingOptions, 'data'> = {
    width: 300,
    height: 300,
    margin: 25,
    qrOptions: {
        errorCorrectionLevel: "H",
    },
    dotsOptions: {
        type: 'rounded',
        color: '#000000',
    },
    backgroundOptions: {
        color: '#ffffff',
    },
    cornersSquareOptions: {
        type: 'extra-rounded',
        color: '#000000',
    },
    cornersDotOptions: {
        type: 'dot',
        color: '#000000',
    },
    imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.4,
        margin: 4,
    }
};

interface GradientState {
    enabled: boolean;
    type: 'linear' | 'radial';
    color1: string;
    color2: string;
    rotation: number;
}

const defaultGradientState: GradientState = {
    enabled: false,
    type: 'linear',
    color1: '#6a11cb',
    color2: '#2575fc',
    rotation: 0,
};

const VisitingCardPreview: FC<{
    qrWrapperRef: React.RefObject<HTMLDivElement>;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    activeOverlay: TextOverlay | undefined;
    isDragging: boolean;
    onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    qrSize: number;
    scale: number;
    activeContentType: string;
    vCardData: typeof vCardInitialState;
    meCardData: typeof meCardInitialState;
}> = ({
    qrWrapperRef,
    canvasRef,
    activeOverlay,
    isDragging,
    onMouseDown,
    qrSize,
    scale,
    activeContentType,
    vCardData,
    meCardData
}) => {
    const showVCard = activeContentType === 'vcard' && (vCardData.firstName || vCardData.lastName);
    const showMeCard = activeContentType === 'mecard' && meCardData.name;

    const InfoBlock = () => {
        if (showVCard) {
            return (
                <div className="flex-grow flex flex-col justify-center text-right p-4 sm:p-6 text-foreground">
                    <h3 className="font-headline text-2xl sm:text-3xl font-bold">{vCardData.firstName} {vCardData.lastName}</h3>
                    {vCardData.jobTitle && <p className="text-sm sm:text-base text-muted-foreground">{vCardData.jobTitle}</p>}
                    {vCardData.company && <p className="text-sm sm:text-base text-muted-foreground flex items-center justify-end gap-2 mt-1"><Building className="h-4 w-4" /> {vCardData.company}</p>}
                    <Separator className="my-3 sm:my-4"/>
                    <div className="flex flex-col items-end gap-2 text-xs sm:text-sm">
                        {vCardData.phone && <div className="flex items-center gap-2"><p>{vCardData.phone}</p><Phone className="h-4 w-4"/></div>}
                        {vCardData.email && <div className="flex items-center gap-2"><p>{vCardData.email}</p><Mail className="h-4 w-4"/></div>}
                        {vCardData.website && <div className="flex items-center gap-2"><p>{vCardData.website}</p><LinkIcon className="h-4 w-4"/></div>}
                    </div>
                </div>
            )
        }
        if (showMeCard) {
             return (
                <div className="flex-grow flex flex-col justify-center text-right p-4 sm:p-6 text-foreground">
                    <h3 className="font-headline text-2xl sm:text-3xl font-bold">{meCardData.name}</h3>
                    <Separator className="my-3 sm:my-4"/>
                    <div className="flex flex-col items-end gap-2 text-xs sm:text-sm">
                        {meCardData.phone && <div className="flex items-center gap-2"><p>{meCardData.phone}</p><Phone className="h-4 w-4"/></div>}
                        {meCardData.email && <div className="flex items-center gap-2"><p>{meCardData.email}</p><Mail className="h-4 w-4"/></div>}
                        {meCardData.website && <div className="flex items-center gap-2"><p>{meCardData.website}</p><LinkIcon className="h-4 w-4"/></div>}
                    </div>
                </div>
            )
        }
        return null;
    }

    const hasInfo = showVCard || showMeCard;

    return (
        <Card className="flex-grow flex flex-col shadow-lg w-full max-w-4xl mx-auto aspect-[16/9]">
            <CardContent className="p-4 sm:p-6 flex-grow flex items-center justify-center">
                <div className={cn("w-full h-full rounded-lg border bg-card shadow-inner overflow-hidden flex", hasInfo ? "flex-row" : "items-center justify-center")}>
                   {hasInfo && <InfoBlock />}
                    <div
                        className={cn(
                          "relative flex items-center justify-center",
                          hasInfo ? "w-1/3 p-4" : "w-full h-full"
                        )}
                        style={{
                            backgroundSize: '20px 20px',
                            backgroundColor: 'white',
                            backgroundImage:
                                'linear-gradient(to right, #f0f0f0 1px, transparent 1px),' +
                                'linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)',
                        }}
                    >
                        <div
                            className="relative aspect-square rounded-lg overflow-hidden"
                            style={{
                                width: hasInfo ? '100%' : qrSize,
                                height: hasInfo ? 'auto' : qrSize,
                                maxHeight: '100%',
                            }}
                        >
                            <div ref={qrWrapperRef} className="absolute inset-0" />
                            <canvas
                                ref={canvasRef}
                                width={qrSize * scale}
                                height={qrSize * scale}
                                className={cn(
                                    "absolute top-0 left-0 w-full h-full",
                                    activeOverlay ? "cursor-grab" : "",
                                    isDragging ? "cursor-grabbing" : ""
                                )}
                                onMouseDown={onMouseDown}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};


export default function Home() {
  const { toast } = useToast();
  const [scale, setScale] = useState(2);
  const [qrSize, setQrSize] = useState(300);
  const [qrContent, setQrContent] = useState("https://firebase.google.com/");
  const [downloadFormat, setDownloadFormat] = useState<FileExtension>("png");
  
  const [activeContentType, setActiveContentType] = useState('text');
  
  // States for different QR types
  const [textData, setTextData] = useState("https://firebase.google.com/");
  const [vCardData, setVCardData] = useState(vCardInitialState);
  const [meCardData, setMeCardData] = useState(meCardInitialState);
  const [wifiData, setWifiData] = useState(wifiInitialState);
  const [phoneData, setPhoneData] = useState(phoneInitialState);
  const [smsData, setSmsData] = useState(smsInitialState);
  const [emailData, setEmailData] = useState(emailInitialState);
  const [geoData, setGeoData] = useState(geoInitialState);
  const [eventData, setEventData] = useState(eventInitialState);
  const [whatsappData, setWhatsappData] = useState(whatsappInitialState);
  const [skypeData, setSkypeData] = useState(skypeInitialState);
  const [zoomData, setZoomData] = useState(zoomInitialState);
  const [paypalData, setPaypalData] = useState(paypalInitialState);
  const [bitcoinData, setBitcoinData] = useState(bitcoinInitialState);
  const [twitterData, setTwitterData] = useState(socialInitialState);
  const [facebookData, setFacebookData] = useState(socialInitialState);
  const [instagramData, setInstagramData] = useState(socialInitialState);
  const [plainTextData, setPlainTextData] = useState(plainTextInitialState);

  const [qrOptions, setQrOptions] = useState<Omit<QRCodeStylingOptions, 'data'>>(defaultQrOptions);
  const [logo, setLogo] = useState<string | null>(null);

  const [dotsGradient, setDotsGradient] = useState<GradientState>(defaultGradientState);
  const [backgroundGradient, setBackgroundGradient] = useState<GradientState>({
    ...defaultGradientState,
    enabled: false,
    color1: '#ffffff',
    color2: '#e9e9e9',
    rotation: 45,
  });


  const qrCodeRef = useRef<QRCodeStyling | null>(null);
  const qrWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrImageRef = useRef<HTMLImageElement | null>(null);

  const [overlays, setOverlays] = useState<TextOverlay[]>([]);
  const [activeOverlayId, setActiveOverlayId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const activeOverlay = overlays.find(o => o.id === activeOverlayId);

  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    setScale(window.devicePixelRatio || 2);
  }, []);

  const handleColorChange = (updater: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement> | string) => {
    const value = typeof e === 'string' ? e : e.target.value;
    updater(value);
  }

  const updateQrOptions = (newOptions: Partial<Omit<QRCodeStylingOptions, 'data'>>) => {
    setQrOptions(prev => ({...prev, ...newOptions}));
  }

  const updateNestedQrOptions = (category: keyof Omit<QRCodeStylingOptions, 'data'>, newOptions: any) => {
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
  
  const addOverlay = () => {
    const newId = Date.now();
    const newOverlay: TextOverlay = {
      id: newId,
      text: "New Text",
      color: "#000000",
      fontSize: 20 * scale,
      fontFamily: "Inter",
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'center',
      rotation: 0,
      position: { x: (qrSize / 2) * scale, y: (qrSize / 2) * scale },
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

  const drawOverlay = (ctx: CanvasRenderingContext2D, overlay: TextOverlay) => {
      ctx.save();
      ctx.translate(overlay.position.x, overlay.position.y);
      ctx.rotate((overlay.rotation * Math.PI) / 180);
      ctx.font = `${overlay.fontStyle} ${overlay.fontWeight} ${overlay.fontSize}px "${overlay.fontFamily}"`;
      ctx.textAlign = overlay.textAlign;
      ctx.fillStyle = overlay.color;
      ctx.textBaseline = "middle";
      ctx.fillText(overlay.text, 0, 0);
      ctx.restore();
  };

  const drawOverlaysOnly = () => {
    const visibleCtx = canvasRef.current?.getContext("2d");
    if (!visibleCtx || !canvasRef.current) return;
    
    visibleCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    if (qrImageRef.current) {
        visibleCtx.drawImage(qrImageRef.current, 0, 0, qrSize * scale, qrSize * scale);
    }
    
    overlays.forEach(o => drawOverlay(visibleCtx, o));
  }
  
  const drawAllLayers = async () => {
    const visibleCtx = canvasRef.current?.getContext("2d");

    if (!visibleCtx || !qrCodeRef.current || !canvasRef.current) return;
    
    visibleCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    const qrDataUrl = await qrCodeRef.current.getRawData('png');
    if (!qrDataUrl) return;

    qrImageRef.current = await new Promise<HTMLImageElement>(resolve => {
        const img = new window.Image();
        img.onload = () => {
          URL.revokeObjectURL(img.src);
          resolve(img);
        }
        img.src = URL.createObjectURL(qrDataUrl as Blob);
    });

    visibleCtx.drawImage(qrImageRef.current, 0, 0, qrSize * scale, qrSize * scale);
    
    overlays.forEach(o => {
      drawOverlay(visibleCtx, o);
    });
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
            setLogo(event.target?.result as string);
        };
        reader.readAsDataURL(e.target.files[0]);
    }
  };

  useEffect(() => {
    let newContent = "";
    switch(activeContentType) {
      case 'text':
        newContent = textData;
        break;
      case 'vcard':
        newContent = generateVCardString(vCardData);
        break;
      case 'mecard':
        newContent = generateMeCardString(meCardData);
        break;
      case 'wifi':
        newContent = generateWifiString(wifiData);
        break;
      case 'phone':
        newContent = generatePhoneString(phoneData);
        break;
      case 'sms':
        newContent = generateSmsString(smsData);
        break;
      case 'email':
        newContent = generateEmailString(emailData);
        break;
      case 'geo':
        newContent = generateGeoString(geoData);
        break;
      case 'event':
        newContent = generateEventString(eventData);
        break;
      case 'whatsapp':
        newContent = generateWhatsappString(whatsappData);
        break;
      case 'skype':
        newContent = generateSkypeString(skypeData);
        break;
      case 'zoom':
        newContent = generateZoomString(zoomData);
        break;
      case 'paypal':
        newContent = generatePaypalString(paypalData);
        break;
      case 'bitcoin':
        newContent = generateBitcoinString(bitcoinData);
        break;
      case 'twitter':
        newContent = generateTwitterString(twitterData);
        break;
      case 'facebook':
        newContent = generateFacebookString(facebookData);
        break;
      case 'instagram':
        newContent = generateInstagramString(instagramData);
        break;
      case 'plaintext':
        newContent = plainTextData.text;
        break;
    }
    setQrContent(newContent);
  }, [
    activeContentType, textData, vCardData, meCardData, wifiData, phoneData, smsData, 
    emailData, geoData, eventData, whatsappData, skypeData, zoomData, 
    paypalData, bitcoinData, twitterData, facebookData, instagramData, plainTextData
  ]);


  useEffect(() => {
      if(canvasRef.current) {
        canvasRef.current.width = qrSize * scale;
        canvasRef.current.height = qrSize * scale;
      }
      const finalQrOptions: QRCodeStylingOptions = {
          ...qrOptions,
          width: qrSize * scale,
          height: qrSize * scale,
          margin: (qrOptions.margin ?? 0) * scale,
          data: qrContent,
          image: logo ?? undefined,
          dotsOptions: {
              ...qrOptions.dotsOptions,
              ...(dotsGradient.enabled ? {
                  gradient: {
                      type: dotsGradient.type,
                      rotation: dotsGradient.rotation,
                      colorStops: [{ offset: 0, color: dotsGradient.color1 }, { offset: 1, color: dotsGradient.color2 }]
                  }
              } : {
                  color: qrOptions.dotsOptions?.color
              })
          },
          backgroundOptions: {
              ...qrOptions.backgroundOptions,
              ...(backgroundGradient.enabled ? {
                  gradient: {
                      type: backgroundGradient.type,
                      rotation: backgroundGradient.rotation,
                      colorStops: [{ offset: 0, color: backgroundGradient.color1 }, { offset: 1, color: backgroundGradient.color2 }]
                  }
              } : {
                  color: qrOptions.backgroundOptions?.color
              })
          },
          cornersSquareOptions: {
              ...qrOptions.cornersSquareOptions,
              type: qrOptions.cornersSquareOptions?.type === 'default' ? undefined : qrOptions.cornersSquareOptions?.type
          },
          cornersDotOptions: {
              ...qrOptions.cornersDotOptions,
              type: qrOptions.cornersDotOptions?.type === 'default' ? undefined : qrOptions.cornersDotOptions?.type
          },
          imageOptions: {
            ...qrOptions.imageOptions,
            margin: (qrOptions.imageOptions?.margin ?? 0) * scale,
          }
      };

      if (!qrCodeRef.current) {
          qrCodeRef.current = new QRCodeStyling(finalQrOptions);
      } else {
          qrCodeRef.current.update(finalQrOptions);
      }

      if (qrWrapperRef.current && qrCodeRef.current) {
          if(qrWrapperRef.current.firstChild) {
            qrWrapperRef.current.removeChild(qrWrapperRef.current.firstChild);
          }
          drawAllLayers();
      }
  }, [qrContent, qrOptions, logo, dotsGradient, backgroundGradient, qrSize, scale]);
  
  useEffect(() => {
    drawOverlaysOnly();
  }, [overlays, activeOverlayId]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

    const clickedOverlay = [...overlays].reverse().find(overlay => {
        const ctx = document.createElement('canvas').getContext('2d')!;
        ctx.font = `${overlay.fontStyle} ${overlay.fontWeight} ${overlay.fontSize}px "${overlay.fontFamily}"`;
        const textMetrics = ctx.measureText(overlay.text);

        const cx = overlay.position.x;
        const cy = overlay.position.y;
        const angle = overlay.rotation * (Math.PI / 180);

        const dx = mouseX - cx;
        const dy = mouseY - cy;

        const rotatedX = dx * Math.cos(-angle) - dy * Math.sin(-angle);
        const rotatedY = dx * Math.sin(-angle) + dy * Math.cos(-angle);
        
        const ascent = textMetrics.actualBoundingBoxAscent;
        const descent = textMetrics.actualBoundingBoxDescent;

        let x = 0;
        if(overlay.textAlign === 'center') x = -textMetrics.width / 2;
        if(overlay.textAlign === 'right') x = -textMetrics.width;

        const y = -ascent;
        const width = textMetrics.width;
        const height = ascent + descent;

        return rotatedX >= x && rotatedX <= x + width && rotatedY >= y && rotatedY <= y + height;
    });

    if (clickedOverlay) {
        setActiveOverlayId(clickedOverlay.id);
        setIsDragging(true);
        setDragStart({ x: mouseX - clickedOverlay.position.x, y: mouseY - clickedOverlay.position.y });
    } else {
      setActiveOverlayId(null);
    }
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !activeOverlay) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
      const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
  
      setOverlays(overlays.map(o => o.id === activeOverlay.id ? { 
          ...o, 
          position: {
              x: mouseX - dragStart.x,
              y: mouseY - dragStart.y
          }
      } : o));
    };

    const handleMouseUp = () => {
      if (isDragging) {
          setIsDragging(false);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, activeOverlay, dragStart, overlays, scale]);


  const handleDownload = async () => {
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = qrSize * scale;
    finalCanvas.height = qrSize * scale;
    const finalCtx = finalCanvas.getContext('2d');

    if(!finalCtx || !qrCodeRef.current) return;
    
    // Redraw for download to ensure latest state
    const qrData = await qrCodeRef.current.getRawData('png');
    if (!qrData) return;

    const img = await new Promise<HTMLImageElement>(resolve => {
      const image = new window.Image();
      image.onload = () => {
        URL.revokeObjectURL(image.src);
        resolve(image);
      };
      image.src = URL.createObjectURL(qrData as Blob);
    });
    
    finalCtx.drawImage(img, 0, 0, qrSize * scale, qrSize * scale);
    overlays.forEach(o => drawOverlay(finalCtx, o));

    if (downloadFormat === 'svg') {
        if (overlays.length > 0) {
            toast({ title: "SVG with overlays not supported", description: "Please choose PNG, JPG, or WEBP for downloads with text overlays.", variant: "destructive" });
            return;
        }
        
        const svgString = await qrCodeRef.current.getRawData('svg');
        const blob = new Blob([svgString!], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `qrcode.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
    }

    const mimeType = downloadFormat === "jpeg" ? "image/jpeg" : `image/${downloadFormat}`;
    const url = finalCanvas.toDataURL(mimeType, 1.0);
    const link = document.createElement("a");
    link.href = url;
    link.download = `qrcode.${downloadFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleVCardChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setVCardData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleMeCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMeCardData(prev => ({...prev, [e.target.name]: e.target.value}));
  }

  const handleWifiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWifiData(prev => ({...prev, [e.target.name]: e.target.value}));
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneData(prev => ({...prev, [e.target.name]: e.target.value}));
  }

  const handleSmsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSmsData(prev => ({...prev, [e.target.name]: e.target.value}));
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEmailData(prev => ({...prev, [e.target.name]: e.target.value}));
  }

  const handleGeoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGeoData(prev => ({...prev, [e.target.name]: e.target.value}));
  }
  
  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEventData(prev => ({...prev, [e.target.name]: e.target.value}));
  }
  
  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setWhatsappData(p => ({...p, [e.target.name]: e.target.value}));
  const handleSkypeChange = (e: React.ChangeEvent<HTMLInputElement>) => setSkypeData(p => ({...p, [e.target.name]: e.target.value}));
  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => setZoomData(p => ({...p, [e.target.name]: e.target.value}));
  const handlePaypalChange = (e: React.ChangeEvent<HTMLInputElement>) => setPaypalData(p => ({...p, [e.target.name]: e.target.value}));
  const handleBitcoinChange = (e: React.ChangeEvent<HTMLInputElement>) => setBitcoinData(p => ({...p, [e.target.name]: e.target.value}));
  const handleSocialChange = (setter: React.Dispatch<React.SetStateAction<typeof socialInitialState>>) => (e: React.ChangeEvent<HTMLInputElement>) => setter({username: e.target.value});
  const handlePlainTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setPlainTextData({text: e.target.value});

  const applyAiDesign = (design: GenerateDesignOutput) => {
    if (design.colors.dots) {
      updateNestedQrOptions('dotsOptions', { color: design.colors.dots });
      setDotsGradient(p => ({ ...p, enabled: false }));
    }
    if (design.colors.corner) {
       updateNestedQrOptions('cornersSquareOptions', { color: design.colors.corner });
       updateNestedQrOptions('cornersDotOptions', { color: design.colors.corner });
    }
    if (design.colors.background) {
      updateNestedQrOptions('backgroundOptions', { color: design.colors.background });
      setBackgroundGradient(p => ({...p, enabled: false}));
    }
    if (design.shapes.dots) {
      updateNestedQrOptions('dotsOptions', { type: design.shapes.dots });
    }
    if (design.shapes.corners) {
       updateNestedQrOptions('cornersSquareOptions', { type: design.shapes.corners });
    }
    if (design.logoDataUri) {
      setLogo(design.logoDataUri);
    } else {
      // If no logo is generated, we might want to clear any existing logo
      setLogo(null);
    }
  };

  const handleGenerateDesign = async () => {
    if (!aiPrompt) {
      toast({ title: "Error", description: "Please enter a prompt.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const design = await generateDesign(aiPrompt);
      applyAiDesign(design);
      toast({ title: "Success", description: "AI design applied!" });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to generate AI design.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };


  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
       <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
           <div className="flex items-center gap-2">
              <Wand2 className="h-6 w-6 text-primary" />
              <h1 className="font-headline text-xl font-bold tracking-tight text-primary">
                QRCodeMint
              </h1>
           </div>
            <div className="ml-auto flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-4">
                <Label htmlFor="format-select" className="flex-shrink-0 text-sm font-medium">
                  Format:
                </Label>
                <Select
                  value={downloadFormat}
                  onValueChange={(v) => setDownloadFormat(v as FileExtension)}
                >
                  <SelectTrigger id="format-select" className="w-[100px]">
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
                className="w-full sm:w-auto"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
      </header>
      <main className="flex-1 grid md:grid-cols-12 gap-px bg-border md:h-[calc(100vh-65px)]">
        <div className="md:col-span-7 lg:col-span-8 bg-background flex flex-col p-4 sm:p-6 items-center justify-center">
            <VisitingCardPreview
                qrWrapperRef={qrWrapperRef}
                canvasRef={canvasRef}
                activeOverlay={activeOverlay}
                isDragging={isDragging}
                onMouseDown={handleMouseDown}
                qrSize={qrSize}
                scale={scale}
                activeContentType={activeContentType}
                vCardData={vCardData}
                meCardData={meCardData}
              />
        </div>
        <div className="md:col-span-5 lg:col-span-4 bg-background flex flex-col md:h-[calc(100vh-65px)]">
            <Tabs defaultValue="content" className="flex-grow flex flex-col md:overflow-hidden">
                <TabsList className="w-full grid grid-cols-2 rounded-none h-auto shrink-0">
                    <TabsTrigger value="content" className="py-3 rounded-none">Content</TabsTrigger>
                    <TabsTrigger value="design" className="py-3 rounded-none">Design</TabsTrigger>
                </TabsList>
                <TabsContent value="content" className="flex-grow md:overflow-y-auto">
                   <ScrollArea className="h-full">
                       <div className="p-4 sm:p-6">
                            <Select value={activeContentType} onValueChange={setActiveContentType}>
                                <SelectTrigger className="w-full h-12 text-base">
                                    <SelectValue placeholder="Select content type..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="text"><div className="flex items-center"><LinkIcon className="mr-2 h-4 w-4"/>URL</div></SelectItem>
                                    <SelectItem value="plaintext"><div className="flex items-center"><FileText className="mr-2 h-4 w-4"/>Text</div></SelectItem>
                                    <SelectItem value="vcard"><div className="flex items-center"><Contact className="mr-2 h-4 w-4"/>vCard Contact</div></SelectItem>
                                    <SelectItem value="mecard"><div className="flex items-center"><User className="mr-2 h-4 w-4"/>MeCard</div></SelectItem>
                                    <SelectItem value="wifi"><div className="flex items-center"><Wifi className="mr-2 h-4 w-4"/>WiFi Network</div></SelectItem>
                                    <SelectItem value="phone"><div className="flex items-center"><Phone className="mr-2 h-4 w-4"/>Phone Number</div></SelectItem>
                                    <SelectItem value="sms"><div className="flex items-center"><MessageSquare className="mr-2 h-4 w-4"/>SMS</div></SelectItem>
                                    <SelectItem value="email"><div className="flex items-center"><Mail className="mr-2 h-4 w-4"/>Email</div></SelectItem>
                                    <SelectItem value="geo"><div className="flex items-center"><MapPin className="mr-2 h-4 w-4"/>Location</div></SelectItem>
                                    <SelectItem value="event"><div className="flex items-center"><CalendarIcon className="mr-2 h-4 w-4"/>Calendar Event</div></SelectItem>
                                    <SelectItem value="whatsapp"><div className="flex items-center"><MessageCircle className="mr-2 h-4 w-4"/>WhatsApp</div></SelectItem>
                                    <SelectItem value="skype"><div className="flex items-center"><svg className="mr-2 h-4 w-4" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Skype</title><path d="M22.02 14.65c-.59-2.03-1.63-3.9-3.08-5.46-1.52-1.63-3.43-2.78-5.6-3.35-1.9-.49-3.92-.49-5.82 0-2.17.57-4.08 1.72-5.6 3.35C.47 10.75-.43 12.62.16 14.65c1.24 4.28 5.23 7.35 9.84 7.35 4.61 0 8.6-3.07 9.84-7.35.13-.43.2-.87.18-1.31ZM12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12zM18.81 16.3c.6-1.12.92-2.38.92-3.68 0-4.07-3.3-7.37-7.37-7.37S4.99 8.55 4.99 12.62c0 1.3.32 2.56.92 3.68-.3.12-.59.27-.86.44-1.22.77-1.4 2.16-.39 2.92.51.39 1.16.51 1.76.32 2.18-.7 4.78-1.02 7.42-.02 2.64 1 5.23.68 7.41-.02.6-.2 1.25-.1 1.76-.32 1.01-.76.83-2.15-.39-2.92-.27-.17-.56-.32-.86-.44Z"/></svg>Skype</div></SelectItem>
                                    <SelectItem value="zoom"><div className="flex items-center"><Video className="mr-2 h-4 w-4"/>Zoom Meeting</div></SelectItem>
                                    <SelectItem value="paypal"><div className="flex items-center"><DollarSign className="mr-2 h-4 w-4"/>PayPal Payment</div></SelectItem>
                                    <SelectItem value="bitcoin"><div className="flex items-center"><Bitcoin className="mr-2 h-4 w-4"/>Bitcoin Transaction</div></SelectItem>
                                    <SelectItem value="twitter"><div className="flex items-center"><Twitter className="mr-2 h-4 w-4"/>Twitter Profile</div></SelectItem>
                                    <SelectItem value="facebook"><div className="flex items-center"><Facebook className="mr-2 h-4 w-4"/>Facebook Profile</div></SelectItem>
                                    <SelectItem value="instagram"><div className="flex items-center"><Instagram className="mr-2 h-4 w-4"/>Instagram Profile</div></SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="mt-6">
                                {activeContentType === 'text' && (
                                  <div className="grid gap-2">
                                    <Label htmlFor="text-input" className="font-medium">
                                      URL to Encode
                                    </Label>
                                    <Input
                                      id="text-input"
                                      value={textData}
                                      onChange={(e) => setTextData(e.target.value)}
                                      placeholder="e.g., https://example.com"
                                    />
                                  </div>
                                )}
                                {activeContentType === 'plaintext' && (
                                  <div className="grid gap-2">
                                    <Label htmlFor="plaintext-input">Plain Text</Label>
                                    <Textarea id="plaintext-input" value={plainTextData.text} onChange={handlePlainTextChange} placeholder="Enter any text here..."/>
                                  </div>
                                )}
                                {activeContentType === 'vcard' && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="vcard-firstName">First Name</Label>
                                      <Input id="vcard-firstName" name="firstName" value={vCardData.firstName} onChange={handleVCardChange} />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="vcard-lastName">Last Name</Label>
                                      <Input id="vcard-lastName" name="lastName" value={vCardData.lastName} onChange={handleVCardChange} />
                                    </div>
                                     <div className="grid gap-2">
                                      <Label htmlFor="vcard-phone">Phone</Label>
                                      <Input id="vcard-phone" name="phone" type="tel" value={vCardData.phone} onChange={handleVCardChange} />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="vcard-email">Email</Label>
                                      <Input id="vcard-email" name="email" type="email" value={vCardData.email} onChange={handleVCardChange} />
                                    </div>
                                     <div className="grid gap-2">
                                      <Label htmlFor="vcard-company">Company</Label>
                                      <Input id="vcard-company" name="company" value={vCardData.company} onChange={handleVCardChange} />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="vcard-jobTitle">Job Title</Label>
                                      <Input id="vcard-jobTitle" name="jobTitle" value={vCardData.jobTitle} onChange={handleVCardChange} />
                                    </div>
                                    <div className="sm:col-span-2 grid gap-2">
                                      <Label htmlFor="vcard-website">Website</Label>
                                      <Input id="vcard-website" name="website" type="url" value={vCardData.website} onChange={handleVCardChange} />
                                    </div>
                                    <div className="sm:col-span-2 grid gap-2">
                                      <Label htmlFor="vcard-address">Address</Label>
                                      <Textarea id="vcard-address" name="address" value={vCardData.address} onChange={handleVCardChange} />
                                    </div>
                                  </div>
                                )}
                                 {activeContentType === 'mecard' && (
                                  <div className="grid grid-cols-1 gap-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="mecard-name">Name</Label>
                                      <Input id="mecard-name" name="name" value={meCardData.name} onChange={handleMeCardChange} />
                                    </div>
                                     <div className="grid gap-2">
                                      <Label htmlFor="mecard-phone">Phone</Label>
                                      <Input id="mecard-phone" name="phone" type="tel" value={meCardData.phone} onChange={handleMeCardChange} />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="mecard-email">Email</Label>
                                      <Input id="mecard-email" name="email" type="email" value={meCardData.email} onChange={handleMeCardChange} />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="mecard-website">Website</Label>
                                      <Input id="mecard-website" name="website" type="url" value={meCardData.website} onChange={handleMeCardChange} />
                                    </div>
                                  </div>
                                )}
                                {activeContentType === 'wifi' && (
                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="wifi-ssid">Network Name (SSID)</Label>
                                            <Input id="wifi-ssid" name="ssid" value={wifiData.ssid} onChange={handleWifiChange}/>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="wifi-password">Password</Label>
                                            <Input id="wifi-password" name="password" type="password" value={wifiData.password} onChange={handleWifiChange}/>
                                        </div>
                                        <div className="grid gap-2">
                                           <Label htmlFor="wifi-encryption">Encryption</Label>
                                            <Select name="encryption" value={wifiData.encryption} onValueChange={(v) => setWifiData(p => ({...p, encryption: v}))}>
                                                <SelectTrigger><SelectValue/></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="WPA">WPA/WPA2</SelectItem>
                                                    <SelectItem value="WEP">WEP</SelectItem>
                                                    <SelectItem value="nopass">None</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="wifi-hidden" checked={wifiData.hidden} onCheckedChange={(c) => setWifiData(p => ({...p, hidden: !!c}))}/>
                                            <Label htmlFor="wifi-hidden">Hidden Network</Label>
                                        </div>
                                    </div>
                                )}
                                 {activeContentType === 'phone' && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone-number">Phone Number</Label>
                                        <Input id="phone-number" name="phone" type="tel" value={phoneData.phone} onChange={handlePhoneChange} placeholder="+15551234567"/>
                                    </div>
                                )}
                                 {activeContentType === 'sms' && (
                                     <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="sms-phone">Recipient Phone Number</Label>
                                            <Input id="sms-phone" name="phone" type="tel" value={smsData.phone} onChange={handleSmsChange} placeholder="+15551234567"/>
                                        </div>
                                         <div className="grid gap-2">
                                            <Label htmlFor="sms-message">Message</Label>
                                            <Textarea id="sms-message" name="message" value={smsData.message} onChange={handleSmsChange}/>
                                        </div>
                                    </div>
                                )}
                                 {activeContentType === 'email' && (
                                     <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="email-address">Recipient Email</Label>
                                            <Input id="email-address" name="email" type="email" value={emailData.email} onChange={handleEmailChange}/>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="email-subject">Subject</Label>
                                            <Input id="email-subject" name="subject" value={emailData.subject} onChange={handleEmailChange}/>
                                        </div>
                                         <div className="grid gap-2">
                                            <Label htmlFor="email-body">Body</Label>
                                            <Textarea id="email-body" name="body" value={emailData.body} onChange={handleEmailChange}/>
                                        </div>
                                    </div>
                                )}
                                {activeContentType === 'geo' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="geo-latitude">Latitude</Label>
                                            <Input id="geo-latitude" name="latitude" value={geoData.latitude} onChange={handleGeoChange}/>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="geo-longitude">Longitude</Label>
                                            <Input id="geo-longitude" name="longitude" value={geoData.longitude} onChange={handleGeoChange}/>
                                        </div>
                                    </div>
                                )}
                                {activeContentType === 'event' && (
                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="event-summary">Event Title</Label>
                                            <Input id="event-summary" name="summary" value={eventData.summary} onChange={handleEventChange}/>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="event-location">Location</Label>
                                            <Input id="event-location" name="location" value={eventData.location} onChange={handleEventChange}/>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="event-description">Description</Label>
                                            <Textarea id="event-description" name="description" value={eventData.description} onChange={handleEventChange}/>
                                        </div>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label>Start Date</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline">{format(eventData.startDate, 'PPP')}</Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={eventData.startDate} onSelect={(d) => d && setEventData(p => ({...p, startDate: d}))} initialFocus/></PopoverContent>
                                                </Popover>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>End Date</Label>
                                                 <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline">{format(eventData.endDate, 'PPP')}</Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={eventData.endDate} onSelect={(d) => d && setEventData(p => ({...p, endDate: d}))} initialFocus/></PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {activeContentType === 'whatsapp' && (
                                  <div className="grid gap-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="whatsapp-phone">Phone Number</Label>
                                      <Input id="whatsapp-phone" name="phone" type="tel" value={whatsappData.phone} onChange={handleWhatsappChange} placeholder="15551234567 (no +)"/>
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="whatsapp-message">Message (optional)</Label>
                                      <Textarea id="whatsapp-message" name="message" value={whatsappData.message} onChange={handleWhatsappChange}/>
                                    </div>
                                  </div>
                                )}
                                {activeContentType === 'skype' && (
                                  <div className="grid gap-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="skype-username">Skype Username</Label>
                                      <Input id="skype-username" name="username" value={skypeData.username} onChange={handleSkypeChange}/>
                                    </div>
                                    <div className="grid gap-2">
                                      <Label>Action</Label>
                                      <Select value={skypeData.action} onValueChange={(v) => setSkypeData(p => ({...p, action: v}))}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="chat">Chat</SelectItem>
                                          <SelectItem value="call">Call</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                )}
                                {activeContentType === 'zoom' && (
                                  <div className="grid gap-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="zoom-id">Meeting ID</Label>
                                      <Input id="zoom-id" name="meetingId" value={zoomData.meetingId} onChange={handleZoomChange}/>
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="zoom-password">Password (optional)</Label>
                                      <Input id="zoom-password" name="password" value={zoomData.password} onChange={handleZoomChange}/>
                                    </div>
                                  </div>
                                )}
                                {activeContentType === 'paypal' && (
                                  <div className="grid gap-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="paypal-email">PayPal Email</Label>
                                      <Input id="paypal-email" name="email" type="email" value={paypalData.email} onChange={handlePaypalChange}/>
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="paypal-item">Item Name</Label>
                                      <Input id="paypal-item" name="itemName" value={paypalData.itemName} onChange={handlePaypalChange}/>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="grid gap-2">
                                        <Label htmlFor="paypal-amount">Amount</Label>
                                        <Input id="paypal-amount" name="amount" type="number" value={paypalData.amount} onChange={handlePaypalChange}/>
                                      </div>
                                      <div className="grid gap-2">
                                        <Label>Currency</Label>
                                        <Select value={paypalData.currency} onValueChange={(v) => setPaypalData(p => ({...p, currency: v}))}>
                                          <SelectTrigger><SelectValue/></SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="EUR">EUR</SelectItem>
                                            <SelectItem value="GBP">GBP</SelectItem>
                                            <SelectItem value="JPY">JPY</SelectItem>
                                            <SelectItem value="CAD">CAD</SelectItem>
                                            <SelectItem value="AUD">AUD</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {activeContentType === 'bitcoin' && (
                                  <div className="grid gap-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="bitcoin-address">Bitcoin Address</Label>
                                      <Input id="bitcoin-address" name="address" value={bitcoinData.address} onChange={handleBitcoinChange}/>
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="bitcoin-amount">Amount (optional)</Label>
                                      <Input id="bitcoin-amount" name="amount" type="number" value={bitcoinData.amount} onChange={handleBitcoinChange}/>
                                    </div>
                                  </div>
                                )}
                                {activeContentType === 'twitter' && (
                                  <div className="grid gap-2">
                                      <Label htmlFor="twitter-username">Twitter Username</Label>
                                      <Input id="twitter-username" value={twitterData.username} onChange={handleSocialChange(setTwitterData)} placeholder="firebase"/>
                                  </div>
                                )}
                                {activeContentType === 'facebook' && (
                                  <div className="grid gap-2">
                                      <Label htmlFor="facebook-username">Facebook Username/ID</Label>
                                      <Input id="facebook-username" value={facebookData.username} onChange={handleSocialChange(setFacebookData)} placeholder="firebase"/>
                                  </div>
                                )}
                                {activeContentType === 'instagram' && (
                                  <div className="grid gap-2">
                                      <Label htmlFor="instagram-username">Instagram Username</Label>
                                      <Input id="instagram-username" value={instagramData.username} onChange={handleSocialChange(setInstagramData)} placeholder="firebase"/>
                                  </div>
                                )}
                            </div>
                       </div>
                   </ScrollArea>
                </TabsContent>
                <TabsContent value="design" className="flex-grow md:overflow-y-auto">
                   <ScrollArea className="h-full">
                       <Accordion type="single" defaultValue="templates" collapsible className="w-full">
                           <AccordionItem value="templates" className="border-b-0">
                            <AccordionTrigger className="px-4 sm:px-6 py-4 text-base font-semibold hover:no-underline">
                              <div className="flex items-center">
                                <LayoutTemplate className="mr-2 h-5 w-5 text-accent" />
                                Templates
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 sm:px-6">
                               <ScrollArea>
                                <div className="flex space-x-4 pb-4">
                                  {PRESET_DESIGNS.map(preset => (
                                    <div key={preset.name} className="flex-shrink-0 w-[120px] space-y-2">
                                      <button
                                        className="w-full aspect-square rounded-md border-2 border-transparent hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-center justify-center p-2"
                                        style={{ background: preset.design.colors.background }}
                                        onClick={() => applyAiDesign(preset.design)}
                                      >
                                        <div className="grid grid-cols-2 gap-1 w-full h-full">
                                          {Array.from({length: 4}).map((_, i) => {
                                            const dotType = preset.design.shapes.dots;
                                            let borderRadius = '0';
                                            if (dotType === 'dots' || dotType === 'rounded' || dotType === 'classy-rounded') {
                                              borderRadius = '50%';
                                            } else if (dotType === 'extra-rounded') {
                                              borderRadius = '8px';
                                            }
                                            
                                            return <div key={i} style={{
                                              background: preset.design.colors.dots,
                                              borderRadius
                                            }}/>
                                          })}
                                        </div>
                                      </button>
                                      <p className="text-xs text-center font-medium text-muted-foreground">{preset.name}</p>
                                    </div>
                                  ))}
                                </div>
                                <ScrollBar orientation="horizontal" />
                              </ScrollArea>
                            </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="ai-magic" className="border-b-0">
                            <AccordionTrigger className="px-4 sm:px-6 py-4 text-base font-semibold hover:no-underline">
                              <div className="flex items-center">
                                <Wand2 className="mr-2 h-5 w-5 text-accent" />
                                Magic Design
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 sm:px-6 space-y-4">
                              <div className="grid gap-2">
                                <Label htmlFor="ai-prompt">Design Prompt</Label>
                                <Textarea 
                                  id="ai-prompt" 
                                  placeholder="e.g., A business card for a futuristic tech company"
                                  value={aiPrompt}
                                  onChange={(e) => setAiPrompt(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">Describe the design you want. The AI will generate colors, shapes, and even a logo!</p>
                              </div>
                              <Button onClick={handleGenerateDesign} disabled={isGenerating}>
                                {isGenerating ? (
                                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Wand2 className="mr-2 h-4 w-4" />
                                )}
                                Generate
                              </Button>
                            </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="colors" className="border-b-0">
                            <AccordionTrigger className="px-4 sm:px-6 py-4 text-base font-semibold hover:no-underline">
                              <div className="flex items-center">
                                <Palette className="mr-2 h-5 w-5 text-accent" />
                                Colors
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 sm:px-6 space-y-6">
                              <div>
                                  <Label className="font-medium text-base">Dots</Label>
                                  <div className="flex items-center space-x-2 mt-2">
                                     <Switch id="dots-gradient-switch" checked={dotsGradient.enabled} onCheckedChange={(c) => setDotsGradient(p => ({...p, enabled: c}))} />
                                     <Label htmlFor="dots-gradient-switch">Use Gradient</Label>
                                  </div>
                                  {dotsGradient.enabled ? (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 border p-4 rounded-md">
                                          <ColorInput label="Color 1" value={dotsGradient.color1} onChange={handleColorChange(v => setDotsGradient(p => ({ ...p, color1: v })))} />
                                          <ColorInput label="Color 2" value={dotsGradient.color2} onChange={handleColorChange(v => setDotsGradient(p => ({ ...p, color2: v })))} />
                                          <div className="grid gap-2">
                                              <Label>Type</Label>
                                              <Select value={dotsGradient.type} onValueChange={(v: 'linear' | 'radial') => setDotsGradient(p => ({ ...p, type: v }))}>
                                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                                  <SelectContent>
                                                      <SelectItem value="linear">Linear</SelectItem>
                                                      <SelectItem value="radial">Radial</SelectItem>
                                                  </SelectContent>
                                              </Select>
                                          </div>
                                          <div className="grid gap-2">
                                              <Label>Rotation: {dotsGradient.rotation}°</Label>
                                              <Slider value={[dotsGradient.rotation]} onValueChange={(v) => setDotsGradient(p => ({ ...p, rotation: v[0] }))} min={0} max={360} step={1} />
                                          </div>
                                      </div>
                                  ) : (
                                      <ColorInput label="Dots Color" value={qrOptions.dotsOptions?.color ?? '#000000'} onChange={handleColorChange(v => updateNestedQrOptions('dotsOptions', { color: v }))} className="mt-4" />
                                  )}
                              </div>
                              <Separator/>
                               <div>
                                  <Label className="font-medium text-base">Corners</Label>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                      <ColorInput label="Corner Squares" value={qrOptions.cornersSquareOptions?.color ?? '#000000'} onChange={handleColorChange(v => updateNestedQrOptions('cornersSquareOptions', { color: v }))} />
                                      <ColorInput label="Corner Dots" value={qrOptions.cornersDotOptions?.color ?? '#000000'} onChange={handleColorChange(v => updateNestedQrOptions('cornersDotOptions', { color: v }))} />
                                  </div>
                              </div>
                              <Separator/>
                               <div>
                                  <Label className="font-medium text-base">Background</Label>
                                  <div className="flex items-center space-x-2 mt-2">
                                     <Switch id="bg-gradient-switch" checked={backgroundGradient.enabled} onCheckedChange={(c) => setBackgroundGradient(p => ({...p, enabled: c}))} />
                                     <Label htmlFor="bg-gradient-switch">Use Gradient</Label>
                                  </div>
                                  {backgroundGradient.enabled ? (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 border p-4 rounded-md">
                                          <ColorInput label="Color 1" value={backgroundGradient.color1} onChange={handleColorChange(v => setBackgroundGradient(p => ({ ...p, color1: v })))} />
                                          <ColorInput label="Color 2" value={backgroundGradient.color2} onChange={handleColorChange(v => setBackgroundGradient(p => ({ ...p, color2: v })))} />
                                          <div className="grid gap-2">
                                              <Label>Type</Label>
                                              <Select value={backgroundGradient.type} onValueChange={(v: 'linear' | 'radial') => setBackgroundGradient(p => ({ ...p, type: v }))}>
                                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                                  <SelectContent>
                                                      <SelectItem value="linear">Linear</SelectItem>
                                                      <SelectItem value="radial">Radial</SelectItem>
                                                  </SelectContent>
                                              </Select>
                                          </div>
                                          <div className="grid gap-2">
                                              <Label>Rotation: {backgroundGradient.rotation}°</Label>
                                              <Slider value={[backgroundGradient.rotation]} onValueChange={(v) => setBackgroundGradient(p => ({ ...p, rotation: v[0] }))} min={0} max={360} step={1} />
                                          </div>
                                      </div>
                                  ) : (
                                     <ColorInput label="Background Color" value={qrOptions.backgroundOptions?.color ?? '#ffffff'} onChange={handleColorChange(v => updateNestedQrOptions('backgroundOptions', { color: v }))} className="mt-4"/>
                                  )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                           <AccordionItem value="qr-style" className="border-b-0">
                              <AccordionTrigger className="px-4 sm:px-6 py-4 text-base font-semibold hover:no-underline">
                                  <div className="flex items-center"><ImageIcon className="mr-2 h-5 w-5 text-accent"/>Shapes</div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 sm:px-6 space-y-4">
                                  <div className="grid gap-2">
                                      <Label>Dot Style</Label>
                                      <Select value={qrOptions.dotsOptions?.type} onValueChange={(v) => updateNestedQrOptions('dotsOptions', {type: v})}>
                                          <SelectTrigger><SelectValue/></SelectTrigger>
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
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                       <div className="grid gap-2">
                                          <Label>Corner Square Style</Label>
                                          <Select value={qrOptions.cornersSquareOptions?.type ?? "default"} onValueChange={(v) => updateNestedQrOptions('cornersSquareOptions', {type: v})}>
                                              <SelectTrigger><SelectValue/></SelectTrigger>
                                              <SelectContent>
                                                  <SelectItem value="default">Default</SelectItem>
                                                  <SelectItem value="square">Square</SelectItem>
                                                  <SelectItem value="extra-rounded">Extra Rounded</SelectItem>
                                                  <SelectItem value="dot">Dot</SelectItem>
                                              </SelectContent>
                                          </Select>
                                      </div>
                                      <div className="grid gap-2">
                                          <Label>Corner Dot Style</Label>
                                          <Select value={qrOptions.cornersDotOptions?.type ?? "default"} onValueChange={(v) => updateNestedQrOptions('cornersDotOptions', {type: v})}>
                                              <SelectTrigger><SelectValue/></SelectTrigger>
                                              <SelectContent>
                                                  <SelectItem value="default">Default</SelectItem>
                                                  <SelectItem value="square">Square</SelectItem>
                                                  <SelectItem value="dot">Dot</SelectItem>
                                              </SelectContent>
                                          </Select>
                                      </div>
                                  </div>
                              </AccordionContent>
                           </AccordionItem>
                           <AccordionItem value="logo" className="border-b-0">
                               <AccordionTrigger className="px-4 sm:px-6 py-4 text-base font-semibold hover:no-underline">
                                   <div className="flex items-center"><Upload className="mr-2 h-5 w-5 text-accent" /> Logo</div>
                               </AccordionTrigger>
                               <AccordionContent className="px-4 sm:px-6 space-y-4">
                                   <div className="grid gap-2">
                                      <Label htmlFor="logo-upload">Upload Logo</Label>
                                      <div className="flex items-center gap-2">
                                          <Input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} className="flex-grow"/>
                                          <Button variant="ghost" size="icon" onClick={() => setLogo(null)} disabled={!logo}>
                                              <Trash2 className="h-4 w-4"/>
                                          </Button>
                                      </div>
                                   </div>
                                   {logo && (
                                       <div className="space-y-4 border-t pt-4">
                                          <div className="flex items-center space-x-2">
                                              <Switch id="hide-dots-switch" checked={qrOptions.imageOptions?.hideBackgroundDots} onCheckedChange={(c) => updateNestedQrOptions('imageOptions', { hideBackgroundDots: c })} />
                                              <Label htmlFor="hide-dots-switch">Hide dots behind logo</Label>
                                          </div>
                                           <div className="grid gap-2">
                                              <Label>Logo Size: {Math.round((qrOptions.imageOptions?.imageSize ?? 0.4) * 100)}%</Label>
                                              <Slider value={[(qrOptions.imageOptions?.imageSize ?? 0.4)]} onValueChange={(v) => updateNestedQrOptions('imageOptions', { imageSize: v[0] })} min={0.1} max={0.9} step={0.05} />
                                           </div>
                                           <div className="grid gap-2">
                                              <Label>Logo Margin: {Math.round((qrOptions.imageOptions?.margin ?? 0) / scale)}px</Label>
                                              <Slider value={[Math.round((qrOptions.imageOptions?.margin ?? 0) / scale)]} onValueChange={(v) => updateNestedQrOptions('imageOptions', { margin: v[0] * scale })} min={0} max={20} step={1} />
                                           </div>
                                       </div>
                                   )}
                               </AccordionContent>
                           </AccordionItem>
                          <AccordionItem value="text-overlay" className="border-b-0">
                             <AccordionTrigger className="px-4 sm:px-6 py-4 text-base font-semibold hover:no-underline">
                               <div className="flex items-center">
                                 <Type className="mr-2 h-5 w-5 text-accent" />
                                 Text Overlays
                               </div>
                             </AccordionTrigger>
                             <AccordionContent className="px-4 sm:px-6">
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
                                          <Label htmlFor={`text-overlay-input-${activeOverlay.id}`}>Text</Label>
                                          <Input
                                              id={`text-overlay-input-${activeOverlay.id}`}
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
                                     
                                     <Accordion type="single" defaultValue="font-style" collapsible className="w-full">
                                          <AccordionItem value="font-style">
                                              <AccordionTrigger className="text-base">Font & Style</AccordionTrigger>
                                              <AccordionContent className="pt-4 space-y-4">
                                                  <div className="grid grid-cols-2 gap-4">
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
                                                    <ColorInput
                                                     label="Color"
                                                     value={activeOverlay.color}
                                                     onChange={handleColorChange(v => updateOverlay(activeOverlay.id, {color: v}))}
                                                   />
                                                 </div>
                                                  <div className="grid gap-2">
                                                    <Label>Font Size: {Math.round(activeOverlay.fontSize / scale)}px</Label>
                                                    <Slider value={[activeOverlay.fontSize / scale]} onValueChange={(v) => updateOverlay(activeOverlay.id, {fontSize: v[0] * scale})} min={10} max={80} step={1} />
                                                 </div>
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
                                              </AccordionContent>
                                          </AccordionItem>
                                          <AccordionItem value="layout">
                                              <AccordionTrigger className="text-base">Layout</AccordionTrigger>
                                              <AccordionContent className="pt-4 space-y-4">
                                                 <div className="grid gap-2">
                                                   <Label>Alignment</Label>
                                                   <ToggleGroup type="single" value={activeOverlay.textAlign} onValueChange={(value: TextOverlay['textAlign']) => value && updateOverlay(activeOverlay.id, {textAlign: value})}>
                                                     <ToggleGroupItem value="left" aria-label="Align left"><AlignLeft className="h-4 w-4" /></ToggleGroupItem>
                                                     <ToggleGroupItem value="center" aria-label="Align center"><AlignCenter className="h-4 w-4" /></ToggleGroupItem>
                                                     <ToggleGroupItem value="right" aria-label="Align right"><AlignRight className="h-4 w-4" /></ToggleGroupItem>
                                                   </ToggleGroup>
                                                 </div>
                                                 <div className="grid gap-2">
                                                    <Label>Rotation: {activeOverlay.rotation}°</Label>
                                                    <Slider value={[activeOverlay.rotation]} onValueChange={(v) => updateOverlay(activeOverlay.id, {rotation: v[0]})} min={-180} max={180} step={1} />
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
                          <AccordionItem value="advanced" className="border-b-0">
                            <AccordionTrigger className="px-4 sm:px-6 py-4 text-base font-semibold hover:no-underline">
                              <div className="flex items-center">
                                <Settings2 className="mr-2 h-5 w-5 text-accent" />
                                Advanced Settings
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 sm:px-6 space-y-4">
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
                                <p className="text-xs text-muted-foreground">Higher levels can recover more data but increase QR code density.</p>
                              </div>
                              <Separator/>
                              <div className="grid gap-2">
                                  <Label>Size: {qrSize}px</Label>
                                  <Slider value={[qrSize]} onValueChange={(v) => setQrSize(v[0])} min={200} max={1000} step={10} />
                              </div>
                              <div className="grid gap-2">
                                  <Label>Margin: {qrOptions.margin}px</Label>
                                  <Slider value={[qrOptions.margin ?? 0]} onValueChange={(v) => updateQrOptions({ margin: v[0] })} min={0} max={50} step={1} />
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                   </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>
      </main>
      <footer className="border-t bg-background p-4 text-center text-sm text-muted-foreground shrink-0">
        © {new Date().getFullYear()} QRCodeMint. All rights reserved.
      </footer>
    </div>
  );
}
