const SIDEBAR_TWINKLES = [
  { top: "5%", left: "16%", size: 2, delay: "0s", duration: "3.2s", tone: "white" },
  { top: "10%", left: "72%", size: 3, delay: "0.7s", duration: "4s", tone: "sky" },
  { top: "18%", left: "38%", size: 2, delay: "1.4s", duration: "3.6s", tone: "white" },
  { top: "24%", left: "84%", size: 2, delay: "0.3s", duration: "4.5s", tone: "rose" },
  { top: "32%", left: "12%", size: 3, delay: "1.8s", duration: "3.9s", tone: "white" },
  { top: "38%", left: "58%", size: 2, delay: "0.9s", duration: "4.2s", tone: "sky" },
  { top: "46%", left: "28%", size: 2, delay: "2.1s", duration: "3.5s", tone: "white" },
  { top: "52%", left: "76%", size: 3, delay: "0.5s", duration: "4.8s", tone: "rose" },
  { top: "60%", left: "44%", size: 2, delay: "1.2s", duration: "3.8s", tone: "white" },
  { top: "66%", left: "18%", size: 2, delay: "2.4s", duration: "4.1s", tone: "sky" },
  { top: "74%", left: "66%", size: 3, delay: "0.8s", duration: "3.7s", tone: "white" },
  { top: "80%", left: "36%", size: 2, delay: "1.6s", duration: "4.4s", tone: "rose" },
  { top: "86%", left: "88%", size: 2, delay: "2.7s", duration: "3.4s", tone: "white" },
  { top: "14%", left: "52%", size: 2, delay: "2s", duration: "4.6s", tone: "sky" },
  { top: "70%", left: "8%", size: 2, delay: "1s", duration: "3.9s", tone: "white" },
  { top: "42%", left: "90%", size: 2, delay: "2.3s", duration: "4.3s", tone: "rose" },
];

const TONE_CLASS = {
  white: "bg-white shadow-[0_0_12px_rgba(255,255,255,0.75)]",
  sky: "bg-sky-300 shadow-[0_0_12px_rgba(125,211,252,0.7)]",
  rose: "bg-rose-300 shadow-[0_0_12px_rgba(253,164,175,0.65)]",
};

export default function SidebarTwinkles() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {SIDEBAR_TWINKLES.map((spark, index) => (
        <span
          key={index}
          className={`dash-twinkle absolute rounded-full ${TONE_CLASS[spark.tone]}`}
          style={{
            top: spark.top,
            left: spark.left,
            width: spark.size,
            height: spark.size,
            animationDelay: spark.delay,
            animationDuration: spark.duration,
          }}
        />
      ))}
    </div>
  );
}
