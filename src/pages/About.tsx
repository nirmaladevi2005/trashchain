import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, MapPin, Brain, FileText, 
  Users, Flame, ShieldCheck
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StaggerContainer, StaggerItem } from '../components/ui/ScrollReveal';
import { PageTransition } from '../components/ui/PageTransition';
import { CinematicSection } from '../components/ui/CinematicSection';
import { ScrollParallax } from '../components/ui/ScrollParallax';

export default function About() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F6F8F5] dark:bg-[#0A0F0D] text-[#0F172A] dark:text-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
      <div className="max-w-5xl mx-auto space-y-20">

        {/* 1. HERO STORYTELLING BANNER WITH PARALLAX */}
        <CinematicSection variant="fade-up" className="text-center space-y-6 pt-4 relative">
          <ScrollParallax speed={-25} className="max-w-3xl mx-auto">
            <Badge variant="success" className="bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 text-xs font-mono px-3 py-1 mb-3 inline-block">
              OUR ENVIRONMENTAL PURPOSE
            </Badge>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight font-display leading-[1.1]">
              Breaking the Cycle of<br />
              <span className="text-emerald-600 dark:text-emerald-400">Repeated Waste</span>
            </h1>

            <p className="text-base sm:text-lg text-[#64748B] dark:text-[#94A3B8] max-w-2xl mx-auto leading-relaxed font-sans pt-3">
              Cleaning waste is only half the battle. Without intelligent planning and ongoing monitoring, reported hotspots get dumped on again. TrashChain is built to break the cycle.
            </p>
          </ScrollParallax>
        </CinematicSection>

        {/* 2. THE ENDLESS CYCLE PROBLEM */}
        <CinematicSection variant="fade-up" className="bg-white dark:bg-[#121915] border border-[#E2E8F0] dark:border-[#1E2C24] rounded-3xl p-8 sm:p-10 shadow-sm space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest block">
              THE BROKEN STATUS QUO
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display">The Endless Dump–Clean Cycle</h2>
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
              Traditional cleanups treat symptoms, not root causes.
            </p>
          </div>

          {/* 4-Step Repeating Loop Visual */}
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center font-mono text-xs">
            <StaggerItem>
              <div className="p-4 bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/20 rounded-2xl space-y-2 h-full">
                <span className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center mx-auto text-sm">1</span>
                <h3 className="font-bold text-rose-700 dark:text-rose-300">Illegal Dumping</h3>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-sans">Waste accumulates at an unmonitored roadside site.</p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="p-4 bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 rounded-2xl space-y-2 h-full">
                <span className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center mx-auto text-sm">2</span>
                <h3 className="font-bold text-amber-700 dark:text-amber-300">One-Time Cleanup</h3>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-sans">Volunteers clean the debris without long-term prevention.</p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="p-4 bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/20 rounded-2xl space-y-2 h-full">
                <span className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center mx-auto text-sm">3</span>
                <h3 className="font-bold text-purple-700 dark:text-purple-300">Repeat Dumping</h3>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-sans">Offenders notice no surveillance and dump waste again.</p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="p-4 bg-blue-500/5 dark:bg-blue-950/20 border border-blue-500/20 rounded-2xl space-y-2 h-full">
                <span className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center mx-auto text-sm">4</span>
                <h3 className="font-bold text-blue-700 dark:text-blue-300">Frustrated Effort</h3>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-sans">Community loses momentum as effort is wasted.</p>
              </div>
            </StaggerItem>
          </StaggerContainer>

          <div className="p-4 bg-[#F6F8F5] dark:bg-[#1A241E] rounded-2xl border border-[#E2E8F0] dark:border-[#1E2C24] text-center font-mono text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
            Traditional Cycle: <span className="text-rose-600 dark:text-rose-400 font-bold">Dump ➔ Clean ➔ Dump ➔ Clean</span> (Never Stops)
          </div>
        </CinematicSection>

        {/* 3. TRASHCHAIN 6-STEP RECOVERY SOLUTION */}
        <div className="space-y-10">
          <CinematicSection variant="fade-up" className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
              THE TRASHCHAIN SOLUTION
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-display">A Complete 6-Step Recovery Journey</h2>
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
              TrashChain connects AI technology, community mobilization, and long-term surveillance monitoring.
            </p>
          </CinematicSection>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StaggerItem>
              <div className="bg-white dark:bg-[#121915] border border-[#E2E8F0] dark:border-[#1E2C24] rounded-2xl p-6 space-y-3 shadow-sm hover:border-emerald-500/40 transition-colors h-full">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-neutral-400">01</span>
                </div>
                <h3 className="font-bold text-lg font-display">1. Report Hotspot</h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-sans leading-relaxed">
                  Citizens snap a photo with GPS accuracy to log the exact location and evidence.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="bg-white dark:bg-[#121915] border border-[#E2E8F0] dark:border-[#1E2C24] rounded-2xl p-6 space-y-3 shadow-sm hover:border-purple-500/40 transition-colors h-full">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                    <Brain className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-neutral-400">02</span>
                </div>
                <h3 className="font-bold text-lg font-display">2. Gemini AI Analysis</h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-sans leading-relaxed">
                  Multimodal vision AI assesses waste categories (plastic, hazardous) and calculates risk ratings.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="bg-white dark:bg-[#121915] border border-[#E2E8F0] dark:border-[#1E2C24] rounded-2xl p-6 space-y-3 shadow-sm hover:border-indigo-500/40 transition-colors h-full">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-neutral-400">03</span>
                </div>
                <h3 className="font-bold text-lg font-display">3. OpenAI Recovery Plan</h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-sans leading-relaxed">
                  Generates safety precautions, equipment needs, volunteer counts, and long-term barrier recommendations.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="bg-white dark:bg-[#121915] border border-[#E2E8F0] dark:border-[#1E2C24] rounded-2xl p-6 space-y-3 shadow-sm hover:border-amber-500/40 transition-colors h-full">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-neutral-400">04</span>
                </div>
                <h3 className="font-bold text-lg font-display">4. Mobilize Volunteers</h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-sans leading-relaxed">
                  Hotspot converts into a organized community mission with date, time, and team registration.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="bg-white dark:bg-[#121915] border border-[#E2E8F0] dark:border-[#1E2C24] rounded-2xl p-6 space-y-3 shadow-sm hover:border-emerald-500/40 transition-colors h-full">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                    <Flame className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-neutral-400">05</span>
                </div>
                <h3 className="font-bold text-lg font-display">5. Transform & Recover</h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-sans leading-relaxed">
                  Volunteers remove debris and install physical barriers (Mini Gardens, Composting Hubs, Murals).
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="bg-white dark:bg-[#121915] border border-[#E2E8F0] dark:border-[#1E2C24] rounded-2xl p-6 space-y-3 shadow-sm hover:border-sky-500/40 transition-colors h-full">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-neutral-400">06</span>
                </div>
                <h3 className="font-bold text-lg font-display">6. Surveillance Monitoring</h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-sans leading-relaxed">
                  Biweekly photo check-ins and community surveillance track site health to prevent repeat dumping.
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>

        {/* 4. FINAL STORYTELLING CTA WITH PARALLAX */}
        <CinematicSection variant="zoom-in" className="bg-emerald-950 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
          <ScrollParallax speed={15} className="max-w-xl mx-auto space-y-3 relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black font-display">
              Ready to Recover a Space?
            </h2>
            <p className="text-emerald-200 text-sm font-sans">
              Join thousands of community changemakers using TrashChain to clean today and prevent tomorrow.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/report')}
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold px-8 py-3.5 rounded-xl shadow-lg"
              >
                Report a Hotspot <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/explore')}
                className="w-full sm:w-auto border-emerald-400/40 text-white bg-emerald-900/50 hover:bg-emerald-900 font-bold px-8 py-3.5 rounded-xl"
              >
                Explore Map
              </Button>
            </div>
          </ScrollParallax>
        </CinematicSection>

      </div>
    </div>
    </PageTransition>
  );
}
