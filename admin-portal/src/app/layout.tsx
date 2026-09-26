import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { AshokaEmblem, TricolorBar } from "@/components/Emblem";

export const metadata: Metadata = {
  title: "CPGRAMS - Public Grievance Redressal Administration Portal | Government of India",
  description:
    "Official Administrative Portal for Centralised Public Grievance Redress & Monitoring System (CPGRAMS). Ministry of Housing & Urban Affairs, Government of India.",
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.png" type="image/png" sizes="64x64" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#f1f5f9] text-slate-900 min-h-screen flex flex-col font-sans overflow-x-hidden max-w-full">
        <div className="flex min-h-screen flex-1 w-full max-w-full overflow-x-hidden">
          {/* Institutional Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 main-content-layout flex flex-col min-h-screen transition-all duration-300 overflow-x-hidden">
            <Header />

            {/* Official Alert Banner for Grievance Officers */}
            <div className="bg-amber-50 border-b border-amber-200 px-4 md:px-6 py-2 text-xs flex flex-wrap items-center justify-between gap-2 text-amber-900 shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[10px] bg-[#e65100] text-white px-2 py-0.5 rounded uppercase shrink-0">
                  Gazette Notice
                </span>
                <span className="font-medium text-xs">
                  SLA Directive: Under the Citizens&apos; Charter Act, civic grievances designated as High Priority must be inspected within 48 hours.
                </span>
              </div>
              <span className="text-[11px] font-mono text-amber-800 hidden md:inline shrink-0">
                National Grievance Cell • Toll-Free: 1800-11-4000
              </span>
            </div>

            {/* Dynamic Page Content */}
            <main className="flex-1 min-w-0 p-4 md:p-6 bg-[#f1f5f9] max-w-full overflow-x-hidden">{children}</main>

            {/* Official Indian Government Portal Footer */}
            <footer className="bg-[#051b30] text-slate-300 border-t-2 border-[#0b3c68] text-xs shrink-0 select-none">
              <TricolorBar />
              <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-700/80">
                  <div className="flex items-center gap-3">
                    <AshokaEmblem className="w-10 h-12 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-white uppercase tracking-wider">
                        Government of India
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Ministry of Housing &amp; Urban Affairs
                      </p>
                      <p className="text-[10px] text-amber-400 font-mono mt-0.5">
                        Centralised Public Grievance Redress &amp; Monitoring System (CPGRAMS)
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-slate-400 space-y-1">
                    <p className="text-slate-300 font-semibold">
                      Technical Support &amp; Network Operations:
                    </p>
                    <p>National Informatics Centre (NIC) Municipal Data Centre</p>
                    <p className="font-mono text-[10px] text-slate-400">
                      Standard Compliance: Guidelines for Indian Government Websites (GIGW 3.0)
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
                  <div>
                    © {new Date().getFullYear()} National Civic Redressal Portal. All Rights Reserved.
                  </div>
                  <div className="flex items-center gap-4 text-slate-300">
                    <span className="hover:text-amber-300 transition-colors cursor-pointer">
                      Citizen Charter
                    </span>
                    <span>•</span>
                    <span className="hover:text-amber-300 transition-colors cursor-pointer">
                      Grievance Guidelines
                    </span>
                    <span>•</span>
                    <span className="hover:text-amber-300 transition-colors cursor-pointer">
                      Security Policy
                    </span>
                    <span>•</span>
                    <span className="font-mono text-emerald-400">NIC-SECURE SSL</span>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
