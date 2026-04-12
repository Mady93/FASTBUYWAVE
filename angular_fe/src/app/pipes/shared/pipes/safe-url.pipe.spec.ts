import { SafeUrlPipe } from './safe-url.pipe';
import { DomSanitizer } from '@angular/platform-browser';

class MockDomSanitizer implements DomSanitizer {
  sanitize(context: any, value: any): string | null {
    return value ? String(value) : null;
  }
  bypassSecurityTrustHtml(value: string): any { return value; }
  bypassSecurityTrustStyle(value: string): any { return value; }
  bypassSecurityTrustScript(value: string): any { return value; }
  bypassSecurityTrustUrl(value: string): any { return value; }
  bypassSecurityTrustResourceUrl(value: string): any { return value; }
}

describe('SafeUrlPipe', () => {
  let pipe: SafeUrlPipe;

  beforeEach(() => {
    const mockSanitizer = new MockDomSanitizer() as DomSanitizer;
    pipe = new SafeUrlPipe(mockSanitizer);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return safe url when valid url is provided', () => {
    const url = 'https://example.com/image.jpg';
    expect(pipe.transform(url)).toBe(url);
  });

  it('should handle empty string', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('should handle blob url', () => {
    const url = 'blob:http://example.com/1234';
    expect(pipe.transform(url)).toBe(url);
  });

  it('should handle data url', () => {
    const url = 'data:image/png;base64,abc123';
    expect(pipe.transform(url)).toBe(url);
  });
});