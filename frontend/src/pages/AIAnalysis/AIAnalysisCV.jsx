import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Edit3,
  Sparkles,
  Share2,
  Printer,
  Loader2,
} from "lucide-react";
import { cvApi } from "../../api/cvApi";
import { atsApi } from "../../api/atsApi";
import { toast } from "sonner";

function ScoreRing({ score, size = 80, strokeWidth = 6 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  let color = "#ba1a1a";
  if (score >= 80) color = "#16a34a";
  else if (score >= 60) color = "#d97706";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#ebefee"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold" style={{ color }}>
          {score}%
        </span>
      </div>
    </div>
  );
}

export default function AlAnalysisCV() {
  const { id } = useParams();
  const [cv, setCv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadCvData() {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);

        const cvResponse = await cvApi.getCvById(id);

        if (!mounted) return;

        if (cvResponse) {
          setCv(cvResponse);
        }
      } catch (err) {
        console.error("Error loading CV detail page data:", err);
        if (mounted) {
          setError("Failed to load CV details. Please try again later.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadCvData();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleAnalyzeCv = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description first.");
      return;
    }
    try {
      setAnalyzing(true);
      setAnalysisError(null);
      const result = await atsApi.scoreCv(cv.content, jobDescription);
      setAnalysis(result);
    } catch (err) {
      console.error("Error analyzing CV:", err);
      setAnalysisError("Failed to analyze CV. Please try again later.");
      toast.error("Failed to analyze CV.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-fade-in">
        <Loader2 size={36} className="text-primary animate-spin mb-4" />
        <h3 className="text-lg font-semibold text-secondary-dark mb-1">
          Loading CV details...
        </h3>
        <p className="text-sm text-outline">
          Please wait while we fetch CV content and AI Analysis.
        </p>
      </div>
    );
  }

  if (error || !cv) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-fade-in">
        <div className="text-error mb-4 font-bold text-lg">⚠️ Error</div>
        <h3 className="text-lg font-semibold text-secondary-dark mb-2">
          {error || "CV not found"}
        </h3>
        <Link
          to="/dashboard"
          className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const cvContent = cv.content || {};
  const personalInfo = cvContent.personalInfo || {};
  const summary = cvContent.summary || "";
  const experience = cvContent.experience || [];
  const education = cvContent.education || [];
  const skills = cvContent.skills || [];
  const projects = cvContent.projects || [];
  const certifications = cvContent.certifications || [];

  const formattedDate = cv.updatedAt
    ? new Date(cv.updatedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never";

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link
            to="/ai-analysis"
            className="p-2 hover:bg-surface-container rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-on-surface-variant" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-on-surface">
              {cv.title || "Untitled CV"}
            </h1>
            <p className="text-sm text-outline">
              Last updated: {formattedDate}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* CV Preview */}
        <div className="lg:col-span-2">
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-sm p-8 md:p-10">
            <div className="text-center mb-8 pb-6 border-b border-surface-container">
              <h2 className="text-2xl font-bold text-on-surface">
                {personalInfo.fullName || "Name Not Specified"}
              </h2>
              <p className="text-sm text-on-surface-variant mt-2">
                {[
                  personalInfo.email,
                  personalInfo.phone,
                  personalInfo.location,
                  personalInfo.linkedin,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>

            {summary && (
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 border-b border-primary/20 pb-1">
                  Professional Summary
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {summary}
                </p>
              </div>
            )}

            {experience && experience.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 border-b border-primary/20 pb-1">
                  Work Experience
                </h3>
                {experience.map((exp, i) => (
                  <div key={i} className="mb-4">
                    <div className="flex items-baseline justify-between">
                      <h4 className="text-sm font-bold text-on-surface">
                        {exp.role}
                      </h4>
                      <span className="text-xs text-outline">{exp.period}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-2">
                      {exp.company}
                    </p>
                    {exp.bullets && exp.bullets.length > 0 && (
                      <ul className="space-y-1">
                        {exp.bullets.map((b, j) => (
                          <li
                            key={j}
                            className="text-sm text-on-surface-variant flex items-start gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {education && education.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 border-b border-primary/20 pb-1">
                  Education
                </h3>
                {education.map((edu, i) => (
                  <div
                    key={i}
                    className="flex items-baseline justify-between mb-2"
                  >
                    <div>
                      <p className="text-sm font-semibold text-on-surface">
                        {edu.degree}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {edu.school}
                      </p>
                    </div>
                    <span className="text-xs text-outline">{edu.year}</span>
                  </div>
                ))}
              </div>
            )}

            {projects && projects.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 border-b border-primary/20 pb-1">
                  Projects
                </h3>
                {projects.map((proj, i) => (
                  <div key={i} className="mb-4">
                    <h4 className="text-sm font-bold text-on-surface">
                      {proj.name}
                    </h4>
                    <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                      {proj.description}
                    </p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {proj.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 bg-primary/5 text-primary text-xs rounded font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {certifications && certifications.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 border-b border-primary/20 pb-1">
                  Certifications
                </h3>
                {certifications.map((cert, i) => (
                  <div
                    key={i}
                    className="flex items-baseline justify-between mb-2"
                  >
                    <div>
                      <p className="text-sm font-semibold text-on-surface">
                        {cert.name}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {cert.issuer}
                      </p>
                    </div>
                    <span className="text-xs text-outline">{cert.year}</span>
                  </div>
                ))}
              </div>
            )}

            {skills && skills.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 border-b border-primary/20 pb-1">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 bg-surface-container text-xs text-on-surface rounded-full font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analysis sidebar */}
        <div className="space-y-5">
          {/* Overall score */}
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-5">
            <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              Job Description
            </h3>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              rows={6}
              className="w-full text-sm text-on-surface bg-surface-container border border-outline-variant rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 mb-3"
            />

            <button
              onClick={handleAnalyzeCv}
              disabled={analyzing}
              className="w-full px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {analyzing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Analyze CV Now
                </>
              )}
            </button>

            {analysisError && (
              <p className="text-xs text-error mt-2">{analysisError}</p>
            )}
          </div>

          {/* ATS Evaluation Result */}
          {analysis && (
            <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-5 animate-fade-in">
              <h3 className="text-sm font-bold text-on-surface mb-4">
                ATS Evaluation Result
              </h3>

              <div className="flex justify-center mb-5">
                <ScoreRing score={analysis.score ?? 0} />
              </div>

              {analysis.summaryEvaluation && (
                <div className="mb-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
                    Summary
                  </h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {analysis.summaryEvaluation}
                  </p>
                </div>
              )}

              {analysis.matchedSkills && analysis.matchedSkills.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
                    Matched Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.matchedSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-green-600/10 text-green-700 text-xs rounded font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.missingSkills && analysis.missingSkills.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
                    Missing Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.missingSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-error/10 text-error text-xs rounded font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.improvements && analysis.improvements.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
                    Improvements
                  </h4>
                  <ul className="space-y-1.5">
                    {analysis.improvements.map((imp, i) => (
                      <li
                        key={i}
                        className="text-sm text-on-surface-variant flex items-start gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
