const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateCaptcha(length = 5) {
  let captcha = '';

  for (let index = 0; index < length; index += 1) {
    const randomIndex = Math.floor(Math.random() * CAPTCHA_CHARS.length);
    captcha += CAPTCHA_CHARS[randomIndex];
  }

  return captcha;
}
