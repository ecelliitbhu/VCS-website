/**
 * VC Scout ambient backdrop (styles live in globals.css under "Ambient background").
 * Rising ember/crimson aurora, a radially-masked dot grid, faint radar contours
 * and film grain. Fixed behind every page, compositor-only animation, and
 * frozen under prefers-reduced-motion.
 */
export default function ScoutBackground() {
  return (
    <div className="scout-bg" aria-hidden="true">
      <div className="scout-bg__aurora scout-bg__aurora--c" />
      <div className="scout-bg__aurora scout-bg__aurora--a" />
      <div className="scout-bg__aurora scout-bg__aurora--b" />
      <div className="scout-bg__contours" />
      <div className="scout-bg__dots" />
      <div className="scout-bg__grain" />
    </div>
  );
}
