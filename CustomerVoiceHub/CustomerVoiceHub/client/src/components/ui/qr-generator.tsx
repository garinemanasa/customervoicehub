import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Share } from "lucide-react";

interface Store {
  id: number;
  name: string;
  qrCode?: string;
}

interface QRGeneratorProps {
  stores: Store[];
}

export default function QRGenerator({ stores }: QRGeneratorProps) {
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  
  const selectedStore = stores.find(store => store.id.toString() === selectedStoreId);

  const handleDownload = () => {
    if (!selectedStore?.qrCode) return;
    
    const link = document.createElement('a');
    link.download = `${selectedStore.name}-qr-code.png`;
    link.href = selectedStore.qrCode;
    link.click();
  };

  const handleShare = () => {
    if (!selectedStore) return;
    
    if (navigator.share) {
      navigator.share({
        title: `QR Code for ${selectedStore.name}`,
        text: `Scan this QR code to leave feedback for ${selectedStore.name}`,
        url: `${window.location.origin}/feedback/${selectedStore.id}`,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/feedback/${selectedStore.id}`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6 font-poppins">QR Code Generator</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Select Store</label>
          <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a store..." />
            </SelectTrigger>
            <SelectContent>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id.toString()}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* QR Code Display */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-40 h-40 bg-white border-2 border-border rounded-xl flex items-center justify-center">
            {selectedStore?.qrCode ? (
              <img 
                src={selectedStore.qrCode} 
                alt={`QR Code for ${selectedStore.name}`}
                className="max-w-full max-h-full rounded-lg"
              />
            ) : selectedStoreId ? (
              <div className="text-center text-muted-foreground">
                <div className="text-2xl mb-2">📱</div>
                <p className="text-sm">Generating QR code...</p>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <div className="text-2xl mb-2">📱</div>
                <p className="text-sm">Select a store</p>
              </div>
            )}
          </div>
          
          {selectedStore?.qrCode && (
            <div className="flex space-x-3">
              <Button 
                onClick={handleDownload}
                className="btn-primary rounded-xl text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button 
                onClick={handleShare}
                variant="outline" 
                className="rounded-xl text-sm"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          )}
        </div>

        {selectedStore && (
          <div className="mt-4 p-3 bg-muted rounded-xl">
            <p className="text-xs text-muted-foreground mb-1">Feedback URL:</p>
            <p className="text-sm font-mono text-foreground break-all">
              {window.location.origin}/feedback/{selectedStore.id}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
