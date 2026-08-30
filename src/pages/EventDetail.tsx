import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineTicket,
  HiOutlineArrowLeft,
  HiOutlineExclamationCircle,
} from "react-icons/hi";

import EmptyState from "../components/EmptyState";
import Button from "../components/Button";

import {
  getEventBySlug,
} from "../data/events";

import type { EventItem } from "../types";


const EventDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const navigate = useNavigate();

  const [event, setEvent] =
    useState<EventItem | undefined>();


  useEffect(() => {
    if (!slug) return;

    const foundEvent = getEventBySlug(slug);

    setEvent(foundEvent);
  }, [slug]);


  if (!event) {
    return (
      <div className="section-pad pt-32">
        <div className="container-x">
          <EmptyState
            icon={<HiOutlineExclamationCircle />}
            title="We couldn't find that event"
            description="It may have wrapped up or the link might be off."
            action={
              <Button
                variant="gold"
                onClick={() => navigate("/events")}
              >
                View All Events
              </Button>
            }
          />
        </div>
      </div>
    );
  }


  return (
    <div className="pt-24">

      <section className="relative flex min-h-[60vh] items-end overflow-hidden pb-14 pt-24 sm:min-h-[70vh]">

        <div className="absolute inset-0 -z-20">
          {event.flyer ? (
            <img
              src={event.flyer}
              alt={`${event.title} flyer`}
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <div className="h-full w-full bg-ink-900" />
          )}
        </div>


        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/70 to-ink/20" />


        <div className="container-x relative">

          <Link
            to="/events"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-mute transition-colors hover:text-bone"
          >
            <HiOutlineArrowLeft />
            Back to events
          </Link>


          <span className="eyebrow mb-4">
            {event.category}
          </span>


          <motion.h1
            initial={{
              opacity: 0,
              y: 24,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
            }}
            className="max-w-2xl text-4xl font-extrabold uppercase leading-[0.98] text-bone sm:text-6xl"
          >
            {event.title}
          </motion.h1>

        </div>

      </section>


      <section className="section-pad">

        <div className="container-x grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr]">

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            className="flex flex-col gap-6"
          >
            <h2 className="text-2xl font-bold text-bone">
              About this event
            </h2>

            <p className="text-base leading-relaxed text-mute">
              {event.description}
            </p>
          </motion.div>


          <motion.aside
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              delay: 0.1,
            }}
            className="glass h-fit rounded-3xl p-7 sm:p-8"
          >

            <div className="flex flex-col gap-4 text-sm">

              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-gold/10 text-gold">
                  <HiOutlineCalendar />
                </span>

                <div>
                  <p className="text-xs uppercase tracking-wide text-mute">
                    Date
                  </p>

                  <p className="font-semibold text-bone">
                    {event.date}
                  </p>
                </div>
              </div>


              <div className="flex items-center gap-3">

                <span className="grid h-10 w-10 place-items-center rounded-full bg-gold/10 text-gold">
                  <HiOutlineClock />
                </span>

                <div>
                  <p className="text-xs uppercase tracking-wide text-mute">
                    Time
                  </p>

                  <p className="font-semibold text-bone">
                    {event.time}
                  </p>
                </div>

              </div>


              <div className="flex items-center gap-3">

                <span className="grid h-10 w-10 place-items-center rounded-full bg-gold/10 text-gold">
                  <HiOutlineLocationMarker />
                </span>

                <div>
                  <p className="text-xs uppercase tracking-wide text-mute">
                    Location
                  </p>

                  <p className="font-semibold text-bone">
                    {event.location}
                  </p>
                </div>

              </div>


              <div className="flex items-center justify-between border-t border-white/10 pt-4">

                <span className="text-xs uppercase tracking-wide text-mute">
                  From
                </span>

                <span className="text-xl font-extrabold text-gold-light">
                  {event.priceFrom}
                </span>

              </div>

            </div>


            <Link
              to={`/tickets/${event.id}`}
              className="btn-gold mt-6 w-full"
            >
              {event.ticketsAvailable
                ? "Get Tickets"
                : "Join Waitlist"}

              <HiOutlineTicket />
            </Link>

          </motion.aside>

        </div>

      </section>

    </div>
  );
};

export default EventDetail;