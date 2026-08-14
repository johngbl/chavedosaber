type IconProps = {
	className?: string;
};

const strokeProps = {
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round",
} as const;

export function IconWhatsapp({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
			<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
		</svg>
	);
}

export function IconInstagram({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...strokeProps}>
			<rect x="3" y="3" width="18" height="18" rx="5" />
			<circle cx="12" cy="12" r="4" />
			<line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
		</svg>
	);
}

export function IconFacebook({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
			<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
		</svg>
	);
}

export function IconMapPin({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...strokeProps}>
			<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
			<circle cx="12" cy="10" r="3" />
		</svg>
	);
}

export function IconPhone({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...strokeProps}>
			<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
		</svg>
	);
}

export function IconMail({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...strokeProps}>
			<rect x="2" y="4" width="20" height="16" rx="2" />
			<path d="m22 6-10 7L2 6" />
		</svg>
	);
}

export function IconKey({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...strokeProps}>
			<circle cx="8" cy="16" r="4" />
			<path d="M10.8 13.2 20 4" />
			<path d="M17 4h3v3" />
			<path d="m15 9 2 2" />
		</svg>
	);
}

export function IconBook({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...strokeProps}>
			<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
			<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
		</svg>
	);
}

export function IconSnow({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...strokeProps}>
			<path d="M12 2v20" />
			<path d="m4.9 4.9 14.2 14.2" />
			<path d="m19.1 4.9-14.2 14.2" />
			<path d="M2 12h20" />
		</svg>
	);
}

export function IconWifi({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...strokeProps}>
			<path d="M5 12.55a11 11 0 0 1 14.08 0" />
			<path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
			<path d="M12 20h.01" />
		</svg>
	);
}

export function IconAccess({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...strokeProps}>
			<circle cx="12" cy="4.5" r="2" />
			<path d="M5 9.5c4.5 1 9.5 1 14 0" />
			<path d="M12 10v5" />
			<path d="m9.5 20.5 2.5-5.5 2.5 5.5" />
		</svg>
	);
}

export function IconUsers({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...strokeProps}>
			<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
			<circle cx="9" cy="7" r="4" />
			<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
			<path d="M16 3.13a4 4 0 0 1 0 7.75" />
		</svg>
	);
}

export function IconUmbrella({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...strokeProps}>
			<path d="M12 2a10 10 0 0 1 10 10H2A10 10 0 0 1 12 2Z" />
			<path d="M12 12v7a2 2 0 0 0 4 0" />
		</svg>
	);
}

export function IconArrowDown({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...strokeProps}>
			<path d="M12 5v14" />
			<path d="m19 12-7 7-7-7" />
		</svg>
	);
}

export function IconSparkle({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
			<path d="m12 3 1.9 5.8L20 12l-6.1 3.2L12 21l-1.9-5.8L4 12l6.1-3.2Z" />
		</svg>
	);
}

export function IconHeart({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...strokeProps}>
			<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
		</svg>
	);
}

export function IconShapes({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...strokeProps}>
			<rect x="3" y="14" width="7" height="7" rx="1" />
			<circle cx="16.5" cy="6.5" r="3.5" />
			<path d="m17 14 4 7h-8z" />
		</svg>
	);
}

export function IconCheck({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...strokeProps}>
			<path d="m5 12 5 5L20 7" />
		</svg>
	);
}
