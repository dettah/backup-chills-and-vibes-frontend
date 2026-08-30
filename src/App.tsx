import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import {
  AnimatePresence,
  motion,
} from "framer-motion";

import MainLayout from "./layouts/MainLayout";
import { CheckoutProvider } from "./hooks/useCheckout";
import { initializeLiveEventData } from "./data/events";

import Home from "./pages/Home";
import Tickets from "./pages/Tickets";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";


const PageTransition = ({
  children,
}: {
  children: ReactNode;
}) => (
  <motion.div
    initial={{
      opacity: 0,
      y: 12,
    }}
    animate={{
      opacity: 1,
      y: 0,
    }}
    exit={{
      opacity: 0,
      y: -12,
    }}
    transition={{
      duration: 0.35,
      ease: "easeOut",
    }}
  >
    {children}
  </motion.div>
);


const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">

      <Routes
        location={location}
        key={location.pathname}
      >

        <Route element={<MainLayout />}>

          <Route
            path="/"
            element={
              <PageTransition>
                <Home />
              </PageTransition>
            }
          />

          {/* =====================================================
              TICKETS
              ===================================================== */}

          <Route
            path="/tickets/:eventId"
            element={
              <PageTransition>
                <Tickets />
              </PageTransition>
            }
          />

          {/* =====================================================
              OTHER PAGES
              ===================================================== */}

          <Route
            path="/about"
            element={
              <PageTransition>
                <About />
              </PageTransition>
            }
          />

          <Route
            path="/contact"
            element={
              <PageTransition>
                <Contact />
              </PageTransition>
            }
          />

          <Route
            path="/events"
            element={
              <PageTransition>
                <Events />
              </PageTransition>
            }
          />

          <Route
            path="/events/:slug"
            element={
              <PageTransition>
                <EventDetail />
              </PageTransition>
            }
          />

          <Route
            path="/checkout"
            element={
              <PageTransition>
                <Checkout />
              </PageTransition>
            }
          />

          <Route
            path="*"
            element={
              <PageTransition>
                <NotFound />
              </PageTransition>
            }
          />

        </Route>

      </Routes>

    </AnimatePresence>
  );
};


function App() {
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const initializeApp =
      async () => {

        try {
          await initializeLiveEventData();

        } finally {
          setLoading(false);
        }

      };

    initializeApp();

  }, []);


  if (loading) {

    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center font-sans">

        <div className="w-10 h-10 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />

        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-gold/80 animate-pulse">
          Syncing Stadium of Vibes...
        </p>

      </div>
    );

  }


  return (
    <BrowserRouter>

      <CheckoutProvider>

        <AnimatedRoutes />

      </CheckoutProvider>

    </BrowserRouter>
  );
}


export default App;