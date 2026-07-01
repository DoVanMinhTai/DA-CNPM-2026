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

export default function AIAnalysisPage() {
  const [recentDocs, setRecentDocs] = useState(mockRecentDocuments);

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
        <p className="text-on-surface-variant mt-1">AI Analysis</p>
      </div>
      <div className="animate-fade-in delay-300">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-on-surface">
            Recent Documents
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentDocs.map((doc) => (
            <Link
              key={doc.id}
              to={`/ai-analysis/${doc.id}`}
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
        </div>
      </div>
    </div>
  );
}
