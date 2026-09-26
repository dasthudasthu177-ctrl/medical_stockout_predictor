import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ArrowRight,
  Database,
  Cpu,
  TrendingUp,
  AlertOctagon,
  BellRing,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Layers,
  Users,
  Building,
  HeartPulse,
  Share2,
  FileText,
  Clock,
  Send,
  CloudRain,
  Radio,
} from 'lucide-react';

interface PresentationDeckProps {
  onNavigateToLive: (view: 'dashboard' | 'simulator' | 'nudges' | 'ai-copilot') => void;
}

export const PresentationDeck: React.FC<PresentationDeckProps> = ({ onNavigateToLive }) => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 8;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [audioFeedback, setAudioFeedback] = useState(false);
  const deckRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev < totalSlides ? prev + 1 : prev));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev > 1 ? prev - 1 : prev));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        prevSlide();
      } else if (e.key === 'Home') {
        setCurrentSlide(1);
      } else if (e.key === 'End') {
        setCurrentSlide(totalSlides);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, totalSlides]);

  // Autoplay timer
  useEffect(() => {
    let timer: any = null;
    if (autoplay) {
      timer = setInterval(() => {
        setCurrentSlide((prev) => (prev < totalSlides ? prev + 1 : 1));
      }, 7000);
    }
    return () => clearInterval(timer);
  }, [autoplay, totalSlides]);

  const toggleFullscreen = () => {
    if (!deckRef.current) return;
    if (!document.fullscreenElement) {
      deckRef.current.requestFullscreen().catch((err) => console.log(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.log(err));
      setIsFullscreen(false);
    }
  };

  // Touch gesture support for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div
      ref={deckRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative flex flex-col justify-between min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden select-none"
    >
      {/* Background aesthetic grid & glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Top Deck Info Bar */}
      <div className="relative z-10 px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Slide {currentSlide} of {totalSlides}
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Code for Communities | GDG Chennai DevFest Roadshow 4
          </span>
        </div>

        {/* Quick jump thumbnails / dots */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {Array.from({ length: totalSlides }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setCurrentSlide(num)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentSlide === num
                  ? 'w-6 bg-emerald-400'
                  : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
              title={`Go to Slide ${num}`}
            />
          ))}
        </div>

        {/* Slide Utility Buttons */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => setAutoplay(!autoplay)}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              autoplay ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={autoplay ? 'Pause Auto-play' : 'Start Auto-play'}
          >
            {autoplay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              showNotes ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Toggle Presenter Notes"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Slide Content Canvas */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-10 lg:px-16 py-6 sm:py-10 max-w-7xl mx-auto w-full">
        {/* SLIDE 1: COVER */}
        {currentSlide === 1 && (
          <div className="space-y-6 sm:space-y-8 animate-fadeIn text-center sm:text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 shadow-inner">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>SMART HEALTH & SUPPLY CHAIN RESILIENCE</span>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
                Medicine Stockout <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  Predictor
                </span>
              </h1>
              <p className="text-lg sm:text-2xl text-slate-300 max-w-3xl font-light leading-relaxed">
                Forecasting medicine shortages before they happen — so hospitals and pharmacies never run dry.
              </p>
            </div>

            {/* Event & Author Pill */}
            <div className="pt-4 flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-xs sm:text-sm text-slate-400">
              <div className="flex items-center space-x-2 bg-slate-900/90 px-3.5 py-2 rounded-xl border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-semibold text-slate-200">Code for Communities</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-900/90 px-3.5 py-2 rounded-xl border border-slate-800">
                <Building className="w-4 h-4 text-emerald-400" />
                <span>GDG Chennai DevFest Roadshow 4</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-900/90 px-3.5 py-2 rounded-xl border border-slate-800">
                <Users className="w-4 h-4 text-teal-400" />
                <span>Presenter: <strong className="text-slate-200 font-semibold">Dasthu</strong></span>
              </div>
            </div>

            {/* Live Demo Trigger on Slide 1 */}
            <div className="pt-6 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <button
                onClick={() => onNavigateToLive('dashboard')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center space-x-2 cursor-pointer group"
              >
                <span>Launch Live Predictor MVP</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={nextSlide}
                className="px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium text-sm border border-slate-700 transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <span>View Slide Deck</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* SLIDE 2: THE PROBLEM */}
        {currentSlide === 2 && (
          <div className="space-y-6 sm:space-y-8 animate-fadeIn">
            <div>
              <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">
                The Problem
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-1">
                Medicine stockouts don't just inconvenience —{' '}
                <span className="text-rose-400 underline decoration-rose-500/50 underline-offset-4">
                  they cost lives.
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2">
              {/* Card 1 */}
              <div className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/40 p-6 rounded-2xl space-y-4 transition-all shadow-xl group">
                <div className="w-12 h-12 rounded-xl bg-rose-950/70 border border-rose-800/60 flex items-center justify-center text-rose-400 font-bold text-lg group-hover:scale-110 transition-transform">
                  1
                </div>
                <h3 className="text-xl font-bold text-white">Reactive, not predictive</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Pharmacies and PHCs reorder only after shelves go empty — by then patients are already turned away without vital antibiotics or fever remedies.
                </p>
                <div className="pt-2 text-xs font-medium text-rose-400/90 bg-rose-950/30 px-3 py-1.5 rounded-lg border border-rose-900/40">
                  ⚠️ Average lead-time delay: 4–7 days of zero inventory
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 p-6 rounded-2xl space-y-4 transition-all shadow-xl group">
                <div className="w-12 h-12 rounded-xl bg-amber-950/70 border border-amber-800/60 flex items-center justify-center text-amber-400 font-bold text-lg group-hover:scale-110 transition-transform">
                  2
                </div>
                <h3 className="text-xl font-bold text-white">Seasonal blind spots</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Demand spikes for flu, dengue, and monsoon illnesses catch supply chains off guard every single year. Static reorder levels fail during rain surges.
                </p>
                <div className="pt-2 text-xs font-medium text-amber-400/90 bg-amber-950/30 px-3 py-1.5 rounded-lg border border-amber-900/40">
                  🌧️ +80% surge in ORS & Antipyretics during heavy monsoon
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 p-6 rounded-2xl space-y-4 transition-all shadow-xl group">
                <div className="w-12 h-12 rounded-xl bg-cyan-950/70 border border-cyan-800/60 flex items-center justify-center text-cyan-400 font-bold text-lg group-hover:scale-110 transition-transform">
                  3
                </div>
                <h3 className="text-xl font-bold text-white">Fragmented data</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Consumption records sit in disconnected registers and spreadsheets, completely invisible to district drug warehouses and suppliers upstream.
                </p>
                <div className="pt-2 text-xs font-medium text-cyan-400/90 bg-cyan-950/30 px-3 py-1.5 rounded-lg border border-cyan-900/40">
                  📄 Upstream distributors get zero real-time consumption signals
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800">
              <span>Medicine Stockout Predictor</span>
              <span>Slide 2 of {totalSlides}</span>
            </div>
          </div>
        )}

        {/* SLIDE 3: OUR SOLUTION */}
        {currentSlide === 3 && (
          <div className="space-y-6 sm:space-y-8 animate-fadeIn">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                Our Solution
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-1">
                An AI model that forecasts stockouts{' '}
                <span className="text-emerald-400">weeks in advance</span> and nudges suppliers automatically.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 pt-2">
              {/* Solution 1 */}
              <div className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 p-5 rounded-2xl space-y-3 shadow-lg">
                <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400 font-bold">
                  1
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">Consumption forecasting</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Learns each facility's usage pattern from historical dispensing data and predicts demand for the next 2–4 weeks.
                </p>
              </div>

              {/* Solution 2 */}
              <div className="bg-slate-900/90 border border-slate-800 hover:border-teal-500/50 p-5 rounded-2xl space-y-3 shadow-lg">
                <div className="w-10 h-10 rounded-lg bg-teal-950/80 border border-teal-800/80 flex items-center justify-center text-teal-400 font-bold">
                  2
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">Seasonal & outbreak signals</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Factors in local disease trend data (e.g. dengue / flu season, rainfall) to adjust forecasts dynamically.
                </p>
              </div>

              {/* Solution 3 */}
              <div className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 p-5 rounded-2xl space-y-3 shadow-lg">
                <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400 font-bold">
                  3
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">Early-warning alerts</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Flags at-risk medicines before stock hits critical levels — days or weeks ahead of a shortage, not after.
                </p>
              </div>

              {/* Solution 4 */}
              <div className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 p-5 rounded-2xl space-y-3 shadow-lg">
                <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400 font-bold">
                  4
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">Supplier-facing dashboard</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  One shared view for PHCs and distributors, so restocking is a gentle nudge, not an emergency panicky call.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => onNavigateToLive('dashboard')}
                className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                <span>Preview the live supplier dashboard & alerts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-slate-500">Slide 3 of {totalSlides}</span>
            </div>
          </div>
        )}

        {/* SLIDE 4: HOW IT WORKS */}
        {currentSlide === 4 && (
          <div className="space-y-6 sm:space-y-8 animate-fadeIn">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                How It Works
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-1">
                A simple pipeline from raw stock data to an action a supplier can take.
              </h2>
            </div>

            {/* Pipeline Flow (5 Steps) */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-4 pt-2">
              {/* Step 1 */}
              <div className="bg-slate-900/95 border border-slate-800 p-4 sm:p-5 rounded-2xl relative space-y-2 hover:border-emerald-500 transition-colors">
                <div className="text-xs font-bold text-emerald-400 flex items-center justify-between">
                  <span>01</span>
                  <Database className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white">Data Ingestion</h4>
                <p className="text-xs text-slate-300">
                  Pull daily dispensing & stock-level records from PHC / pharmacy registers (CSV/API).
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-900/95 border border-slate-800 p-4 sm:p-5 rounded-2xl relative space-y-2 hover:border-teal-500 transition-colors">
                <div className="text-xs font-bold text-teal-400 flex items-center justify-between">
                  <span>02</span>
                  <Cpu className="w-4 h-4 text-teal-400" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white">Feature Engineering</h4>
                <p className="text-xs text-slate-300">
                  Combine usage trends with seasonal + regional illness signals (rainfall, viral wave).
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-900/95 border border-slate-800 p-4 sm:p-5 rounded-2xl relative space-y-2 hover:border-cyan-500 transition-colors">
                <div className="text-xs font-bold text-cyan-400 flex items-center justify-between">
                  <span>03</span>
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white">Forecast Model</h4>
                <p className="text-xs text-slate-300">
                  Time-series ML model (e.g. Prophet/LSTM) predicts stock levels 2–4 weeks out with confidence bands.
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-900/95 border border-slate-800 p-4 sm:p-5 rounded-2xl relative space-y-2 hover:border-amber-500 transition-colors">
                <div className="text-xs font-bold text-amber-400 flex items-center justify-between">
                  <span>04</span>
                  <AlertOctagon className="w-4 h-4 text-amber-400" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white">Risk Scoring</h4>
                <p className="text-xs text-slate-300">
                  Each medicine gets a stockout-risk score per facility, updated daily against supplier lead time.
                </p>
              </div>

              {/* Step 5 */}
              <div className="bg-slate-900/95 border border-slate-800 p-4 sm:p-5 rounded-2xl relative space-y-2 hover:border-emerald-400 transition-colors">
                <div className="text-xs font-bold text-emerald-400 flex items-center justify-between">
                  <span>05</span>
                  <BellRing className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white">Alert & Dashboard</h4>
                <p className="text-xs text-slate-300">
                  Suppliers see a ranked shortage list and get auto-alerts via WhatsApp/SMS before it's critical.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800">
              <button
                onClick={() => onNavigateToLive('simulator')}
                className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center space-x-1"
              >
                <span>Simulate step 02 Feature Engineering with Outbreak Sliders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span>Slide 4 of {totalSlides}</span>
            </div>
          </div>
        )}

        {/* SLIDE 5: TECH STACK */}
        {currentSlide === 5 && (
          <div className="space-y-6 sm:space-y-8 animate-fadeIn">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                Tech Stack
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-1">
                Lightweight, buildable within a hackathon timeframe, and easy to extend.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 pt-2">
              {/* Stack 1: Data & ML */}
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-400">
                    <Database className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Data & ML</h3>
                </div>
                <ul className="space-y-2.5 text-sm text-slate-300">
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span>Python (Pandas, Scikit-learn)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span>Facebook Prophet for time-series forecasting</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span>Public health datasets (seasonal illness trends)</span>
                  </li>
                </ul>
              </div>

              {/* Stack 2: Backend */}
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-teal-950/80 border border-teal-800/80 text-teal-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Backend</h3>
                </div>
                <ul className="space-y-2.5 text-sm text-slate-300">
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
                    <span>Node.js / Express or Flask API</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
                    <span>PostgreSQL / MySQL for stock records</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
                    <span>REST endpoints for risk scores & alerts</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
                    <span>Gemini 3.8 Flash for Public Health Logistics Advisory</span>
                  </li>
                </ul>
              </div>

              {/* Stack 3: Frontend & Alerts */}
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-800/80 text-cyan-400">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Frontend & Alerts</h3>
                </div>
                <ul className="space-y-2.5 text-sm text-slate-300">
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    <span>React dashboard for suppliers & PHCs</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    <span>Chart.js / SVG for stock-risk visualizations</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    <span>Twilio / WhatsApp API for automated stockout alerts</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800">
              <span>Medicine Stockout Predictor</span>
              <span>Slide 5 of {totalSlides}</span>
            </div>
          </div>
        )}

        {/* SLIDE 6: WHY IT MATTERS */}
        {currentSlide === 6 && (
          <div className="space-y-6 sm:space-y-8 animate-fadeIn">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                Why It Matters
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-1">
                Small lead time, big difference for patients and health workers.
              </h2>
            </div>

            {/* Impact Metric Hero Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-2">
              <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/40 p-6 rounded-2xl text-center space-y-2 shadow-xl">
                <div className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight">
                  2–4 wks
                </div>
                <div className="text-sm font-semibold text-white">Advance Warning</div>
                <p className="text-xs text-slate-400">
                  Before a critical medicine runs out, giving suppliers ample time to dispatch.
                </p>
              </div>

              <div className="bg-gradient-to-br from-teal-950/60 to-slate-900 border border-teal-500/40 p-6 rounded-2xl text-center space-y-2 shadow-xl">
                <div className="text-4xl sm:text-5xl font-black text-teal-300 tracking-tight">
                  Fewer
                </div>
                <div className="text-sm font-semibold text-white">Patients Turned Away</div>
                <p className="text-xs text-slate-400">
                  At PHCs due to stockouts — continuous treatment for acute infections and chronic diseases.
                </p>
              </div>

              <div className="bg-gradient-to-br from-cyan-950/60 to-slate-900 border border-cyan-500/40 p-6 rounded-2xl text-center space-y-2 shadow-xl">
                <div className="text-4xl sm:text-5xl font-black text-cyan-300 tracking-tight">
                  Faster
                </div>
                <div className="text-sm font-semibold text-white">Restocking Cycles</div>
                <p className="text-xs text-slate-400">
                  Via automated supplier alerts and instant 1-click WhatsApp restock confirmations.
                </p>
              </div>
            </div>

            {/* Who Benefits Section */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-3">
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Who benefits</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-300">
                <div className="flex items-start space-x-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <p>
                    <strong className="text-white">PHCs & pharmacies:</strong> Never turn a patient away for lack of stock on essential lists.
                  </p>
                </div>
                <div className="flex items-start space-x-2.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                  <p>
                    <strong className="text-white">District health suppliers:</strong> Plan restocking proactively instead of emergency firefighting.
                  </p>
                </div>
                <div className="flex items-start space-x-2.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <p>
                    <strong className="text-white">Patients:</strong> Reliable, uninterrupted access to essential medicines, especially in rural areas.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800">
              <span>Medicine Stockout Predictor</span>
              <span>Slide 6 of {totalSlides}</span>
            </div>
          </div>
        )}

        {/* SLIDE 7: ROADMAP */}
        {currentSlide === 7 && (
          <div className="space-y-6 sm:space-y-8 animate-fadeIn">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                Roadmap
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-1">
                What we'll build during the hackathon vs. what comes next.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 pt-2">
              {/* Phase 1 */}
              <div className="bg-slate-900/90 border-2 border-emerald-500/60 p-6 rounded-2xl space-y-4 relative shadow-xl">
                <span className="absolute -top-3 right-6 bg-emerald-500 text-slate-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Current Stage
                </span>
                <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-700/80 flex items-center justify-center text-emerald-400 font-bold text-lg">
                  1
                </div>
                <h3 className="text-xl font-bold text-white">Hackathon MVP</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Forecast model on sample data + risk dashboard for a single district (Chennai / Chengalpattu).
                </p>
                <div className="pt-2 flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Fully functional live prototype</span>
                </div>
              </div>

              {/* Phase 2 */}
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4 relative shadow-xl">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-lg">
                  2
                </div>
                <h3 className="text-xl font-bold text-white">Pilot</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Partner with 1–2 PHCs, plug in real dispensing data from registers, tune and calibrate the model.
                </p>
                <div className="pt-2 flex items-center space-x-1.5 text-xs text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>Next 60–90 days</span>
                </div>
              </div>

              {/* Phase 3 */}
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4 relative shadow-xl">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-lg">
                  3
                </div>
                <h3 className="text-xl font-bold text-white">Scale</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Multi-district rollout, automated WhatsApp/SMS alerts directly integrated with state drug depots and ERPs.
                </p>
                <div className="pt-2 flex items-center space-x-1.5 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Statewide healthcare resilience</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800">
              <button
                onClick={() => onNavigateToLive('dashboard')}
                className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center space-x-1"
              >
                <span>Experience Hackathon MVP in action</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span>Slide 7 of {totalSlides}</span>
            </div>
          </div>
        )}

        {/* SLIDE 8: THANK YOU */}
        {currentSlide === 8 && (
          <div className="space-y-6 sm:space-y-8 animate-fadeIn text-center sm:text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-700/60">
              <HeartPulse className="w-4 h-4 text-emerald-300" />
              <span>Smart Health & Supply Chain Resilience</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-5xl sm:text-7xl font-extrabold text-white tracking-tight">
                Thank You!
              </h1>
              <p className="text-xl sm:text-3xl text-emerald-300 font-light">
                Medicine Stockout Predictor
              </p>
              <p className="text-base sm:text-lg text-slate-400 max-w-2xl">
                Empowering frontline health centers and pharmacies with predictive intelligence so no patient ever walks away empty-handed.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-slate-300">
              <div className="bg-slate-900/90 px-4 py-3 rounded-xl border border-slate-800 flex items-center space-x-3">
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="font-semibold text-white">Dasthu</span>
              </div>
              <div className="bg-slate-900/90 px-4 py-3 rounded-xl border border-slate-800 flex items-center space-x-3">
                <Building className="w-4 h-4 text-emerald-400" />
                <span>Code for Communities</span>
              </div>
              <div className="bg-slate-900/90 px-4 py-3 rounded-xl border border-slate-800 flex items-center space-x-3">
                <Users className="w-4 h-4 text-teal-400" />
                <span>GDG Chennai DevFest Roadshow 4</span>
              </div>
            </div>

            {/* Direct Actions on Slide 8 */}
            <div className="pt-6 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <button
                onClick={() => onNavigateToLive('dashboard')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center space-x-2 cursor-pointer"
              >
                <span>Open Live Predictor Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigateToLive('simulator')}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm border border-slate-700 transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <CloudRain className="w-4 h-4 text-cyan-400" />
                <span>Test Outbreak Surge Simulator</span>
              </button>
              <button
                onClick={() => onNavigateToLive('nudges')}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm border border-slate-700 transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <Send className="w-4 h-4 text-emerald-400" />
                <span>Try WhatsApp Restock Nudge</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Presenter Notes Drawer */}
      {showNotes && (
        <div className="relative z-20 bg-slate-900 border-t border-indigo-500/40 p-4 text-xs sm:text-sm text-slate-300">
          <div className="max-w-7xl mx-auto flex items-start justify-between">
            <div className="space-y-1">
              <div className="font-bold text-indigo-400 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Speaker Notes for Slide {currentSlide}</span>
              </div>
              <p className="text-slate-200">
                {currentSlide === 1 &&
                  "Welcome everyone to DevFest Roadshow 4! I am Dasthu, presenting Medicine Stockout Predictor under Code for Communities. Millions of patients in developing nations arrive at rural clinics only to find essential medicines are out of stock. Today we'll demonstrate how predictive AI fixes this."}
                {currentSlide === 2 &&
                  "Emphasize the human cost: patients with malaria or diabetic complications cannot wait 5 days for paperwork. Point out why static spreadsheets fail during sudden monsoon or viral spikes."}
                {currentSlide === 3 &&
                  "Highlight the four core pillars: automated consumption baseline, weather/outbreak ingestion, early warning badges, and the critical nudge mechanism directly to distributors."}
                {currentSlide === 4 &&
                  "Walk the audience through the 5-step pipeline. In the demo, we'll see Prophet time-series calculations in action with live sliders for rainfall and viral flu signals."}
                {currentSlide === 5 &&
                  "Explain why we chose lightweight technologies: Python & Prophet for robust time series, Node/Express for real-time APIs, and React + Twilio/WhatsApp for zero-friction frontline adoption."}
                {currentSlide === 6 &&
                  "Walk through the 2-4 week lead time advantage. Mention that suppliers prefer knowing orders 2 weeks in advance rather than dealing with panicked SOS calls."}
                {currentSlide === 7 &&
                  "Present our clear phased execution: we built the working MVP today, next is deploying in 2 local primary health centers in Chengalpattu / Chennai, then scaling statewide."}
                {currentSlide === 8 &&
                  "Invite questions and offer to run custom outbreak scenarios on the live dashboard. Thank GDG Chennai community and organizers!"}
              </p>
            </div>
            <button
              onClick={() => setShowNotes(false)}
              className="text-slate-400 hover:text-white text-xs ml-4 shrink-0 font-medium"
            >
              Close Notes
            </button>
          </div>
        </div>
      )}

      {/* Bottom Slide Navigation Bar */}
      <div className="relative z-10 px-4 sm:px-8 py-3.5 flex items-center justify-between border-t border-slate-800/80 bg-slate-900/80 backdrop-blur-sm">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 1}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            currentSlide === 1
              ? 'text-slate-600 bg-slate-900/40 cursor-not-allowed'
              : 'text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {/* Center Progress Indicator */}
        <div className="text-xs text-slate-400 font-medium">
          Use <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 font-mono text-[10px]">←</kbd> and <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 font-mono text-[10px]">→</kbd> or swipe on mobile
        </div>

        <button
          onClick={nextSlide}
          disabled={currentSlide === totalSlides}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            currentSlide === totalSlides
              ? 'text-slate-600 bg-slate-900/40 cursor-not-allowed'
              : 'text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-500/20'
          }`}
        >
          <span>{currentSlide === totalSlides ? 'End of Deck' : 'Next'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
