/**
 * BirthdayDecorGallery — Gallery of all Birthday Moments assets.
 *
 * Displays storybook, photo frames, gifts, balloons, flowers, and hearts
 * using SVG assets from public/assets/. Images are lazy-loaded where appropriate.
 */
export function BirthdayDecorGallery() {
  const assets = [
    {
      category: 'Storybook',
      src: '/assets/storybook/storybook-open.svg',
      alt: 'Open storybook with castle illustration',
      description: 'A magical storybook for birthday tales and memories.',
    },
    {
      category: 'Photo Frame',
      src: '/assets/photos/polaroid-frame.svg',
      alt: 'Polaroid photo frame',
      description: 'Frame your favorite birthday moments.',
      lazy: true,
    },
    {
      category: 'Gift',
      src: '/assets/gifts/gift-box.svg',
      alt: 'Purple gift box with coral ribbon',
      description: 'A beautifully wrapped birthday present.',
    },
    {
      category: 'Balloons',
      src: '/assets/balloons/balloon-bunch.svg',
      alt: 'Colorful balloon bunch',
      description: 'Festive balloons for celebration.',
      lazy: true,
    },
    {
      category: 'Flowers',
      src: '/assets/flowers/bouquet.svg',
      alt: 'Pink and purple flower bouquet',
      description: 'A fresh bouquet for the birthday star.',
      lazy: true,
    },
    {
      category: 'Hearts',
      src: '/assets/hearts/floating-hearts.svg',
      alt: 'Floating hearts in pink and purple',
      description: 'Love and affection for the celebration.',
      lazy: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {assets.map((asset) => (
        <div
          key={asset.category}
          className="clay-card-static p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] group hover:border-[var(--color-coral)]/50 transition-all"
        >
          <div className="aspect-[1] mb-3 flex items-center justify-center bg-[var(--color-surface-lavender)]/30 rounded-lg overflow-hidden">
            <img
              src={asset.src}
              alt={asset.alt}
              className="w-full h-full object-contain p-2 opacity-100 group-hover:opacity-100 transition-opacity"
              loading={asset.lazy ? 'lazy' : 'eager'}
              decoding="async"
            />
          </div>
          <h3 className="font-bold text-sm text-[var(--color-text-primary)] mb-1">{asset.category}</h3>
          <p className="text-xs text-[var(--color-text-secondary)]">{asset.description}</p>
        </div>
      ))}
    </div>
  );
}