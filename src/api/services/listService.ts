import { backendApi } from '..';

import { ListMapper } from '../mappers/list.mapper';

import { ListDto } from '../dtos/list.dto';

export namespace ListService {
  export const getAll = async() => {
    const { data } = await backendApi.get<readonly ListDto[]>('/list');
    const result = data.map(list => ListMapper.fromDto(list));
    return result;
  };

  export const create = async(list: ListDto) => {
    const { data } = await backendApi.post<ListDto>('/list', list);
    return ListMapper.fromDto(data);
  };

  export const remove = async(id: string) => {
    await backendApi.delete(`/list/${id}`);
  };
}
