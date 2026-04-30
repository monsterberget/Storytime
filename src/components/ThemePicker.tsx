const THEMES = [
  {
    name: "Dragons",
    image:
      "https://fbbjurouxohpzyyypfwx.supabase.co/storage/v1/object/public/theme-images/dragons.png",
  },
  {
    name: "Space",
    image:
      "https://fbbjurouxohpzyyypfwx.supabase.co/storage/v1/object/public/theme-images/space.png",
  },
  {
    name: "Friendship",
    image:
      "https://fbbjurouxohpzyyypfwx.supabase.co/storage/v1/object/public/theme-images/friendship.png",
  },
  {
    name: "Animals",
    image:
      "https://fbbjurouxohpzyyypfwx.supabase.co/storage/v1/object/public/theme-images/animals.png",
  },
  {
    name: "Magic",
    image:
      "https://fbbjurouxohpzyyypfwx.supabase.co/storage/v1/object/public/theme-images/magic.png",
  },
  {
    name: "Ocean",
    image:
      "https://fbbjurouxohpzyyypfwx.supabase.co/storage/v1/object/public/theme-images/ocean.png",
  },
  {
    name: "Dinosaurs",
    image:
      "https://fbbjurouxohpzyyypfwx.supabase.co/storage/v1/object/public/theme-images/dinosaurs.png",
  },
  {
    name: "Superheroes",
    image:
      "https://fbbjurouxohpzyyypfwx.supabase.co/storage/v1/object/public/theme-images/superheroes.png",
  },
];

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
          className={`relative aspect-4/3 rounded-xl overflow-hidden border-2 transition-all ${
            selected === theme.name
              ? "border-emerald-500 ring-4 ring-emerald-500/20"
              : "border-transparent hover:border-zinc-600"
          }`}
        >
          <img
            src={theme.image}
            alt={theme.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
          <span className="absolute bottom-2.5 left-0 right-0 text-white text-sm font-semibold">
            {theme.name}
          </span>
          {selected === theme.name && (
            <span className="absolute top-2 right-2 bg-emerald-500 text-zinc-950 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              ✓
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
