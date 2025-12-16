'use client'

import React, { useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextEffect } from '@/components/ui/text-effect'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { HeroHeader } from './header'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export default function HeroSection() {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.75 // Half speed
        }
    }, [])

    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden relative">
                <section className="relative min-h-screen flex items-center justify-center">
                    {/* Full-width video background */}
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        className="absolute inset-0 w-full h-full object-cover"
                    >
                        <source src="/hero.mp4" type="video/mp4" />
                    </video>

                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-black/50" />

                    {/* Gradient overlays for depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

                    {/* Content overlay */}
                    <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:py-32">
                        <div className="text-center">
                            <AnimatedGroup variants={transitionVariants}>
                                <Link
                                    href="./models"
                                    className="hover:bg-white/20 bg-white/10 group mx-auto flex w-fit items-center gap-4 rounded-full border border-white/20 p-1 pl-4 shadow-lg backdrop-blur-sm transition-colors duration-300">
                                    <span className="text-white text-sm">Introducing Support for AI Models</span>
                                    <span className="block h-4 w-0.5 border-l border-white/30"></span>

                                    <div className="bg-white/20 group-hover:bg-white/30 size-6 overflow-hidden rounded-full duration-500">
                                        <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                            <span className="flex size-6">
                                                <ArrowRight className="m-auto size-3 text-white" />
                                            </span>
                                            <span className="flex size-6">
                                                <ArrowRight className="m-auto size-3 text-white" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </AnimatedGroup>

                            <TextEffect
                                preset="fade-in-blur"
                                speedSegment={0.3}
                                as="h1"
                                className="mx-auto mt-8 max-w-4xl text-balance text-5xl font-bold text-white max-md:font-semibold md:text-7xl lg:mt-16 xl:text-[5.25rem] drop-shadow-lg">
                                Your Creative Studio Powered By AI
                            </TextEffect>

                            <TextEffect
                                per="line"
                                preset="fade-in-blur"
                                speedSegment={0.3}
                                delay={0.5}
                                as="p"
                                className="mx-auto mt-8 max-w-2xl text-balance text-lg text-white/90 drop-shadow-md">
                                Generate stunning images and videos with state-of-the-art AI models. From concept to creation in seconds.
                            </TextEffect>

                            <AnimatedGroup
                                variants={{
                                    container: {
                                        visible: {
                                            transition: {
                                                staggerChildren: 0.05,
                                                delayChildren: 0.75,
                                            },
                                        },
                                    },
                                    ...transitionVariants,
                                }}
                                className="mt-12 flex flex-col items-center justify-center gap-4 md:flex-row">
                                <div
                                    key={1}
                                    className="rounded-[calc(var(--radius-xl)+0.125rem)] p-0.5">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="rounded-xl px-8 py-6 text-base font-semibold shadow-lg">
                                        <Link href="/generate">
                                            <span className="text-nowrap">Start Creating</span>
                                        </Link>
                                    </Button>
                                </div>
                                <Button
                                    key={2}
                                    asChild
                                    size="lg"
                                    variant="outline"
                                    className="rounded-xl px-8 py-6 text-base font-semibold bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm">
                                    <Link href="#link">
                                        <span className="text-nowrap">See Examples</span>
                                    </Link>
                                </Button>
                            </AnimatedGroup>
                        </div>
                    </div>

                    {/* Bottom fade to content below */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
                </section>
            </main>
        </>
    )
}
