import Filter from 'bad-words';

const filter = new Filter();

// Add additional words to censor if needed
filter.addWords(
  'someword',
  'anotherword'
);

export function censorText(text: string): string {
  if (!text) return '';
  return filter.clean(text);
}