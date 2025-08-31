export default function TailwindTest() {
  return (
    <div className="bg-red-500 text-white p-4 m-4 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold">Tailwind Test</h1>
      <p className="text-lg">If this is styled, Tailwind is working!</p>
      <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded mt-2">
        Test Button
      </button>
    </div>
  );
}
