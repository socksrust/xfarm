const title = 'woofer';
const description =
  'woofer next DEFI generation';

const SEO = {
  title,
  description,
  canonical: 'https://woofer.vercel.app/',
  openGraph: {
    type: 'website',
    locale: 'en_IE',
    url: 'https://woofer.vercel.app/',
    title,
    description,
    images: [
      {
        url: 'https://i.imgur.com/pKfinE6.png',
        alt: title,
        width: 1440,
        height: 926,
      },
    ],
  },
};

export default SEO;
