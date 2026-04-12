import { TruncateWordsPipe } from './truncate-words.pipe';

describe('TruncateWordsPipePipe', () => {
  it('create an instance', () => {
    const pipe = new TruncateWordsPipe();
    expect(pipe).toBeTruthy();
  });
});
