import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import SectionTitle from "../components/SectionTitle";
import TicketCard from "../components/TicketCard";
import OrderSummary from "../components/OrderSummary";

import {
  initializeTicketOptionsData,
} from "../data/tickets";

import { useCheckout } from "../hooks/useCheckout";

import type {
  SelectedTicket,
  TicketOption,
} from "../types";


const Tickets = () => {

  const { eventId } = useParams<{
    eventId: string;
  }>();

  const {
    selectedTicket,
    setSelectedTicket,
  } = useCheckout();


  const [ticketOptions, setTicketOptions] =
    useState<TicketOption[]>([]);

  const [loading, setLoading] =
    useState(true);


  /*
   * ============================================================
   * LOAD TICKETS FOR THE CURRENT EVENT
   * ============================================================
   */

  useEffect(() => {

    const loadTickets = async () => {

      if (!eventId) {
        console.error(
          "Tickets page loaded without an event ID."
        );

        setLoading(false);
        return;
      }


      setLoading(true);

      try {

        console.log(
          `Loading tickets for event ${eventId}`
        );

        const tickets =
          await initializeTicketOptionsData(
            eventId
          );

        setTicketOptions(tickets);

      } catch (error) {

        console.error(
          "Failed to load ticket options:",
          error
        );

        setTicketOptions([]);

      } finally {

        setLoading(false);

      }

    };


    loadTickets();

  }, [eventId]);


  /*
   * ============================================================
   * QUANTITIES
   * ============================================================
   */

  const [quantities, setQuantities] =
    useState<Record<string, number>>({});


  useEffect(() => {

    if (ticketOptions.length === 0) {
      setQuantities({});
      return;
    }


    const initialQuantities =
      Object.fromEntries(
        ticketOptions.map(
          (ticket) => [
            ticket.id,
            1,
          ]
        )
      );


    setQuantities(
      initialQuantities
    );

  }, [ticketOptions]);


  /*
   * ============================================================
   * QUANTITY CHANGE
   * ============================================================
   */

  const handleQuantityChange = (
    ticketId: string,
    quantity: number
  ) => {

    setQuantities((prev) => ({
      ...prev,
      [ticketId]: quantity,
    }));


    if (
      selectedTicket?.ticketId ===
      ticketId
    ) {

      setSelectedTicket({
        ...selectedTicket,
        quantity,
      });

    }

  };


  /*
   * ============================================================
   * SELECT TICKET
   * ============================================================
   */

  const handleSelect = (
    ticketId: string
  ) => {

    const ticket =
      ticketOptions.find(
        (item) =>
          item.id === ticketId
      );


    if (!ticket) {
      return;
    }


    const next: SelectedTicket = {

      eventId: Number(eventId),

      ticketId: ticket.id,

      tier: ticket.tier,

      price: ticket.price,

      quantity:
        quantities[ticketId] ?? 1,

    };


    setSelectedTicket(next);

  };


  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {

    return (
      <section className="section-pad pt-32">

        <div className="container-x text-center">

          <p className="text-mute">
            Loading ticket options...
          </p>

        </div>

      </section>
    );

  }


  /*
   * ============================================================
   * INVALID / MISSING EVENT
   * ============================================================
   */

  if (!eventId) {

    return (
      <section className="section-pad pt-32 pb-32">

        <div className="container-x text-center">

          <h2 className="text-2xl font-bold text-bone">
            Event Not Selected
          </h2>

          <p className="mt-3 text-mute">
            Please select an event before choosing
            tickets.
          </p>

        </div>

      </section>
    );

  }


  /*
   * ============================================================
   * NO TICKETS
   * ============================================================
   */

  if (ticketOptions.length === 0) {

    return (
      <section className="section-pad pt-32 pb-32">

        <div className="container-x text-center">

          <h2 className="text-2xl font-bold text-bone">
            No Tickets Available
          </h2>

          <p className="mt-3 text-mute">
            Tickets are currently unavailable
            for this event.
          </p>

        </div>

      </section>
    );

  }


  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (

    <section className="section-pad pt-32 pb-32 lg:pb-28">

      <div className="container-x">

        <SectionTitle
          eyebrow="Tickets"
          title="Choose Your Experience"
          description="Select the ticket that works best for you."
          align="center"
        />


        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">

            {ticketOptions.map(
              (ticket, index) => (

                <TicketCard
                  key={ticket.id}

                  ticket={ticket}

                  quantity={
                    quantities[
                      ticket.id
                    ] ?? 1
                  }

                  selected={
                    selectedTicket?.ticketId ===
                    ticket.id
                  }

                  onQuantityChange={(
                    quantity
                  ) =>
                    handleQuantityChange(
                      ticket.id,
                      quantity
                    )
                  }

                  onSelect={() =>
                    handleSelect(
                      ticket.id
                    )
                  }

                  index={index}
                />

              )
            )}

          </div>


          <OrderSummary
            selectedTicket={
              selectedTicket
            }
          />

        </div>

      </div>

    </section>

  );

};


export default Tickets;