import { AlertTriangle, CheckCircle2, ClipboardList, HeartHandshake, PackageCheck, ShieldCheck, Users } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { RecoveryPlan } from '../../types';
import { cn } from '../../utils/cn';

interface RecoveryPlanCardProps {
  plan: RecoveryPlan;
  onStartMission: () => void;
}

const priorityStyles: Record<RecoveryPlan['priority'], string> = {
  LOW: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
  MEDIUM: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
  HIGH: 'bg-orange-500/15 border-orange-500/30 text-orange-300',
  URGENT: 'bg-coral-500/15 border-coral-500/30 text-coral-300',
};

function PlanList({ title, items, icon: Icon }: { title: string; items: string[]; icon: typeof ClipboardList }) {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-neutral-300">
        <Icon className="h-4 w-4 text-fresh-400" aria-hidden="true" /> {title}
      </h3>
      <ul className="mt-3 space-y-2 text-xs leading-relaxed text-neutral-300">
        {items.map((item, index) => <li className="flex gap-2" key={`${title}-${index}`}><span className="text-fresh-400" aria-hidden="true">•</span><span>{item}</span></li>)}
      </ul>
    </section>
  );
}

export function RecoveryPlanCard({ plan, onStartMission }: RecoveryPlanCardProps) {
  const isDemo = plan.dataClassification === 'DEMO DATA';
  return (
    <Card className="overflow-hidden border-fresh-500/30 bg-neutral-900 text-white shadow-2xl">
      <div className="border-b border-fresh-500/20 bg-gradient-to-r from-forest-950 via-neutral-900 to-neutral-900 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-fresh-500/40 bg-fresh-500/10 text-[10px] font-mono text-fresh-300">{isDemo ? 'DEMO DATA' : 'AI-ASSISTED'}</Badge>
              <Badge variant="outline" className={cn('text-[10px] font-mono', priorityStyles[plan.priority])}>PRIORITY: {plan.priority}</Badge>
            </div>
            <h2 className="mt-3 text-xl font-black tracking-tight sm:text-2xl">Recovery Plan</h2>
            <p className="mt-1 text-sm font-semibold text-neutral-100">{plan.title}</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-neutral-200">
            <Users className="h-4 w-4 text-fresh-400" aria-hidden="true" />
            <span><strong className="text-white">{plan.peopleNeeded}</strong> people suggested</span>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-neutral-300">{plan.summary}</p>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <PlanList title="What to do now" items={plan.immediateActions} icon={CheckCircle2} />
        <PlanList title="Safety precautions" items={plan.safetyPrecautions} icon={ShieldCheck} />
        <PlanList title="Cleanup plan" items={plan.cleanupPlan} icon={ClipboardList} />
        <div className="grid gap-4 md:grid-cols-2">
          <PlanList title="Equipment" items={plan.recommendedEquipment} icon={PackageCheck} />
          <PlanList title="Sorting and disposal" items={[...plan.sortingGuidance, ...plan.disposalGuidance]} icon={AlertTriangle} />
          <PlanList title="Prevention" items={plan.preventionActions} icon={HeartHandshake} />
          <PlanList title="Monitoring" items={plan.monitoringPlan} icon={ClipboardList} />
        </div>
        <div className="grid gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-4 text-xs sm:grid-cols-2">
          <div><span className="block text-[10px] font-bold uppercase text-neutral-500">Estimated effort</span><span className="mt-1 block text-neutral-200">{plan.estimatedEffort}</span></div>
          <div><span className="block text-[10px] font-bold uppercase text-neutral-500">Community message</span><span className="mt-1 block text-neutral-200">{plan.communityMessage}</span></div>
        </div>
        <p className="rounded-xl border border-purple-500/25 bg-purple-500/10 p-3 text-xs leading-relaxed text-purple-100">AI-assisted recovery recommendations. Field measurements and verification are recorded separately. These recommendations are not official government advice.</p>
        <button type="button" onClick={onStartMission} className="w-full rounded-xl bg-forest-600 px-4 py-3 text-xs font-bold text-white transition-colors hover:bg-forest-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fresh-400">
          Start Recovery Mission
        </button>
      </div>
    </Card>
  );
}
