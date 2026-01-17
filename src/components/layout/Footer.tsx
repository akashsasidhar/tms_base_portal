'use client';

import Link from 'next/link';
import appConfig from '@/config/app.config';

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-2.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <Link 
            href="/privacy" 
            className="hover:text-foreground transition-colors"
          >
            Privacy
          </Link>
          <span className="text-muted-foreground/50">•</span>
          <Link 
            href="/terms" 
            className="hover:text-foreground transition-colors"
          >
            Terms
          </Link>
          <span className="text-muted-foreground/50">•</span>
          <Link 
            href="/support" 
            className="hover:text-foreground transition-colors"
          >
            Support
          </Link>
        </div>
        <div className="text-xs">
          © {new Date().getFullYear()} {appConfig.APP_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
