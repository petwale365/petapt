"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

// Use a more robust subscriber pattern with a unique ID for each subscriber
type SubscriberCallback = (user: User | null, isAnonymous: boolean) => void;
const subscribers = new Map<string, SubscriberCallback>();
let subscriberIdCounter = 0;

// Initialize with the current auth state
let currentUser: User | null = null;
let currentIsAnonymous = true;

// Track the initialization state
let isInitialized = false;

// Initialize the auth state
const initializeAuthState = async () => {
  try {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      currentUser = data.user;
      currentIsAnonymous = data.user.is_anonymous === true;
    } else {
      currentUser = null;
      currentIsAnonymous = true;
    }
    isInitialized = true;

    // Notify all subscribers with the initial state
    subscribers.forEach((callback) => {
      callback(currentUser, currentIsAnonymous);
    });
  } catch (error) {
    console.error("Error initializing auth state:", error);
    isInitialized = true; // Mark as initialized even on error
  }
};

// Start initialization
initializeAuthState();

// Setup auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  console.log(
    "[use-user] Auth state change:",
    event,
    session?.user?.id,
    "isAnonymous:",
    session?.user?.is_anonymous
  );

  if (session?.user) {
    currentUser = session.user;
    currentIsAnonymous = session.user.is_anonymous === true;
  } else {
    currentUser = null;
    currentIsAnonymous = true;
  }

  // Notify all subscribers
  subscribers.forEach((callback) => {
    callback(currentUser, currentIsAnonymous);
  });
});

export function useUser() {
  const [isReady, setIsReady] = useState(isInitialized);
  const [user, setUser] = useState<User | null>(currentUser);
  const [isAnonymous, setIsAnonymous] = useState(currentIsAnonymous);

  useEffect(() => {
    // Generate a unique subscriber ID
    const subscriberId = `subscriber-${subscriberIdCounter++}`;

    // Define the subscriber callback
    const callback: SubscriberCallback = (newUser, newIsAnonymous) => {
      setIsReady(true);
      setUser(newUser);
      setIsAnonymous(newIsAnonymous);
    };

    // Register the subscriber
    subscribers.set(subscriberId, callback);

    // If already initialized, immediately update the state
    if (isInitialized) {
      callback(currentUser, currentIsAnonymous);
    }

    // Cleanup: remove the subscriber
    return () => {
      subscribers.delete(subscriberId);
    };
  }, []);

  return { user, isAnonymous, isReady };
}
