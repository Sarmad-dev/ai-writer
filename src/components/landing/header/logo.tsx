import { Sparkles } from "lucide-react"

export function AIWritingLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-r from-indigo-600 to-purple-600">
        <Sparkles className="w-5 h-5 text-white" />
      </div>
      <span className="text-lg font-bold bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
        AI Writing
      </span>
    </div>
  )
}
