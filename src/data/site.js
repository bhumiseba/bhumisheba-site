// প্রধান মেনু: নতুন মেনু যোগ করতে একটি লাইন যোগ করলেই হবে
export const menu = [
  { name: "হোম", href: "/" },
  { name: "আমাদের সম্পর্কে", href: "/about" },
  { name: "সেবা পদ্ধতি", href: "/process" },
  { name: "ফি তালিকা", href: "/fees" },
  { name: "আইন-কানুন", href: "/laws" },
  { name: "জ্ঞাতব্য", href: "/notes" },
  { name: "যোগাযোগ", href: "/contact" },
];

// হোম পেজের সেবা কার্ড: নতুন অ্যাপ যোগ করতে একটি ব্লক যোগ করলেই হবে
export const services = [
  {
    name: "জমির একক রূপান্তরকারী",
    href: "#",
    color: "#006A4E",
    icon: '<path d="M10 18h26M30 10l8 8-8 8M38 32H12M18 24l-8 8 8 8"/>',
  },
  {
    name: "ওয়ারিশ অংশ ক্যালকুলেটর",
    href: "#",
    color: "#4E8B2E",
    icon: '<circle cx="18" cy="16" r="6"/><path d="M6 40c0-7 5-12 12-12s12 5 12 12"/><circle cx="34" cy="18" r="5"/><path d="M34 28c6 0 9 4 9 10"/>',
  },
  {
    name: "ফি ক্যালকুলেটর",
    href: "#",
    color: "#7A4B22",
    icon: '<rect x="10" y="6" width="28" height="36" rx="4"/><rect x="15" y="12" width="18" height="8" rx="1.5"/><path d="M16 28h.01M24 28h.01M32 28h.01M16 35h.01M24 35h.01M32 35h.01" stroke-width="4"/>',
  },
  {
    name: "নামজারি গাইড ও চেকলিস্ট",
    href: "#",
    color: "#1F6F8B",
    icon: '<rect x="10" y="6" width="28" height="36" rx="4"/><path d="M16 17l3 3 5-6M16 31l3 3 5-6M29 18h5M29 32h5"/>',
  },
  {
    name: "আইন-কানুন",
    href: "/laws",
    color: "#6B4FA0",
    icon: '<path d="M24 12v28M24 12c-4-4-10-5-16-4v28c6-1 12 0 16 4 4-4 10-5 16-4V8c-6-1-12 0-16 4z"/>',
  },
  {
    name: "কেন্দ্রের জন্য",
    href: "#",
    color: "#E0A526",
    dark: true,
    icon: '<path d="M8 40h32M12 40V18l12-8 12 8v22M20 40V28h8v12"/>',
  },
];