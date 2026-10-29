import { Link, useParams } from 'react-router-dom';
import { storeInfo } from '@/app/config/store';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { PageHeading } from '@/components/ui/PageHeading';
import { policies } from '../content';
import { isPolicySlug, policyPath, policySlugs, policyTitles } from '../links';

export default function PolicyPage() {
  const { slug = '' } = useParams();
  if (!isPolicySlug(slug)) {
    return (
      <ErrorState
        title="Page not found"
        message="We couldn't find that policy."
        action={<ButtonLink to="/contact">Contact us</ButtonLink>}
      />
    );
  }

  const policy = policies[slug];

  return (
    <div className="container pt-8 sm:pt-10">
      <div className="grid gap-10 lg:grid-cols-[1fr_240px] lg:gap-16">
        <article className="max-w-3xl">
          <PageHeading description={`Last updated ${storeInfo.policiesLastUpdated}`}>
            {policy.title}
          </PageHeading>
          <p className="mb-8 text-lg text-graphite">{policy.summary}</p>

          <div className="space-y-8">
            {policy.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="mb-2 text-lg font-semibold text-ink">{section.heading}</h2>
                <div className="space-y-3 leading-relaxed text-graphite">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-10 border-t border-line pt-6 text-sm text-graphite">
            Questions about this policy?{' '}
            <Link
              to="/contact"
              className="font-medium text-ink underline decoration-brand-400 decoration-2 underline-offset-4"
            >
              Contact us
            </Link>
            .
          </p>
        </article>

        <nav aria-labelledby="other-policies" className="lg:pt-16">
          <h2 id="other-policies" className="mb-3 text-sm font-semibold text-ink">
            Policies
          </h2>
          <ul className="space-y-2 text-sm">
            {policySlugs.map((otherSlug) => (
              <li key={otherSlug}>
                <Link
                  to={policyPath(otherSlug)}
                  aria-current={otherSlug === slug ? 'page' : undefined}
                  className={
                    otherSlug === slug
                      ? 'font-semibold text-ink'
                      : 'text-graphite decoration-brand-400 decoration-2 underline-offset-4 hover:underline'
                  }
                >
                  {policyTitles[otherSlug]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
