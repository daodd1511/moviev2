import { api } from '..';

export namespace MovieService {
  export const getMovies = async() => {
    const response = await api.get('/discover/movie');
    return response.data;
  };
}
