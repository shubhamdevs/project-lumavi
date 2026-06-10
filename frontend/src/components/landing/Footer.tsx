export function Footer() {
  return (
    <footer className="bg-surface-container-lowest dark:bg-inverse-surface w-full py-unit-12 border-t border-outline-variant/20">
      <div className="flex flex-col md:flex-row justify-between items-center px-gutter max-w-container-max mx-auto gap-6">
        <div className="font-headline-h2 text-headline-h2 text-primary">
          Lumavi
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-on-surface-variant font-body-sm text-body-sm">
          <a className="hover:text-primary underline transition-all opacity-80 hover:opacity-100" href="#">Privacy Policy</a>
          <a className="hover:text-primary underline transition-all opacity-80 hover:opacity-100" href="#">Terms of Service</a>
          <a className="hover:text-primary underline transition-all opacity-80 hover:opacity-100" href="#">Cookie Policy</a>
        </div>
        <div className="text-secondary dark:text-secondary-fixed font-body-sm text-body-sm">
          © {new Date().getFullYear()} Lumavi AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
