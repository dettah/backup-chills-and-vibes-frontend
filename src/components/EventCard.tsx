import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { HiOutlineCalendar, HiOutlineClock, HiOutlineLocationMarker, HiOutlineArrowRight } from "react-icons/hi";
import type { EventItem } from "../types";
import jerseyFlyer from "../assets/images/jersey-hero.avif";
interface EventCardProps {
  event: EventItem;
  index?: number;
}

const EventCard = ({ event, index = 0 }: EventCardProps) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="glass glass-hover group flex flex-col overflow-hidden rounded-3xl sm:flex-row"
    >
      <div className="relative h-56 w-full shrink-0 overflow-hidden sm:h-auto sm:w-64">

        <img
          src={event.flyer || jerseyFlyer}
          alt={`${event.title} flyer`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = jerseyFlyer;
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent sm:bg-gradient-to-r" />

        <span className="absolute left-4 top-4 rounded-full bg-ink/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gold-light backdrop-blur-md">
          {event.category}
        </span>

        {!event.ticketsAvailable && (
          <span className="absolute right-4 top-4 rounded-full bg-ink/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-mute backdrop-blur-md">
            Sold Out
          </span>
        )}

      </div>

      <div className="flex flex-1 flex-col justify-between gap-5 p-6 sm:p-7">
        <div>
          <h3 className="text-2xl font-bold text-bone">{event.title}</h3>
          <p className="mt-2 text-sm text-mute">{event.shortDescription}</p>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-bone/80 sm:text-sm">
            <span className="inline-flex items-center gap-1.5">
              <HiOutlineCalendar className="text-gold" /> {event.date}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <HiOutlineClock className="text-gold" /> {event.time}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <HiOutlineLocationMarker className="text-gold" /> {event.location}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-5">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-mute">From</p>
            <p className="text-lg font-bold text-gold-light">{event.priceFrom}</p>
          </div>
          <Link
            to={`/events/${event.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-bone transition-colors hover:border-gold/50 hover:text-gold-light"
          >
            View Event <HiOutlineArrowRight />
          </Link>
        </div>
      </div>
    </motion.article>
  );
};

export default EventCard;
