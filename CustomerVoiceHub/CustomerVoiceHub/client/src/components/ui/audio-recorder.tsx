import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/ui/star-rating";
import { Mic, Square, Play, Pause, Send } from "lucide-react";

interface AudioRecorderProps {
  storeId: number;
  onSubmitted: () => void;
}

export default function AudioRecorder({ storeId, onSubmitted }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [rating, setRating] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: BlobPart[] = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 300) { // 5 minutes max
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to record your feedback.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setHasRecorded(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const submitFeedbackMutation = useMutation({
    mutationFn: async () => {
      if (!recordedBlob || rating === 0) {
        throw new Error("Please complete your recording and rating");
      }

      const formData = new FormData();
      formData.append('storeId', storeId.toString());
      formData.append('type', 'audio');
      formData.append('rating', rating.toString());
      formData.append('media', recordedBlob, 'feedback-audio.webm');

      const response = await apiRequest('POST', '/api/feedback', formData);
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

  return (
    <div className="flex-1 p-6 flex flex-col">
      {/* Avatar Encouragement */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <Mic className="w-8 h-8 text-white" />
        </div>
        <p className="text-muted-foreground">
          Press and hold the record button to share your thoughts with us.
        </p>
      </div>

      {/* Recording Interface */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        {/* Recording Visualization */}
        <div className="relative">
          {isRecording && (
            <div className="absolute inset-0 rounded-full border-4 border-secondary animate-ping opacity-30"></div>
          )}
          <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
            isRecording ? 'bg-red-600' : 'bg-secondary'
          }`}>
            <Mic className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Timer */}
        {(isRecording || hasRecorded) && (
          <div className="text-center">
            <div className={`px-4 py-2 rounded-full font-mono text-lg ${
              isRecording ? 'bg-red-100 text-red-600' : 'bg-muted text-foreground'
            }`}>
              {formatTime(recordingTime)}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center space-x-4">
          {!hasRecorded ? (
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-16 h-16 rounded-full ${
                isRecording ? 'bg-red-600 hover:bg-red-700' : 'btn-secondary'
              }`}
              disabled={submitFeedbackMutation.isPending}
            >
              {isRecording ? (
                <Square className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </Button>
          ) : (
            <Button
              onClick={togglePlayback}
              className="w-16 h-16 rounded-full btn-secondary"
              disabled={submitFeedbackMutation.isPending}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white ml-1" />
              )}
            </Button>
          )}
        </div>

        {/* Action Text */}
        <p className="text-sm text-muted-foreground text-center">
          {!hasRecorded && !isRecording && "Tap to start recording"}
          {isRecording && "Recording... Tap to stop"}
          {hasRecorded && "Tap to replay"}
        </p>
      </div>

      {/* Hidden Audio Element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}

      {/* Submit Section */}
      {hasRecorded && (
        <div className="space-y-6">
          {/* Star Rating */}
          <div className="text-center">
            <p className="text-foreground mb-3 font-medium">Rate your experience</p>
            <StarRating rating={rating} onChange={setRating} />
          </div>
          
          {/* Submit Button */}
          <Button
            onClick={() => submitFeedbackMutation.mutate()}
            disabled={rating === 0 || submitFeedbackMutation.isPending}
            className="w-full btn-primary py-4 rounded-xl font-semibold"
          >
            {submitFeedbackMutation.isPending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Send Feedback
          </Button>
        </div>
      )}
    </div>
  );
}
