"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Users, Trophy, Heart } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { GlassModal } from "@/components/GlassModal";
import { PageShell } from "@/components/PageShell";
import { ShimmerLoader } from "@/components/ShimmerLoader";
import { motion } from "framer-motion";
import Image from "next/image";
import { sanitizeHtml } from "@/lib/sanitize";
import { adminSelect } from "@/app/admin/actions";

type Person = {
  name: string;
  role: string;
  photo?: string;
  bio?: string;
};

const MOCK_ABOUT_SETTINGS = {
  title: "HallsSports Tournament",
  description: "The HallsSports Tournament is a premier football competition bringing together the best local talent.",
  mission: "To create an inclusive, competitive environment that celebrates football excellence.",
  vision: "To become the leading amateur football tournament in the region.",
};

export default function AboutPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await adminSelect('settings') as Array<{ key: string; value: string }>;
        const settingsObj: Record<string, any> = { ...MOCK_ABOUT_SETTINGS };
        
        if (data) {
          data.forEach(s => {
            if (s.key === 'organizers' || s.key === 'contributors') {
              try {
                settingsObj[s.key] = JSON.parse(s.value);
              } catch {
                settingsObj[s.key] = [];
              }
            } else {
              settingsObj[s.key] = s.value;
            }
          });
        }
        setSettings(settingsObj);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <PageShell title="About">
        <div className="space-y-6">
          <ShimmerLoader height={200} width="100%" />
          <ShimmerLoader height={300} width="100%" />
          <ShimmerLoader height={200} width="100%" />
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="About">
        <GlassCard className="p-6 text-center">
          <p className="text-red-400 mb-2">Error: {error}</p>
          <button onClick={() => window.location.reload()} className="text-primary underline">Retry</button>
        </GlassCard>
      </PageShell>
    );
  }

  return (
    <PageShell title="About">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">{settings?.title}</h2>
          </div>
          <p className="text-muted-foreground mb-4">{settings?.description}</p>
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Our Mission</h3>
            <p className="text-muted-foreground">{settings?.mission}</p>
            <h3 className="font-semibold text-lg">Our Vision</h3>
            <p className="text-muted-foreground">{settings?.vision}</p>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Tournament Organizers</h2>
          </div>
          <p className="text-muted-foreground mb-4">The official team running the tournament.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(settings?.organizers || []).map((person: Person, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedPerson({ ...person, bio: person.bio || "" })}
                className="glass p-4 rounded-lg text-center hover:bg-white/20 transition-colors min-h-[44px]"
              >
                <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto mb-3">
                  <Image
                    src={person.photo || "/images/guests/default.jpg"}
                    alt={person.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-bold">{person.name}</h3>
                <p className="text-sm text-primary">{person.role}</p>
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Contributors</h2>
          </div>
          <p className="text-muted-foreground mb-4">People who helped build and run HallsSports.</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(settings?.contributors || []).map((contributor: Person, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedPerson({ ...contributor, bio: contributor.bio || "" })}
                className="glass p-3 rounded-lg text-center hover:bg-white/20 transition-colors min-h-[44px]"
              >
                <div className="relative w-16 h-16 rounded-full overflow-hidden mx-auto mb-2">
                  <Image
                    src={contributor.photo || "/images/contributors/default.jpg"}
                    alt={contributor.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h4 className="font-semibold text-sm">{contributor.name}</h4>
                <p className="text-xs text-primary">{contributor.role}</p>
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-8 text-center">
          <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Powered by Pantero</h2>
          <p className="text-muted-foreground mb-6">
            This tournament platform is proudly powered by Pantero, bringing innovative technology to grassroots football.
          </p>
          <a
            href="https://pantero.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Visit Pantero <ExternalLink className="h-4 w-4" />
          </a>
        </GlassCard>

        <GlassCard className="p-6 border-2 border-primary/30">
          <p className="text-center mb-4">Looking for a similar service? We can build a custom live-stats platform for your event.</p>
          <a
            href="https://nmesirionyengbaronye.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 bg-primary text-white font-bold rounded-lg text-center hover:bg-primary/90 transition-colors"
          >
            Contact the Developer
          </a>
          <p className="text-center text-xs text-muted-foreground mt-3">Built with ❤️ by the HallsSports team</p>
        </GlassCard>

        {selectedPerson && (
          <GlassModal
            open={true}
            onClose={() => setSelectedPerson(null)}
            title={selectedPerson.name}
            maxWidth="md"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <Image
                    src={selectedPerson.photo || "/images/contributors/default.jpg"}
                    alt={selectedPerson.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-xl">{selectedPerson.name}</h3>
                  <p className="text-primary">{selectedPerson.role}</p>
                </div>
              </div>
              {selectedPerson.bio && (
                <p className="text-muted-foreground">{sanitizeHtml(selectedPerson.bio)}</p>
              )}
            </div>
          </GlassModal>
        )}
      </motion.div>
    </PageShell>
  );
}