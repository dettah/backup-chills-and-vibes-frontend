// src/components/SuccessScreen.tsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { HiOutlineDownload, HiOutlineHome, HiCheckCircle } from "react-icons/hi";
import type { CustomerInfo, EventItem, SelectedTicket } from "../types";
import { formatNaira } from "../utils/format";
import Button from "./Button";

interface SuccessScreenProps {
  customer: CustomerInfo;
  ticket: SelectedTicket;
  event: EventItem;
  reference: string; 
}

const SuccessScreen = ({ customer, ticket, event, reference }: SuccessScreenProps) => {
  const total = ticket.price * ticket.quantity;

  // SECURE CONTEXT FIX: 
  const secureQrUrlPayload = `https://chillandvibes.com{reference}`;

  const handleDownload = () => {
    const svg = document.getElementById("ticket-qr");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chills-vibes-ticket-${reference}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-xl"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.15 }}
          className="grid h-16 w-16 place-items-center rounded-full bg-gold/10 text-gold shadow-gold"
        >
          <HiCheckCircle size={34} />
        </motion.span>
        <h2 className="text-3xl font-bold text-bone sm:text-4xl">Payment Successful 🎉</h2>
        <p className="max-w-sm text-sm text-mute">
          Your Chills &amp; Vibes ticket has been confirmed. See you on the dance floor!
        </p>
      </div>

      <div className="ticket-stub glass mt-10 overflow-hidden rounded-3xl">
        <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_1px_1fr]">
          <div className="flex flex-col gap-4 p-7 sm:p-8">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-mute">Event</p>
              <p className="text-lg font-bold text-bone">{event.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-mute">Customer</p>
                <p className="text-bone/90">{customer.fullName}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-mute">Ticket Type</p>
                <p className="text-bone/90">{ticket.tier}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-mute">Quantity</p>
                <p className="text-bone/90">{ticket.quantity}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-mute">Date</p>
                <p className="text-bone/90">{event.date}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-mute">Venue</p>
                <p className="text-bone/90">{event.location}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-mute">Total Paid</p>
                <p className="font-semibold text-gold-light">{formatNaira(total)}</p>
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-mute">Payment Reference</p>
              <p className="font-mono text-sm text-bone/90">{reference}</p>
            </div>
          </div>

          <div className="ticket-perf hidden w-px sm:block" />
          <div className="ticket-perf block h-px w-full sm:hidden" />

          <div className="flex flex-col items-center justify-center gap-3 p-7 sm:p-8">
            <div className="rounded-2xl bg-white p-3">
              {/* value parameter targets secure URL variable path now */}
              <QRCodeSVG id="ticket-qr" value={secureQrUrlPayload} size={128} bgColor="#ffffff" fgColor="#07070A" />
            </div>
            <p className="text-center text-[11px] text-mute">Scan at the entrance</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button variant="gold" onClick={handleDownload} fullWidth>
          Download Ticket <HiOutlineDownload />
        </Button>
        <Link to="/" className="btn-ghost w-full">
          Back Home <HiOutlineHome />
        </Link>
      </div>
    </motion.div>
  );
};

export default SuccessScreen;
