/** Top Navigation for the BirthdayWish creator */
import { ROUTES } from '@/utils/routes';

export function TopNav() {
  return (
    <header className="top-nav" role="banner">
      <div className="top-nav-inner">
        <a href={ROUTES.HOME} className="top-nav-brand" aria-label="BirthdayWish home">
          <span className="brand-mark" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 3c0 4.7 3.6 8.3 8.3 8.3v1.4C15.6 12.7 12 16.3 12 21c0-4.7-3.6-8.3-8.3-8.3v-1.4C8.4 11.3 12 7.7 12 3z" />
              <path d="M19.2 3.2c0 1.5-.6 2.1-2.1 2.1 1.5 0 2.1.6 2.1 2.1 0-1.5.6-2.1 2.1-2.1-1.5 0-2.1-.6-2.1-2.1z" />
            </svg>
          </span>
          <span className="top-nav-title">
            BirthdayWish<span style={{ color: 'var(--color-gold)' }}>.</span>
          </span>
        </a>
        <nav className="top-nav-links" aria-label="Main navigation">
          <a href={ROUTES.HOME} className="top-nav-link">Explore</a>
          <a href={ROUTES.DASHBOARD} className="top-nav-link">My gifts</a>
          <a href={ROUTES.HOW_IT_WORKS} className="top-nav-link">How it works</a>
        </nav>
        <button type="button" className="top-nav-save" aria-label="Save draft">Save draft</button>
      </div>
    </header>
  );
}
