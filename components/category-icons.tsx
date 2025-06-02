import { Coffee, ShoppingCart, Utensils, Home, HelpCircle, Car, HeartPulse, Film, BookOpen, PiggyBank, Briefcase, Globe, Plane, Smartphone, Shirt, Gift, CreditCard, LucideIcon, Heart, Newspaper, NewspaperIcon } from "lucide-react";

// Map category names to Lucide icons
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Coffee: Coffee,
  Groceries: ShoppingCart,
  Food: Utensils,
  Home: Home,
  "Transportation": Car,
  Health: HeartPulse,
  Entertainment: Film,
  Education: BookOpen,
  Savings: PiggyBank,
  Work: Briefcase,
  Travel: Plane,
  Internet: Globe,
  Phone: Smartphone,
  Clothing: Shirt,
  Gifts: Gift,
  Bills: CreditCard,
  "Clothings": Shirt,
  "Subscription": NewspaperIcon,  
  "Beauty related": Heart,
  "Food and Drinks": Utensils
  // Add more mappings as needed
};

export const DEFAULT_CATEGORY_ICON = HelpCircle;
