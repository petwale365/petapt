"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  loadCaptchaEnginge,
  LoadCanvasTemplate,
  validateCaptcha,
} from "react-simple-captcha";

// Import custom styles for the captcha
import "@/styles/captcha.css";

interface SimpleCaptchaProps {
  onVerify: (isVerified: boolean) => void;
}

export default function SimpleCaptcha({ onVerify }: SimpleCaptchaProps) {
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const captchaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize captcha with 6 characters
    loadCaptchaEnginge(6);
  }, []);

  const handleVerify = () => {
    if (!captchaInputRef.current) return;

    const userCaptchaValue = captchaInputRef.current.value;

    if (validateCaptcha(userCaptchaValue) === true) {
      setIsVerified(true);
      setErrorMessage("");
      onVerify(true);
    } else {
      setIsVerified(false);
      setErrorMessage("Captcha verification failed. Please try again.");
      onVerify(false);
      // Reload captcha
      loadCaptchaEnginge(6);
      if (captchaInputRef.current) {
        captchaInputRef.current.value = "";
      }
    }
  };

  // Reset verification status
  const resetCaptcha = () => {
    setIsVerified(false);
    setErrorMessage("");
    onVerify(false);
    loadCaptchaEnginge(6);
    if (captchaInputRef.current) {
      captchaInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full space-y-4">
      {!isVerified ? (
        <>
          <div className="flex flex-col space-y-4">
            <div className="captcha-container mx-auto">
              <LoadCanvasTemplate reloadText="Reload Captcha" />
            </div>

            <div className="flex space-x-2">
              <Input
                ref={captchaInputRef}
                placeholder="Enter Captcha"
                id="user_captcha_input"
                name="user_captcha_input"
                className="flex-1"
              />
              <Button onClick={handleVerify}>Verify</Button>
            </div>

            {errorMessage && (
              <p className="text-sm text-red-500 text-center">{errorMessage}</p>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center space-y-2">
          <div className="text-sm font-medium text-green-600 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Captcha verification successful!
          </div>
          <Button variant="outline" size="sm" onClick={resetCaptcha}>
            Reset Captcha
          </Button>
        </div>
      )}
    </div>
  );
}
