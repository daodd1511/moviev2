import { backendApi } from '..';

import { ListMapper } from '../mappers/list.mapper';

import { ListDto } from '../dtos/list.dto';

import { List } from '@/models';

export namespace ListService {
  export const getAll = async() => {
    const { data } = await backendApi.get<readonly ListDto[]>('/list');
    const result = data.map(list => ListMapper.fromDto(list));
    return result;
  };

  export const create = async(list: List) => {
    const listDto = ListMapper.toDto(list);
    const { data } = await backendApi.post<ListDto>('/list', listDto);
    return ListMapper.fromDto(data);
  };

  export const getById = async(id: string) => {
    const { data } = await backendApi.get<ListDto>(`/list/${id}`);
    return ListMapper.fromDto(data);
  };

  export const remove = async(id: string) => {
    await backendApi.delete(`/list/${id}`);
  };

  export const addMovie = async(listId: string, movieId: number) => {
    await backendApi.post(`/list/${listId}/movie/`, { mediaId: movieId });
  };

  export const addTv = async(listId: string, tvId: number) => {
    await backendApi.post(`/list/${listId}/tv/`, { mediaId: tvId });
  };
}
