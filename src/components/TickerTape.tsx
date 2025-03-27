import React from 'react';

const images = [
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441e6a8fe723fe0488c3.jpeg',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441eb6255b2d301e2798.jpeg',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441eb6ea2b90c122fbfc.jpeg',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441eb6255b18421e2796.jpeg',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441e6a8fe70f670488c4.jpeg',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441eb6255bad6f1e279d.jpeg',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441e6a8fe774b30488c6.jpeg',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441eb6255b796c1e2799.png',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441eb6ea2b58f822fbf8.jpeg',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441eb16f9b4e9b870d74.jpeg',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441eb6255b7a641e279e.jpeg',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441e1842f21b95e4dcba.jpeg',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441e6a8fe783af0488c1.jpeg',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441eb16f9b38c3870d73.jpeg',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441e6a8fe79edf0488c7.jpeg',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441e6a8fe7615d0488c5.jpeg',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441eb6255b860d1e279a.jpeg',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441eb6ea2b159b22fbfa.jpeg',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441eb6ea2b802722fbff.jpeg',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441e1842f23a73e4dcbb.jpeg',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441eb6ea2bb2a022fbfb.jpeg',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441eb16f9b0318870d76.jpeg',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441e1842f220c5e4dcb8.jpeg',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441eb6ea2b05a922fbfe.jpeg',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441eb6255b65a81e2797.jpeg',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441eb6ea2b1ffb22fbfd.jpeg',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441e1842f26899e4dcb9.jpeg',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441eb6ea2b60d922fbf9.jpeg',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441eb16f9bc6b9870d75.jpeg',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441eb6255b62381e279c.jpeg',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441eb6255bb6a91e279b.jpeg',
  'https://storage.googleapis.com/msgsndr/SYb6WvRUyQ4YDG9ycDbK/media/6786441e6a8fe723690488c2.jpeg'
];

export function TickerTape() {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-black py-[3px] z-50">
      <div className="relative overflow-hidden whitespace-nowrap h-10">
        <div className="flex">
          <div className="animate-[ticker_60s_linear_infinite] flex shrink-0">
            {images.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Partner ${index + 1}`}
                className="h-8 w-auto mx-3 object-contain"
              />
            ))}
          </div>
          <div className="animate-[ticker_60s_linear_infinite] flex shrink-0">
            {images.map((src, index) => (
              <img
                key={`clone-${index}`}
                src={src}
                alt={`Partner ${index + 1}`}
                className="h-8 w-auto mx-3 object-contain"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}