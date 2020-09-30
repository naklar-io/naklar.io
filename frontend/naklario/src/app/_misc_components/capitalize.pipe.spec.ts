import { CapitalizePipe } from './capitalize.pipe';

describe('CapitalizePipe', () => {
  it('create an instance', () => {
    const pipe = new CapitalizePipe();
    expect(pipe).toBeTruthy();
  });
  it('capitalizes the first letter', () => {
    const pipe = new CapitalizePipe();
    expect(pipe.transform('email')).toEqual('Email');
  });
});
