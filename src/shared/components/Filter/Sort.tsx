import { SORT_OPTIONS } from '@/shared/constants/sort';

export const Sort = () => (
  <>
    <label className="label">Sort</label>
    <select className="select select-bordered">
      {SORT_OPTIONS.map(option => (
        <option key={option.value} value={option.value}>{option.display}</option>
      ))}
    </select>

  </>
);
