import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, AlertTriangle, CheckCircle2, ArrowLeft, 
  MapPin, Users, Award, 
  FileText, Check, Eye, Printer
} from 'lucide-react';
import { missions, hotspots, mockPreventionRecommendation } from '../data/mockData';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ImpactBadge } from '../components/ui/ImpactBadge';
import { Card, CardContent } from '../components/ui/Card';
import { TransformationReveal } from '../components/ui/impact/ImpactMoments';
import { cn } from '../utils/cn';
import type { TransformationIdea, TransformationStatus } from '../types';
import { useAuth } from '../hooks/useAuth';

const TRANSFORMATION_STAGES: { id: TransformationStatus; label: string }[] = [
  { id: 'ai_recommendation', label: 'AI Recommendation' },
  { id: 'community_voting', label: 'Community Voting' },
  { id: 'idea_selected', label: 'Idea Selected' },
  { id: 'planning', label: 'Planning' },
  { id: 'implementation', label: 'Implementation' },
  { id: 'transformation_complete', label: 'Transformation Complete' },
];

export default function Prevention() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDemo } = useAuth();

  const mission = missions.find(m => m.id === id) || missions[1] || missions[0];
  const hotspot = hotspots.find(h => h.id === mission?.hotspotId) || hotspots[1] || hotspots[0];

  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisStep, setAnalysisStep] = useState(0);

  const [ideas, setIdeas] = useState<TransformationIdea[]>(mockPreventionRecommendation.ideas);
  const [userVote, setUserVote] = useState<string | null>('idea-1');
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>('idea-1');
  const [transformationStatus, setTransformationStatus] = useState<TransformationStatus>('community_voting');
  const [activeTab, setActiveTab] = useState<'recommendations' | 'voting' | 'visualization' | 'report'>('recommendations');
  const [visualizeView, setVisualizeView] = useState<'before' | 'after' | 'future'>('future');
  const [showTransformationToast, setShowTransformationToast] = useState(false);

  const totalVotes = ideas.reduce((sum, item) => sum + item.votes, 0);
  const leadingIdea = [...ideas].sort((a, b) => b.votes - a.votes)[0];
  const selectedIdea = ideas.find(i => i.id === selectedIdeaId) || leadingIdea;

  useEffect(() => {
    const timer1 = setTimeout(() => setAnalysisStep(1), 500);
    const timer2 = setTimeout(() => setAnalysisStep(2), 1000);
    const timer3 = setTimeout(() => setAnalysisStep(3), 1500);
    const timer4 = setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  const handleVote = (ideaId: string) => {
    setIdeas(prev => prev.map(item => {
      if (item.id === ideaId) {
        return { ...item, votes: item.votes + (userVote === ideaId ? 0 : 1) };
      }
      if (item.id === userVote) {
        return { ...item, votes: Math.max(0, item.votes - 1) };
      }
      return item;
    }));
    setUserVote(ideaId);
    setSelectedIdeaId(ideaId);
    setTransformationStatus('idea_selected');
    setShowTransformationToast(true);
  };

  const handleSelectForVisualization = (ideaId: string) => {
    setSelectedIdeaId(ideaId);
    setActiveTab('visualization');
    setVisualizeView('future');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-28">
      
      {/* Toast Micro-Interaction */}
      <TransformationReveal
        show={showTransformationToast}
        onClose={() => setShowTransformationToast(false)}
      />

      {/* 1. HERO HEADER */}
      <div className="bg-neutral-950 border-b border-neutral-850 py-10 px-4 md:px-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10 space-y-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-neutral-900 border-neutral-700 text-white font-bold text-xs"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Mission
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="success" className="bg-fresh-500/10 text-fresh-400 border-fresh-500/30 text-[10px] font-mono">
                  {isDemo ? 'DEMO DATA' : 'FIELD DATA'}
                </Badge>
                <Badge variant="outline" className="border-purple-500/40 text-purple-300 bg-purple-500/10 text-[10px] font-mono">
                  AI-ASSISTED TRANSFORMATION
                </Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                Prevent the Next Dump
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl mt-1 font-sans">
                The space is clean. Now let's give it a future worth protecting.
              </p>
            </div>
            
            <div className="bg-neutral-900/90 p-4 rounded-2xl border border-neutral-800 shrink-0 flex items-center gap-4 font-mono text-xs">
              <div className="text-center px-3 border-r border-neutral-800">
                <span className="text-[10px] text-neutral-500 block uppercase">Location</span>
                <span className="font-bold text-white text-sm mt-0.5">{hotspot?.location || 'Pine Street Lot'}</span>
              </div>
              <div className="text-center px-3">
                <span className="text-[10px] text-fresh-400 block uppercase">Status</span>
                <span className="font-bold text-fresh-400 text-sm mt-0.5">Verified Cleaned</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-4 relative z-20 space-y-8">
        
        {/* 2. RECOVERED LOCATION SUMMARY */}
        <Card className="bg-neutral-900 border-neutral-800 text-white p-6 rounded-3xl shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Before / After Preview */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3">
              <div className="space-y-1.5 font-mono text-xs">
                <span className="text-[10px] font-bold uppercase text-coral-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-coral-500" /> Before Cleanup
                </span>
                <div className="h-36 rounded-2xl overflow-hidden bg-neutral-950 relative border border-neutral-800">
                  <img 
                    src={hotspot?.images?.[0] || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800'} 
                    alt="Before cleanup" 
                    className="w-full h-full object-cover filter grayscale opacity-80"
                  />
                  <div className="absolute bottom-2 left-2 bg-neutral-950/90 text-coral-400 text-[9px] font-bold px-2 py-0.5 rounded border border-coral-500/30">
                    Score: 18/100
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                <span className="text-[10px] font-bold uppercase text-fresh-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-fresh-500" /> After Cleanup
                </span>
                <div className="h-36 rounded-2xl overflow-hidden bg-neutral-950 relative border border-fresh-500/30">
                  <img 
                    src={'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=800'} 
                    alt="After cleanup" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-fresh-950/90 text-fresh-400 text-[9px] font-bold px-2 py-0.5 rounded border border-fresh-500/40">
                    Score: 72/100
                  </div>
                </div>
              </div>
            </div>

            {/* Stats & Info */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-fresh-400" /> {hotspot?.location || 'Pine Street Lot'}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Verified cleanup completed by community volunteers
                  </p>
                </div>
                <ImpactBadge type="VERIFIED" size="sm" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
                  <span className="text-neutral-500 block text-[9px] uppercase">Score Boost</span>
                  <span className="text-base font-bold text-fresh-400">+54 Pts</span>
                  <span className="text-[9px] text-neutral-500 block">18 → 72 / 100</span>
                </div>

                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
                  <span className="text-neutral-500 block text-[9px] uppercase">Waste Removed</span>
                  <span className="text-base font-bold text-white">{hotspot?.estimatedWaste || '400 kg'}</span>
                  <span className="text-[9px] text-fresh-400 block">100% Cleared</span>
                </div>

                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
                  <span className="text-neutral-500 block text-[9px] uppercase">Volunteers</span>
                  <span className="text-base font-bold text-white">{mission?.volunteersRegistered?.length || 12}</span>
                  <span className="text-[9px] text-neutral-500 block">Local Heroes</span>
                </div>

                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
                  <span className="text-neutral-500 block text-[9px] uppercase">Cleanup Date</span>
                  <span className="text-base font-bold text-white">Recent</span>
                  <span className="text-[9px] text-neutral-500 block">Field Action</span>
                </div>
              </div>
            </div>

          </div>
        </Card>

        {/* 3. AI ANALYSIS EXPERIENCE */}
        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-neutral-900 text-white rounded-3xl p-8 shadow-2xl border border-neutral-800 text-center space-y-6"
            >
              <div className="w-14 h-14 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mx-auto animate-spin-slow">
                <Sparkles className="w-7 h-7 text-purple-300 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Analyzing Location for Prevention...</h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  Studying recurrence patterns, assessing community context, and generating prevention strategy.
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-2 text-left bg-neutral-950 p-4 rounded-xl border border-neutral-850 font-mono text-xs">
                <div className={cn("flex items-center gap-2.5 transition-opacity", analysisStep >= 0 ? "text-fresh-400" : "text-neutral-600")}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Studying recurrence patterns & dumping history...</span>
                </div>
                <div className={cn("flex items-center gap-2.5 transition-opacity", analysisStep >= 1 ? "text-fresh-400" : "text-neutral-600")}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Assessing pedestrian activity & nocturnal visibility...</span>
                </div>
                <div className={cn("flex items-center gap-2.5 transition-opacity", analysisStep >= 2 ? "text-fresh-400" : "text-neutral-600")}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Generating place transformation concepts...</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="analyzed"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* 4. RECURRENCE RISK PANEL */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                <div className="md:col-span-5 bg-neutral-900 text-white p-6 rounded-3xl shadow-xl border border-neutral-800 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono font-bold uppercase text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> RECURRENCE RISK
                      </span>
                      <ImpactBadge type="PROJECTED" size="sm" />
                    </div>

                    <div className="flex items-baseline gap-2 mb-2 font-mono">
                      <span className="text-4xl font-black text-amber-400">
                        {mockPreventionRecommendation.recurrenceRisk.percentage}%
                      </span>
                      <span className="text-lg font-bold text-neutral-300 uppercase">
                        — {mockPreventionRecommendation.recurrenceRisk.level}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed font-sans mb-4">
                      "{mockPreventionRecommendation.recurrenceRisk.explanation}"
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-3 border-t border-neutral-850 font-mono text-[10px]">
                    <span className="text-neutral-500 uppercase block font-bold mb-1">KEY RISK FACTORS</span>
                    {mockPreventionRecommendation.recurrenceRisk.factors.map((factor, i) => (
                      <div key={i} className="flex items-center gap-2 text-neutral-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        <span>{factor}</span>
                      </div>
                    ))}
                    <p className="text-[9px] text-neutral-500 font-sans italic mt-2">
                      *Model-assisted risk assessment based on site characteristics and historical observations.
                    </p>
                  </div>
                </div>

                {/* 6. SMART LOCATION REASONING */}
                <div className="md:col-span-7 bg-purple-950/40 text-white p-6 rounded-3xl shadow-xl border border-purple-500/30 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono font-bold uppercase text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded border border-purple-500/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-400" /> WHY AI RECOMMENDED THIS
                      </span>
                      <Badge variant="outline" className="border-purple-500/40 text-purple-300 bg-purple-500/10 text-[9px] font-mono uppercase">AI-ASSISTED</Badge>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">
                      Tailored for {mockPreventionRecommendation.locationName}
                    </h3>
                    
                    <p className="text-xs text-neutral-300 leading-relaxed font-sans mb-4">
                      Because this site sits beside a residential walkway and has a history of recurring litter, a visible community mini-garden will create social ownership and reduce repeat dumping by over <strong className="text-white">65%</strong>.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono bg-neutral-950 p-3 rounded-xl border border-neutral-850 mb-3">
                      <div>
                        <span className="text-neutral-500 block text-[9px]">SURROUNDING ACTIVITY</span>
                        <span className="font-bold text-white">{mockPreventionRecommendation.locationAnalysis.nearbyActivity}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[9px]">SITE CHARACTERISTICS</span>
                        <span className="font-bold text-white">{mockPreventionRecommendation.locationAnalysis.spaceCharacteristics}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-fresh-950/40 rounded-xl border border-fresh-500/30 flex items-center gap-2 text-xs font-mono text-fresh-300">
                    <Award className="w-4 h-4 text-fresh-400 shrink-0" />
                    <span>AI Model Verdict: Social ownership prevents repeat dumping.</span>
                  </div>
                </div>

              </div>

              {/* NAVIGATION TABS */}
              <div className="flex items-center gap-2 border-b border-neutral-850 pb-3 overflow-x-auto scrollbar-none font-mono text-xs">
                <button
                  onClick={() => setActiveTab('recommendations')}
                  className={cn(
                    "px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5",
                    activeTab === 'recommendations' ? "bg-forest-600 text-white" : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5" /> Ideas ({ideas.length})
                </button>

                <button
                  onClick={() => setActiveTab('voting')}
                  className={cn(
                    "px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5",
                    activeTab === 'voting' ? "bg-forest-600 text-white" : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
                  )}
                >
                  <Users className="w-3.5 h-3.5" /> Community Poll ({totalVotes})
                </button>

                <button
                  onClick={() => setActiveTab('visualization')}
                  className={cn(
                    "px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5",
                    activeTab === 'visualization' ? "bg-forest-600 text-white" : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
                  )}
                >
                  <Eye className="w-3.5 h-3.5" /> Visualizer
                </button>

                <button
                  onClick={() => setActiveTab('report')}
                  className={cn(
                    "px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5",
                    activeTab === 'report' ? "bg-forest-600 text-white" : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
                  )}
                >
                  <FileText className="w-3.5 h-3.5" /> Prevention Report
                </button>
              </div>

              {/* 5. TRANSFORMATION IDEAS GALLERY */}
              {activeTab === 'recommendations' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ideas.map((idea, index) => (
                      <Card key={idea.id} className="bg-neutral-900 border-neutral-800 text-white flex flex-col justify-between hover:border-forest-500/50 transition-all duration-300 group overflow-hidden">
                        <div>
                          <div className="h-44 bg-neutral-950 relative overflow-hidden">
                            <img src={idea.imageUrl} alt={idea.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
                            <div className="absolute top-3 left-3 flex gap-1.5">
                              <Badge variant="success" className="bg-forest-900/90 text-fresh-300 font-mono text-[10px]">
                                #{index + 1} AI Pick
                              </Badge>
                              <ImpactBadge type="PROJECTED" size="sm" />
                            </div>
                            <div className="absolute bottom-3 left-3 right-3">
                              <h4 className="text-base font-bold text-white">{idea.title}</h4>
                            </div>
                          </div>

                          <CardContent className="p-5 space-y-4">
                            <p className="text-xs text-neutral-300 font-sans leading-relaxed">{idea.description}</p>

                            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850 font-mono text-[10px]">
                              <span className="text-fresh-400 font-bold block mb-0.5">WHY IT SUITS THIS SPOT</span>
                              <span className="text-neutral-300">{idea.whySuits}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 font-mono text-[10px] pt-2 border-t border-neutral-800">
                              <div><span className="text-neutral-500 block">Dumping Cut</span> <span className="font-bold text-fresh-400">{idea.expectedReduction}</span></div>
                              <div><span className="text-neutral-500 block">Est. Cost</span> <span className="font-bold text-white">{idea.estimatedCost}</span></div>
                              <div><span className="text-neutral-500 block">Timeline</span> <span className="font-bold text-white">{idea.estimatedTime}</span></div>
                              <div><span className="text-neutral-500 block">Maintenance</span> <span className="font-bold text-white">{idea.maintenanceDifficulty}</span></div>
                            </div>
                          </CardContent>
                        </div>

                        <div className="p-5 pt-0 flex items-center gap-2">
                          <Button variant="outline" size="sm" className="flex-1 border-neutral-700 text-xs font-bold" onClick={() => handleSelectForVisualization(idea.id)}>
                            <Eye className="w-3.5 h-3.5 mr-1" /> Visualize
                          </Button>
                          <Button size="sm" className={cn("flex-1 text-xs font-bold", userVote === idea.id ? "bg-fresh-600 text-neutral-950" : "bg-forest-600 text-white")} onClick={() => { handleVote(idea.id); setActiveTab('voting'); }}>
                            {userVote === idea.id ? "Voted" : "Vote Idea"}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 8. COMMUNITY VOTING & 9. ROADMAP */}
              {activeTab === 'voting' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">Let the Community Decide</h3>
                        <p className="text-xs text-neutral-400">Vote for your preferred place transformation idea.</p>
                      </div>
                      <div className="bg-neutral-950 px-4 py-2 rounded-xl border border-neutral-850 font-mono text-xs flex items-center gap-4">
                        <div><span className="text-neutral-500 block text-[9px]">TOTAL VOTES</span> <span className="font-bold text-white">{totalVotes}</span></div>
                        <div><span className="text-neutral-500 block text-[9px]">LEADING</span> <span className="font-bold text-fresh-400">{leadingIdea.title}</span></div>
                      </div>
                    </div>

                    <div className="space-y-3 font-mono text-xs">
                      {ideas.sort((a, b) => b.votes - a.votes).map((idea) => {
                        const percentage = totalVotes > 0 ? Math.round((idea.votes / totalVotes) * 100) : 0;
                        const isVoted = userVote === idea.id;
                        return (
                          <div 
                            key={idea.id}
                            onClick={() => handleVote(idea.id)}
                            className={cn(
                              "p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex items-center justify-between",
                              isVoted ? "border-fresh-500/50 bg-forest-950/40 text-white" : "border-neutral-800 bg-neutral-950 text-neutral-300"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center", isVoted ? "bg-fresh-500 border-fresh-500 text-neutral-950" : "border-neutral-700")}>
                                {isVoted && <Check className="w-3.5 h-3.5" />}
                              </div>
                              <div>
                                <span className="font-bold text-sm text-white block">{idea.title}</span>
                                <span className="text-[10px] text-neutral-500">{idea.description}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 font-bold">
                              <span className="text-neutral-400">{idea.votes} votes</span>
                              <span className="text-fresh-400 text-base min-w-[40px] text-right">{percentage}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 9. TRANSFORMATION ROADMAP */}
                  <Card className="bg-neutral-900 border-neutral-800 text-white p-6 rounded-3xl">
                    <h3 className="text-lg font-bold text-white mb-4">Transformation Roadmap</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 font-mono text-[10px]">
                      {TRANSFORMATION_STAGES.map((stage, idx) => {
                        const currentIdx = TRANSFORMATION_STAGES.findIndex(s => s.id === transformationStatus);
                        const isDone = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;
                        return (
                          <div key={stage.id} className={cn("p-3 rounded-xl border flex flex-col justify-between h-20", isCurrent ? "bg-forest-600/30 border-fresh-500 text-white" : isDone ? "bg-neutral-950 border-neutral-800 text-fresh-400" : "bg-neutral-950/40 border-neutral-850 text-neutral-600")}>
                            <span className="font-bold text-neutral-500">0{idx + 1}</span>
                            <span className="font-bold leading-tight">{stage.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* 7. TRANSFORMATION VISUALIZER & 10. SCORE EVOLUTION */}
              {activeTab === 'visualization' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <Card className="bg-neutral-900 border-neutral-800 text-white rounded-3xl overflow-hidden shadow-2xl">
                    <div className="p-5 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="border-purple-500/40 text-purple-300 bg-purple-500/10 text-[9px] font-mono uppercase">CONCEPT</Badge>
                          <span className="text-xs font-mono text-neutral-400">Selected: {selectedIdea.title}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white">Transformation Visualizer</h3>
                      </div>
                      <div className="flex gap-1 font-mono text-xs bg-neutral-950 p-1 rounded-xl border border-neutral-850">
                        <button onClick={() => setVisualizeView('before')} className={cn("px-3 py-1.5 rounded-lg font-bold", visualizeView === 'before' ? "bg-coral-500 text-white" : "text-neutral-400")}>Before</button>
                        <button onClick={() => setVisualizeView('after')} className={cn("px-3 py-1.5 rounded-lg font-bold", visualizeView === 'after' ? "bg-fresh-500 text-neutral-950" : "text-neutral-400")}>Cleaned</button>
                        <button onClick={() => setVisualizeView('future')} className={cn("px-3 py-1.5 rounded-lg font-bold", visualizeView === 'future' ? "bg-forest-600 text-white" : "text-neutral-400")}>Future Concept</button>
                      </div>
                    </div>

                    <div className="relative h-80 bg-neutral-950 overflow-hidden flex items-center justify-center">
                      {visualizeView === 'before' && (
                        <div className="absolute inset-0">
                          <img src={hotspot?.images?.[0] || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800'} alt="Before" className="w-full h-full object-cover filter grayscale" />
                          <div className="absolute top-4 left-4 bg-neutral-950/90 text-coral-400 text-xs font-mono font-bold px-3 py-1.5 rounded-xl border border-coral-500/30">1. BEFORE: POLLUTED (18/100)</div>
                        </div>
                      )}
                      {visualizeView === 'after' && (
                        <div className="absolute inset-0">
                          <img src={'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=800'} alt="After" className="w-full h-full object-cover" />
                          <div className="absolute top-4 left-4 bg-neutral-950/90 text-fresh-400 text-xs font-mono font-bold px-3 py-1.5 rounded-xl border border-fresh-500/30">2. CLEANED: VERIFIED RECOVERY (72/100)</div>
                        </div>
                      )}
                      {visualizeView === 'future' && (
                        <div className="absolute inset-0">
                          <img src={selectedIdea.imageUrl} alt="Future" className="w-full h-full object-cover" />
                          <div className="absolute top-4 left-4 bg-forest-950/90 text-fresh-400 text-xs font-mono font-bold px-3 py-1.5 rounded-xl border border-fresh-500/40">3. FUTURE CONCEPT: {selectedIdea.title} (90+ PROJECTED TARGET)</div>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* 10. ENVIRONMENTAL SCORE JOURNEY */}
                  <Card className="bg-neutral-900 border-neutral-800 text-white p-6 rounded-3xl space-y-4">
                    <h3 className="text-lg font-bold text-white text-center">Environmental Score Evolution</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-center">
                      <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-850 space-y-1">
                        <span className="text-[10px] text-coral-400 block uppercase">POLLUTED</span>
                        <span className="text-2xl font-black text-coral-400">18 / 100</span>
                        <span className="text-[9px] text-neutral-500 block">Initial Hazard</span>
                      </div>
                      <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-850 space-y-1">
                        <span className="text-[10px] text-fresh-400 block uppercase">CLEANED</span>
                        <span className="text-2xl font-black text-fresh-400">72 / 100</span>
                        <span className="text-[9px] text-neutral-500 block">Verified Action</span>
                      </div>
                      <div className="p-4 bg-forest-950 border border-forest-500/40 rounded-2xl space-y-1">
                        <span className="text-[10px] text-purple-300 block uppercase">FUTURE TARGET</span>
                        <span className="text-2xl font-black text-purple-300">90+ / 100</span>
                        <span className="text-[9px] text-purple-400 block font-bold">PROJECTED TARGET</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* 11. PREVENTION REPORT CARD */}
              {activeTab === 'report' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <Card className="bg-neutral-900 border-neutral-800 text-white p-6 md:p-8 rounded-3xl space-y-6 shadow-2xl">
                    <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
                      <div>
                        <span className="text-[10px] font-mono text-neutral-400 uppercase">OFFICIAL DOCUMENT</span>
                        <h3 className="text-2xl font-black text-white">TRASHCHAIN PREVENTION REPORT</h3>
                      </div>
                      <div className="text-right font-mono text-xs">
                        <span className="text-neutral-400 block">REPORT ID: #TRC-PRV-992</span>
                        <span className="text-fresh-400 font-bold">AI-ASSISTED PLANNING REPORT</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 font-mono text-xs bg-neutral-950 p-4 rounded-xl border border-neutral-850">
                      <div><span className="text-neutral-500 block text-[10px]">LOCATION</span><span className="font-bold text-white">{hotspot?.location || 'Pine Street Lot'}</span></div>
                      <div><span className="text-neutral-500 block text-[10px]">RECURRENCE RISK</span><span className="font-bold text-coral-400">{mockPreventionRecommendation.recurrenceRisk.percentage}% HIGH</span></div>
                      <div><span className="text-neutral-500 block text-[10px]">AI RECOMMENDATION</span><span className="font-bold text-fresh-400">{leadingIdea.title}</span></div>
                      <div><span className="text-neutral-500 block text-[10px]">PROJECTED IMPACT</span><span className="font-bold text-white">{leadingIdea.expectedReduction}</span></div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button onClick={() => window.print()} className="bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs py-3 px-6">
                        <Printer className="w-4 h-4 mr-2" /> Print / Save Report
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
