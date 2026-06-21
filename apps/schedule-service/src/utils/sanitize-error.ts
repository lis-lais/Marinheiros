export function sanitizeMessage(message: string): string {
  if (!message) return message;
  
  return message
    // Mask JWT tokens
    .replace(/ey[a-zA-Z0-9-_=]+\.ey[a-zA-Z0-9-_=]+\.[a-zA-Z0-9-_=]+/g, '[JWT]')
    // Mask emails
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
    // Mask CPF
    .replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, '[CPF]')
    .replace(/\b\d{11}\b/g, '[CPF]')
    // Mask IPv4
    .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]');
}
