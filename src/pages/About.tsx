import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, MapPin, Users, Flame,
  ShieldCheck, RefreshCw, Sparkles,
  TreePine, Palette, HeartHandshake,
  Compass, Award, Target, Activity
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageTransition } from '../components/ui/PageTransition';
import { CinematicSection } from '../components/ui/CinematicSection';
import { ScrollParallax } from '../components/ui/ScrollParallax';

export default function About() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F6F8F5] dark:bg-[#0A0F0D] text-[#0F172A] dark:text-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
        <div className="max-w-6xl mx-auto space-y-24">

          {/* ==================================================
              SECTION 1 — CINEMATIC HERO
             ================================================== */}
          <CinematicSection variant="fade-up" className="text-center space-y-8 pt-6 relative overflow-hidden">
            <ScrollParallax speed={-20} className="max-w-4xl mx-auto space-y-6">
              <Badge variant="success" className="bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 text-xs font-mono px-3.5 py-1.5 uppercase tracking-wider inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" /> Environmental Recovery Movement
              </Badge>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight font-display leading-[1.08] text-[#0F172A] dark:text-white">
                THE PROBLEM WAS NEVER<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-forest-500 to-fresh-400 dark:from-emerald-400 dark:via-fresh-400 dark:to-teal-300">
                  JUST TRASH.
                </span>
              </h1>

              <div className="max-w-2xl mx-auto space-y-2 font-mono text-sm sm:text-base text-[#64748B] dark:text-[#94A3B8]">
                <p className="font-bold text-[#0F172A] dark:text-neutral-200 text-lg">The real problem is the cycle.</p>
                <p className="text-rose-600 dark:text-rose-400">Trash appears. People clean it. And eventually, it returns.</p>
              </div>

              <div className="pt-4">
                <div className="inline-block p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30">
                  <p className="text-base sm:text-xl font-black font-display text-emerald-700 dark:text-emerald-300 tracking-wide">
                    TRASHCHAIN EXISTS TO BREAK THAT CYCLE.
                  </p>
                </div>
              </div>
            </ScrollParallax>

            {/* Visual Lifecycle Comparison Banner */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6"
            >
              {/* Broken Loop Visual */}
              <div className="bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/20 rounded-3xl p-6 space-y-4 text-left">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Traditional Broken Loop
                  </span>
                  <Badge variant="danger" className="text-[10px]">NEVER STOPS</Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs pt-2">
                  <div className="p-3 bg-white/80 dark:bg-neutral-900/80 rounded-xl border border-rose-500/20">
                    <span className="text-rose-500 font-black block text-sm">01</span>
                    <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300">DUMPING</span>
                  </div>
                  <div className="p-3 bg-white/80 dark:bg-neutral-900/80 rounded-xl border border-rose-500/20">
                    <span className="text-rose-500 font-black block text-sm">02</span>
                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">CLEANUP</span>
                  </div>
                  <div className="p-3 bg-white/80 dark:bg-neutral-900/80 rounded-xl border border-rose-500/20">
                    <span className="text-rose-500 font-black block text-sm">03</span>
                    <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300">REPEAT</span>
                  </div>
                </div>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-sans">
                  Treats symptoms instead of root causes. Without ongoing protection, effort is lost.
                </p>
              </div>

              {/* TrashChain Continuous Chain Visual */}
              <div className="bg-emerald-500/5 dark:bg-emerald-950/30 border border-emerald-500/30 rounded-3xl p-6 space-y-4 text-left">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> The TrashChain Solution
                  </span>
                  <Badge variant="success" className="text-[10px]">VERIFIED RECOVERY</Badge>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center font-mono text-[10px] pt-2">
                  <div className="p-2 bg-white/80 dark:bg-neutral-900/80 rounded-xl border border-emerald-500/20">
                    <span className="text-emerald-500 font-black block">01</span>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">REPORT</span>
                  </div>
                  <div className="p-2 bg-white/80 dark:bg-neutral-900/80 rounded-xl border border-emerald-500/20">
                    <span className="text-emerald-500 font-black block">02</span>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">CONNECT</span>
                  </div>
                  <div className="p-2 bg-white/80 dark:bg-neutral-900/80 rounded-xl border border-emerald-500/20">
                    <span className="text-emerald-500 font-black block">03</span>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">CLEAN</span>
                  </div>
                  <div className="p-2 bg-white/80 dark:bg-neutral-900/80 rounded-xl border border-emerald-500/20">
                    <span className="text-emerald-500 font-black block">04</span>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">MONITOR</span>
                  </div>
                  <div className="p-2 bg-white/80 dark:bg-neutral-900/80 rounded-xl border border-emerald-500/20">
                    <span className="text-emerald-500 font-black block">05</span>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">RECOVER</span>
                  </div>
                  <div className="p-2 bg-white/80 dark:bg-neutral-900/80 rounded-xl border border-emerald-500/20">
                    <span className="text-emerald-500 font-black block">06</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">TRANSFORM</span>
                  </div>
                </div>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-sans">
                  Combines AI reporting, community missions, biweekly surveillance, and physical transformation.
                </p>
              </div>
            </motion.div>
          </CinematicSection>

          {/* ==================================================
              SECTION 2 — THE PROBLEM
             ================================================== */}
          <CinematicSection variant="fade-up" className="space-y-8">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest block">
                ROOT CAUSE ANALYSIS
              </span>
              <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-[#0F172A] dark:text-white">
                CLEANING ONCE IS NOT ENOUGH.
              </h2>
              <p className="text-sm sm:text-base text-[#64748B] dark:text-[#94A3B8] font-sans">
                A clean site today without community ownership, surveillance, and transformation becomes an illegal dump site tomorrow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* THE OLD CYCLE */}
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white dark:bg-[#121915] border border-rose-500/30 rounded-3xl p-8 space-y-6 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-rose-500/20 pb-4">
                  <h3 className="text-xl font-bold font-display text-rose-700 dark:text-rose-300 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-rose-500" /> THE OLD CYCLE
                  </h3>
                  <Badge variant="danger" className="text-[10px] font-mono">UNPROTECTED</Badge>
                </div>

                <div className="space-y-4 font-mono text-xs">
                  <div className="p-3.5 rounded-2xl bg-rose-500/5 dark:bg-rose-950/30 border border-rose-500/20 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-600 font-bold flex items-center justify-center shrink-0">1</span>
                    <div>
                      <span className="font-bold text-rose-700 dark:text-rose-300 text-sm block">Waste Appears</span>
                      <span className="text-neutral-500 font-sans text-xs">Illegal dumping starts at unmonitored roadside site.</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-rose-500/5 dark:bg-rose-950/30 border border-rose-500/20 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-600 font-bold flex items-center justify-center shrink-0">2</span>
                    <div>
                      <span className="font-bold text-rose-700 dark:text-rose-300 text-sm block">Someone Cleans</span>
                      <span className="text-neutral-500 font-sans text-xs">Volunteers perform a one-off cleanup without follow-up.</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-rose-500/5 dark:bg-rose-950/30 border border-rose-500/20 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-600 font-bold flex items-center justify-center shrink-0">3</span>
                    <div>
                      <span className="font-bold text-rose-700 dark:text-rose-300 text-sm block">No Long-Term Protection</span>
                      <span className="text-neutral-500 font-sans text-xs">No cameras, no barrier, no monitoring, no accountability.</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-rose-500/5 dark:bg-rose-950/30 border border-rose-500/20 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-600 font-bold flex items-center justify-center shrink-0">4</span>
                    <div>
                      <span className="font-bold text-rose-700 dark:text-rose-300 text-sm block">Waste Returns</span>
                      <span className="text-neutral-500 font-sans text-xs">Repeat offenders dump trash again. Effort is lost.</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* THE TRASHCHAIN CYCLE */}
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white dark:bg-[#121915] border border-emerald-500/40 rounded-3xl p-8 space-y-6 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
                  <h3 className="text-xl font-bold font-display text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" /> THE TRASHCHAIN CYCLE
                  </h3>
                  <Badge variant="success" className="text-[10px] font-mono">PROTECTED & RECOVERED</Badge>
                </div>

                <div className="space-y-4 font-mono text-xs">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/30 border border-emerald-500/20 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 font-bold flex items-center justify-center shrink-0">1</span>
                    <div>
                      <span className="font-bold text-emerald-700 dark:text-emerald-300 text-sm block">Pollution Reported</span>
                      <span className="text-neutral-500 font-sans text-xs">GPS pin, photo evidence & AI severity logged in central dataset.</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/30 border border-emerald-500/20 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 font-bold flex items-center justify-center shrink-0">2</span>
                    <div>
                      <span className="font-bold text-emerald-700 dark:text-emerald-300 text-sm block">Community Takes Action</span>
                      <span className="text-neutral-500 font-sans text-xs">Cleanup mission organized with volunteer dispatch & safety gear.</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/30 border border-emerald-500/20 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 font-bold flex items-center justify-center shrink-0">3</span>
                    <div>
                      <span className="font-bold text-emerald-700 dark:text-emerald-300 text-sm block">Recovery Monitored</span>
                      <span className="text-neutral-500 font-sans text-xs">Biweekly 30/60/90 day photo checkpoints track site cleanliness.</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/30 border border-emerald-500/20 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 font-bold flex items-center justify-center shrink-0">4</span>
                    <div>
                      <span className="font-bold text-emerald-700 dark:text-emerald-300 text-sm block">Space Transformed</span>
                      <span className="text-neutral-500 font-sans text-xs">Site converted into a Mini Garden, Art Wall, or Community Hub.</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </CinematicSection>

          {/* ==================================================
              SECTION 3 — THE IDEA BEHIND TRASHCHAIN
             ================================================== */}
          <CinematicSection variant="fade-up" className="bg-gradient-to-br from-emerald-950 via-forest-950 to-[#0A0F0D] text-white rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden space-y-10 border border-emerald-500/30">
            <ScrollParallax speed={-15} className="text-center space-y-4 max-w-3xl mx-auto">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                THE CHAIN EFFECT
              </span>
              <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white">
                FROM ONE ACTION, A CHAIN BEGINS.
              </h2>
            </ScrollParallax>

            {/* Progressive Storytelling Lines */}
            <div className="max-w-2xl mx-auto space-y-4 font-mono text-sm sm:text-base">
              {[
                'One person notices a problem.',
                'One person decides to act.',
                'A community joins the mission.',
                'The polluted place is cleaned.',
                'The location is monitored.',
                'The space is recovered.',
                'The transformation inspires others.',
                'Another community takes action.',
                'AND THE CHAIN GROWS.'
              ].map((sentence, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -25 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className={`p-4 rounded-2xl border flex items-center gap-3 ${
                    idx === 8
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-black text-lg sm:text-xl shadow-lg'
                      : 'bg-white/5 border-white/10 text-neutral-200'
                  }`}
                >
                  <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0 font-mono">
                    0{idx + 1}
                  </span>
                  <span>{sentence}</span>
                </motion.div>
              ))}
            </div>

            <div className="pt-4 text-center">
              <div className="inline-block p-6 rounded-3xl bg-emerald-500/20 border border-emerald-400/50 shadow-2xl">
                <span className="text-xl sm:text-3xl font-black font-display text-emerald-300 tracking-wider">
                  ONE ACTION CAN START A CHAIN.
                </span>
              </div>
            </div>
          </CinematicSection>

          {/* ==================================================
              SECTION 4 — HOW TRASHCHAIN WORKS (6-STEP LIFECYCLE)
             ================================================== */}
          <CinematicSection variant="fade-up" className="space-y-10">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
                SYSTEM ARCHITECTURE
              </span>
              <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-[#0F172A] dark:text-white">
                THE 6-STEP RECOVERY LIFECYCLE
              </h2>
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8] font-sans">
                Every reported hotspot moves through an automated 6-step recovery pipeline from detection to transformation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs">
              {[
                { step: '01', title: 'REPORT', icon: MapPin, color: 'text-rose-500', bg: 'bg-rose-500/10', desc: 'A citizen discovers and reports a polluted site with GPS evidence & AI hazard detection.' },
                { step: '02', title: 'CONNECT', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10', desc: 'The community discovers the problem and aligns volunteers and equipment for action.' },
                { step: '03', title: 'CLEAN', icon: Flame, color: 'text-amber-500', bg: 'bg-amber-500/10', desc: 'Organized volunteers execute an equipped cleanup mission with safety protocols.' },
                { step: '04', title: 'MONITOR', icon: ShieldCheck, color: 'text-sky-500', bg: 'bg-sky-500/10', desc: 'Biweekly 30/60/90 day photo inspection checkpoints prevent waste from returning.' },
                { step: '05', title: 'RECOVER', icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: 'Long-term recovery verification confirms the location remains 100% clean.' },
                { step: '06', title: 'TRANSFORM', icon: TreePine, color: 'text-teal-500', bg: 'bg-teal-500/10', desc: 'The space becomes a Community Garden, Public Art Mural, Green Park, or Protected Zone.' },
              ].map((item, idx) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -5, scale: 1.015, transition: { duration: 0.2 } }}
                  className="bg-white dark:bg-[#121915] border border-[#E2E8F0] dark:border-[#1E2C24] p-6 rounded-3xl space-y-4 shadow-sm hover:border-emerald-500/40"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center font-bold`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-sm font-black text-neutral-400">STEP {item.step}</span>
                  </div>
                  <h3 className="font-bold text-lg font-display text-[#0F172A] dark:text-white">{item.title}</h3>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-sans leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </CinematicSection>

          {/* ==================================================
              SECTION 5 — TRANSFORMATION, NOT JUST CLEANUP
             ================================================== */}
          <CinematicSection variant="fade-up" className="space-y-8">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
                BEYOND GARBAGE REMOVAL
              </span>
              <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-[#0F172A] dark:text-white">
                WE DON'T JUST REMOVE WASTE.<br />
                <span className="text-emerald-600 dark:text-emerald-400">
                  WE HELP COMMUNITIES RECLAIM THEIR SPACES.
                </span>
              </h2>
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8] font-sans pt-2">
                A successful mission does not end when garbage is removed. The real goal is:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-xs font-bold pt-1">
                <span className="px-3 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full border border-rose-500/20">PREVENT</span>
                <span>➔</span>
                <span className="px-3 py-1 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-full border border-sky-500/20">PROTECT</span>
                <span>➔</span>
                <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full border border-amber-500/20">RECOVER</span>
                <span>➔</span>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">TRANSFORM</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'GREEN', icon: TreePine, color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: 'Convert neglected dump sites into vibrant community mini gardens and composting hubs.' },
                { title: 'CREATE', icon: Palette, color: 'text-purple-500', bg: 'bg-purple-500/10', desc: 'Use public art murals, clean pathways, and creative seating to make the site welcoming.' },
                { title: 'CONNECT', icon: HeartHandshake, color: 'text-amber-500', bg: 'bg-amber-500/10', desc: 'Create active public spaces that local neighborhoods use, take pride in, and protect.' },
                { title: 'PROTECT', icon: ShieldCheck, color: 'text-sky-500', bg: 'bg-sky-500/10', desc: 'Continue ongoing biweekly surveillance monitoring so pollution never returns.' },
              ].map((card, idx) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-white dark:bg-[#121915] border border-[#E2E8F0] dark:border-[#1E2C24] p-6 rounded-3xl space-y-4 shadow-sm hover:border-emerald-500/40"
                >
                  <div className={`w-12 h-12 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center font-bold`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold font-display text-[#0F172A] dark:text-white">{card.title}</h3>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-sans leading-relaxed">{card.desc}</p>
                </motion.div>
              ))}
            </div>
          </CinematicSection>

          {/* ==================================================
              SECTION 6 — THE CHAIN EFFECT
             ================================================== */}
          <CinematicSection variant="fade-up" className="space-y-10">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
                EXPANDING MOVEMENT
              </span>
              <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-[#0F172A] dark:text-white">
                ACTION IS CONTAGIOUS.
              </h2>
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8] font-sans">
                When one community takes visible action, it inspires surrounding neighborhoods, NGOs, leaders, and volunteers to join.
              </p>
            </div>

            {/* Visual Chain Expansion Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs">
              {[
                { label: '1 PERSON ACTS', desc: 'A citizen reports a site with GPS pin & AI analysis.' },
                { label: '10 PEOPLE JOIN', desc: 'Local volunteers sign up for the cleanup mission.' },
                { label: 'A COMMUNITY ORGANIZES', desc: 'Equipment, safety gear & schedule are aligned.' },
                { label: 'A LOCATION IS RECOVERED', desc: 'Debris removed & physical site barriers installed.' },
                { label: 'ANOTHER COMMUNITY INSPIRED', desc: 'Surrounding neighborhoods replicate the recovery.' },
                { label: 'THE MOVEMENT GROWS', desc: 'NGOs, schools & municipal leaders expand the network.' },
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: idx * 0.08 }}
                  className="bg-white dark:bg-[#121915] border border-[#E2E8F0] dark:border-[#1E2C24] p-5 rounded-2xl space-y-2 shadow-sm border-l-4 border-l-emerald-500"
                >
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">LINK 0{idx + 1}</span>
                  <h3 className="font-bold text-base text-[#0F172A] dark:text-white font-display">{step.label}</h3>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-sans">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </CinematicSection>

          {/* ==================================================
              SECTION 7 — TECHNOLOGY + COMMUNITY
             ================================================== */}
          <CinematicSection variant="fade-up" className="space-y-10">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
                UNIFIED ENGINE
              </span>
              <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-[#0F172A] dark:text-white">
                TECHNOLOGY CONNECTS THE CHAIN.<br />
                <span className="text-emerald-600 dark:text-emerald-400">
                  PEOPLE CREATE THE CHANGE.
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs">
              {[
                { title: 'HOTSPOT REPORTING', icon: MapPin, desc: 'Instant GPS pin, photo evidence log, and AI severity rating.' },
                { title: 'COMMUNITY DISCOVERY', icon: Compass, desc: 'Real-time interactive satellite map showing environmental needs nearby.' },
                { title: 'CLEANUP MISSIONS', icon: Target, desc: 'Structured volunteer dispatch with safety checklists and scale weights.' },
                { title: 'EVIDENCE & VERIFICATION', icon: Award, desc: 'Before/After photo comparison and AI verification scoring.' },
                { title: 'MONITORING NETWORK', icon: Activity, desc: '30/60/90 day post-cleanup inspection checkpoints.' },
                { title: 'RECOVERY & TRANSFORMATION', icon: Sparkles, desc: 'Long-term site health index and barrier tracking.' },
              ].map((feat, idx) => (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: idx * 0.08 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-white dark:bg-[#121915] border border-[#E2E8F0] dark:border-[#1E2C24] p-6 rounded-3xl space-y-3 shadow-sm hover:border-emerald-500/40"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <feat.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-[#0F172A] dark:text-white font-display">{feat.title}</h3>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-sans leading-relaxed">{feat.desc}</p>
                </motion.div>
              ))}
            </div>
          </CinematicSection>

          {/* ==================================================
              SECTION 8 — OUR VISION
             ================================================== */}
          <CinematicSection variant="zoom-in" className="bg-emerald-950 text-white rounded-3xl p-8 sm:p-14 text-center space-y-8 shadow-2xl relative overflow-hidden border border-emerald-500/30">
            <ScrollParallax speed={15} className="max-w-3xl mx-auto space-y-6">
              <Badge variant="success" className="bg-emerald-500/20 text-emerald-300 border-emerald-400/40 font-mono text-xs px-3.5 py-1 uppercase tracking-wider">
                OUR VISION
              </Badge>

              <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white leading-tight">
                A CLEANER INDIA STARTS WITH CONNECTED ACTION.
              </h2>

              <div className="space-y-3 text-sm sm:text-base text-emerald-200 font-sans max-w-2xl mx-auto leading-relaxed">
                <p>Imagine a place where pollution does not simply disappear for one day.</p>
                <p>Imagine communities taking permanent ownership of their surroundings.</p>
                <p>Imagine every cleanup becoming the beginning of a longer recovery story.</p>
                <p>Imagine one successful transformation inspiring another.</p>
              </div>

              <div className="pt-4 space-y-2 font-mono text-base sm:text-xl font-bold text-emerald-400">
                <p>FROM ONE STREET.</p>
                <p>TO ONE COMMUNITY.</p>
                <p className="text-white font-black text-xl sm:text-3xl">TO A GROWING CHAIN OF CHANGE.</p>
              </div>

              <div className="pt-4">
                <span className="text-2xl sm:text-4xl font-black font-display text-emerald-300 tracking-widest block">
                  THIS IS TRASHCHAIN.
                </span>
              </div>
            </ScrollParallax>
          </CinematicSection>

          {/* ==================================================
              SECTION 9 — FINAL CALL TO ACTION
             ================================================== */}
          <CinematicSection variant="fade-up" className="bg-white dark:bg-[#121915] border border-[#E2E8F0] dark:border-[#1E2C24] rounded-3xl p-8 sm:p-14 text-center space-y-8 shadow-sm">
            <div className="max-w-2xl mx-auto space-y-4">
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
                TAKE ACTION TODAY
              </span>
              <h2 className="text-3xl sm:text-5xl font-black font-display text-[#0F172A] dark:text-white">
                THE CHAIN STARTS WITH SOMEONE.
              </h2>
              <p className="text-sm sm:text-base text-[#64748B] dark:text-[#94A3B8] font-sans leading-relaxed">
                It could be a person reporting a polluted location. A volunteer joining a cleanup. A community protecting a recovered space. Or an organization supporting the movement.
              </p>
              <p className="text-base sm:text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                EVERY ACTION CREATES ANOTHER LINK.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Button
                size="lg"
                onClick={() => navigate('/report')}
                className="w-full sm:w-auto bg-[#15803D] hover:bg-[#166534] text-white font-bold px-8 py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                REPORT A POLLUTION HOTSPOT <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/missions')}
                className="w-full sm:w-auto border-neutral-300 dark:border-neutral-700 text-[#0F172A] dark:text-white font-bold px-8 py-3.5 rounded-xl flex items-center justify-center gap-2"
              >
                EXPLORE CLEANUP MISSIONS <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CinematicSection>

        </div>
      </div>
    </PageTransition>
  );
}
