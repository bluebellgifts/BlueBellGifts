import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getOfferBannerImages } from "../../services/firestore-service";

interface BannerImage {
  id: string;
  imageUrl: string;
  fileName: string;
  fileSize?: number;
}

export function OfferBannerCarousel() {
  const [banners, setBanners] = useState<BannerImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (!autoPlayEnabled || banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [autoPlayEnabled, banners.length]);

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const images = await getOfferBannerImages();
      setBanners(images || []);
    } catch (error) {
      console.error("Failed to fetch offer banners:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    setAutoPlayEnabled(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
    setAutoPlayEnabled(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setAutoPlayEnabled(false);
  };

  if (isLoading) {
    return (
      <div className="w-full bg-gradient-to-r from-slate-100 to-slate-200 h-48 md:h-80 animate-pulse rounded-xl flex items-center justify-center">
        <p className="text-slate-500">Loading banners...</p>
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-white rounded-xl overflow-hidden shadow-lg">
      {/* Main Carousel */}
      <div className="relative h-48 md:h-80 lg:h-96 overflow-hidden bg-slate-900">
        {/* Slide */}
        <div className="relative w-full h-full">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={banner.imageUrl}
                alt={banner.fileName}
                className="w-full h-full object-cover"
              />
            </div>
          ))}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        </div>

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              onMouseEnter={() => setAutoPlayEnabled(false)}
              onMouseLeave={() => setAutoPlayEnabled(true)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-slate-900 p-2 rounded-full transition-all duration-200 group"
            >
              <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={goToNext}
              onMouseEnter={() => setAutoPlayEnabled(false)}
              onMouseLeave={() => setAutoPlayEnabled(true)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-slate-900 p-2 rounded-full transition-all duration-200 group"
            >
              <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-8 bg-white"
                      : "w-2 bg-white/50 hover:bg-white/75"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Counter */}
      {banners.length > 1 && (
        <div className="px-4 py-2 bg-slate-50 text-center text-xs text-slate-600">
          {currentIndex + 1} / {banners.length}
        </div>
      )}
    </div>
  );
}
