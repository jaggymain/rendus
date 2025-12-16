import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Zap, Sparkles, Crown } from 'lucide-react'

const plans = [
    {
        name: 'Fast',
        price: 9,
        description: 'Quick generations for exploration',
        credits: 100,
        icon: Zap,
        popular: false,
        features: [
            '100 credits / month',
            'Fast image models (FLUX Dev, Imagen4)',
            'Budget video models (LTX, Longcat)',
            'Up to 5 second videos',
            '1 concurrent generation',
            'Standard queue priority',
        ],
    },
    {
        name: 'Quality',
        price: 29,
        description: 'Professional quality outputs',
        credits: 350,
        icon: Sparkles,
        popular: true,
        features: [
            '350 credits / month',
            'All Fast tier models',
            'Premium image (FLUX Pro Ultra, Ideogram)',
            'Quality video (Kling Standard, Sora 2)',
            'Up to 10 second videos',
            '3 concurrent generations',
            'Priority queue',
            'Generation history (30 days)',
        ],
    },
    {
        name: 'Ultra',
        price: 79,
        description: 'Maximum quality, all models',
        credits: 1000,
        icon: Crown,
        popular: false,
        features: [
            '1000 credits / month',
            'All Quality tier models',
            'Ultra video (Veo3, Kling Master)',
            'Premium effects (Wan Pro, Veo2)',
            'Up to 30 second videos',
            '5 concurrent generations',
            'Fastest queue priority',
            'Generation history (unlimited)',
            'API access',
        ],
    },
]

export default function Pricing() {
    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-6xl px-6">
                <div className="mx-auto max-w-2xl space-y-6 text-center">
                    <h1 className="text-center text-4xl font-semibold lg:text-5xl">Pricing that Scales with You</h1>
                    <p className="text-muted-foreground">
                        Generate stunning images and videos with state-of-the-art AI models.
                        Pay monthly, use credits flexibly across any supported model.
                    </p>
                </div>

                <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-3 [--color-card:var(--color-muted)] *:border-none *:shadow-none dark:[--color-muted:var(--color-zinc-900)]">
                    {plans.map((plan) => {
                        const Icon = plan.icon
                        return (
                            <Card
                                key={plan.name}
                                className={`bg-muted relative flex flex-col ${plan.popular ? '!border !border-solid !border-primary' : ''
                                    }`}
                            >
                                {plan.popular && (
                                    <span className="bg-linear-to-br/increasing absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center rounded-full from-purple-400 to-amber-300 px-3 py-1 text-xs font-medium text-amber-950 ring-1 ring-inset ring-white/20 ring-offset-1 ring-offset-gray-950/5">
                                        Most Popular
                                    </span>
                                )}

                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Icon className="size-5 text-primary" />
                                        <CardTitle className="font-medium">{plan.name}</CardTitle>
                                    </div>
                                    <span className="my-3 block text-2xl font-semibold">
                                        ${plan.price} <span className="text-base font-normal text-muted-foreground">/ month</span>
                                    </span>
                                    <CardDescription className="text-sm">
                                        {plan.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <hr className="border-dashed" />

                                    <ul className="list-outside space-y-3 text-sm">
                                        {plan.features.map((feature, index) => (
                                            <li
                                                key={index}
                                                className="flex items-center gap-2"
                                            >
                                                <Check className="size-3" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>

                                <CardFooter className="mt-auto">
                                    <Button
                                        asChild
                                        variant={plan.popular ? 'default' : 'outline'}
                                        className="w-full"
                                    >
                                        <Link href="/signup">Get Started</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-sm text-muted-foreground">
                        Need more? Credits never expire.{' '}
                        <Link href="/pricing/credits" className="text-primary underline underline-offset-2">
                            Buy additional credits
                        </Link>{' '}
                        anytime.
                    </p>
                </div>
            </div>
        </section>
    )
}