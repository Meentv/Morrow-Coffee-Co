/** FAQ content, migrated verbatim from the original contact.html accordion. */
export type FaqEntry = {
  id: string;
  question: string;
  answer: string;
};

export const FAQ_ENTRIES: readonly FaqEntry[] = [
  {
    id: "bookings",
    question: "Do you take bookings?",
    answer:
      "For groups of eight or more, yes. Send us your date and guest count and we’ll find the best table or kitchen option.",
  },
  {
    id: "delivery",
    question: "Can I order for delivery?",
    answer:
      "Yes. Start an order from the menu and choose local delivery at checkout. We’ll confirm your delivery time.",
  },
  {
    id: "catering",
    question: "Can Morrow cater an event?",
    answer:
      "We can bring a coffee bar, a breakfast table, or a full evening kitchen to your event. Visit the Kitchen page to send a request.",
  },
  {
    id: "wholesale",
    question: "Do you sell beans wholesale?",
    answer:
      "We do. Send a wholesale enquiry with your location, volume, and the kind of coffee experience you want to build.",
  },
] as const;
