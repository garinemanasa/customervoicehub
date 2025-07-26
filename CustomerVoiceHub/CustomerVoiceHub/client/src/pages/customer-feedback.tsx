import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AIAvatar from "@/components/ui/ai-avatar";
import VideoRecorder from "@/components/ui/video-recorder";
import AudioRecorder from "@/components/ui/audio-recorder";
import TextFeedbackForm from "@/components/ui/text-feedback-form";

type FeedbackType = "video" | "audio" | "text" | null;
type ViewState = "welcome" | "feedback" | "success";

export default function CustomerFeedback() {
  const [, params] = useRoute("/feedback/:storeId");
  const storeId = params?.storeId;
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(null);
  const [viewState, setViewState] = useState<ViewState>("welcome");

  // Fetch store information
  const { data: store, isLoading } = useQuery({
    queryKey: [`/api/stores/${storeId}`],
    enabled: !!storeId,
    retry: false,
  });

  useEffect(() => {
    if (!storeId) {
      window.location.href = "/";
    }
  }, [storeId]);

  const handleFeedbackTypeSelect = (type: FeedbackType) => {
    setFeedbackType(type);
    setViewState("feedback");
  };

  const isDemo = storeId === 'demo';

  const handleGoBack = () => {
    if (viewState === "feedback") {
      setViewState("welcome");
      setFeedbackType(null);
    } else {
      window.location.href = "/";
    }
  };

  const handleFeedbackSubmitted = () => {
    setViewState("success");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading store information...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-xl p-8 text-center shadow-lg">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-semibold mb-4 font-poppins">Store Not Found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find the store you're looking for. Please check the QR code and try again.
          </p>
          <Button onClick={() => window.location.href = "/"} className="btn-primary rounded-xl">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  // Success View
  if (viewState === "success") {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col justify-center items-center p-8">
          <div className="text-center space-y-6">
            <div className="w-32 h-32 bg-success rounded-full flex items-center justify-center mx-auto">
              <div className="text-4xl text-white">✓</div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground font-poppins">Thank You!</h2>
              <p className="text-muted-foreground">
                Your feedback has been successfully submitted and will help us improve our service.
              </p>
            </div>
            
            <div className="bg-muted rounded-xl p-4">
              <p className="text-sm text-muted-foreground">
                <span className="inline-block w-4 h-4 mr-2">🕒</span>
                Submitted at {new Date().toLocaleTimeString()}
              </p>
            </div>
            
            <Button 
              onClick={() => window.location.href = "/"} 
              className="btn-primary rounded-xl px-8 py-3"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Feedback Recording View
  if (viewState === "feedback" && feedbackType) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Button variant="ghost" size="sm" onClick={handleGoBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h2 className="font-semibold text-foreground">
              {feedbackType === "video" && "Video Feedback"}
              {feedbackType === "audio" && "Voice Message"}
              {feedbackType === "text" && "Written Feedback"}
            </h2>
            <Button variant="ghost" size="sm" onClick={() => window.location.href = "/"}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1">
            {feedbackType === "video" && (
              <VideoRecorder 
                storeId={isDemo ? 1 : parseInt(storeId!)} 
                onSubmitted={handleFeedbackSubmitted} 
                isDemo={isDemo}
              />
            )}
            {feedbackType === "audio" && (
              <AudioRecorder 
                storeId={isDemo ? 1 : parseInt(storeId!)} 
                onSubmitted={handleFeedbackSubmitted} 
                isDemo={isDemo}
              />
            )}
            {feedbackType === "text" && (
              <TextFeedbackForm 
                storeId={isDemo ? 1 : parseInt(storeId!)} 
                onSubmitted={handleFeedbackSubmitted} 
                isDemo={isDemo}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Welcome View with AI Avatar
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              className="w-10 h-10 rounded-lg object-cover" 
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
              alt="Store" 
            />
            <div>
              <h2 className="font-semibold text-foreground font-poppins">{store.name}</h2>
              <p className="text-sm text-muted-foreground">
                {isDemo ? "Experience our AI demo" : "Share your experience"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => window.location.href = "/"}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Demo Banner */}
        {isDemo && (
          <div className="bg-blue-50 border-b border-blue-200 p-3">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-blue-700 font-medium">Demo Mode - Experience our AI-powered feedback system</p>
            </div>
          </div>
        )}

        {/* AI Avatar and Feedback Options */}
        <div className="flex-1 p-6 flex flex-col">
          <AIAvatar 
            storeName={store.name}
            onFeedbackTypeSelect={handleFeedbackTypeSelect}
            isDemo={isDemo}
          />

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              Powered by FeedbackFlow • Your privacy is protected
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
