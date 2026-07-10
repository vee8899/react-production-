import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { SiGmail } from "react-icons/si";
import { SiGooglecalendar } from "react-icons/si";
import { SiGooglesheets } from "react-icons/si";
import { SiGoogledocs } from "react-icons/si";
import { SiWhatsapp } from "react-icons/si";
import { SiTelegram } from "react-icons/si";
import { FaSlack } from "react-icons/fa";
import { FaEnvelope } from "react-icons/fa";
import SectionHeader from "@/components/ui/SectionHeader";

type Integration = {
  name: string;
  label: string;
  angle: number;
  icon: React.ReactNode;
};

const iconColor = "#0F0E0D";
const iconSize = 28;

const integrations: Integration[] = [
  { name: "Gmail", label: "Gmail", angle: 0, icon: <SiGmail size={iconSize} color={iconColor} /> },
  { name: "Calendar", label: "Calendar", angle: 45, icon: <SiGooglecalendar size={iconSize} color={iconColor} /> },
  { name: "Sheets", label: "Sheets", angle: 90, icon: <SiGooglesheets size={iconSize} color={iconColor} /> },
  { name: "Docs", label: "Docs", angle: 135, icon: <SiGoogledocs size={iconSize} color={iconColor} /> },
  { name: "WhatsApp", label: "WhatsApp", angle: 180, icon: <SiWhatsapp size={iconSize} color={iconColor} /> },
  { name: "Telegram", label: "Telegram", angle: 225, icon: <SiTelegram size={iconSize} color={iconColor} /> },
  { name: "Slack", label: "Slack", angle: 270, icon: <FaSlack size={iconSize} color={iconColor} /> },
  { name: "Outlook", label: "Outlook", angle: 315, icon: <FaEnvelope size={iconSize} color={iconColor} /> },
];

const CONTAINER_SIZE = 500;
const RADIUS = 200;
const CENTER = CONTAINER_SIZE / 2; // 250

export default function IntegrationsOrbit() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const shouldAnimate = !reducedMotion;

  return (
    <section className="px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,192px)] bg-[#FEFDFC]">
      <div className="max-w-[1280px] mx-auto">
        <SectionHeader label="07 — INTEGRATIONS" />

        <h2
          className="font-display font-normal text-primary mt-12 mb-16 text-center mx-auto max-w-[700px] leading-[1.15] tracking-[-0.02em]"
          style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}
        >
          Built around the tools your business already uses.
        </h2>

        <div className="flex justify-center items-center w-full">
          <div
            className="relative"
            style={{ width: CONTAINER_SIZE, height: CONTAINER_SIZE, margin: "0 auto" }}
          >
            {/* Layer 1 — Static: dashed ring */}
            <div
              className="absolute rounded-full border border-dashed"
              style={{
                width: RADIUS * 2,
                height: RADIUS * 2,
                top: CENTER - RADIUS,
                left: CENTER - RADIUS,
                borderColor: "#E0DDDA",
                borderWidth: 1,
              }}
            />

            {/* Layer 2 — Rotating: only the icon groups */}
            <motion.div
              className="absolute"
              style={{ width: CONTAINER_SIZE, height: CONTAINER_SIZE, top: 0, left: 0 }}
              animate={shouldAnimate ? { rotate: 360 } : { rotate: 0 }}
              transition={
                shouldAnimate
                  ? {
                      duration: 20,
                      ease: "linear",
                      repeat: Infinity,
                    }
                  : { duration: 0 }
              }
            >
              {integrations.map(({ name, label, angle, icon }) => {
                const angleRad = (angle * Math.PI) / 180;
                const x = CENTER + RADIUS * Math.sin(angleRad);
                const y = CENTER - RADIUS * Math.cos(angleRad);

                return (
                  <div
                    key={name}
                    className="absolute"
                    style={{
                      left: x,
                      top: y,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <motion.div
                      className="flex flex-col items-center"
                      animate={shouldAnimate ? { rotate: -360 } : { rotate: 0 }}
                      transition={
                        shouldAnimate
                          ? {
                              duration: 20,
                              ease: "linear",
                              repeat: Infinity,
                            }
                          : { duration: 0 }
                      }
                    >
                      <div className="w-8 h-8 flex items-center justify-center">
                        {icon}
                      </div>
                      <span
                        className="font-mono uppercase text-center mt-1.5 whitespace-nowrap"
                        style={{ fontSize: "0.75rem", color: "#6B6762", letterSpacing: "0.08em" }}
                      >
                        {label}
                      </span>
                    </motion.div>
                  </div>
                );
              })}
            </motion.div>

            {/* Layer 3 — Static: center card */}
            <div
              className="absolute rounded-lg flex flex-col items-center justify-center text-center z-10"
              style={{
                width: 180,
                height: "clamp(120px, 15vw, 160px)",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "#F2F0ED",
                border: "1px solid #E0DDDA",
              }}
            >
              <span
                className="font-mono uppercase tracking-[0.12em] mb-1.5"
                style={{ fontSize: "0.75rem", color: "#6B6762" }}
              >
                STUDIO
              </span>
              <span
                className="font-sans font-light leading-snug whitespace-nowrap"
                style={{ fontSize: "0.875rem", color: "#6B6762" }}
              >
                Private Automation Studio
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
