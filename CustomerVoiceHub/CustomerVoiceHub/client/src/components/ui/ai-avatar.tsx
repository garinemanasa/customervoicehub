import { Button } from "@/components/ui/button";
import { Video, Mic, MessageSquare, ChevronRight } from "lucide-react";

interface AIAvatarProps {
  storeName: string;
  onFeedbackTypeSelect: (type: "video" | "audio" | "text") => void;
  isDemo?: boolean;
}

export default function AIAvatar({ storeName, onFeedbackTypeSelect, isDemo = false }: AIAvatarProps) {
  return (
    <>
      {/* Avatar Display */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          {/* AI Avatar */}
          <div className="w-32 h-32 bg-gradient-to-br from-avatar-accent to-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <div className="text-6xl text-white">😊</div>
          </div>
          {/* Animated pulse ring */}
          <div className="absolute inset-0 rounded-full border-4 border-avatar-accent animate-pulse opacity-30"></div>
        </div>
        
        {/* Speech Bubble */}
        <div className="bg-white rounded-xl p-4 shadow-lg border border-border max-w-xs mx-auto relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white border-l border-t border-border rotate-45"></div>
          <p className="text-foreground font-medium">
            {isDemo ? (
              "Welcome to our demo! 🎉 I'm your AI feedback assistant. Try out our different feedback options below to see how customers share their experiences!"
            ) : (
              `Hi there! 👋 I'm here to help you share your feedback about your experience at ${storeName}. How would you like to tell us about your visit?`
            )}
          </p>
        </div>
      </div>

      {/* Feedback Options */}
      <div className="space-y-4 flex-1">
        <Button
          onClick={() => onFeedbackTypeSelect("video")}
          className="w-full p-6 bg-white rounded-xl border-2 border-border hover:border-success hover:bg-success/5 transition-all duration-200 text-left group h-auto"
          variant="ghost"
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center group-hover:bg-success group-hover:bg-opacity-10">
                <Video className="w-6 h-6 text-success" />
              </div>
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-foreground mb-1 font-poppins">Video Message</h3>
              <p className="text-sm text-muted-foreground">Record a video to share your experience (up to 2 minutes)</p>
            </div>
            <div className="flex-shrink-0">
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-success" />
            </div>
          </div>
        </Button>

        <Button
          onClick={() => onFeedbackTypeSelect("audio")}
          className="w-full p-6 bg-white rounded-xl border-2 border-border hover:border-secondary hover:bg-secondary/5 transition-all duration-200 text-left group h-auto"
          variant="ghost"
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center group-hover:bg-secondary group-hover:bg-opacity-10">
                <Mic className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-foreground mb-1 font-poppins">Voice Message</h3>
              <p className="text-sm text-muted-foreground">Record an audio message (up to 5 minutes)</p>
            </div>
            <div className="flex-shrink-0">
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary" />
            </div>
          </div>
        </Button>

        <Button
          onClick={() => onFeedbackTypeSelect("text")}
          className="w-full p-6 bg-white rounded-xl border-2 border-border hover:border-avatar-accent hover:bg-avatar-accent/5 transition-all duration-200 text-left group h-auto"
          variant="ghost"
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-avatar-accent/10 rounded-xl flex items-center justify-center group-hover:bg-avatar-accent group-hover:bg-opacity-10">
                <MessageSquare className="w-6 h-6 text-avatar-accent" />
              </div>
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-foreground mb-1 font-poppins">Written Feedback</h3>
              <p className="text-sm text-muted-foreground">Type your thoughts and suggestions</p>
            </div>
            <div className="flex-shrink-0">
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-avatar-accent" />
            </div>
          </div>
        </Button>
      </div>
    </>
  );
}
