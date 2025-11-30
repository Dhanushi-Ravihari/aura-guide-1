import React, { useState, useEffect, useRef } from "react";
import { X, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

const motivationalMessages = [
  "Small steps every day add up, keep moving, you're closer than you think.",
  "You've overcome harder things than this; stay focused and keep going.",
  "Discipline beats motivation, show up today and your future self will thank you.",
  "Progress isn't always loud; trust the process you're building.",
  "You're not chasing perfection, you're building momentum, don't stop now.",
];

export function MotivationalNotification() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isExiting, setIsExiting] = useState(false);
  const isDismissedRef = useRef(false);

  const getRandomMessage = () => {
    const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
    return motivationalMessages[randomIndex];
  };

  const showMessage = (message: string) => {
    console.log('MotivationalNotification: showMessage called with:', message);
    setCurrentMessage(message);
    setIsExiting(false);
    setIsVisible(true);
    isDismissedRef.current = false;
    console.log('MotivationalNotification: State updated - isVisible: true, currentMessage:', message);
  };

  useEffect(() => {
    //TODO: make this a notification
    const initialTimer = setTimeout(() => {
      const msg = getRandomMessage();
      console.log('MotivationalNotification: Showing first message:', msg);
      showMessage(msg);
    }, 30000);
    const interval = setInterval(() => {
      if (isDismissedRef.current) {
        showMessage(getRandomMessage());
      } else {
        setIsExiting(true);
        setTimeout(() => {
          showMessage(getRandomMessage());
        }, 300);
      }
    }, 60000);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    isDismissedRef.current = true;
    setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
      setCurrentMessage("");
    }, 300);
  };

  const shouldShow = isVisible && !isExiting && currentMessage;

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 99999,
        maxWidth: '24rem',
        width: 'calc(100% - 2rem)',
        opacity: shouldShow ? 1 : 0,
        transform: shouldShow ? 'translateX(0)' : 'translateX(100%)',
        transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
        pointerEvents: shouldShow ? 'auto' : 'none',
      }}
    >
      {currentMessage && (
        <div 
          className="glass-card rounded-xl p-4 shadow-lg border border-primary/20 bg-white/95 backdrop-blur-md"
          style={{ pointerEvents: 'auto', cursor: 'default' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="p-2 bg-primary/10 rounded-full">
                <Sparkles className="size-4 text-primary" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground leading-relaxed">
                {currentMessage}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDismiss();
              }}
              className="flex-shrink-0 h-6 w-6 p-0 rounded-full hover:bg-muted/50 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Dismiss message"
              type="button"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

