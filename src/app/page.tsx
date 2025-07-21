
"use client";

import { useState, useEffect, useRef, type FC } from "react";
import Image from "next/image";
import QRCodeStyling, { type Options as QRCodeStylingOptions, type FileExtension } from 'qr-code-styling';
import { Download, Palette, Settings2, Type, RotateCcw, Move, Trash2, PlusCircle, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Contact, Wifi, Phone, MessageSquare, Mail, MapPin, Calendar as CalendarIcon } from "lucide-react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

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


export default function Home() {
  const [qrContent, setQrContent] = useState("https://firebase.google.com/");
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [downloadFormat, setDownloadFormat] = useState<FileExtension>("png");
  
  const [activeTab, setActiveTab] = useState('text');
  
  // States for different QR types
  const [textData, setTextData] = useState("https://firebase.google.com/");
  const [vCardData, setVCardData] = useState(vCardInitialState);
  const [wifiData, setWifiData] = useState(wifiInitialState);
  const [phoneData, setPhoneData] = useState(phoneInitialState);
  const [smsData, setSmsData] = useState(smsInitialState);
  const [emailData, setEmailData] = useState(emailInitialState);
  const [geoData, setGeoData] = useState(geoInitialState);
  const [eventData, setEventData] = useState(eventInitialState);

  const [qrOptions, setQrOptions] = useState<QRCodeStylingOptions>({
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      margin: 20,
      qrOptions: {
          errorCorrectionLevel: "M",
      }
  });

  const qrCodeRef = useRef<QRCodeStyling | null>(null);
  const qrWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const finalCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [overlays, setOverlays] = useState<TextOverlay[]>([]);
  const [activeOverlayId, setActiveOverlayId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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
  
  const drawFinalCanvas = async () => {
    const finalCtx = finalCanvasRef.current?.getContext("2d");
    if (!finalCtx || !qrCodeRef.current) return;
    
    finalCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Get the QR code as a data URL from qr-code-styling
    const qrDataUrl = await qrCodeRef.current.getRawData('png');
    if (!qrDataUrl) return;

    const qrImage = await new Promise<HTMLImageElement>(resolve => {
        const img = new window.Image();
        img.onload = () => resolve(img);
        const url = URL.createObjectURL(qrDataUrl as Blob);
        img.src = url;
    });

    finalCtx.drawImage(qrImage, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    overlays.forEach(o => drawOverlay(finalCtx, o));
  };
  

  useEffect(() => {
    let newContent = "";
    switch(activeTab) {
      case 'text':
        newContent = textData;
        break;
      case 'vcard':
        newContent = generateVCardString(vCardData);
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
    }
    setQrContent(newContent);
  }, [activeTab, textData, vCardData, wifiData, phoneData, smsData, emailData, geoData, eventData]);


  useEffect(() => {
    const finalQrOptions: QRCodeStylingOptions = {
        ...qrOptions,
        data: qrContent,
        dotsOptions: { color: foregroundColor },
        backgroundOptions: { color: backgroundColor },
    };
    if (!qrCodeRef.current) {
        qrCodeRef.current = new QRCodeStyling(finalQrOptions);
    } else {
        qrCodeRef.current.update(finalQrOptions);
    }

    let timeoutId: NodeJS.Timeout;
    if (qrWrapperRef.current && qrCodeRef.current) {
        qrWrapperRef.current.innerHTML = '';
        qrCodeRef.current.append(qrWrapperRef.current);
        // Delay drawing to canvas to ensure QR code has rendered
        timeoutId = setTimeout(drawFinalCanvas, 200);
    }

    return () => clearTimeout(timeoutId);
  }, [qrContent, foregroundColor, backgroundColor, qrOptions, overlays]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const clickedOverlay = overlays.find(overlay => {
        const textMetrics = document.createElement('canvas').getContext('2d')!;
        textMetrics.font = `${overlay.fontStyle} ${overlay.fontWeight} ${overlay.fontSize}px "${overlay.fontFamily}"`;
        const width = textMetrics.measureText(overlay.text).width;
        
        // This is a simplified hit-detection that doesn't account for rotation.
        const halfWidth = width / 2;
        const halfHeight = overlay.fontSize / 2;

        return (
            mouseX >= overlay.position.x - halfWidth &&
            mouseX <= overlay.position.x + halfWidth &&
            mouseY >= overlay.position.y - halfHeight &&
            mouseY <= overlay.position.y + halfHeight
        )
    });

    if (clickedOverlay) {
        setActiveOverlayId(clickedOverlay.id);
        setIsDragging(true);
        setDragStart({ x: mouseX - clickedOverlay.position.x, y: mouseY - clickedOverlay.position.y });
    } else {
      setActiveOverlayId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !activeOverlay) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    updateOverlay(activeOverlay.id, {
        position: {
            x: mouseX - dragStart.x,
            y: mouseY - dragStart.y
        }
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleDownload = async () => {
    await drawFinalCanvas();
    const finalCanvas = finalCanvasRef.current;
    if (!finalCanvas) return;

    const mimeType = downloadFormat === "jpeg" ? "image/jpeg" : "image/png";
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
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <ScrollArea className="w-full whitespace-nowrap rounded-md">
                    <TabsList className="w-max">
                        <TabsTrigger value="text"><Type className="mr-2 h-4 w-4"/>URL/Text</TabsTrigger>
                        <TabsTrigger value="vcard"><Contact className="mr-2 h-4 w-4"/>vCard</TabsTrigger>
                        <TabsTrigger value="wifi"><Wifi className="mr-2 h-4 w-4"/>WiFi</TabsTrigger>
                        <TabsTrigger value="phone"><Phone className="mr-2 h-4 w-4"/>Phone</TabsTrigger>
                        <TabsTrigger value="sms"><MessageSquare className="mr-2 h-4 w-4"/>SMS</TabsTrigger>
                        <TabsTrigger value="email"><Mail className="mr-2 h-4 w-4"/>Email</TabsTrigger>
                        <TabsTrigger value="geo"><MapPin className="mr-2 h-4 w-4"/>Location</TabsTrigger>
                        <TabsTrigger value="event"><CalendarIcon className="mr-2 h-4 w-4"/>Event</TabsTrigger>
                    </TabsList>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
                <div className="mt-4 max-h-[400px] overflow-y-auto pr-2">
                <TabsContent value="text">
                    <div className="grid gap-2">
                      <Label htmlFor="text-input" className="font-medium">
                        URL or Text to Encode
                      </Label>
                      <Input
                        id="text-input"
                        value={textData}
                        onChange={(e) => setTextData(e.target.value)}
                        placeholder="e.g., https://example.com"
                      />
                    </div>
                </TabsContent>
                <TabsContent value="vcard">
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
                </TabsContent>
                <TabsContent value="wifi">
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
                    </div>
                </TabsContent>
                 <TabsContent value="phone">
                    <div className="grid gap-2">
                        <Label htmlFor="phone-number">Phone Number</Label>
                        <Input id="phone-number" name="phone" type="tel" value={phoneData.phone} onChange={handlePhoneChange} placeholder="+15551234567"/>
                    </div>
                </TabsContent>
                 <TabsContent value="sms">
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
                </TabsContent>
                 <TabsContent value="email">
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
                </TabsContent>
                <TabsContent value="geo">
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
                </TabsContent>
                <TabsContent value="event">
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
                </TabsContent>
                </div>
              </Tabs>


              <Accordion type="multiple" defaultValue={['colors']} className="w-full">
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
                           <div className="grid grid-cols-2 gap-4">
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
                           <div className="grid gap-2">
                              <Label>Rotation</Label>
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
              <div className="relative w-full max-w-[400px] aspect-square rounded-lg bg-gray-100 dark:bg-gray-800 shadow-inner">
                 <div ref={qrWrapperRef} className="absolute inset-0" />
                 <canvas
                    ref={canvasRef}
                    width={CANVAS_SIZE}
                    height={CANVAS_SIZE}
                    className={cn(
                        "absolute top-0 left-0 w-full h-full",
                        activeOverlay ? "cursor-grab" : "",
                        isDragging ? "cursor-grabbing" : ""
                    )}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                 />
                 <canvas ref={finalCanvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="hidden" />
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

    