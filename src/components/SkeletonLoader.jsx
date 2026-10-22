import React from 'react';

export function CardSkeleton() {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="angular-card-wrap">
        <div className="angular-card">
          <div className="aspect-[2/3] w-full skeleton-shimmer bg-[#111115]" />
          <div className="h-[74px] p-3 flex flex-col justify-between bg-[#0c0d12]">
            <div className="h-3.5 w-4/5 angular-cut-sm skeleton-shimmer bg-[#161822]" />
            <div className="flex items-center justify-between">
              <div className="h-3 w-1/3 angular-cut-sm skeleton-shimmer bg-[#161822]" />
              <div className="h-3 w-1/4 angular-cut-sm skeleton-shimmer bg-[#161822]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative w-full h-[480px] sm:h-[540px] angular-cut-lg bg-[#0b0b0b] border border-white/[0.06] overflow-hidden my-6 p-8 sm:p-12 flex flex-col justify-end">
      <div className="skeleton-shimmer absolute inset-0 bg-[#111111] opacity-40" />
      <div className="relative z-10 flex flex-col gap-3 max-w-xl">
        <div className="h-6 w-32 angular-cut-sm skeleton-shimmer bg-[#161616]" />
        <div className="h-10 sm:h-14 w-3/4 angular-cut-sm skeleton-shimmer bg-[#161616]" />
        <div className="h-4 w-full angular-cut-sm skeleton-shimmer bg-[#161616]" />
        <div className="h-4 w-2/3 angular-cut-sm skeleton-shimmer bg-[#161616]" />
        <div className="flex gap-3 mt-4">
          <div className="h-11 w-36 angular-cut-sm skeleton-shimmer bg-[#161616]" />
          <div className="h-11 w-32 angular-cut-sm skeleton-shimmer bg-[#161616]" />
        </div>
      </div>
    </div>
  );
}

export function ReviewSkeleton() {
  return (
    <div className="p-6 angular-cut bg-[#0b0b0b] border border-white/[0.06] flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 angular-cut-sm skeleton-shimmer bg-[#111111]" />
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="h-4 w-28 angular-cut-sm skeleton-shimmer bg-[#111111]" />
          <div className="h-3 w-16 angular-cut-sm skeleton-shimmer bg-[#111111]" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-3.5 w-full angular-cut-sm skeleton-shimmer bg-[#111111]" />
        <div className="h-3.5 w-4/5 angular-cut-sm skeleton-shimmer bg-[#111111]" />
      </div>
    </div>
  );
}

export function EpisodesSkeleton() {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 sm:gap-3">
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} className="aspect-square angular-cut-sm skeleton-shimmer bg-[#0b0b0b] border border-white/[0.06]" />
      ))}
    </div>
  );
}
