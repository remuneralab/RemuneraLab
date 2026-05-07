export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <nav className="border-b border-gray-100 px-8 py-5">
        <span className="text-xl font-semibold tracking-tight text-gray-900">
          Remunera<span className="text-blue-600">Lab</span>
        </span>
      </nav>

      <section className="flex-1 flex flex-col items-center justify-center px-6 py-28 text-center">
        <div className="max-w-2xl">
          <span className="inline-block bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
            Mercado laboral chileno
          </span>
          <h1 className="text-5xl font-bold text-gray-900 leading-tight tracking-tight mb-5">
            ¿Cuánto vale tu trabajo<br className="hidden sm:block" /> en el mercado?
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-xl mx-auto">
            Ingresa tu cargo, industria, experiencia y región, y descubre en qué
            percentil te posicionas dentro del mercado laboral chileno.
          </p>
          <a
            href="/formulario"
            className="inline-block bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors shadow-sm"
          >
            Conoce tu posición salarial
          </a>
        </div>
      </section>

      <section className="border-t border-gray-100 px-6 py-12">
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-3xl font-bold text-gray-900">15+</p>
            <p className="text-sm text-gray-500 mt-1">Industrias</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">13</p>
            <p className="text-sm text-gray-500 mt-1">Regiones</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">100%</p>
            <p className="text-sm text-gray-500 mt-1">Anónimo</p>
          </div>
        </div>
      </section>
    </main>
  );
}
