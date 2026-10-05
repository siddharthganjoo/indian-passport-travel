import type { Metadata } from 'next';
import { PageHeader, Prose } from '@/components/content/page-header';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'What jugo collects, why, and your rights under India’s Digital Personal Data Protection Act, 2023.',
};

export default function PrivacyPage() {
  return (
    <div className="space-y-12">
      <PageHeader eyebrow={`Last updated ${SITE.lastLegalUpdate}`} title="Privacy policy" lead="Short version: no accounts, no passport details, minimal data." />
      <Prose>
        <section>
          <h2>What we collect</h2>
          <ul>
            <li>
              <strong>Your searches</strong> (departure airport, destination, date, bag choice, which visas you hold) are
              used to show results and are not linked to your identity. They appear in the page address so you can share a
              search.
            </li>
            <li>
              <strong>Technical data</strong> such as IP address and browser type, used briefly to keep the service secure
              and to limit abusive traffic (rate limiting).
            </li>
            <li>
              <strong>Stored in your browser only</strong>: your cookie choice and the documents you tick off in a
              checklist. We can&apos;t see these.
            </li>
            <li>
              <strong>Anonymous usage analytics</strong>, only if you choose “Accept” in the cookie banner.
            </li>
          </ul>
          <p>We do not ask for, collect or store passport numbers, payment details or visa documents.</p>
        </section>

        <section>
          <h2>Partners</h2>
          <p>
            When you click through to book a flight you leave jugo for the partner&apos;s website, and their privacy policy
            applies there. Links may carry a referral code so the partner knows you came from jugo. We use service providers
            for hosting, databases, caching and exchange rates; they process data only to run the service.
          </p>
        </section>

        <section>
          <h2>Your rights</h2>
          <p>
            Under India&apos;s Digital Personal Data Protection Act, 2023 you can ask what personal data we hold about you,
            ask us to correct or erase it, and withdraw consent (for analytics, use the cookie banner or clear your
            browser&apos;s site data).
          </p>
        </section>

        {SITE.supportEmail && (
          <section>
            <h2>Contact</h2>
            <p>
              Privacy questions and requests: <a href={`mailto:${SITE.supportEmail}?subject=Privacy`}>{SITE.supportEmail}</a>.
              Data controller: {SITE.legalName}.
            </p>
          </section>
        )}
      </Prose>
    </div>
  );
}
