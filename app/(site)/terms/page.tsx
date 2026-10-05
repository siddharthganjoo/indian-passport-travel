import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader, Prose } from '@/components/content/page-header';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Terms of use',
  description: 'The terms for using jugo, including how visa information and flight prices should be relied on.',
};

export default function TermsPage() {
  return (
    <div className="space-y-12">
      <PageHeader eyebrow={`Last updated ${SITE.lastLegalUpdate}`} title="Terms of use" />
      <Prose>
        <section>
          <h2>What jugo is</h2>
          <p>
            jugo is an information and search service. We are not an airline, travel agent or visa agency, and we don&apos;t
            sell tickets or visas. Bookings are made with the partner you choose, under their terms.
          </p>
        </section>

        <section>
          <h2>Visa information</h2>
          <p>
            Visa and transit rules are set by governments and can change without notice. We show when each rule was last
            checked and link to the official source (see <Link href="/how-we-verify">how we verify</Link>). Entry is always
            at the discretion of immigration officers and airlines. You are responsible for confirming requirements with the
            official source before you book and travel.
          </p>
        </section>

        <section>
          <h2>Prices and routes</h2>
          <p>
            Fares come from partners and may be cached; the price on the booking site is final. Bag fees, visa fees and
            layover costs are estimates. Self-transfer routes use separate tickets: if one flight is delayed or cancelled,
            the other airline is not obliged to help, and missed connections are at your own risk.
          </p>
        </section>

        <section>
          <h2>Affiliate links</h2>
          <p>
            Some links to booking partners are affiliate links; we may earn a commission at no extra cost to you. This does
            not affect how routes are ranked.
          </p>
        </section>

        <section>
          <h2>Liability</h2>
          <p>
            jugo is provided “as is”. To the extent permitted by law, we are not liable for losses arising from reliance on
            the information shown, denied boarding or entry, missed connections, or partner services. Nothing in these terms
            limits rights you have under Indian consumer law.
          </p>
        </section>

        <section>
          <h2>Governing law</h2>
          <p>These terms are governed by the laws of India.</p>
          {SITE.supportEmail && (
            <p>
              Questions: <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>
            </p>
          )}
        </section>
      </Prose>
    </div>
  );
}
