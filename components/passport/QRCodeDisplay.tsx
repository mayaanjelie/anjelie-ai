'use client';

import { QRCodeSVG } from 'qrcode.react';
import { InlineStack, Button, Text, BlockStack } from '@shopify/polaris';

type Props = {
  slug: string;
  size?: number;
};

export default function QRCodeDisplay({ slug, size = 160 }: Props) {
  const passportUrl = `${process.env.NEXT_PUBLIC_HOST}/passport/${slug}`;

  const handleDownload = () => {
    const svg = document.getElementById('passport-qr-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = size * 2;
    canvas.height = size * 2;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      const a = document.createElement('a');
      a.download = `passport-${slug}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <BlockStack gap="300">
      <div style={{ display: 'inline-block', padding: 16, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12 }}>
        <QRCodeSVG
          id="passport-qr-svg"
          value={passportUrl}
          size={size}
          fgColor="#0f172a"
          bgColor="#ffffff"
          level="M"
          includeMargin={false}
        />
      </div>
      <InlineStack gap="200">
        <Button onClick={handleDownload} size="slim">
          Download QR PNG
        </Button>
        <Button
          url={passportUrl}
          external
          size="slim"
          variant="plain"
        >
          View Public Passport →
        </Button>
      </InlineStack>
      <Text as="p" tone="subdued" variant="bodySm" breakWord>
        {passportUrl}
      </Text>
    </BlockStack>
  );
}
