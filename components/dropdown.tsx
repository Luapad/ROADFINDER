type Props = {
  value: string;
  onChange: (value: string) => void;
};

const CATEGORIES = [
  '경영대학',
  '인문대학',
  '공과대학',
  '농업생명과학대학',
  '자연과학대학',
  '수의과대학',
  '사범대학',
  'AI융합대학',
  '약학대학',
  '생활과학대학',
  '사회과학대학',
  '대학원',
  '도서관',
  '생활관',
  '부속시설',
];

export default function CategoryDropdown({ value, onChange }: Props) {
  return (
    <div className="mb-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">건물명1</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border rounded-md p-2 mb-4 text-gray-900 placeholder-gray-600 bg-white"
      >
        <option value="">선택하세요</option>
        {CATEGORIES.map(category => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
}
