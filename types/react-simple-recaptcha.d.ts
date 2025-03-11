// types/react-simple-captcha.d.ts

declare module "react-simple-captcha" {
  /**
   * Loads captcha engine with specified character length
   * @param numberOfCharacters - The number of characters to use in the captcha
   */
  export function loadCaptchaEnginge(numberOfCharacters: number): void;

  /**
   * Alternative spelling of loadCaptchaEnginge (both functions exist in the library)
   * @param numberOfCharacters - The number of characters to use in the captcha
   */
  export function loadCaptchaEngine(numberOfCharacters: number): void;

  /**
   * Validates the captcha against the user input
   * @param userCaptcha - The user's input to validate
   * @returns boolean indicating if captcha is valid
   */
  export function validateCaptcha(userCaptcha: string): boolean;

  /**
   * Renders a captcha canvas with reload button
   * @param reloadText - Optional text for reload button
   */
  export function LoadCanvasTemplate(props?: {
    reloadText?: string;
  }): JSX.Element;

  /**
   * Renders a captcha canvas without reload button
   */
  export function LoadCanvasTemplateNoReload(): JSX.Element;

  /**
   * Creates a captcha text with the specified length
   * @param numberOfCharacters - The number of characters to use in the captcha
   * @returns The generated captcha text
   */
  export function createCaptcha(numberOfCharacters: number): string;
}
