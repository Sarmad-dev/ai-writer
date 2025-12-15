'use client';


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  MessageSquare, 
  BarChart3,
  Sparkles,
  Wand2,
  PenTool,
  Globe
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  onClick: () => void;
  index: number;
}

function QuickActionCard({ title, description, icon: Icon, gradient, onClick, index }: QuickActionProps) {
  return (
    <div
      className="dashboard-card opacity-0 animate-in fade-in scale-in-95 duration-300 hover:scale-[1.02] active:scale-[0.98] transition-all"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
    >
      <Card 
        className="cursor-pointer border-0 shadow-md hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
        onClick={onClick}
      >
        <div className={`absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity ${gradient}`} />
        <CardContent className="p-6 relative">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl group-hover:scale-110 transition-transform ${gradient}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      title: 'Write Article',
      description: 'Create a new blog post or article with AI assistance',
      icon: FileText,
      gradient: 'bg-linear-to-r from-blue-500 to-blue-600',
      onClick: () => router.push('/content/new?type=article'),
    },
    {
      title: 'Start Chat',
      description: 'Have a conversation with AI to brainstorm ideas',
      icon: MessageSquare,
      gradient: 'bg-linear-to-r from-green-500 to-emerald-600',
      onClick: () => router.push('/chat'),
    },
    {
      title: 'Generate Ideas',
      description: 'Get creative suggestions for your next project',
      icon: Sparkles,
      gradient: 'bg-linear-to-r from-purple-500 to-pink-600',
      onClick: () => router.push('/content/new?type=ideas'),
    },
    {
      title: 'Create Report',
      description: 'Generate detailed reports with data visualization',
      icon: BarChart3,
      gradient: 'bg-linear-to-r from-orange-500 to-red-600',
      onClick: () => router.push('/content/new?type=report'),
    },
    {
      title: 'Write Copy',
      description: 'Create marketing copy and promotional content',
      icon: PenTool,
      gradient: 'bg-linear-to-r from-indigo-500 to-purple-600',
      onClick: () => router.push('/content/new?type=copy'),
    },
    {
      title: 'Research Topic',
      description: 'Get comprehensive research on any topic',
      icon: Globe,
      gradient: 'bg-linear-to-r from-teal-500 to-cyan-600',
      onClick: () => router.push('/content/new?type=research'),
    },
  ] as const;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <QuickActionCard key={action.title} {...action} index={index} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}