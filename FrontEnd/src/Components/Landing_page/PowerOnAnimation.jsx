import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import "./PowerOnAnimation.css";

gsap.registerPlugin(useGSAP);

function BootScreen() {
  return (
    <div className="boot-screen">
      <i className="fab fa-apple boot-logo" aria-hidden="true" />
      <span className="boot-label">Starting up</span>
      <span className="boot-progress" aria-hidden="true">
        <span className="boot-progress-fill" />
      </span>
    </div>
  );
}

export default function PowerOnAnimation({ onComplete }) {
  const overlayRef = useRef(null);

  useGSAP(() => {
    const overlay = overlayRef.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onComplete();
      return;
    }

    const isMobile = window.matchMedia("(max-width: 800px)").matches;
    const device = overlay.querySelector(isMobile ? ".boot-ios-device" : ".boot-macbook");
    const screen = device.querySelector(".boot-screen");
    const logo = device.querySelector(".boot-logo");
    const progress = device.querySelector(".boot-progress-fill");
    const timeline = gsap.timeline({ onComplete });

    timeline
      .fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "power1.out" })
      .fromTo(
        device,
        { autoAlpha: 0, y: isMobile ? 28 : 40, scale: 0.92 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" },
        "-=0.05",
      );

    if (!isMobile) {
      timeline.fromTo(
        device.querySelector(".boot-macbook-lid"),
        { rotateX: -72 },
        { rotateX: 0, duration: 0.85, ease: "power2.out" },
        "-=0.35",
      );
    }

    timeline
      .to(screen, { backgroundColor: "#14243a", duration: 0.45, ease: "power2.out" }, "-=0.2")
      .fromTo(logo, { autoAlpha: 0, scale: 0.65 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(1.8)" }, "-=0.12")
      .fromTo(progress, { scaleX: 0 }, { scaleX: 1, duration: 1.05, ease: "power1.inOut" }, "+=0.08")
      .to(overlay, { autoAlpha: 0, duration: 0.42, ease: "power2.inOut" }, "+=0.16");

    return () => timeline.kill();
  }, { scope: overlayRef, dependencies: [onComplete] });

  return (
    <div className="boot-overlay" ref={overlayRef} role="status" aria-label="Starting portfolio">
      <div className="boot-macbook" aria-hidden="true">
        <div className="boot-macbook-lid">
          <BootScreen />
        </div>
        <div className="boot-macbook-base">
          <span className="boot-trackpad" />
        </div>
      </div>

      <div className="boot-ios-device" aria-hidden="true">
        <div className="boot-ios-island" />
        <BootScreen />
      </div>
    </div>
  );
}
