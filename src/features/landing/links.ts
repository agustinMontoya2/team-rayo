import { GENERAL_WHATSAPP_MESSAGE, WHATSAPP_NUMBER, INSTAGRAM_URL } from './constants';

export function whatsappUrl(message = GENERAL_WHATSAPP_MESSAGE): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const instagramUrl = INSTAGRAM_URL;

export function openWhatsApp(message?: string) {
  window.open(whatsappUrl(message), '_blank');
}

export function openInstagram() {
  window.open(INSTAGRAM_URL, '_blank');
}

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}