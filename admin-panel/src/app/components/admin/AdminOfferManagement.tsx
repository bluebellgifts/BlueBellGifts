import React, { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Modal } from "../ui/Modal";
import { toast } from "sonner";
// @ts-ignore
import { Trash2, Upload } from "lucide-react";
import {
  uploadOfferBannerImage,
  getOfferBannerImages,
  saveOfferText,
  getOfferText,
  deleteOfferBanner,
} from "../../services/firestore-service";

export function AdminOfferManagement() {
  const [offerText, setOfferText] = useState("");
  const [bannerImages, setBannerImages] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: number]: number;
  }>({});
  const [imageLoadError, setImageLoadError] = useState<{
    [key: string]: boolean;
  }>({});
  const [loadingImages, setLoadingImages] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    fetchOfferData();
  }, []);

  const fetchOfferData = async () => {
    setIsLoading(true);
    try {
      const text = await getOfferText();
      setOfferText(text || "");
      const images = await getOfferBannerImages();
      setBannerImages(images || []);
    } catch (error) {
      toast.error("Failed to load offer data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveText = async () => {
    setIsLoading(true);
    try {
      await saveOfferText(offerText);
      toast.success("Offer text updated");
    } catch (error) {
      toast.error("Failed to update offer text");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleBannerUpload = async () => {
    if (selectedFiles.length === 0) return;
    setIsLoading(true);
    try {
      // Upload all selected files
      for (let i = 0; i < selectedFiles.length; i++) {
        setUploadProgress((prev) => ({ ...prev, [i]: 0 }));
        try {
          await uploadOfferBannerImage(selectedFiles[i]);
          setUploadProgress((prev) => ({ ...prev, [i]: 100 }));
          toast.success(`${selectedFiles[i].name} uploaded`);
        } catch (error) {
          toast.error(`Failed to upload ${selectedFiles[i].name}`);
        }
      }
      setSelectedFiles([]);
      setUploadProgress({});
      fetchOfferData();
    } catch (error) {
      toast.error("Failed to upload banner images");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    try {
      setIsLoading(true);
      await deleteOfferBanner(bannerId);
      toast.success("Banner deleted");
      fetchOfferData();
    } catch (error) {
      toast.error("Failed to delete banner");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshImageURL = async (bannerId: string) => {
    try {
      // Try to reload the image by creating a new version of banners state
      toast.info("Attempting to refresh image...");
      fetchOfferData(); // Refetch all banner data
    } catch (error) {
      toast.error("Failed to refresh image");
    }
  };

  return (
    <Card className="p-4 md:p-6 space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-[#0f1419]">
        Offer Management
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Offer Text</label>
          <Input
            value={offerText}
            onChange={(e) => setOfferText(e.target.value)}
            placeholder="Enter offer text..."
          />
          <Button
            className="mt-2"
            onClick={handleSaveText}
            disabled={isLoading}
          >
            Save Text
          </Button>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Offer Banner Images (Upload Multiple)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelection}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {selectedFiles.length > 0 && (
            <div className="mt-2 space-y-2">
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded"
                >
                  <span className="text-xs text-gray-700">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </span>
                </div>
              ))}
            </div>
          )}
          <Button
            className="mt-2"
            onClick={handleBannerUpload}
            disabled={isLoading || selectedFiles.length === 0}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload {selectedFiles.length} Banner
            {selectedFiles.length !== 1 ? "s" : ""}
          </Button>

          {/* Display Uploaded Banners */}
          {bannerImages.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">
                Uploaded Banners ({bannerImages.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {bannerImages.map((banner) => (
                  <div key={banner.id} className="relative group">
                    <div className="relative rounded shadow overflow-hidden bg-gray-100 h-32 w-full flex items-center justify-center">
                      {loadingImages[banner.id] && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                          <span className="text-xs text-gray-500">
                            Loading...
                          </span>
                        </div>
                      )}
                      {imageLoadError[banner.id] ? (
                        <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
                          <span className="text-xs text-gray-600 text-center px-2">
                            Failed to load image
                          </span>
                        </div>
                      ) : (
                        <img
                          src={banner.imageUrl}
                          alt={banner.fileName}
                          className="h-full w-full object-cover"
                          onLoadStart={() =>
                            setLoadingImages((prev) => ({
                              ...prev,
                              [banner.id]: true,
                            }))
                          }
                          onLoad={() =>
                            setLoadingImages((prev) => ({
                              ...prev,
                              [banner.id]: false,
                            }))
                          }
                          onError={() => {
                            setImageLoadError((prev) => ({
                              ...prev,
                              [banner.id]: true,
                            }));
                            setLoadingImages((prev) => ({
                              ...prev,
                              [banner.id]: false,
                            }));
                          }}
                        />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded transition-all duration-200 flex items-center justify-center">
                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        disabled={isLoading}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 truncate">
                      {banner.fileName}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {(banner.fileSize / 1024).toFixed(1)} KB
                    </div>
                    {imageLoadError[banner.id] && (
                      <div className="mt-1">
                        <a
                          href={banner.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline text-[10px]"
                          title="Click to open image directly in browser"
                        >
                          Open Direct URL
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
