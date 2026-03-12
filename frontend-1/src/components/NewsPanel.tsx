import { FileText, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NewsArticle {
  title: string;
  sentiment: number;
  label: "positive" | "negative" | "neutral";
  published_at?: string;
}

interface NewsPanelProps {
  articles: NewsArticle[];
  averageSentiment: number;
  className?: string;
}

export function NewsPanel({ articles, averageSentiment, className }: NewsPanelProps) {
  if (!articles || articles.length === 0) {
    return (
      <div className={cn("w-full h-full flex flex-col items-center justify-center p-8 border border-[#3f3f46] rounded-xl bg-[#27272a]/30", className)}>
        <div className="w-12 h-12 rounded-full bg-[#1D1D20] border border-[#3f3f46] flex items-center justify-center mb-4">
          <Newspaper className="w-6 h-6 text-[#909094]" />
        </div>
        <h3 className="text-lg font-bold text-[#fbfbff] mb-1">No News Data</h3>
        <p className="text-sm text-[#909094] text-center max-w-xs">No recent news articles found for this entity.</p>
      </div>
    );
  }

  // Determine overall sentiment color and label
  let overallColor = "#909094";
  let overallLabel = "Neutral";
  
  if (averageSentiment >= 0.05) {
    overallColor = "#8DE5A1"; // Zerve Green
    overallLabel = "Positive";
  } else if (averageSentiment <= -0.05) {
    overallColor = "#f04438"; // Zerve Red
    overallLabel = "Negative";
  }

  return (
    <div className={cn("w-full h-full flex flex-col", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="w-5 h-5 text-[#fbfbff]" />
        <h3 className="text-lg font-bold text-[#fbfbff]">News Intelligence</h3>
        
        <div className="ml-auto flex items-center gap-2 bg-[#27272a] px-3 py-1 rounded-full border border-[#3f3f46]">
          <span className="text-xs font-medium text-[#909094]">Overall:</span>
          <span 
            className="text-sm font-bold flex items-center gap-1"
            style={{ color: overallColor }}
          >
            {averageSentiment > 0 ? "+" : ""}{averageSentiment.toFixed(2)}
            <span className="text-xs font-medium uppercase opacity-80">({overallLabel})</span>
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-2">
        {articles.map((article, idx) => {
          let iconColor = "#ffd400"; // neutral yellow
          let iconStyle = "text-yellow-500 bg-yellow-500/10";
          
          if (article.label === "positive") {
            iconColor = "#8DE5A1";
            iconStyle = "text-[#8DE5A1] bg-[#8DE5A1]/10";
          } else if (article.label === "negative") {
            iconColor = "#f04438";
            iconStyle = "text-[#f04438] bg-[#f04438]/10";
          }

          return (
            <div 
              key={`news-${idx}`}
              className="p-3 rounded-lg bg-[#27272a]/50 border border-[#3f3f46] hover:border-[#52525b] transition-colors flex gap-3"
            >
              <div className={cn("mt-0.5 w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center", iconStyle)}>
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#fbfbff] leading-snug break-words">
                  {article.title}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span 
                    className="text-xs font-bold"
                    style={{ color: iconColor }}
                  >
                    {article.sentiment > 0 ? "+" : ""}{article.sentiment.toFixed(2)}
                  </span>
                  
                  {article.published_at && article.published_at !== "N/A" && (
                    <span className="text-xs text-[#909094]">
                      {article.published_at}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
