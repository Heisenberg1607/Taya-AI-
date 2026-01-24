import { User } from "lucide-react";

interface HeaderProps {
  isDarkMode: boolean;
  
}

export function Header({ isDarkMode }: HeaderProps) {
  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${
        isDarkMode
          ? "bg-slate-900/80 border-slate-800"
          : "bg-white/80 border-neutral-200"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isDarkMode ? "bg-indigo-500/20" : "bg-indigo-100"
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400" />
            </div>
            <h1
              className={`text-xl font-semibold ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}
            >
              Living Memory
            </h1>
          </div>

          <p
            className={`hidden md:block text-sm ${
              isDarkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Turn moments into meaning.
          </p>

          <div className="flex items-center gap-3">
            
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-300 ${
                isDarkMode
                  ? "bg-gradient-to-br from-indigo-500 to-purple-500"
                  : "bg-gradient-to-br from-indigo-400 to-purple-400"
              }`}
            >
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}