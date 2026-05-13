"use client";

import { useState, useEffect } from "react";
import { PageShell } from "@/components/PageShell";
import { GlassCard } from "@/components/GlassCard";
import { BackButton } from "@/components/BackButton";
import { Skeleton } from "@/components/Skeleton";
import { useToast } from "@/components/ToastProvider";
import { ShareButton } from "@/components/ShareButton";
import { Gift } from "lucide-react";
import { supabase } from "@/lib/supabase";

function generateReferralCode(): string {
  return "ref" + Math.random().toString(36).substring(2, 7);
}

export default function ReferralPage() {
  const [userCode, setUserCode] = useState<string>("");
  const [referralCount, setReferralCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchReferralCount = async (code: string) => {
    if (!supabase) {
      setReferralCount(0);
      setLoading(false);
      return;
    }

    try {
      const { count, error } = await supabase
        .from("referrals")
        .select("*", { count: "exact", head: true })
        .eq("referrer_code", code);

      if (error) {
        console.warn("Referrals table might be missing or inaccessible:", error);
        setReferralCount(0);
        return;
      }
      setReferralCount(count || 0);
    } catch (err) {
      console.error("Referral fetch error:", err);
      setReferralCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const init = async () => {
      // Check for referral code in localStorage
      let code = localStorage.getItem("hallssports_referral_code");
      if (!code) {
        code = generateReferralCode();
        localStorage.setItem("hallssports_referral_code", code);
      }
      setUserCode(code);

      // Check for ?ref= in URL
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get("ref");
      if (refCode && refCode !== code) {
        localStorage.setItem("hallssports_referred_by", refCode);
        // Insert into Supabase if available
        if (supabase) {
          supabase.from("referrals").insert({
            referrer_code: refCode,
            visitor_id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
          } as never).then(({ error }) => {
            if (error) console.error("Referral insert error:", error);
          });
        }
      }

      fetchReferralCount(code);
    };
    init();
  }, []);

  const copyLink = async () => {
    const link = `${window.location.origin}?ref=${userCode}`;
    await navigator.clipboard.writeText(link);
    addToast({ type: "success", title: "Link copied!", description: "Share it with your friends." });
  };

  const referralLink = typeof window !== "undefined" 
    ? `${window.location.origin}?ref=${userCode}` 
    : "";

if (loading) {
     return (
       <PageShell title="Referrals">
         <BackButton />
         <div className="space-y-6">
           <Skeleton className="h-48 w-full" />
           <Skeleton className="h-24 w-full" />
         </div>
       </PageShell>
     );
   }

   return (
    <PageShell title="Referrals">
      <BackButton />
      <div className="space-y-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Invite your friends</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Your referral code</label>
              <div className="font-mono text-2xl font-bold text-primary">{userCode}</div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Your referral link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-foreground text-sm"
                />
                <button
                  onClick={copyLink}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            <ShareButton
              title="Join me on HallsSports"
              text="Join me on HallsSports – the best live football stats app! ⚽🔥"
              url={referralLink}
              className="w-full"
            />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="font-bold mb-3">Your Stats</h3>
          <div className="text-center py-4">
            <div className="text-4xl font-bold text-primary mb-2">{referralCount}</div>
            <p className="text-muted-foreground">
              {referralCount === 0 
                ? "Share your link to start earning invites!" 
                : "People you've brought"}
            </p>
          </div>
        </GlassCard>
      </div>
    </PageShell>
  );
}