import { ticketApi } from "../services/api";
import type { EventItem } from "../types";

import jerseyFlyer from "../assets/images/jersey-hero.jpg";

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
  },
];

/**
 * Current event collection used by the frontend.
 */
export let events: EventItem[] = [...fallbackEvents];

/**
 * Featured event used by the Home page and Checkout context.
 */
export let featuredEvent: EventItem = events[0];

/**
 * Loads events from Django.
 */
export const initializeLiveEventData = async (): Promise<EventItem[]> => {
  try {
    const liveData = await ticketApi.fetchLiveEvents();

    if (Array.isArray(liveData) && liveData.length > 0) {
      events = liveData.map((event) => ({
        ...event,
        id: String(event.id),
      }));

      featuredEvent = events[0];
    } else {
      events = [...fallbackEvents];
      featuredEvent = events[0];
    }
  } catch (error) {
    console.warn(
      "Backend API unreachable. Falling back to static events:",
      error
    );

    events = [...fallbackEvents];
    featuredEvent = events[0];
  }

  return events;
};

/**
 * Finds an event using its slug.
 */
export const getEventBySlug = (
  slug: string
): EventItem | undefined => {
  return events.find((event) => event.slug === slug);
};