import { backendApi } from '..';

import { ListMapper } from '../mappers/list.mapper';

import { ListDto } from '../dtos/list.dto';

import { List, Media } from '@/models';

export namespace ListService {
  export const getAll = async() => {
    const { data } = await backendApi.get<readonly ListDto[]>('/list');
    const result = data.map(list => ListMapper.fromDto(list));
    return result;
  };

  export const create = async(list: List) => {
    const dto = ListMapper.toDto(list);
    const { data } = await backendApi.post<ListDto>('/list', dto);
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

  export const removeMovie = async(listId: string, movie: Media) => {
    await backendApi.delete(`/list/${listId}/movie/`, { data: { ...movie } });
  };

  export const removeTv = async(listId: string, tv: Media) => {
    await backendApi.delete(`/list/${listId}/tv/`, { data: { ...tv } });
  };

  export const update = async(list: List) => {
    const dto = ListMapper.toDto(list);
    const { data } = await backendApi.put<ListDto>(`/list/${list.id}`, dto);
    return ListMapper.fromDto(data);
  };

  export const getPublicList = async(username: string, listId: string) => {
    // Change Api endpoint in future
    const { data } = await backendApi.get<ListDto>(`/user/list/${username}/${listId}`);
    return ListMapper.fromDto(data);
  };
}
