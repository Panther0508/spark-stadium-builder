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

const MOCK_ABOUT_SETTINGS = {
  title: "HallsSports Tournament",
  description: "The HallsSports Tournament is a premier football competition bringing together the best local talent. Our mission is to foster community engagement through the beautiful game while providing a platform for players to showcase their skills.",
  mission: "To create an inclusive, competitive environment that celebrates football excellence and builds lasting community connections through sport.",
  vision: "To become the leading amateur football tournament in the region, known for its fair play, competitive spirit, and community impact.",
  honouredGuests: [
    { id: 1, name: "John Smith", title: "Former National Team Captain", bio: "John Smith captained the national team for 8 years, winning 67 caps. He now runs a youth academy.", photo: "/images/guests/guest1.jpg" },
    { id: 2, name: "Maria Garcia", title: "Olympic Gold Medalist", bio: "Maria won gold in the 2016 Olympics and bronze in 2020. She is an inspiration to young female athletes.", photo: "/images/guests/guest2.jpg" },
    { id: 3, name: "David Thompson", title: "FIFA Ambassador", bio: "David has been involved in football development for over 20 years, working with FIFA on grassroots programs.", photo: "/images/guests/guest3.jpg" },
    { id: 4, name: "Sarah Johnson", title: "Sports Journalist", bio: "Sarah has covered football for 15 years, bringing insightful analysis and storytelling to the sport.", photo: "/images/guests/guest4.jpg" },
    { id: 5, name: "Coach Williams", title: "Development Director", bio: "Williams has trained over 500 coaches and developed youth programs across 5 countries.", photo: "/images/guests/guest5.jpg" },
  ],
  contributors: [
    { id: 1, name: "Alex Morgan", role: "Tournament Director", bio: "Alex has 10 years of tournament experience, managing events across three continents.", photo: "/images/contributors/cont1.jpg" },
    { id: 2, name: "Jamie Lee", role: "Technical Director", bio: "Former pro player turned coach, Jamie ensures fair play and high standards throughout the tournament.", photo: "/images/contributors/cont2.jpg" },
    { id: 3, name: "Chris Evans", role: "Marketing Lead", bio: "Chris brings 8 years of sports marketing experience, growing our audience by 300%.", photo: "/images/contributors/cont3.jpg" },
    { id: 4, name: "Taylor Kim", role: "Operations Manager", bio: "Taylor coordinates logistics, from pitch preparation to volunteer coordination.", photo: "/images/contributors/cont4.jpg" },
    { id: 5, name: "Jordan Patel", role: "Social Media", bio: "Jordan creates engaging content and manages our community outreach.", photo: "/images/contributors/cont5.jpg" },
    { id: 6, name: "Riley Brown", role: "Safety Officer", bio: "Riley ensures all matches meet safety standards and emergency protocols are in place.", photo: "/images/contributors/cont6.jpg" },
    { id: 7, name: "Avery Davis", role: "Finance Lead", bio: "Avery handles all financial operations and sponsorship management.", photo: "/images/contributors/cont7.jpg" },
    { id: 8, name: "Quinn Miller", role: "Volunteer Coordinator", bio: "Quinn organizes and trains our 100+ volunteers who make the tournament possible.", photo: "/images/contributors/cont8.jpg" },
  ],
};

type Guest = typeof MOCK_ABOUT_SETTINGS.honouredGuests[0];
type Contributor = typeof MOCK_ABOUT_SETTINGS.contributors[0];

export default function AboutPage() {
  const [settings, setSettings] = useState<typeof MOCK_ABOUT_SETTINGS | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [selectedContributor, setSelectedContributor] = useState<Contributor | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setSettings(MOCK_ABOUT_SETTINGS);
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
        {/* About the Tournament */}
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

        {/* Honoured Guests */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Honoured Guests</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {settings?.honouredGuests.map(guest => (
              <button
                key={guest.id}
                onClick={() => setSelectedGuest(guest)}
                className="glass p-4 rounded-lg text-center hover:bg-white/20 transition-colors"
              >
                <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto mb-3">
                  <Image
                    src={guest.photo || "/images/guests/default.jpg"}
                    alt={guest.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-bold">{guest.name}</h3>
                <p className="text-sm text-muted-foreground">{guest.title}</p>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Contributors */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Contributors</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {settings?.contributors.map(contributor => (
              <button
                key={contributor.id}
                onClick={() => setSelectedContributor(contributor)}
                className="glass p-3 rounded-lg text-center hover:bg-white/20 transition-colors"
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
                <p className="text-xs text-muted-foreground">{contributor.role}</p>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Powered by Pantero */}
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

        {/* Contact Developer */}
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

        {/* Guest Bio Modal */}
        {selectedGuest && (
          <GlassModal
            open={true}
            onClose={() => setSelectedGuest(null)}
            title={selectedGuest.name}
            maxWidth="md"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <Image
                    src={selectedGuest.photo || "/images/guests/default.jpg"}
                    alt={selectedGuest.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-xl">{selectedGuest.name}</h3>
                  <p className="text-primary">{selectedGuest.title}</p>
                </div>
              </div>
              <p className="text-muted-foreground">{sanitizeHtml(selectedGuest.bio)}</p>
            </div>
          </GlassModal>
        )}

        {/* Contributor Bio Modal */}
        {selectedContributor && (
          <GlassModal
            open={true}
            onClose={() => setSelectedContributor(null)}
            title={selectedContributor.name}
            maxWidth="md"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <Image
                    src={selectedContributor.photo || "/images/contributors/default.jpg"}
                    alt={selectedContributor.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-xl">{selectedContributor.name}</h3>
                  <p className="text-primary">{selectedContributor.role}</p>
                </div>
              </div>
              <p className="text-muted-foreground">{sanitizeHtml(selectedContributor.bio)}</p>
            </div>
          </GlassModal>
        )}
      </motion.div>
    </PageShell>
  );
}