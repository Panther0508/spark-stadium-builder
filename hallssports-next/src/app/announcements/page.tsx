"use client";

import { useEffect, useState, useCallback } from "react";
import { GlassCard } from "@/components/GlassCard";
import { ShimmerLoader } from "@/components/ShimmerLoader";
import { PageShell } from "@/components/PageShell";
import { BackButton } from "@/components/BackButton";
import { Megaphone, Calendar } from "lucide-react";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { FullScreenOverlay } from "@/components/FullScreenOverlay";
import { supabase } from "@/lib/supabase";
import { formatRelativeTime } from "@/lib/utils";

interface Announcement {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  created_at: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Announcement | null>(null);

const fetchAnnouncements = useCallback(async () => {
     setLoading(true);
     setError(null);
     try {
       const { data, error } = await supabase
         .from('announcements')
         .select('*')
         .eq('is_verified', true)
         .order('created_at', { ascending: false });
       if (error) throw error;
       setAnnouncements(data as Announcement[] || []);
     } catch (e) {
       setError(e instanceof Error ? e.message : "Failed to load announcements");
     } finally {
       setLoading(false);
     }
   }, []);

  useEffect(() => {
    const handleFetch = async () => {
      await fetchAnnouncements();
    };
    handleFetch();

    const channel = supabase
      .channel('announcements')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, (payload) => {
        if (payload.new.is_verified) {
          setAnnouncements(prev => [payload.new as Announcement, ...prev]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchAnnouncements]);

  if (loading) {
    return (
      <PageShell title="Announcements">
        <BackButton />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <ShimmerLoader key={i} height={120} width="100%" />)}
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Announcements">
        <BackButton />
        <ErrorState message={error} onRetry={fetchAnnouncements} />
      </PageShell>
    );
  }

  if (announcements.length === 0) {
    return (
      <PageShell title="Announcements">
        <BackButton />
        <EmptyState 
          icon={<Megaphone className="h-12 w-12 text-primary" />} 
          title="No announcements yet." 
        />
      </PageShell>
    );
  }

  return (
    <PageShell title="Announcements">
      <BackButton />
      <div className="space-y-4">
        {announcements.map((item) => (
          <GlassCard key={item.id} className="p-4 cursor-pointer hover:border-primary/30 transition-all" onClick={() => setSelected(item)}>
            <div className="flex gap-4">
               {item.image_url && <div className="w-16 h-16 rounded-lg bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${item.image_url})` }} />}
               <div className="min-w-0">
                  <h3 className="font-bold text-lg truncate">{item.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.body}</p>
                  <div className="flex items-center gap-1 text-[10px] text-primary mt-2">
                    <Calendar className="h-3 w-3" />
                    {formatRelativeTime(item.created_at)}
                  </div>
               </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <FullScreenOverlay isOpen={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <div className="space-y-4">
            {selected.image_url && <img src={selected.image_url} alt={selected.title} className="w-full h-64 object-cover rounded-2xl" /* eslint-disable-line @next/next/no-img-element */ />}
            <h2 className="text-2xl font-black">{selected.title}</h2>
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{selected.body}</p>
          </div>
        )}
      </FullScreenOverlay>
    </PageShell>
  );
}
