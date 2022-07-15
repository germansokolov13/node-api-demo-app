import * as sharp from 'sharp';

const LIGHTS_FROM = 175;
const SHADOWS_FROM = 125;

const LIGHTS_TINT = { r: 91, g: 156, b: 181 };
const MIDS_TINT = { r: 167, g: 91, b: 181 };
const SHADOWS_TINT = { r: 249, g: 255, b: 46 };

const MAX_WIDTH = 2000;
const MAX_HEIGHT = 400;

export async function repaintImage(input: Buffer): Promise<Buffer> {
  const grayscale = await sharp(input)
    .grayscale()
    .resize(MAX_WIDTH, MAX_HEIGHT, {
      withoutEnlargement: true,
      fit: sharp.fit.inside,
    })
    .toBuffer();

  const [aboveShadows, aboveLights] = await Promise.all([
    sharp(grayscale).threshold(SHADOWS_FROM).toBuffer(),
    sharp(grayscale).threshold(LIGHTS_FROM).toBuffer(),
  ]);

  const [belowShadows, belowLights] = await Promise.all([
    sharp(aboveShadows).negate().toBuffer(),
    sharp(aboveLights).negate().toBuffer(),
  ]);

  const lightsPromise = sharp(grayscale).clone()
    .composite([
      {
        input: aboveLights,
        blend: 'multiply',
      },
    ])
    .tint(LIGHTS_TINT)
    .toBuffer();

  const midsPromise = sharp(grayscale).clone()
    .composite([
      {
        input: aboveLights,
        blend: 'multiply',
      },
      {
        input: belowShadows,
        blend: 'multiply',
      },
    ])
    .tint(MIDS_TINT)
    .toBuffer();

  const shadowsPromise = sharp(grayscale).clone()
    .composite([
      {
        input: belowLights,
        blend: 'multiply',
      },
    ])
    .tint(SHADOWS_TINT)
    .toBuffer();

  const [lights, mids, shadows] = await Promise.all([lightsPromise, midsPromise, shadowsPromise]);

  return sharp(lights)
    .composite([
      {
        input: shadows,
        blend: 'add',
      },
      {
        input: mids,
        blend: 'add',
      },
    ])
    .toBuffer();
}
