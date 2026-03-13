import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/">
            Get Started →
          </Link>
        </div>
      </div>
    </header>
  );
}

const features = [
  {
    title: '📄 OCR',
    description: 'Extract information from identity documents – CCCD, Passport.',
  },
  {
    title: '🧬 Liveness Detection',
    description: 'Verify a selfie is from a real person with anti-spoofing technology.',
  },
  {
    title: '🔍 Face Match',
    description: 'Compare a selfie with a document photo for identity verification.',
  },
  {
    title: '📹 Video eKYC',
    description: 'Real-time video sessions with React components for remote verification.',
  },
  {
    title: '🔧 TypeScript',
    description: 'Full TypeScript support with complete type declarations. No @types needed.',
  },
  {
    title: '🌐 i18n',
    description: 'Vietnamese and English out of the box. Custom locale support.',
  },
];

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md" style={{ padding: '1rem' }}>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function Home(): React.JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title="Home" description={siteConfig.tagline}>
      <HomepageHeader />
      <main>
        <section style={{ padding: '2rem 0' }}>
          <div className="container">
            <div className="row">
              {features.map((props, idx) => (
                <Feature key={idx} {...props} />
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '2rem 0', background: 'var(--ifm-background-surface-color)' }}>
          <div className="container">
            <div className="text--center">
              <Heading as="h2">Quick Install</Heading>
              <pre style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                borderRadius: '8px',
                fontSize: '1.1rem',
              }}>
                npm install ermis-ekyc-sdk ermis-ekyc-react
              </pre>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
