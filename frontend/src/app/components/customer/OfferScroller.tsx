import React, { useState, useEffect } from "react";
import { getOfferText } from "../../services/firestore-service";
import "./OfferScroller.css";

export function OfferScroller() {
  const [offerText, setOfferText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOfferText = async () => {
      try {
        const text = await getOfferText();
        setOfferText(text || "");
      } catch (error) {
        console.error("Failed to fetch offer text:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOfferText();
  }, []);

  if (isLoading || !offerText) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white py-2 md:py-3 overflow-hidden shadow-lg">
      <div className="relative flex items-center">
        {/* Star Icon */}
        <div className="flex-shrink-0 px-4 md:px-6">
          <span className="text-lg md:text-xl animate-bounce">⭐</span>
        </div>

        {/* Scrolling Text */}
        <div className="flex-1 overflow-hidden">
          <div className="offer-scroller">
            <span className="offer-text px-4 md:px-6 whitespace-nowrap text-sm md:text-base font-semibold">
              {offerText}
            </span>
            {/* Duplicate for seamless loop */}
            <span className="offer-text px-4 md:px-6 whitespace-nowrap text-sm md:text-base font-semibold">
              {offerText}
            </span>
          </div>
        </div>

        {/* Star Icon */}
        <div className="flex-shrink-0 px-4 md:px-6">
          <span className="text-lg md:text-xl animate-bounce">⭐</span>
        </div>
      </div>
    </div>
  );
}
