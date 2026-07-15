import Image from "next/image";
import {
  footerCompanyLinks,
  footerContactEmail,
  footerEcosystemLinks,
  footerSocialLinks,
} from "@/config/footer";
import { siteConfig } from "@/config/site";
import { FooterNewsletterForm } from "@/components/layout/footer-newsletter-form";
import { FooterSocialIcon } from "@/components/layout/footer-social-icon";

function FooterLinkArrow() {
  return (
    <svg
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function FooterColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="nm-footer-column-title">
      <span className="relative z-10">{children}</span>
      <div className="nm-footer-column-underline" aria-hidden />
    </h3>
  );
}

function FooterLinkList({
  links,
}: {
  links: ReadonlyArray<{ label: string; href: string }>;
}) {
  return (
    <ul className="space-y-3">
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-2 py-1 text-sm text-gray-400 transition-all duration-300 hover:text-[var(--violet-light)] sm:justify-start sm:text-base"
          >
            <FooterLinkArrow />
            <span>{link.label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function Footer() {
  return (
    <footer className="nm-footer">
      <div className="nm-container">
        <div className="grid grid-cols-1 gap-8 text-center sm:gap-12 sm:text-left md:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="mx-auto mb-4 w-fit sm:mx-0">
              <Image
                src="/images/nodemeta.png"
                alt="NodeMeta"
                width={80}
                height={80}
                className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20"
              />
            </div>

            <div className="group mb-6 text-[19px] font-bold tracking-wide text-white">
              <span className="inline-block transition-transform duration-300 group-hover:scale-105">
                NODE<span className="brand-meta-text">META</span>
              </span>
            </div>

            <p className="mb-6 text-sm leading-relaxed text-gray-400 sm:text-base">
              {siteConfig.companyDescription}
            </p>

            <a
              href={`mailto:${footerContactEmail}`}
              className="group inline-flex items-center justify-center gap-3 text-gray-400 transition-colors duration-300 hover:text-[var(--violet-light)] sm:justify-start"
            >
              <span className="text-[var(--violet)] transition-transform duration-300 group-hover:scale-110">
                <svg
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  height="16"
                  width="16"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <span className="text-sm">{footerContactEmail}</span>
            </a>
          </div>

          <div className="space-y-6">
            <FooterColumnTitle>Ecosystem</FooterColumnTitle>
            <FooterLinkList links={footerEcosystemLinks} />
          </div>

          <div className="space-y-6">
            <FooterColumnTitle>Company</FooterColumnTitle>
            <FooterLinkList links={footerCompanyLinks} />
          </div>

          <div className="space-y-6">
            <FooterColumnTitle>Stay Updated</FooterColumnTitle>
            <p className="mb-6 text-sm text-gray-400 sm:text-base">
              Subscribe to our newsletter for the latest updates and exclusive insights.
            </p>
            <FooterNewsletterForm />

            <div className="border-t border-gray-800/50 pt-4">
              <h4 className="mb-4 text-sm font-semibold text-white">Follow Us</h4>
              <div className="grid grid-cols-4 justify-items-center gap-3 sm:justify-items-start">
                {footerSocialLinks.map((social) => (
                  <a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="nm-footer-social-btn group"
                  >
                    <span className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                      <FooterSocialIcon icon={social.icon} />
                    </span>
                    <div className="nm-footer-social-btn-hover" aria-hidden />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="nm-footer-bottom">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>© 2026 NodeMeta. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Made with</span>
            <svg
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 animate-pulse text-red-500"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>
              by the <span className="text-[var(--violet-light)]">Node-Meta IT team</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
