"use client";

import { useState, useEffect, useRef, type FC } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { Download, Palette, Settings2 } from "lucide-react";

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
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [imageKey, setImageKey] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!text.trim()) {
      setQrCodeDataUrl(null);
      return;
    }

    const generateQrCode = async () => {
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
        if (canvasRef.current) {
          await QRCode.toCanvas(canvasRef.current, text, options);
          const dataUrl = canvasRef.current.toDataURL("image/png");
          setQrCodeDataUrl(dataUrl);
          setImageKey((k) => k + 1);
        }
      } catch (err) {
        console.error("Failed to generate QR code:", err);
        setQrCodeDataUrl(null);
      }
    };

    const timeoutId = setTimeout(generateQrCode, 300);
    return () => clearTimeout(timeoutId);
  }, [text, foregroundColor, backgroundColor, errorCorrectionLevel]);

  const handleDownload = () => {
    if (!qrCodeDataUrl || !canvasRef.current) return;

    const mimeType = downloadFormat === "jpeg" ? "image/jpeg" : "image/png";
    const downloadUrl = canvasRef.current.toDataURL(mimeType, 1.0);

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

              <div className="grid gap-4 rounded-lg border p-4">
                <h3 className="flex items-center text-lg font-semibold">
                  <Palette className="mr-2 h-5 w-5 text-accent" />
                  Customize Colors
                </h3>
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
              </div>

              <div className="grid gap-4 rounded-lg border p-4">
                 <h3 className="flex items-center text-lg font-semibold">
                  <Settings2 className="mr-2 h-5 w-5 text-accent" />
                  Advanced Settings
                </h3>
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
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div
                className="relative flex aspect-square w-full max-w-[300px] items-center justify-center rounded-lg p-4 shadow-inner"
                style={{ backgroundColor }}
              >
                {qrCodeDataUrl ? (
                  <Image
                    key={imageKey}
                    src={qrCodeDataUrl}
                    alt="Generated QR Code"
                    width={300}
                    height={300}
                    className="animate-in fade-in-0 zoom-in-95 duration-500"
                    unoptimized
                    data-ai-hint="qr code"
                  />
                ) : text.trim() ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <p>Your QR code will appear here.</p>
                    <p className="text-sm">Enter some text to begin.</p>
                  </div>
                )}
              </div>
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
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </main>
  );
}
