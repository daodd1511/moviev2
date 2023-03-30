import { MovieService } from '../movieService';
import { test } from '../a';
jest.mock('axios', () => ({
    get: jest.fn(),
}));

describe('test', () => {
  it('Should return test', () => {
      expect(test()).toEqual('test');
  });
});

describe('Movie service', () => {
    it('Should return movies', async() => {
        const movies = await MovieService.getMovies(1);
        expect(movies).toEqual([]);
    });
});
