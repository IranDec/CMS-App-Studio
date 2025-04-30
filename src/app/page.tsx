import { WidgetPanel } from '@/components/widget-panel';
import { PhonePreview } from '@/components/phone-preview';

export default function Home() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Left Panel: Widget Selection */}
      <aside className="w-1/4 max-w-xs border-r bg-secondary overflow-y-auto">
        <WidgetPanel />
      </aside>

      {/* Right Panel: Phone Preview */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 bg-background">
        <PhonePreview />
      </main>
    </div>
  );
}
