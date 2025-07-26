import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import StarRating from "@/components/ui/star-rating";
import { Send } from "lucide-react";

interface TextFeedbackFormProps {
  storeId: number;
  onSubmitted: () => void;
}

export default function TextFeedbackForm({ storeId, onSubmitted }: TextFeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const submitFeedbackMutation = useMutation({
    mutationFn: async () => {
      if (rating === 0) {
        throw new Error("Please provide a rating");
      }
      if (!message.trim()) {
        throw new Error("Please write your feedback");
      }

      const response = await apiRequest('POST', '/api/feedback', {
        storeId,
        type: 'text',
        rating,
        message: message.trim(),
        customerEmail: email.trim() || null,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted!",
        description: "Thank you for sharing your experience with us.",
      });
      onSubmitted();
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFeedbackMutation.mutate();
  };

  return (
    <div className="flex-1 p-6 flex flex-col space-y-6">
      {/* Avatar Encouragement */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-avatar-accent to-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="text-3xl text-white">😊</div>
        </div>
        <p className="text-muted-foreground">Tell us about your experience! Your feedback helps us improve.</p>
      </div>

      {/* Feedback Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-6">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            How would you rate your experience?
          </label>
          <div className="flex justify-center">
            <StarRating rating={rating} onChange={setRating} size="large" />
          </div>
        </div>

        {/* Text Area */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-foreground mb-2">
            Share your thoughts
          </label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-40 resize-none"
            placeholder="What did you love? What could we improve? Your honest feedback is valuable to us..."
            maxLength={500}
          />
          <div className="mt-2 text-right">
            <span className={`text-sm ${message.length > 450 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {message.length}/500
            </span>
          </div>
        </div>

        {/* Optional Contact */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email (optional)
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            We'll only use this to follow up if needed
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={rating === 0 || !message.trim() || submitFeedbackMutation.isPending}
          className="w-full btn-primary py-4 rounded-xl font-semibold"
        >
          {submitFeedbackMutation.isPending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          Send Feedback
        </Button>
      </form>
    </div>
  );
}
