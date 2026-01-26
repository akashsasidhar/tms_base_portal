'use client';

import Link from 'next/link';
import appConfig from '@/config/app.config';
import { getCurrentYear } from '@/utils/date.util';

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30 shrink-0">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-2.5 text-xs text-muted-foreground min-h-[3.5rem] sm:min-h-[2.5rem]">
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
          © {getCurrentYear()} {appConfig.APP_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
