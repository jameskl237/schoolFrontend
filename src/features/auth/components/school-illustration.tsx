export function SchoolIllustration() {
  return (
    <svg
      viewBox="0 0 480 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-auto w-full max-w-md"
      aria-hidden="true"
    >
      {/* soft ground shadow */}
      <ellipse cx="240" cy="360" rx="150" ry="18" fill="black" opacity="0.18" />

      {/* sparkles */}
      <g fill="var(--highlight)">
        <path d="M96 96 L104 116 L124 124 L104 132 L96 152 L88 132 L68 124 L88 116 Z" opacity="0.9" />
        <path d="M388 132 L393 145 L406 150 L393 155 L388 168 L383 155 L370 150 L383 145 Z" opacity="0.75" />
        <path d="M356 300 L361 313 L374 318 L361 323 L356 336 L351 323 L338 318 L351 313 Z" opacity="0.65" />
      </g>

      {/* open book — flat cream shape on the brand panel, no outline needed for contrast */}
      <path
        d="M240 236 C196 202 140 198 100 214 L100 108 C140 92 196 96 240 130 Z"
        fill="var(--brand-panel-foreground)"
      />
      <path
        d="M240 236 C284 202 340 198 380 214 L380 108 C340 92 284 96 240 130 Z"
        fill="var(--brand-panel-foreground)"
      />
      <path d="M240 130 L240 236" stroke="var(--brand-panel)" strokeWidth="4" strokeLinecap="round" />
      <path
        d="M114 132 C148 120 188 122 222 148 M114 158 C148 146 188 148 222 174 M114 184 C148 172 188 174 222 200"
        stroke="var(--brand-panel)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.35"
      />
      <path
        d="M366 132 C332 120 292 122 258 148 M366 158 C332 146 292 148 258 174 M366 184 C332 172 292 174 258 200"
        stroke="var(--brand-panel)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.35"
      />

      {/* graduation cap */}
      <path d="M240 40 L340 78 L240 116 L140 78 Z" fill="var(--brand-panel-foreground)" />
      <path
        d="M200 94 L200 122 C200 136 216 148 240 148 C264 148 280 136 280 122 L280 94"
        fill="none"
        stroke="var(--brand-panel-foreground)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M340 78 L340 108" stroke="var(--highlight)" strokeWidth="4" strokeLinecap="round" />
      <circle cx="340" cy="114" r="6" fill="var(--highlight)" />
    </svg>
  )
}
