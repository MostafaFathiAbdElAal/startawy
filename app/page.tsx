'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  TrendingUp, MessageSquare, Users, BarChart3, Target,
  Shield, ArrowRight, CheckCircle, Sparkles, Zap, Award, Globe,
  Menu, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import Counter from "@/components/Counter";
import logoImage from "@/assets/imgs/logo.png";
import heroImage from "@/assets/imgs/hero.png";

const features = [
  {
    icon: TrendingUp,
    title: "Budget Analysis",
    description: "Get detailed financial insights and recommendations to optimize your spending and maximize growth.",
    color: "from-teal-500 to-teal-600",
  },
  {
    icon: MessageSquare,
    title: "StartBot AI Advisory",
    description: "Chat with our AI-powered advisor for instant answers to your business and financial questions.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Users,
    title: "Expert Consultants",
    description: "Book sessions with certified financial consultants who understand startup challenges.",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: BarChart3,
    title: "Market Research",
    description: "Access industry reports and market insights to stay ahead of trends and competition.",
    color: "from-orange-500 to-orange-600",
  },
  {
    icon: Target,
    title: "Performance Tracking",
    description: "Monitor key financial metrics and KPIs with beautiful, easy-to-understand dashboards.",
    color: "from-pink-500 to-pink-600",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your financial data is encrypted and protected with enterprise-grade security.",
    color: "from-green-500 to-green-600",
  },
];

const benefits = [
  "Real-time financial insights",
  "AI-powered recommendations",
  "Expert consultant network",
  "24/7 support available",
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    // Check auth status from cookie (basic client-side check for UI)
    const checkAuthStatus = () => {
      const hasToken = document.cookie.includes('auth-token');
      setIsAuthenticated(hasToken);
    };

    checkAuthStatus();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        setActiveFeature((prev) => (prev + 1) % features.length);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-950 dark:to-teal-950 transition-colors duration-500 font-sans">
      <ThemeToggle />

      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
            ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg"
            : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
          } border-b border-gray-200 dark:border-gray-800`}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src={logoImage}
                alt="Startawy"
                width={120}
                height={40}
                className="h-10 w-auto object-contain mix-blend-multiply dark:mix-blend-normal dark:brightness-0 dark:invert transition-all"
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-medium">
                How It Works
              </a>
              <a href="#reviews" className="text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-medium">
                Reviews
              </a>

              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="px-6 py-2.5 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg font-semibold flex items-center gap-2"
                >
                  Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    href="/login"
                    className="text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-2.5 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg font-semibold"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 dark:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-4">
                <a
                  href="#features"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-medium py-2"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-medium py-2"
                >
                  How It Works
                </a>
                <a
                  href="#reviews"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-medium py-2"
                >
                  Reviews
                </a>

                <div className="pt-4 flex flex-col gap-4 border-t border-gray-100 dark:border-gray-800">
                  {isAuthenticated ? (
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full text-center px-6 py-3 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                      Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full text-center py-2 text-gray-700 dark:text-gray-300 hover:text-teal-600 transition-colors font-medium"
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full text-center px-6 py-3 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold shadow-lg"
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 pt-24 lg:pt-32 pb-12 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-6 order-2 lg:order-1"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full text-sm font-medium animate-pulse">
              <Sparkles className="w-4 h-4" />
              Financial Analysis & Business Consulting
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-[1.1]">
              Empower Your Startup with
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-teal-500 to-teal-600 mt-2">
                Smart Financial Insights
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg">
              Connect with expert financial consultants, get AI-powered recommendations,
              and access market research to grow your business with confidence.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-teal-600" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 text-sm md:text-base font-medium">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <Link
                href={isAuthenticated ? "/dashboard" : "/register"}
                className="px-8 py-4 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all shadow-xl hover:shadow-2xl text-lg font-bold flex items-center justify-center gap-2 group"
              >
                {isAuthenticated ? "Go to Dashboard" : "Start Free Trial"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 transition-all text-lg font-bold text-center"
              >
                Learn More
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            className="relative order-1 lg:order-2 mt-6 lg:mt-0"
          >
            <div className="absolute -top-12 -right-12 w-80 h-80 bg-teal-400/20 dark:bg-teal-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-12 -left-12 w-80 h-80 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl"></div>

            <div className="relative rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(8,112,184,0.1)] border-8 border-white dark:border-gray-800 transition-colors group">
              <Image
                src={heroImage}
                alt="Startawy Dashboard - Professional Financial Analysis Platform"
                width={800}
                height={600}
                className="w-full h-auto min-h-[300px] object-cover hover:scale-105 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-t from-teal-900/40 via-transparent to-transparent opacity-60"></div>

              <div className="absolute top-2 left-2 lg:top-6 lg:left-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-2 py-1 lg:px-5 lg:py-2.5 rounded-xl lg:rounded-2xl flex items-center gap-1 lg:gap-2 shadow-xl border border-white/20">
                <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-teal-500 rounded-full animate-ping"></div>
                <Zap className="w-3 h-3 lg:w-4 lg:h-4 text-teal-600" />
                <span className="text-[10px] lg:text-sm font-bold text-gray-900 dark:text-white">AI Real-time Analysis</span>
              </div>
            </div>

            {/* Floating Stats Cards */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute bottom-4 lg:-bottom-6 left-4 lg:-left-6 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-3 lg:p-6 border border-gray-100 dark:border-gray-800 hover:-translate-y-2 transition-transform duration-300 z-10"
            >
              <div className="flex items-center gap-2 lg:gap-4">
                <div className="w-8 h-8 lg:w-12 lg:h-12 bg-teal-50 dark:bg-teal-900/30 rounded-lg lg:rounded-xl flex items-center justify-center">
                  <Users className="w-4 h-4 lg:w-6 lg:h-6 text-teal-600" />
                </div>
                <div>
                  <div className="text-xl lg:text-3xl font-extrabold text-teal-600 leading-none">
                    <Counter end={500} suffix="+" />
                  </div>
                  <div className="text-[10px] lg:text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Active Startups</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute top-4 lg:-top-6 right-4 lg:-right-6 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-3 lg:p-6 border border-gray-100 dark:border-gray-800 hover:-translate-y-2 transition-transform duration-300 z-10"
            >
              <div className="flex items-center gap-2 lg:gap-4">
                <div className="w-8 h-8 lg:w-12 lg:h-12 bg-green-50 dark:bg-green-900/30 rounded-lg lg:rounded-xl flex items-center justify-center">
                  <Award className="w-4 h-4 lg:w-6 lg:h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-xl lg:text-3xl font-extrabold text-green-600 leading-none">
                    <Counter end={95} suffix="%" />
                  </div>
                  <div className="text-[10px] lg:text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Success Rate</div>
                </div>
              </div>
            </motion.div>

            {/* Trust Badge */}
            <div className="absolute bottom-4 right-4 lg:bottom-10 lg:right-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-2 py-1 lg:px-5 lg:py-2.5 rounded-xl lg:rounded-2xl flex items-center gap-1 lg:gap-2 shadow-xl border border-white/20">
              <Globe className="w-3 h-3 lg:w-4 lg:h-4 text-blue-600" />
              <span className="text-[10px] lg:text-sm font-bold text-gray-900 dark:text-white">Global Reach</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 bg-white/50 dark:bg-gray-800/30 rounded-3xl my-12" id="features">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Comprehensive tools and services designed for startup founders
          </p>
        </div>

        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer ${activeFeature === index ? "ring-2 ring-teal-500 dark:ring-teal-400 scale-105" : "border border-gray-100 dark:border-gray-700"
                  }`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className={`w-14 h-14 bg-linear-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-6 py-20" id="how-it-works">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How Startawy Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Get started in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="relative">
            <div className="bg-linear-to-br from-teal-500 to-teal-600 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1515355252367-42ae86cb92f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwaW5ub3ZhdGlvbiUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NzI5MjgwMjl8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Step 1"
                width={400}
                height={200}
                className="w-full h-48 object-cover opacity-80"
              />
              <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-2xl text-teal-600 shadow-lg">
                1
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Sign Up & Setup</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Create your account and tell us about your startup. It takes less than 2 minutes.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1763038311036-6d18805537e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNpYWwlMjBhbmFseXNpcyUyMGRhc2hib2FyZCUyMGNoYXJ0c3xlbnwxfHx8fDE3NzMwNTM1MzF8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Step 2"
                width={400}
                height={200}
                className="w-full h-48 object-cover opacity-80"
              />
              <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-2xl text-blue-600 shadow-lg">
                2
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Get AI Insights</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Upload your financial data and get instant AI-powered analysis and recommendations.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative">
            <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1589114207353-1fc98a11070b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGNvbnN1bHRhbnQlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzczMDEzMTI1fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Step 3"
                width={400}
                height={200}
                className="w-full h-48 object-cover opacity-80"
              />
              <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-2xl text-purple-600 shadow-lg">
                3
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Connect with Experts</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Book sessions with our certified consultants to get personalized financial guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-7xl mx-auto px-6 py-20" id="reviews">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted by Successful Founders
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            See what our clients say about Startawy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Sarah Mitchell",
              role: "CEO, TechFlow",
              content: "Startawy helped us optimize our burn rate and secure our Series A. The insights were invaluable!",
              rating: 5,
            },
            {
              name: "James Rodriguez",
              role: "Founder, GrowthHub",
              content: "The AI advisor is like having a CFO on demand. It's been a game-changer for our financial planning.",
              rating: 5,
            },
            {
              name: "Emily Chen",
              role: "Co-founder, DataLabs",
              content: "Working with Startawy consultants helped us reduce costs by 30% while scaling faster than ever.",
              rating: 5,
            },
          ].map((testimonial, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">★</span>
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic">&quot;{testimonial.content}&quot;</p>
              <div>
                <div className="font-bold text-gray-900 dark:text-white">{testimonial.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="bg-linear-to-r from-teal-500 to-teal-600 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 -translate-x-32"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Startup?</h2>
            <p className="text-xl mb-8 text-teal-50 opacity-90">
              Join hundreds of successful founders who trust Startawy for their financial growth.
            </p>
            <Link
              href={isAuthenticated ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-teal-600 rounded-lg hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl text-lg font-semibold group"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white mt-20 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <Image src={logoImage} alt="Startawy" width={100} height={35} className="brightness-0 invert h-8 w-auto" />
              <p className="text-gray-400 text-sm leading-relaxed">
                Empowering startups with smart financial insights and expert consulting.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-teal-400 transition-colors">Pricing</Link></li>
                <li><a href="#features" className="hover:text-teal-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Case Studies</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-teal-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-teal-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 dark:border-gray-900 pt-8 text-center text-gray-400 dark:text-gray-500 text-sm">
            © 2026 Startawy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
