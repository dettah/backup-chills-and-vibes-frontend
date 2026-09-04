import {
  useEffect,
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import {
  Link,
} from "react-router-dom";

import {
  QRCodeSVG,
} from "qrcode.react";

import {
  HiOutlineDownload,
  HiOutlineHome,
  HiCheckCircle,
} from "react-icons/hi";

import type {
  CustomerInfo,
  EventItem,
  SelectedTicket,
} from "../types";

import {
  formatNaira,
} from "../utils/format";

import {
  ticketApi,
  type GuestTicket,
} from "../services/api";

import { useCheckout } from "../hooks/useCheckout";

// import Button from "./Button";


interface SuccessScreenProps {
  customer: CustomerInfo;
  ticket: SelectedTicket;
  event: EventItem;
  reference: string;
}


const SuccessScreen = ({
  customer,
  ticket,
  event,
  reference,
}: SuccessScreenProps) => {

  const { reset } = useCheckout();

  const total =
    ticket.price *
    ticket.quantity;


  /*
   * ============================================================
   * INDIVIDUAL GENERATED TICKETS
   * ============================================================
   */

  const [
    generatedTickets,
    setGeneratedTickets,
  ] = useState<GuestTicket[]>([]);


  const [
    ticketsLoading,
    setTicketsLoading,
  ] = useState(true);


  const [
    ticketsError,
    setTicketsError,
  ] = useState("");


  /*
   * ============================================================
   * FETCH ACTUAL TICKET ROWS
   * ============================================================
   *
   * "reference" is actually our order_hash because Checkout
   * passes verification.order_hash to onSuccess().
   *
   * We therefore use reference + customer.email to retrieve
   * the individual generated ticket hashes.
   */

  useEffect(() => {

    let cancelled = false;


    const loadTickets =
      async () => {

        try {

          setTicketsLoading(true);

          setTicketsError("");


          const response =
            await ticketApi.fetchOrderTickets(
              reference,
              customer.email
            );


          if (
            !cancelled
          ) {

            setGeneratedTickets(
              response.tickets
            );

          }

        } catch (
        error: any
        ) {

          console.error(
            "Unable to load generated tickets:",
            error
          );


          if (
            !cancelled
          ) {

            setTicketsError(
              error?.response?.data?.error ||
              "Your payment was successful, but we could not load your ticket codes yet."
            );

          }

        } finally {

          if (
            !cancelled
          ) {

            setTicketsLoading(false);

          }

        }

      };


    void loadTickets();


    return () => {

      cancelled = true;

    };

  }, [
    reference,
    customer.email,
  ]);


  /*
   * ============================================================
   * BUILD QR PAYLOAD
   * ============================================================
   */

  const getQrPayload =
    (
      ticketHash: string
    ) => {

      return (
        `https://chillandvibes.com` +
        `/tickets/verify/` +
        `${ticketHash}`
      );

    };


  /*
   * ============================================================
   * DOWNLOAD INDIVIDUAL SVG
   * ============================================================
   */

  const handleDownload = async (
    ticketHash: string,
    ticketNumber: number
  ) => {
    const svg =
      document.getElementById(
        `ticket-qr-${ticketNumber}`
      );

    if (!(svg instanceof SVGElement)) {
      console.error(
        "QR SVG element was not found."
      );
      return;
    }

    try {
      /*
       * ------------------------------------------------------------
       * 1. Serialize QR SVG
       * ------------------------------------------------------------
       */

      const serializer =
        new XMLSerializer();

      const svgString =
        serializer.serializeToString(svg);

      const svgBlob =
        new Blob(
          [svgString],
          {
            type:
              "image/svg+xml;charset=utf-8",
          }
        );

      const svgUrl =
        URL.createObjectURL(svgBlob);


      /*
       * ------------------------------------------------------------
       * 2. Load SVG into an Image
       * ------------------------------------------------------------
       */

      const qrImage =
        new Image();

      qrImage.src =
        svgUrl;

      await new Promise<void>(
        (resolve, reject) => {

          qrImage.onload =
            () => resolve();

          qrImage.onerror =
            () =>
              reject(
                new Error(
                  "Unable to render QR code."
                )
              );

        }
      );


      /*
       * ------------------------------------------------------------
       * 3. Create ticket canvas
       * ------------------------------------------------------------
       */

      const canvas =
        document.createElement(
          "canvas"
        );

      const width =
        1400;

      const height =
        1900;

      canvas.width =
        width;

      canvas.height =
        height;


      const context =
        canvas.getContext(
          "2d"
        );

      if (!context) {
        throw new Error(
          "Could not create ticket canvas."
        );
      }


      /*
       * ------------------------------------------------------------
       * 4. White ticket background
       * ------------------------------------------------------------
       */

      context.fillStyle =
        "#FFFFFF";

      context.fillRect(
        0,
        0,
        width,
        height
      );


      /*
       * ------------------------------------------------------------
       * 5. Ticket border
       * ------------------------------------------------------------
       */

      context.strokeStyle =
        "#111111";

      context.lineWidth =
        6;

      context.strokeRect(
        25,
        25,
        width - 50,
        height - 50
      );


      /*
       * ------------------------------------------------------------
       * 6. Branding
       * ------------------------------------------------------------
       */

      context.fillStyle =
        "#07070A";

      context.textAlign =
        "center";

      context.font =
        "bold 54px Arial";

      context.fillText(
        "CHILLS & VIBES",
        width / 2,
        120
      );


      /*
       * ------------------------------------------------------------
       * 7. Event name
       * ------------------------------------------------------------
       */

      context.font =
        "bold 58px Arial";

      context.fillText(
        event.title,
        width / 2,
        230
      );


      /*
       * ------------------------------------------------------------
       * 8. Event details
       * ------------------------------------------------------------
       */

      context.fillStyle =
        "#555555";

      context.font =
        "32px Arial";

      context.fillText(
        `${event.date} • ${event.time}`,
        width / 2,
        300
      );

      context.fillText(
        event.location,
        width / 2,
        355
      );


      /*
       * ------------------------------------------------------------
       * 9. Divider
       * ------------------------------------------------------------
       */

      context.strokeStyle =
        "#DDDDDD";

      context.lineWidth =
        2;

      context.beginPath();

      context.moveTo(
        100,
        410
      );

      context.lineTo(
        width - 100,
        410
      );

      context.stroke();


      /*
       * ------------------------------------------------------------
       * 10. Ticket information
       * ------------------------------------------------------------
       */

      context.textAlign =
        "left";

      context.fillStyle =
        "#777777";

      context.font =
        "24px Arial";

      context.fillText(
        "GUEST",
        110,
        490
      );

      context.fillText(
        "EMAIL",
        110,
        610
      );

      context.fillText(
        "TICKET TYPE",
        110,
        730
      );

      context.fillText(
        "TICKET NUMBER",
        110,
        850
      );


      context.fillStyle =
        "#111111";

      context.font =
        "bold 34px Arial";

      context.fillText(
        customer.fullName,
        110,
        535
      );

      context.fillText(
        customer.email,
        110,
        655
      );

      context.fillText(
        ticket.tier,
        110,
        775
      );

      context.fillText(
        `Ticket #${ticketNumber}`,
        110,
        895
      );


      /*
       * ------------------------------------------------------------
       * 11. QR background
       * ------------------------------------------------------------
       */

      const qrSize =
        620;

      const qrX =
        (width - qrSize) /
        2;

      const qrY =
        970;


      context.fillStyle =
        "#FFFFFF";

      context.fillRect(
        qrX - 35,
        qrY - 35,
        qrSize + 70,
        qrSize + 70
      );


      context.strokeStyle =
        "#EEEEEE";

      context.lineWidth =
        2;

      context.strokeRect(
        qrX - 35,
        qrY - 35,
        qrSize + 70,
        qrSize + 70
      );


      /*
       * ------------------------------------------------------------
       * 12. Draw QR
       * ------------------------------------------------------------
       */

      context.drawImage(
        qrImage,
        qrX,
        qrY,
        qrSize,
        qrSize
      );


      /*
       * ------------------------------------------------------------
       * 13. Ticket ID
       * ------------------------------------------------------------
       */

      context.textAlign =
        "center";

      context.fillStyle =
        "#555555";

      context.font =
        "22px monospace";

      context.fillText(
        ticketHash,
        width / 2,
        1660
      );


      /*
       * ------------------------------------------------------------
       * 14. Entry instruction
       * ------------------------------------------------------------
       */

      context.fillStyle =
        "#111111";

      context.font =
        "bold 28px Arial";

      context.fillText(
        "PRESENT THIS QR CODE AT THE ENTRANCE",
        width / 2,
        1740
      );


      /*
       * ------------------------------------------------------------
       * 15. Generate PNG
       * ------------------------------------------------------------
       */

      const pngBlob =
        await new Promise<Blob | null>(
          (resolve) =>
            canvas.toBlob(
              resolve,
              "image/png",
              1
            )
        );


      if (!pngBlob) {
        throw new Error(
          "Unable to generate ticket PNG."
        );
      }


      /*
       * ------------------------------------------------------------
       * 16. Download
       * ------------------------------------------------------------
       */

      const downloadUrl =
        URL.createObjectURL(
          pngBlob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href =
        downloadUrl;

      link.download =
        `chills-vibes-ticket-${ticketHash}.png`;

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );

      URL.revokeObjectURL(
        downloadUrl
      );

      URL.revokeObjectURL(
        svgUrl
      );

    } catch (error) {

      console.error(
        "Ticket download failed:",
        error
      );

    }
  };


  return (

    <motion.div
      initial={{
        opacity: 0,
        y: 24,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
      }}
      className="mx-auto max-w-xl"
    >


      {/* ======================================================
          SUCCESS HEADER
      ======================================================= */}

      <div className="flex flex-col items-center gap-3 text-center">

        <motion.span
          initial={{
            scale: 0,
          }}
          animate={{
            scale: 1,
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 12,
            delay: 0.15,
          }}
          className="grid h-16 w-16 place-items-center rounded-full bg-gold/10 text-gold shadow-gold"
        >

          <HiCheckCircle
            size={34}
          />

        </motion.span>


        <h2 className="text-3xl font-bold text-bone sm:text-4xl">
          Payment Successful 🎉
        </h2>


        <p className="max-w-sm text-sm text-mute">
          Your Chills &amp; Vibes ticket
          {ticket.quantity > 1
            ? "s have"
            : " has"}{" "}
          been confirmed.
          See you on the dance floor!
        </p>

      </div>


      {/* ======================================================
          ORDER SUMMARY
      ======================================================= */}

      <div className="ticket-stub glass mt-10 overflow-hidden rounded-3xl">

        <div className="p-7 sm:p-8">

          <div className="grid grid-cols-2 gap-4 text-sm">

            <div>

              <p className="text-[11px] uppercase tracking-wide text-mute">
                Event
              </p>

              <p className="font-bold text-bone">
                {event.title}
              </p>

            </div>


            <div>

              <p className="text-[11px] uppercase tracking-wide text-mute">
                Customer
              </p>

              <p className="text-bone/90">
                {customer.fullName}
              </p>

            </div>


            <div>

              <p className="text-[11px] uppercase tracking-wide text-mute">
                Ticket Type
              </p>

              <p className="text-bone/90">
                {ticket.tier}
              </p>

            </div>


            <div>

              <p className="text-[11px] uppercase tracking-wide text-mute">
                Quantity
              </p>

              <p className="text-bone/90">
                {ticket.quantity}
              </p>

            </div>


            <div>

              <p className="text-[11px] uppercase tracking-wide text-mute">
                Date
              </p>

              <p className="text-bone/90">
                {event.date}
              </p>

            </div>


            <div>

              <p className="text-[11px] uppercase tracking-wide text-mute">
                Venue
              </p>

              <p className="text-bone/90">
                {event.location}
              </p>

            </div>


            <div>

              <p className="text-[11px] uppercase tracking-wide text-mute">
                Total Paid
              </p>

              <p className="font-semibold text-gold-light">
                {formatNaira(total)}
              </p>

            </div>


            <div>

              <p className="text-[11px] uppercase tracking-wide text-mute">
                Order Reference
              </p>

              <p className="break-all font-mono text-xs text-bone/90">
                {reference}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* ======================================================
          GENERATED TICKETS
      ======================================================= */}

      <div className="mt-8">

        <h3 className="text-xl font-bold text-bone">
          Your Tickets
        </h3>


        <p className="mt-2 text-sm text-mute">
          Each ticket has its own unique QR code.
          Present one QR code per person at the entrance.
        </p>


        {ticketsLoading && (

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">

            <p className="text-sm text-mute">
              Preparing your ticket QR codes...
            </p>

          </div>

        )}


        {!ticketsLoading &&
          ticketsError && (

            <div className="mt-6 rounded-2xl border border-orange-500/30 bg-orange-500/[0.08] p-6 text-center">

              <p className="text-sm text-orange-300">
                {ticketsError}
              </p>

            </div>

          )}


        {!ticketsLoading &&
          !ticketsError &&
          generatedTickets.length === 0 && (

            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/[0.08] p-6 text-center">

              <p className="text-sm text-red-300">
                No ticket records were returned for this order.
              </p>

            </div>

          )}


        {!ticketsLoading &&
          !ticketsError &&
          generatedTickets.map(
            (
              generatedTicket,
              index
            ) => {

              const ticketNumber =
                index + 1;


              const qrPayload =
                getQrPayload(
                  generatedTicket.ticket_hash
                );


              return (

                <div
                  key={
                    generatedTicket.ticket_hash
                  }
                  className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
                >

                  <div className="flex flex-col items-center gap-6 p-7 sm:p-8">


                    {/* TICKET INFORMATION */}

                    <div className="w-full text-center">

                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                        Ticket #{ticketNumber}
                      </p>


                      <h4 className="mt-2 text-2xl font-bold text-bone">
                        {generatedTicket.ticket_type}
                      </h4>


                      <p className="mt-2 break-all font-mono text-xs text-mute">
                        {generatedTicket.ticket_hash}
                      </p>

                    </div>


                    {/* QR */}

                    <div className="inline-flex rounded-2xl bg-white p-5">

                      <QRCodeSVG
                        id={
                          `ticket-qr-${ticketNumber}`
                        }
                        value={
                          qrPayload
                        }
                        size={280}
                        level="H"
                        bgColor="#FFFFFF"
                        fgColor="#07070A"
                        marginSize={4}
                      />

                    </div>


                    <p className="text-center text-xs text-mute">
                      Scan this QR code at the entrance.
                    </p>


                    {/* DOWNLOAD */}

                    <button
                      type="button"
                      onClick={() =>
                        handleDownload(
                          generatedTicket.ticket_hash,
                          ticketNumber
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-bone transition hover:bg-white/10"
                    >

                      <HiOutlineDownload
                        size={18}
                      />

                      Download Ticket QR

                    </button>

                  </div>

                </div>

              );

            }
          )}

      </div>


      {/* ======================================================
          NAVIGATION
      ======================================================= */}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">

        <Link
          to="/"
          className="btn-ghost w-full"
        >
          Back Home
          <HiOutlineHome />
        </Link>

        <Link
          to={`/tickets/${ticket.eventId}`}
          onClick={reset}
          className="btn-gold w-full"
        >
          Buy Another Ticket
        </Link>

      </div>

    </motion.div>

  );

};


export default SuccessScreen;
