import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { useScrolled } from "../hooks/useScrolled";
import logo from "../assets/images/logo.png";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Tickets", to: "/tickets" },
  { label: "About", to: "/about" },
  { label: "Upcoming Events", to: "/events" },
  { label: "Contact", to: "/contact" },
];

const Navbar = () => {
  const scrolled = useScrolled(20);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-white/10 bg-ink/70 backdrop-blur-xl shadow-glass" : "bg-transparent"
      }`}
    >
      <nav className="container-x flex h-20 items-center justify-between" aria-label="Primary">
        <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="Chills & Vibes home">
          <img src={logo} alt="Chills & Vibes" className="h-9 w-auto sm:h-10" />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `relative rounded-full px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-200 ${
                    isActive ? "text-gold" : "text-bone/80 hover:text-bone"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light"
                      />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden lg:block">
          <Link to="/events" className="btn-gold !px-6 !py-2.5 text-xs">
            Buy Ticket
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 text-bone lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <HiOutlineX size={22} /> : <HiOutlineMenu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden border-t border-white/10 bg-ink/95 backdrop-blur-xl lg:hidden"
          >
            <ul className="container-x flex flex-col gap-1 py-4">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.to}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      `block rounded-xl px-4 py-3 text-base font-medium ${
                        isActive ? "bg-gold/10 text-gold" : "text-bone/85"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.05 }}
                className="mt-2"
              >
                <Link to="/events" className="btn-gold w-full">
                  Buy Ticket
                </Link>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
