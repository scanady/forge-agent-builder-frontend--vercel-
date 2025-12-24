import { generateGreeting } from '@/lib/greeting';

export async function GreetingSection() {
  const greeting = await generateGreeting();
  
  return (
    <div className="text-center mb-12">
      <h2 className="text-2xl font-semibold mb-2 text-foreground">{greeting}</h2>
      <p className="text-muted-foreground text-sm">
        How can I help you today?
      </p>
    </div>
  );
}
