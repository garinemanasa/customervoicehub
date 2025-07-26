import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onChange: (rating: number) => void;
  size?: "small" | "medium" | "large";
  readonly?: boolean;
}

export default function StarRating({ 
  rating, 
  onChange, 
  size = "medium", 
  readonly = false 
}: StarRatingProps) {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-6 h-6",
    large: "w-8 h-8",
  };

  const handleStarClick = (starRating: number) => {
    if (!readonly) {
      onChange(starRating);
    }
  };

  return (
    <div className="flex justify-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleStarClick(star)}
          disabled={readonly}
          className={`transition-colors ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:text-yellow-400'
          }`}
        >
          <Star
            className={`${sizeClasses[size]} ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
