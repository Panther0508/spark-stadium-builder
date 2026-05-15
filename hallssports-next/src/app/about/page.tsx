"use client";

import { useEffect, useState, useCallback } from "react";
import { ExternalLink, Trophy, Heart } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { GlassModal } from "@/components/GlassModal";
import { PageShell } from "@/components/PageShell";
import { ShimmerLoader } from "@/components/ShimmerLoader";
import { BackButton } from "@/components/BackButton";
import { ErrorState } from "@/components/ErrorState";
import { motion } from "framer-motion";
import Image from "next/image";
import { sanitizeHtml } from "@/lib/sanitize";
import { supabase } from "@/lib/supabase";

interface Person {
  name: string;
  role: string;
  photo?: string;
  bio?: string;
}

interface AboutSettings {
  tournament_name: string;
  tournament_logo?: string;
  about_description: string;
  about_mission: string;
  about_vision: string;
  about_goals: string;
  organizers: Person[];
  contributors: Person[];
}

export default function AboutPage() {
  const [settings, setSettings] = useState<AboutSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<(Person & { bio: string }) | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) throw error;
     
      const parsed: Record<string, unknown> = {};
      data?.forEach((s: { key: string; value: string }) => {
        if (s.key === 'organizers' || s.key === 'contributors') {
          try { parsed[s.key] = JSON.parse(s.value); } catch { parsed[s.key] = []; }
        } else {
          parsed[s.key] = s.value;
        }
      });
      setSettings(parsed as unknown as AboutSettings);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSettings();
  }, [fetchSettings]);

  if (loading) {
    return (
      <PageShell title="About">
        <BackButton />
        <div className="space-y-6">
          <ShimmerLoader height={200} width="100%" />
          <ShimmerLoader height={300} width="100%" />
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="About">
        <BackButton />
        <ErrorState message={error} onRetry={fetchSettings} />
      </PageShell>
    );
  }

  return (
    <PageShell title="About">
      <BackButton />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <GlassCard className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
            {settings?.tournament_logo && (
              <div className="relative w-24 h-24 flex-shrink-0">
                <Image 
                  src={settings.tournament_logo} 
                  alt={settings.tournament_name || 'Tournament Logo'} 
                  fill 
                  className="object-contain"
                />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-black">{settings?.tournament_name || 'HallsSports'}</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">{settings?.about_description}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {settings?.about_mission && (
              <div className="space-y-2">
                <h3 className="font-bold flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-primary rounded-full" />
                  Mission
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{settings.about_mission}</p>
              </div>
            )}
            {settings?.about_vision && (
              <div className="space-y-2">
                <h3 className="font-bold flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-primary rounded-full" />
                  Vision
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{settings.about_vision}</p>
              </div>
            )}
            {settings?.about_goals && (
              <div className="space-y-2">
                <h3 className="font-bold flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-primary rounded-full" />
                  Goals
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{settings.about_goals}</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Pantero CTA */}
        <GlassCard className="p-8 text-center bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
          <div className="max-w-md mx-auto">
            <h3 className="text-2xl font-black mb-4">Powered by Pantero</h3>
            <p className="text-muted-foreground mb-6">
              HallsSports is built on the Pantero sports engine, providing real-time data, advanced analytics, and seamless community engagement for university sports.
            </p>
            <a 
              href="https://pantero.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:scale-105 transition-transform shadow-lg shadow-primary/20"
            >
              Learn More about Pantero <ExternalLink className="h-5 w-5" />
            </a>
          </div>
        </GlassCard>

        {settings?.organizers && settings.organizers.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Heart className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Tournament Organizers</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {settings.organizers.map((person, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPerson({ ...person, bio: (person as Person).bio || "" })}
                  className="glass p-4 rounded-2xl text-center hover:bg-white/10 transition-colors"
                >
                  <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 border-2 border-primary/20 bg-black/20">
                    <Image 
                      src={person.photo || "/placeholder-user.png"} 
                      alt={person.name} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                  <h3 className="font-bold text-sm truncate">{person.name}</h3>
                  <p className="text-[10px] text-primary font-bold uppercase tracking-widest truncate">{person.role}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {settings?.contributors && settings.contributors.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Heart className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Contributors</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {settings.contributors.map((person, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPerson({ ...person, bio: (person as Person).bio || "" })}
                  className="glass p-4 rounded-2xl text-center hover:bg-white/10 transition-colors"
                >
                  <div className="relative w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 border-2 border-primary/10 bg-black/20">
                    <Image 
                      src={person.photo || "/placeholder-user.png"} 
                      alt={person.name} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                  <h3 className="font-bold text-xs truncate">{person.name}</h3>
                  <p className="text-[9px] text-primary/70 font-bold uppercase tracking-widest truncate">{person.role}</p>
                </button>
              ))}
            </div>
          </div>
        )}



        {selectedPerson && (
          <GlassModal
            open={true}
            onClose={() => setSelectedPerson(null)}
            title={selectedPerson.name}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <Image src={selectedPerson.photo || "/placeholder-user.png"} alt={selectedPerson.name} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">{selectedPerson.name}</h3>
                  <p className="text-primary font-bold">{selectedPerson.role}</p>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedPerson.bio) }} />
            </div>
          </GlassModal>
        )}
      </motion.div>
    </PageShell>
  );
}
