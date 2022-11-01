import { addNoCacheInterceptMiddleware, getMaptilerEpsg4326Paths } from 'cypress/support/tiles';
import { canvasToArrayBuffer, createCanvasContext, fetchImage } from 'src/util/dom';

describe('createCanvasContext', () => {
  it('should return canvas context', () => {
    const width = 200;
    const height = 400;
    const ctx = createCanvasContext(width, height);
    expect(ctx).to.be.instanceOf(CanvasRenderingContext2D);
    expect(ctx.canvas).to.be.instanceOf(HTMLCanvasElement);
    expect(ctx.canvas.width).to.equals(width);
    expect(ctx.canvas.height).to.equals(height);
  })
});

describe('canvasToArrayBuffer', () => {
  let ctx: CanvasRenderingContext2D; 
  beforeEach(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
    const _ctx = canvas.getContext('2d');
    if (!_ctx) throw new Error('Failed to create canvas context 2d');
    _ctx.fillRect(0, 0, 1, 1);
    ctx = _ctx;
  });

  it('should convert canvas to array buffer', () => {
    cy.wrap(null).then(async () => {
      const output = await canvasToArrayBuffer(ctx.canvas);
      expect(output).to.be.instanceOf(ArrayBuffer);
      const arry = output ? Array.from(new Uint8Array(output).values()) : [];
      expect(arry).to.deep.equal([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 2, 0, 0, 0, 2, 8, 6, 0, 0, 0, 114, 182, 13, 36, 0, 0, 0, 1, 115, 82, 71, 66, 0, 174, 206, 28, 233, 0, 0, 0, 20, 73, 68, 65, 84, 24, 87, 99, 100, 96, 96, 248, 207, 192, 192, 192, 200, 200, 0, 5, 0, 14, 41, 1, 3, 248, 47, 158, 120, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]);
    });
  });
});

describe('fetchImage', () => {
  beforeEach(() => {
    addNoCacheInterceptMiddleware();
  })

  it('should resolve to html image', () => {
    const { url, fixture } = getMaptilerEpsg4326Paths([0, 0, 1]);

    cy.intercept(url, { fixture });

    cy.wrap(null).then(async () => {
      const image = await fetchImage(url);

      expect(image).to.be.instanceOf(HTMLImageElement);
      expect(image.width).to.equal(256);
      expect(image.height).to.equal(256);
    });
  });

  it('should reject when no content', () => {
    const { url } = getMaptilerEpsg4326Paths([0, 0, 1]);

    cy.intercept(url, { statusCode: 204 });

    cy.wrap(null).then(async () => {
      try {
        const image = await fetchImage(url);
        throw new Error('Should have thrown encoding error');
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect((error as any).name).to.equal('EncodingError')
        expect((error as any).message).to.equal('The source image cannot be decoded.')
      }
    });
  });

  it('should reject when not found', async () => {
    const { url } = getMaptilerEpsg4326Paths([0, 0, 1]);

    cy.intercept(url, { statusCode: 404 });

    cy.wrap(null).then(async () => {
      try {
        const image = await fetchImage(url);
        throw new Error('Should have thrown encoding error');
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect((error as any).name).to.equal('EncodingError')
        expect((error as any).message).to.equal('The source image cannot be decoded.')
      }
    });
  });
});