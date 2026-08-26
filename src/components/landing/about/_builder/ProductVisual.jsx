import Image from "next/image";

export default function ProductVisual() {
  return (
    <>
    {/* <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="relative overflow-hidden rounded-3xl aspect-[4/5] bg-white/60 p-2 shadow-[0_20px_50px_rgba(99,102,241,0.12)] ring-1 ring-slate-200/80">
        <Image
          src="/png/productImage.png"
          alt="Flipbooks with QR sharing — elegant and mobile-friendly"
          width={720}
          height={900}
          className="h-auto w-full rounded-2xl object-contain"
          priority
        />
      </div>
    </div> */}
    <div className="relative">
              {/* Main Image Container */}
              <div className="relative group">
                <div className="relative aspect-[4/5] rounded-3xl shadow-2xl overflow-hidden">
                  <Image
                    src="/png/productImage.png"
                    alt="About RD Studio"
                    fill
                    className="object-cover"
                    priority
                  />
                  {/* Subtle overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-200/20 to-sky-200/20"></div>

                  {/* Floating Elements */}
                  <div className="absolute top-6 right-6 w-8 h-8 bg-gradient-to-br from-sky-400 to-indigo-400 rounded-full opacity-80 animate-pulse"></div>
                  <div
                    className="absolute bottom-6 left-6 w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full opacity-80 animate-pulse"
                    style={{ animationDelay: "1s" }}
                  ></div>
                  <div
                    className="absolute top-1/2 left-4 w-4 h-4 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full opacity-60 animate-pulse"
                    style={{ animationDelay: "2s" }}
                  ></div>
                </div>

                {/* Decorative Frame */}
                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-200 to-sky-200 rounded-3xl opacity-20 -z-10 group-hover:opacity-30 transition-opacity duration-500"></div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -bottom-6 -left-6 bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/60 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-sky-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h10l3 3v9a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">Flipbooks</div>
                    <div className="text-xs text-gray-600">Elegant & mobile‑friendly</div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/60 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h7v7H3V3zM14 3h7v7h-7V3zM3 14h7v7H3v-7zM18 14h3v3h-3v-3zM14 18h3v3h-3v-3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">QR Sharing</div>
                    <div className="text-xs text-gray-600">Scan & view instantly</div>
                  </div>
                </div>
              </div>
            </div>
    </>
  );
}
