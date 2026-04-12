import { FileToUrlPipe } from './file-to-url.pipe';

describe('FileToUrlPipe', () => {
  let pipe: FileToUrlPipe;

  beforeEach(() => {
    pipe = new FileToUrlPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return an object URL when a valid File is provided', () => {
    // mock
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    const result = pipe.transform(mockFile);
    
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result).toContain('blob:');
  });

  it('should return empty string when file is null', () => {
    const result = pipe.transform(null);
    
    expect(result).toBe('');
    expect(typeof result).toBe('string');
  });

  it('should return empty string when file is undefined', () => {
    const result = pipe.transform(undefined as any);
    
    expect(result).toBe('');
  });

  it('should generate different URLs for different files', () => {
    const mockFile1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
    const mockFile2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });
    
    const result1 = pipe.transform(mockFile1);
    const result2 = pipe.transform(mockFile2);
    
    expect(result1).not.toBe(result2);
  });

  it('should generate a valid blob URL that starts with "blob:"', () => {
    const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    const result = pipe.transform(mockFile);
    
    expect(result).toMatch(/^blob:/);
  });

  it('should handle empty file', () => {
    const mockFile = new File([], 'empty.txt', { type: 'text/plain' });
    
    const result = pipe.transform(mockFile);
    
    expect(result).toBeTruthy();
    expect(result).toContain('blob:');
  });

  it('should handle file with special characters in name', () => {
    const mockFile = new File(['content'], 'file-name_with_special@chars.txt', { type: 'text/plain' });
    
    const result = pipe.transform(mockFile);
    
    expect(result).toBeTruthy();
    expect(result).toContain('blob:');
  });

  it('should handle large file', () => {
    // file (1MB)
    const largeContent = 'x'.repeat(1024 * 1024);
    const mockFile = new File([largeContent], 'large.txt', { type: 'text/plain' });
    
    const result = pipe.transform(mockFile);
    
    expect(result).toBeTruthy();
    expect(result).toContain('blob:');
  });
});