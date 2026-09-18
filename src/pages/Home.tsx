// Chills-Vibes/pages/Home.tsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import {
  HiOutlineCalendar,
  HiOutlineLocationMarker,
  HiOutlineTicket,
  // HiOutlineSparkles,
  HiOutlineArrowRight,
} from "react-icons/hi";

import Hero from "../components/Hero";
import SectionTitle from "../components/SectionTitle";
import EventCard from "../components/EventCard";
import Gallery from "../components/Gallery";
// import Button from "../components/Button";

import { events } from "../data/events";
import { galleryImages } from "../data/gallery";


const Home = () => {
  // const navigate = useNavigate();

  const featuredEvent = events[0];


  if (!featuredEvent) {
    return (
      <>
        <Hero />

        <section className="section-pad">
          <div className="container-x">
            <SectionTitle
              eyebrow="Upcoming Events"
              title="Something exciting is coming"
              description="We're preparing the next Chill & Vibes experience."
            />
          </div>
        </section>

        
        
      </>
    );
  }


  const infoCards = [
    {
      icon: HiOutlineCalendar,
      label: "Event Date",
      value: featuredEvent.date,
    },

    {
      icon: HiOutlineLocationMarker,
      label: "Location",
      value: featuredEvent.location,
    },

    {
      icon: HiOutlineTicket,
      label: "Ticket Availability",
      value: featuredEvent.ticketsAvailable
        ? "Selling Fast"
        : "Sold Out",
    },
  ];


  return (
    <>
      <Hero />

      <section className="section-pad">
        <div className="container-x">

          <SectionTitle
            eyebrow="The Next One"
            title={featuredEvent.title}
            description={
              featuredEvent.shortDescription
            }
          />


          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">

            {infoCards.map(
              (
                {
                  icon: Icon,
                  label,
                  value,
                },
                i
              ) => (

                <motion.div
                  key={label}
                  initial={{
                    opacity: 0,
                    y: 24,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.4,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.1,
                  }}
                  className="glass glass-hover flex items-center gap-4 rounded-2xl p-6"
                >

                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold/10 text-gold">
                    <Icon size={22} />
                  </span>

                  <div>

                    <p className="text-xs uppercase tracking-wide text-mute">
                      {label}
                    </p>

                    <p className="text-base font-semibold text-bone">
                      {value}
                    </p>

                  </div>

                </motion.div>

              )
            )}

          </div>


          <motion.div
            initial={{
              opacity: 0,
              y: 16,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              delay: 0.3,
            }}
            className="mt-10"
          >

            <Link
              to={`/tickets/${featuredEvent.id}`}
              className="btn-gold"
            >
              Get Tickets
              <HiOutlineTicket />
            </Link>

          </motion.div>

        </div>
      </section>



      {/* Photo Gallery */}

      
        <section className=" container-x py-16">
          <SectionTitle
            eyebrow="Relive The Energy"
            title="Moments From Our Parties"
            description="A look back at the nights that made Chills & Vibes what it is."
          />
          <div className="mt-10">
            <Gallery images={galleryImages} />
          </div>
        </section>
     

      <section className="section-pad">

        <div className="container-x cliveTiers.mapontainer-x">

          <SectionTitle
            eyebrow="What's Coming"
            title="Upcoming events"
            description="From block parties to special nights, there's always something on the calendar."
          />


          <div className="flex flex-col gap-6">

            {events
              .slice(0, 3)
              .map((event, i) => (
                <EventCard
                  key={event.id}
                  event={event}
                  index={i}
                />
              ))}

          </div>


          <div className="mt-10 flex justify-center">

            <Link
              to="/events"
              className="btn-ghost"
            >
              View All Events
              <HiOutlineArrowRight />
            </Link>

          </div>

        </div>

      </section>


      {/* I will have to bring back the CTA banner */}
    </>
  );
};


export default Home;