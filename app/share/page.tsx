"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { GameManager } from "@/components/GameManager";
import { decodeShareData } from "@/lib/share";

function ShareContent() {
  const searchParams = useSearchParams();
  const [decoded, setDecoded] = useState<{
    participants: string[];
    courtCount: number;
  } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const playersParam = searchParams.get("players");
    const courtsParam = searchParams.get("courts");

    if (!playersParam || !courtsParam) {
      setError(true);
      return;
    }

    const result = decodeShareData(playersParam, courtsParam);
    if (result) {
      setDecoded(result);
    } else {
      setError(true);
    }
  }, [searchParams]);

  if (error) {
    return (
      <div className="max-w-[980px] mx-auto px-5 sm:px-[32px] py-8 sm:py-12">
        <header className="border-b-[3px] border-double border-black pb-4 mb-8">
          <h1 className="text-[18px] font-bold uppercase tracking-[0.03em]">
            Badminton Rotation
          </h1>
        </header>
        <p className="text-[#6b6b6b] mb-4">Invalid or missing share link.</p>
        <Link
          href="/"
          className="px-4 py-2 border border-black text-sm font-medium hover:bg-black hover:text-white transition-colors inline-block"
        >
          Go home
        </Link>
        <footer className="mt-16 pt-4 border-t border-black text-[13px] text-[#6b6b6b]">
          Created by{" "}
          <a
            href="https://adja.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black underline underline-offset-3 hover:underline-[2px] transition-[text-decoration-thickness]"
          >
            Anuraag Jain
          </a>
        </footer>
      </div>
    );
  }

  if (!decoded) {
    return (
      <div className="max-w-[980px] mx-auto px-5 sm:px-[32px] py-8 sm:py-12">
        <header className="border-b-[3px] border-double border-black pb-4 mb-8">
          <h1 className="text-[18px] font-bold uppercase tracking-[0.03em]">
            Badminton Rotation
          </h1>
        </header>
        <p className="text-[#6b6b6b] animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <GameManager
      initialParticipants={decoded.participants}
      initialCourtCount={decoded.courtCount}
    />
  );
}

export default function SharePage() {
  return (
    <Suspense>
      <ShareContent />
    </Suspense>
  );
}
