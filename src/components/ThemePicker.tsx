import { THEMES } from "../constants";
interface ThemePickerProps {
  selected: string | null;
  onSelect: (theme: string | null) => void;
}

export default function ThemePicker({ selected, onSelect }: ThemePickerProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {THEMES.map((theme) => (
        <button
          key={theme.name}
          onClick={() => onSelect(selected === theme.name ? null : theme.name)}
          className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${
            selected === theme.name
              ? "border-brand ring-4 ring-brand/20"
              : "border-transparent hover:border-ink-muted"
          }`}
        >
          <img
            src={theme.image}
            alt={theme.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <span className="absolute bottom-2.5 left-0 right-0 text-white text-sm font-semibold">
            {theme.name}
          </span>
          {selected === theme.name && (
            <span className="absolute top-2 right-2 bg-brand text-brand-dark rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              ✓
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
