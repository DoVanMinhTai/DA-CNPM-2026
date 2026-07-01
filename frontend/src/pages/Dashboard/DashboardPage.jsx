import { Link } from "react-router-dom";
import {
  Plus,
  FileText,
  TrendingUp,
  Brain,
  Coins,
  MoreVertical,
  Upload,
} from "lucide-react";
import {
  dashboardUser,
  dashboardStats as mockDashboardStats,
  recentDocuments as mockRecentDocuments,
} from "../../data/mockData";
import { useEffect, useState } from "react";
import dashboardApi from "../../api/dashboardApi";
import { cvApi } from "../../api/cvApi";

const statIcons = { FileText, Brain, TrendingUp, Coins };

function ScoreBadge({ score }) {
  let color = "bg-error/10 text-error";
  if (score >= 80) color = "bg-green-50 text-green-600";
  else if (score >= 60) color = "bg-accent/10 text-amber-600";

  return (
    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${color}`}>
      {score}%
    </span>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(mockDashboardStats);
  const [recentDocs, setRecentDocs] = useState(mockRecentDocuments);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await dashboardApi.getStatistics();
        if (!mounted || !data) return;
        const mapped = [
          {
            label: "Total CVs",
            value: data.totalCVs.value,
            icon: "FileText",
            change: data.totalCVs.change,
          },
          {
            label: "AI Analyses",
            value: data.aiAnalyses.value,
            icon: "Brain",
            change: data.aiAnalyses.change,
          },
          {
            label: "Avg. Score",
            value: data.avgScore.value,
            icon: "TrendingUp",
            change: data.avgScore.change,
          },
          {
            label: "Credits",
            value: data.credits.value,
            icon: "Coins",
            change: data.credits.change,
          },
        ];
        setStats(mapped);
      } catch (e) {
        // keep mock data on error
        console.error("Failed to load dashboard stats", e);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadCvs() {
      try {
        const data = await cvApi.getUserCvs();
        if (!mounted || !data) return;
        const mapped = data.map((c) => ({
          id: c.id,
          title: c.title,
          updatedAt: c.updatedAt ? new Date(c.updatedAt).toLocaleString() : "",
          score: c.score || 0,
          status: c.status || "draft",
        }));
        setRecentDocs(mapped);
      } catch (e) {
        console.error("Failed to load user cvs", e);
      }
    }
    loadCvs();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-[1200px]">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface">
          Hello, {dashboardUser.name}
        </h1>
        <p className="text-on-surface-variant mt-1">
          Manage and optimize your professional documents.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = statIcons[stat.icon];
          return (
            <div
              key={stat.label}
              className="bg-surface-container-lowest rounded-lg border border-outline-variant p-5 hover:shadow-md transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon size={20} className="text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold text-on-surface">{stat.value}</p>
              <p className="text-xs text-outline mt-0.5">{stat.label}</p>
              <p className="text-xs text-primary mt-2">{stat.change}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Documents */}
      <div className="animate-fade-in delay-300">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-on-surface">
            Recent Documents
          </h2>
          <div className="flex items-center gap-3">
            <Link
              to="/cv/upload"
              className="inline-flex items-center gap-2 px-4 py-2 border border-outline-variant text-on-surface text-sm font-medium rounded hover:bg-surface-container-low transition-all duration-200"
            >
              <Upload size={16} />
              Upload CV
            </Link>
            <Link
              to="/cv/editor"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded hover:bg-primary-dark transition-all duration-200"
            >
              <Plus size={16} />
              New CV
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentDocs.map((doc) => (
            <Link
              key={doc.id}
              to={`/cv/${doc.id}`}
              className="bg-surface-container-lowest rounded-lg border border-outline-variant p-5 hover:shadow-md hover:border-primary transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                  <FileText size={20} className="text-primary" />
                </div>
                <button className="p-1 text-outline hover:text-on-surface rounded transition-colors opacity-0 group-hover:opacity-100">
                  <MoreVertical size={16} />
                </button>
              </div>
              <h3 className="text-base font-semibold text-on-surface mb-1 group-hover:text-primary transition-colors">
                {doc.title}
              </h3>
              <p className="text-xs text-outline mb-3">
                Updated {doc.updatedAt}
              </p>
              <div className="flex items-center justify-between">
                <ScoreBadge score={doc.score} />
                <span
                  className={`text-xs font-medium capitalize ${
                    doc.status === "optimized"
                      ? "text-green-600"
                      : doc.status === "needs-review"
                        ? "text-amber-600"
                        : "text-outline"
                  }`}
                >
                  {doc.status.replace("-", " ")}
                </span>
              </div>
            </Link>
          ))}

          {/* New CV Card */}
          <Link
            to="/cv/editor"
            className="bg-surface-container-lowest rounded-lg border-2 border-dashed border-outline-variant p-5 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-surface-container-low transition-all duration-300 min-h-[180px] group"
          >
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Plus
                size={24}
                className="text-outline group-hover:text-primary transition-colors"
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-on-surface">
                Start from scratch
              </p>
              <p className="text-xs text-outline mt-0.5">
                Or import LinkedIn profile
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
