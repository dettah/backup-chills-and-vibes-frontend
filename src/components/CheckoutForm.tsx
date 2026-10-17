import { useState } from "react";
import type { FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineLockClosed, HiOutlineTicket } from "react-icons/hi";
import type { CustomerInfo, SelectedTicket, EventItem } from "../types";
import { formatNaira } from "../utils/format";
import Button from "./Button";

interface CheckoutFormProps {
  ticket: SelectedTicket;
  event: EventItem;
  onSubmit: (customer: CustomerInfo) => void;
  submitting: boolean;
}

interface FieldErrors {
  fullName?: string;
  email?: string;
  phone?: string;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+\s-]{7,15}$/;

const CheckoutForm = ({ ticket, event, onSubmit, submitting }: CheckoutFormProps) => {
  const [values, setValues] = useState<CustomerInfo>({ fullName: "", email: "", phone: "" });
  const [errors, setErrors] = useState<FieldErrors>({});

  const total = ticket.price * ticket.quantity;

  const validate = (): boolean => {
    const nextErrors: FieldErrors = {};
    if (!values.fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!values.email.trim()) nextErrors.email = "Email address is required.";
    else if (!emailPattern.test(values.email)) nextErrors.email = "Enter a valid email address.";
    if (!values.phone.trim()) nextErrors.phone = "Phone number is required.";
    else if (!phonePattern.test(values.phone)) nextErrors.phone = "Enter a valid phone number.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(values);
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
      <form onSubmit={handleSubmit} noValidate className="glass flex flex-col gap-5 rounded-3xl p-7 sm:p-8">
        <h3 className="text-lg font-bold text-bone">Customer Information</h3>

        <div>
          <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-bone/85">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={values.fullName}
            onChange={(e) => setValues((v) => ({ ...v, fullName: e.target.value }))}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-bone placeholder:text-mute/70 outline-none transition-colors focus:border-gold/50"
            placeholder="e.g. Ada Okon"
            aria-invalid={Boolean(errors.fullName)}
          />
          {errors.fullName && <p className="mt-1.5 text-xs text-red-400">{errors.fullName}</p>}
        </div>

        <div>
          <label htmlFor="checkoutEmail" className="mb-2 block text-sm font-medium text-bone/85">
            Email Address
          </label>
          <input
            id="checkoutEmail"
            type="email"
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-bone placeholder:text-mute/70 outline-none transition-colors focus:border-gold/50"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-medium text-bone/85">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            value={values.phone}
            onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-bone placeholder:text-mute/70 outline-none transition-colors focus:border-gold/50"
            placeholder="+234 800 000 0000"
            aria-invalid={Boolean(errors.phone)}
          />
          {errors.phone && <p className="mt-1.5 text-xs text-red-400">{errors.phone}</p>}
        </div>

        <Button type="submit" variant="gold" fullWidth disabled={submitting} className="mt-2">
          <AnimatePresence mode="wait" initial={false}>
            {submitting ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="inline-flex items-center gap-2"
              >
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
                Processing payment...
              </motion.span>
            ) : (
              <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Proceed to Payment
              </motion.span>
            )}
          </AnimatePresence>
        </Button>

        <p className="flex items-center justify-center gap-1.5 text-xs text-mute">
          <HiOutlineLockClosed className="text-gold" /> Secure payment powered by Paystack.
        </p>
      </form>

      <aside className="glass h-fit rounded-3xl p-7 sm:p-8">
        <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-bone">
          <HiOutlineTicket className="text-gold" /> Order Recap
        </h3>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-mute">Event</span>
            <span className="text-right text-bone/90">{event.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-mute">Ticket</span>
            <span className="text-bone/90">{ticket.tier}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-mute">Quantity</span>
            <span className="text-bone/90">{ticket.quantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-mute">Price</span>
            <span className="text-bone/90">{formatNaira(ticket.price)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-white/10 pt-4">
            <span className="font-medium text-mute">Total Amount</span>
            <span className="text-2xl font-extrabold text-gradient-gold">{formatNaira(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default CheckoutForm;
