import { ticketApi } from "../services/api";
import type { EventItem } from "../types";

import jerseyFlyer from "../assets/images/jersey-hero.jpg";

/*
 * ============================================================
 * FALLBACK EVENT
 * ============================================================
 *
 * This event is ONLY used when Django successfully responds
 * and confirmhttps://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1600&auto=format&fit=crops that there are currently zero events.
 *
 * It is NOT used when the API request fails.
 */
const fallbackEvents: EventItem[] = [
  {
    id: "fallback-1",
    slug: "jersey-party",
    title: "Jersey Party",
    category: "Parties",
    date: "September 20",
    isoDate: "2026-09-20",
    time: "7:00 PM",
    location: "Independence Hall, Abak",
    shortDescription:
      "Rep your favourite jersey and dance the night away — music, fashion and pure energy.",
    description:
      "Get ready for an unforgettable night of music, fashion, energy and good vibes.",
    flyer: jerseyFlyer,
    priceFrom: "₦4,000",
    ticketsAvailable: true,
    is_featured: true,
  },
];

/*
 * ============================================================
 * LIVE EVENT COLLECTION
 * ============================================================
 *
 * Start EMPTY.
 *
 * We do not assume a fallback event exists.
 */
export let events: EventItem[] = [];

/*
 * Featured event.
 *
 * This remains null until the backend has been checked.
 */
export let featuredEvent: EventItem | null = null;

/*
 * ============================================================
 * LOAD EVENTS FROM DJANGO
 * ============================================================
 */
export const initializeLiveEventData =
  async (): Promise<EventItem[]> => {
    try {
      console.log(
        "Fetching live events from Django..."
      );

      const liveData =
        await ticketApi.fetchLiveEvents();

      console.log(
        "Django returned events:",
        liveData
      );

      /*
       * ========================================================
       * :
       * Django returned one or more real events.
       * ========================================================
       *
       * These ALWAYS take priority over the fallback.
       */
      if (
        Array.isArray(liveData) &&
        liveData.length > 0
      ) {
        events = liveData.map(
          (event) => ({
            ...event,
            id: String(event.id),
          })
        );

        featuredEvent =
          events.find(
            (event) => event.is_featured
          ) ??
          events[0] ??
          null;

        console.log(
          "Using live database events:",
          events
        );

        return events;
      }

      /*
       * ========================================================
       * 
       * Django successfully responded but there are
       * genuinely no events.
       * ========================================================
       *
       * use the fallback event.
       */
      console.warn(
        "Django returned zero events. Using fallback event."
      );

      events = [
        ...fallbackEvents,
      ];

      featuredEvent =
        events[0] ?? null;

      return events;

    } catch (error) {

      /*
       * ========================================================
       * CASE 3:
       * Django/API request failed.
       * ========================================================
       *
       * IMPORTANT:
       *
       * We DO NOT use the fallback here.
       *
       * A failed API request does not mean the database
       * contains zero events.
       */
      console.error(
        "Failed to load events from Django:",
        error
      );

      events = [];
      featuredEvent = null;

      return [];
    }
  };


/*
 * ============================================================
 * FIND EVENT BY SLUG
 * ============================================================
 */
export const getEventBySlug = (
  slug: string
): EventItem | undefined => {
  return events.find(
    (event) => event.slug === slug
  );
};