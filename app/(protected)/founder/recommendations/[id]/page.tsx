import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/auth-utils";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { 
  Lightbulb, 
  User, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import UserAvatar from "@/components/ui/UserAvatar";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Recommendation Details",
};

async function getRecommendation(id: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  const decoded = await verifyAuth(token);

  if (!decoded || decoded.role !== "FOUNDER") return null;

  const founder = await prisma.startupFounder.findUnique({
    where: { userId: Number(decoded.id) }
  });

  if (!founder) return null;

  // Fetch recommendation ensuring it belongs to this founder
  const rec = await prisma.recommendation.findFirst({
    where: { id, founderId: founder.id },
    include: {
      consultant: {
        include: {
          user: {
            select: { name: true, image: true, email: true }
          }
        }
      }
    }
  });

  return rec;
}

const priorityConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  LOW:      { label: 'Low Priority',      color: 'text-blue-500   bg-blue-50   dark:bg-blue-900/20   border-blue-100   dark:border-blue-800',   icon: TrendingUp },
  MEDIUM:   { label: 'Medium Priority',   color: 'text-amber-600  bg-amber-50  dark:bg-amber-900/20  border-amber-100  dark:border-amber-800',  icon: Clock },
  HIGH:     { label: 'High Priority',     color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800', icon: AlertCircle },
  CRITICAL: { label: 'Critical',          color: 'text-red-600    bg-red-50    dark:bg-red-900/20    border-red-100    dark:border-red-800',    icon: AlertTriangle },
  URGENT:   { label: 'Urgent',            color: 'text-red-700    bg-red-100   dark:bg-red-900/30    border-red-200    dark:border-red-700',    icon: AlertTriangle },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING:  { label: 'Pending Review', color: 'bg-amber-500 text-white' },
  ADOPTED:  { label: 'Adopted',        color: 'bg-emerald-500 text-white' },
  REJECTED: { label: 'Rejected',       color: 'bg-red-500 text-white' },
};

export default async function RecommendationDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const recId = Number(id);

  if (isNaN(recId)) notFound();

  const rec = await getRecommendation(recId);
  if (!rec) notFound();

  const priority = priorityConfig[rec.priority] ?? priorityConfig.MEDIUM;
  const status = statusConfig[rec.status] ?? statusConfig.PENDING;
  const PriorityIcon = priority.icon;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8">
      {/* Back Button */}
      <Link 
        href="/founder/recommendations"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Recommendations
      </Link>

      {/* Hero Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-900/5 overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1.5 bg-linear-to-r from-teal-400 via-teal-500 to-emerald-500" />

        <div className="p-6 sm:p-10 space-y-8">
          {/* Header: Status + Category + Priority */}
          <div className="flex flex-wrap items-center gap-3">
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${status.color}`}>
              {status.label}
            </span>
            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-100 dark:border-teal-800">
              {rec.category?.replace(/_/g, ' ') || 'STRATEGY'}
            </span>
            <span className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${priority.color}`}>
              <PriorityIcon className="w-3 h-3" />
              {priority.label}
            </span>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center shrink-0">
                <Lightbulb className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                {rec.title}
              </h1>
            </div>
          </div>

          {/* Consultant Info */}
          <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <UserAvatar 
              name={rec.consultant.user.name}
              image={rec.consultant.user.image}
              size="md"
              isVerified={true}
            />
            <div>
              <p className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-0.5">From Your Advisor</p>
              <p className="font-black text-slate-900 dark:text-white">{rec.consultant.user.name}</p>
              <p className="text-xs text-slate-400 font-medium">{rec.consultant.user.email}</p>
            </div>
            <div className="ml-auto flex items-center gap-2 text-xs text-slate-400 font-bold">
              <Calendar className="w-4 h-4" />
              <span>{new Date(rec.createdAt).toLocaleDateString('en-GB')}</span>
            </div>
          </div>

          {/* Expected Impact */}
          {rec.impact && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-2xl">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl shrink-0">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Expected Impact</p>
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">{rec.impact}</p>
              </div>
            </div>
          )}

          {/* Full Content */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-500" />
              <h2 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Strategic Advice</h2>
            </div>
            <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-inner">
              <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-medium text-sm sm:text-base">
                {rec.content}
              </p>
            </div>
          </div>

          {/* Metadata Footer */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Issued by {rec.consultant.user.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(rec.createdAt).toLocaleDateString('en-GB')} at {new Date(rec.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {rec.updatedAt && rec.updatedAt.getTime() !== rec.createdAt.getTime() && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Updated {new Date(rec.updatedAt).toLocaleDateString('en-GB')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
