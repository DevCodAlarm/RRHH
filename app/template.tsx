"use client"

import { useLayoutEffect, useRef } from "react"
import { gsap } from "gsap"

export default function Template({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!ref.current) return

    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 10, willChange: "opacity, transform" },
      { opacity: 1, y: 0, duration: 0.28, ease: "power2.out", clearProps: "willChange" }
    )
  }, [])

  return <div ref={ref}>{children}</div>
}
