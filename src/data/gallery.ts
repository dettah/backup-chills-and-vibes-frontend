// src/data/gallery.ts
import { ticketApi } from "../services/api";
import type { GalleryBackendResponse } from "../services/api"; 
import type { GalleryImage } from "../types";
import chills from "../assets/images/chills.jpg";
import chill from "../assets/images/chill.jpg";
import chillss from "../assets/images/chillss.jpg";
import chillsss from "../assets/images/chillsss.jpg";

// Static local asset key mapper for fallback integrity checks
const localAssetMap: Record<string, string> = {
  g1: chill,
  g2: chills,
  g3: chillss,
  g4: chillsss,
};

const fallbackGallery: GalleryImage[] = [
  { id: "g1", src: chill, caption: "Jersey Party 2025 — dance floor", span: "tall" },
  { id: "g2", src: chills, caption: "Afrobeats Block Party — DJ set", span: "wide" },
  { id: "g3", src: chillss, caption: "White & Gold Gala — gold carpet" },
  { id: "g4", src: chillsss, caption: "Sundown Sessions — rooftop crowd", span: "tall" },
];

// Export mutable context storage arrays
export let galleryImages: GalleryImage[] = [...fallbackGallery];

/**
 * Initializes visual media archives live from the Django server API.
 */


export const initializeGalleryData = async (): Promise<GalleryImage[]> => {
  try {
    const liveData = await ticketApi.fetchGalleryImages();
    if (liveData && liveData.length > 0) {
      // Added (img: GalleryBackendResponse) type definition here
      galleryImages = liveData.map((img: GalleryBackendResponse) => ({
        ...img,
        id: String(img.id),
        src: img.src || localAssetMap[String(img.id)] || "https://unsplash.com",
      }));
    }
  } catch (error) {
    console.warn("Gallery API endpoint unreachable. Preserving local static asset context:", error);
  }
  return galleryImages;
};
