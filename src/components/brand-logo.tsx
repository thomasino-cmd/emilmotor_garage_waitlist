'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type Props = {
    brand: string;
    className?: string;
};

function slugify(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

export function BrandLogo({ brand, className = '' }: Props) {
    const [hasError, setHasError] = useState(false);

    if (!brand) return null;

    const slug = slugify(brand);

    if (hasError) {
        // Generic logo fallback (First letter in a stylish circle)
        return (
            <svg viewBox="0 0 60 60" className={className}>
                <circle cx="30" cy="30" r="28" fill="#1e293b" />
                <text x="50%" y="54%" fill="#fff" fontSize="28" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
                    {brand.charAt(0).toUpperCase()}
                </text>
            </svg>
        );
    }

    return (
        <div className={cn("relative", className)}>
            <Image
                src={`/assets/logos/${slug}.png`}
                alt={`${brand} logo`}
                fill
                className="object-contain"
                onError={() => setHasError(true)}
            />
        </div>
    );
}
