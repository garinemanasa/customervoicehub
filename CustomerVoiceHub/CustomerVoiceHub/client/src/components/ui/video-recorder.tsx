import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/ui/star-rating";
import { RotateCcw, Send } from "lucide-react";

interface VideoRecorderProps {
  storeId: number;
  onSubmitted: () => void;
}

export default function VideoRecorder({ storeId, onSubmitted }: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [rating, setRating] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    initializeCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({
        title: "Camera Access Required",
        description: "Please allow camera and microphone access to record your feedback.",
        variant: "destructive",
      });
    }
  };

  const startRecording = () => {
    if (!stream) return;

    const chunks: BlobPart[] = [];
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      setRecordedBlob(blob);
    };

    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);

    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 120) { // 2 minutes max
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
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

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
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
      formData.append('type', 'video');
      formData.append('rating', rating.toString());
      formData.append('media', recordedBlob, 'feedback-video.webm');

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
    <div className="relative h-full bg-gray-900">
      {/* Video Preview */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
      />
      
      {/* Recording Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-end p-6">
        {/* Recording Timer */}
        {isRecording && (
          <div className="text-center mb-6">
            <div className="bg-red-600 text-white px-3 py-1 rounded-full inline-flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center items-center space-x-8 mb-6">
          {/* Record/Stop Button */}
          <Button
            onClick={toggleRecording}
            className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-all"
            disabled={submitFeedbackMutation.isPending}
          >
            <div className={`transition-all ${
              isRecording 
                ? "w-6 h-6 bg-white rounded-sm" 
                : "w-8 h-8 bg-white rounded-full"
            }`} />
          </Button>
          
          {/* Camera Flip (placeholder) */}
          <Button
            variant="ghost"
            className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-30 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>

        {/* Submit Section */}
        {hasRecorded && (
          <div className="bg-white rounded-xl p-4 space-y-4">
            {/* Star Rating */}
            <div className="text-center">
              <p className="text-foreground mb-2 font-medium">Rate your experience</p>
              <StarRating rating={rating} onChange={setRating} />
            </div>
            
            {/* Submit Button */}
            <Button
              onClick={() => submitFeedbackMutation.mutate()}
              disabled={rating === 0 || submitFeedbackMutation.isPending}
              className="w-full btn-primary py-3 rounded-xl font-semibold"
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
    </div>
  );
}
