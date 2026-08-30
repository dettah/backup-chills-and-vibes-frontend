import { ticketApi } from "../services/api";
import type { TicketOption } from "../types";


export let ticketOptions: TicketOption[] = [];


export const initializeTicketOptionsData =
  async (
    eventId: string | number
  ): Promise<TicketOption[]> => {

    const liveTiers =
      await ticketApi.fetchEventTickets(
        eventId
      );


    if (
      !Array.isArray(liveTiers)
    ) {

      throw new Error(
        "Invalid ticket API response."
      );

    }


    ticketOptions =
      liveTiers.map(
        (tier) => ({
          ...tier,
          id: String(tier.id),
        })
      );


    return ticketOptions;
  };


export const getTicketById = (
  id: string
): TicketOption | undefined => {

  return ticketOptions.find(
    (ticket) =>
      ticket.id === id
  );

};