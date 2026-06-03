import React, { useState, useEffect } from "react";
import { getOfferText } from "../../services/firestore-service";

export function OfferScroller() {
  const [offerText, setOfferText] = useState<string | null>(null);

  useEffect(() => {
    const fetchOfferText = async () => {
      try {
        const text = await getOfferText();
        setOfferText(text);
      } catch (error) {
        console.error("Failed to fetch offer text:", error);
      }
    };

    fetchOfferText();
  }, []);

  if (!offerText) {
    return null;
  }

  // Create repeating pattern with stars
  const repeatingText = Array(8).fill(`⭐ ${offerText} `).join("");

  return (
    <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white py-1 overflow-hidden">
      <div className="relative flex items-center">
        <div className="flex-1 overflow-hidden">
          <style>{`
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .offer-scroller {
              display: flex;
              animation: scroll 30s linear infinite;
              gap: 0.5rem;
            }
            .offer-scroller:hover {
              animation-play-state: paused;
            }
          `}</style>
          <div className="offer-scroller">
            <span className="offer-text whitespace-nowrap text-[10px] md:text-xs font-semibold tracking-wide opacity-95">
              {repeatingText}
            </span>
            <span className="offer-text whitespace-nowrap text-[10px] md:text-xs font-semibold tracking-wide opacity-95">
              {repeatingText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
